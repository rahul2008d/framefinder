import { useState } from "react";
import Footer from "./components/Footer";
import SearchVideo from "./components/SearchVideo";
import UploadVideo from "./components/UploadVideo";
import { Toaster } from "react-hot-toast";

type VideoMeta = { url: string; key: string };

export default function App() {
  const [video, setVideo] = useState<VideoMeta | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black text-white">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#0f172a", color: "#fff" } }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
              FrameFinder
            </span>
            <span className="ml-1 text-slate-200/90"> • find moments faster</span>
          </h1>
          <div className="hidden sm:flex gap-2 text-xs">
            {["1. Upload", "2. Process", "3. Search & Play"].map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded-full bg-white/10 border border-white/25 text-slate-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {!video && (
          <section className="mx-auto max-w-3xl">
            <UploadVideo onUploadSuccess={(v: VideoMeta) => setVideo(v)} />
          </section>
        )}

        {video && (
          <section className="mx-auto max-w-3xl">
            <div className="text-center mb-3">
              <span className="text-emerald-300 font-medium">✅ Video ready</span>
              <p className="text-sm text-slate-400">
                Search any moment with natural language.
              </p>
            </div>
            <SearchVideo videoUrl={video.url} videoKey={video.key} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
