import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { CircleX, Play } from "lucide-react";
import toast from "react-hot-toast";

interface SearchVideoProps {
  videoUrl: string;
  videoKey: string;
}

type Hit = { start_sec: number; score?: number; deep_link?: string };

export default function SearchVideo({ videoUrl, videoKey }: SearchVideoProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const server = import.meta.env.VITE_SERVER as string | undefined;

  const handleSearch = async () => {
    if (!query.trim() || !server) return;
    setSearching(true);
    setHits([]);
    setStartTime(null);

    try {
      // Try your current GET endpoint first
      const res = await fetch(`${server}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_key: videoKey, query, k: 2 }),
      });
      if (res.status === 202) {
        toast("Index is building — try again in a few seconds.", {
          icon: "⏳",
        });
        return;
      }

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      // Support both shapes:
      // 1) { start_time: number }  2) { hits: [{start_sec, score, deep_link}, ...] }
      if (typeof data.start_time === "number") {
        setHits([{ start_sec: data.start_time }]);
        setStartTime(data.start_time);
      } else if (Array.isArray(data.hits)) {
        setHits(data.hits);
        setStartTime(data.hits[0]?.start_sec ?? null);
      } else {
        toast("No match found", { icon: "🤔" });
      }
    } catch (e: any) {
      toast.error(e?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const playFrom = async (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (v.readyState < 1) {
        await new Promise<void>((resolve) =>
          v.addEventListener("loadedmetadata", () => resolve(), { once: true })
        );
      }
      v.currentTime = Math.max(0, t);
      await v.play();
      setPlaying(true);
    } catch (e) {
      toast.error("Playback failed");
      setPlaying(false);
    }
  };

  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  // Cleanup
  useEffect(
    () => () => {
      videoRef.current?.pause();
    },
    []
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
      <h3 className="text-lg text-slate-400 font-semibold mb-3">
        Search your video
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="group relative flex items-center gap-3 rounded-2xl
             bg-white/5 border border-sky-200 px-4 py-3
             hover:border-sky-300 
             focus-within:ring-2 focus-within:ring-sky-400/70 focus-within:border-sky-400/60
             transition-colors"
        aria-label="Search video"
      >
        <FaSearch className="text-slate-300/80 group-focus-within:text-sky-300 transition-colors" />
        <input
          className="w-full bg-transparent text-slate-500 placeholder:text-slate-400
               outline-none"
          placeholder='e.g. "the presenter mentions contract renewal"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Query"
        />
        <button
          type="submit"
          disabled={!query.trim() || searching}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition
      ${
        !query.trim() || searching
          ? "bg-slate-700 text-slate-400"
          : "bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white shadow-lg shadow-sky-900/20"
      }
      focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-sky-400/70`}
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Results */}
      <div className="mt-4 space-y-3">
        {hits.length > 0 && (
          <div className="space-y-2">
            {hits.slice(0, 2).map((h, i) => (
              <motion.div
                key={`${h.start_sec}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-xl border border-white/10 px-3 py-2
                  ${
                    startTime === h.start_sec ? "bg-sky-500/10" : "bg-white/5"
                  }`}
              >
                <div className="text-sm">
                  <div className="text-emerald-400/60">Match #{i + 1}</div>
                  <div className="text-slate-600">
                    Start: {h.start_sec}s{" "}
                    {h.score ? `• score ${h.score.toFixed(2)}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStartTime(h.start_sec);
                    playFrom(h.start_sec);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-sm cursor-pointer text-slate-200 transition-colors"
                >
                  <Play className="h-4 w-4" /> Play
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {!searching && hits.length === 0 && startTime === null && (
          <p className="mt-2 text-sm text-slate-400">
            Type a query and press Enter to jump to the best moment.
          </p>
        )}
      </div>

      {/* Player */}
      <div className="mt-5 relative">
        <video
          ref={videoRef}
          className="w-full rounded-2xl border border-white/10 bg-black shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)]"
          controls
          preload="metadata"
          src={videoUrl}
        />
        {playing && (
          <button
            onClick={stop}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Stop"
          >
            <CircleX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
