import { useRef, useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { CircleX, PartyPopper, Play } from "lucide-react";

interface SearchVideoProps {
  uploadedFileName: string | null;
}

const SearchVideo: React.FC<SearchVideoProps> = ({ uploadedFileName }) => {
  const [query, setQuery] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    console.log("Searching for:", query);
    if (!query.trim()) return;

    setError(null); // Clear previous errors
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER
        }/search/search_clip/?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results.");
      }

      const data = await response.json();
      setStartTime(data.start_time); // Set start time if found
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search video. Please try again.");
    }
  };

  const playFromTime = async () => {
    if (!videoRef.current || !uploadedFileName) return;

    setIsLoading(true);
    setError(null);

    try {
      const video = videoRef.current;

      // Ensure video metadata is loaded before playing
      if (video.readyState < 1) {
        await new Promise<void>((resolve) => {
          video.addEventListener("loadedmetadata", () => resolve(), {
            once: true,
          });
        });
      }

      video.currentTime = startTime;
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
      setError("Failed to play video. Check network or file format.");
      setIsPlaying(false); // Reset if playback fails
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause(); // Stop playback when component unmounts
      }
    };
  }, []);

  return (
    <div className="w-full p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">
        {uploadedFileName
          ? "🔍 Start Searching in Your Video"
          : "Upload a Video to Search"}
      </h2>

      {uploadedFileName && (
        <>
          {/* Search Input */}
          <form
            className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search your video..."
              className="w-full bg-transparent text-white outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Search Results */}
          {startTime !== 0 && (
            <div className="mt-4 space-y-3 bg-gray-800 bg-opacity-30 p-5 rounded-lg">
              {startTime ? (
                <div className="w-full flex justify-between items-center p-2 rounded-lg transition-all bg-gray-700/50 backdrop-blur-md">
                  <span className="text-white flex-1 text-lg flex  font-medium gap-2">
                    <PartyPopper /> Matching Clip Found! From {startTime}s To:
                    {startTime + 5}s
                  </span>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={playFromTime} // Pass dynamic start time if needed
                    className="flex items-center gap-3 p-2 h-16 w-16 text-white cursor-pointer bg-gray-600 rounded-full shadow-sm transition hover:bg-gray-500 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <p className="text-xs">Loading...</p>
                    ) : (
                      <p className="ml-3">
                        <Play />
                      </p>
                    )}
                  </motion.button>
                </div>
              ) : (
                <p className="text-gray-400 text-center mt-4 text-base italic">
                  No results found...
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}

          {/* Video Player - Always rendered when uploadedFileName exists */}
          <div className="flex items-center mt-4 relative">
            <video
              className={`mt-4 p-2 flex items-center justify-center ${
                !isPlaying && !isLoading ? "hidden" : ""
              }`}
              ref={videoRef}
              width="640"
              height="360"
              controls
              preload="metadata"
            >
              <source src={uploadedFileName} type="video/webm" />
              <source src={uploadedFileName} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {isPlaying && (
              <CircleX
                className="p-1 cursor-pointer absolute top-6 right-9 text-gray-400 hover:text-white bg-gray-700 rounded-full transition-all"
                onClick={stopPlayback}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchVideo;
