import { useState } from "react";
import { CloudUpload, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface UploadVideoProps {
  onUploadSuccess: (fileName: string) => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const fileName = encodeURIComponent(file.name);

      // 🔹 Step 1: Request a signed URL from the backend
      const response = await fetch(
        "http://127.0.0.1:8000/video/get-signed-url/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_name: fileName }),
        }
      );

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { signedUrl } = await response.json();

      if (!signedUrl) throw new Error("Invalid upload URL received");

      // 🔹 Step 2: Upload file to Supabase Storage via Signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error("File upload failed");

      const metadataResponse = await fetch(
        "http://127.0.0.1:8000/video/update-metadata/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_name: fileName }),
        }
      );

      if (!metadataResponse.ok) throw new Error("Failed to update metadata");

      // 🔹 Step 4: Update UI
      setUploaded(true);
      onUploadSuccess(file.name);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-lg mx-auto bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-lg rounded-lg p-6 text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {!uploaded ? (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">
            📤 Upload Video
          </h2>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-600 rounded-lg py-10 cursor-pointer hover:border-blue-500 transition-all">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="video/*"
            />
            {file ? (
              <span className="text-green-400">{file.name}</span>
            ) : (
              <>
                <CloudUpload size={50} className="text-gray-400 mb-2" />
                <span className="text-gray-400">
                  Drag & Drop or Click to Upload
                </span>
              </>
            )}
          </label>

          <button
            className={`w-full mt-4 py-2 text-center rounded-lg font-medium transition-all flex items-center justify-center ${
              file
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-500 cursor-not-allowed"
            }`}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              "Upload Video"
            )}
          </button>
        </>
      ) : (
        <motion.div
          className="flex items-center justify-between bg-green-800 bg-opacity-50 p-3 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-green-400">{file?.name} uploaded!</span>
          <CheckCircle size={20} className="text-green-400" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadVideo;
