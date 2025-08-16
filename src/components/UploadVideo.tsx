import { useCallback, useRef, useState } from "react";
import { CloudUpload, CheckCircle, Loader2, User, CircleX, CircleCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { uploadFileToS3, fetchWithRetry } from "../utils";

type VideoMeta = { url: string; key: string };

interface UploadVideoProps {
  onUploadSuccess: (v: VideoMeta) => void;
}

const MAX_MB = 2048; // keep in sync with server's presign limit
const MIN_NAME_CHARS = 3; // minimum sanitized chars before enabling upload

export default function UploadVideo({ onUploadSuccess }: UploadVideoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [step, setStep] = useState<number>(0); // 0 idle, 1 presign, 2 upload, 3 process, 4 done
  const [uploading, setUploading] = useState(false);

  const dropRef = useRef<HTMLLabelElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sanitizeUser = (raw: string) =>
    raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

  const sanitizeFile = (raw: string) =>
    raw.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith("video/")) {
      toast.error("Please choose a video file.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large (>${MAX_MB}MB).`);
      return;
    }
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelect(f);
    dropRef.current?.classList.remove("ring-2", "ring-sky-400/60");
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.add("ring-2", "ring-sky-400/60");
  };
  const handleDragLeave = () => {
    dropRef.current?.classList.remove("ring-2", "ring-sky-400/60");
  };

  const makeS3Key = (f: File, userSafe: string) => {
    const ts = Date.now();
    const folder = `${userSafe}-${ts}`;
    const safeName = sanitizeFile(f.name);
    return `uploads/${folder}/${ts}-${safeName}`;
  };

  const userSafe = sanitizeUser(name);
  const nameValid = userSafe.length >= MIN_NAME_CHARS;
  const canUpload = !!file && nameValid && !uploading;

  const removeFile = () => {
    if (uploading) return;
    setFile(null);
    setStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!nameValid) {
      toast.error(
        `Name must be at least ${MIN_NAME_CHARS} characters (letters/numbers/dash/underscore).`
      );
      return;
    }

    const server = import.meta.env.VITE_SERVER as string | undefined;
    if (!server) {
      toast.error("VITE_SERVER is not set.");
      return;
    }

    try {
      setUploading(true);
      setStep(1);

      const key = makeS3Key(file, userSafe);

      // 1) Presign POST
      const presign = await fetchWithRetry<{
        url: string;
        fields: Record<string, string>;
      }>(`${server}/video/get-signed-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: key, content_type: file.type }),
      });
      if (!presign?.url || !presign?.fields)
        throw new Error("Invalid presign response");

      // 2) Upload to S3
      setStep(2);
      const ok = await uploadFileToS3(presign.url, presign.fields, file);
      if (!ok) throw new Error("S3 upload failed");

      // 3) Ask backend to process + index
      setStep(3);
      type ProcessResp = {
        video_key?: string;
        presigned_get?: string;
        url?: string;
        message: string;
        total_chunks: number;
      };
      const processRes = await fetchWithRetry<ProcessResp>(
        `${server}/video/process`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_name: key }),
        }
      );

      const playable = processRes.presigned_get || processRes.url || "";
      const resolvedKey = processRes.video_key || key;

      if (!playable) {
        toast("Video accepted; preparing index…", { icon: "⏳" });
      } else {
        setStep(4);
        toast.success("Video ready! 🎉");
        onUploadSuccess({ url: playable, key: resolvedKey });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
        Upload a video
      </h2>

      {/* User name */}
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-1" htmlFor="u-name">
          Your name <span className="text-red-400">(required)</span>
        </label>
        <div
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/5 border 
                         ${
                           name.length > 0 && !nameValid
                             ? "border-red-400/60"
                             : "border-slate-300/80"
                         }
                         focus-within:ring-2 focus-within:ring-sky-400/60`}
        >
          <User
            className={`h-4 w-4 ${
              name.length > 0 && !nameValid
                ? "text-red-300"
                : "text-slate-300/80"
            }`}
          />
          <input
            id="u-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. rahul_datta"
            maxLength={32}
            className="w-full bg-transparent text-slate-400 placeholder:text-slate-400 outline-none"
            aria-required="true"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Min {MIN_NAME_CHARS} chars • Letters, numbers, dashes & underscores
          only.
        </p>
      </div>

      {/* Dropzone */}
      <label
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="group relative w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky-300/40 bg-gradient-to-b from-white/5 to-white/0 p-8 cursor-pointer transition-colors hover:border-sky-400/40"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="video/*"
        />
        <div className="rounded-full p-3 bg-white/5 border border-white/10">
          <CloudUpload className="h-6 w-6 text-slate-200 group-hover:text-sky-300 transition-colors" />
        </div>
        <div className="text-sm text-slate-300">
          <span className="font-medium">Drag & drop</span> or click to choose a
          video
        </div>
        <div className="text-xs text-slate-400">
          Max {MAX_MB} MB • mp4/webm/mov
        </div>
      </label>

      {file && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
          <div className="text-sm text-emerald-500 truncate">
            <CircleCheck className="inline h-4 w-4 mr-1" /> Selected : &nbsp;
            <span className="font-medium text-emerald-500">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            disabled={uploading}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-black disabled:opacity-50"
            aria-label="Remove selected file"
            title="Remove"
          >
            <CircleX className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleUpload}
        disabled={!canUpload}
        className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition
          ${
            canUpload
              ? "bg-sky-500 hover:bg-sky-600 text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {uploading ? "Uploading…" : "Upload & Process"}
      </button>

      {!canUpload && (
        <p className="mt-2 text-xs text-red-400">
          {!file && !nameValid && (
            <>Choose a video and enter a name (≥ {MIN_NAME_CHARS}).</>
          )}
          {!file && nameValid && <>Choose a video to continue.</>}
          {file && !nameValid && (
            <>
              Enter a valid name (≥ {MIN_NAME_CHARS}; letters/numbers/-/_ only).
            </>
          )}
        </p>
      )}

      {/* Steps */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-12 rounded-full ${
              step >= i ? "bg-sky-400" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center justify-center gap-2 text-emerald-300"
        >
          <CheckCircle className="h-4 w-4" /> Ready to search!
        </motion.div>
      )}
    </motion.div>
  );
}
