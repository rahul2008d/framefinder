import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchVideoProps {
  uploadedFileName: string | null;
}

const SearchVideo: React.FC<SearchVideoProps> = ({ uploadedFileName }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]); // Replace with actual video clips data

  const handleSearch = async () => {
    if (!query.trim()) return;

    // Simulated search result
    setResults([
      `Clip 1 matching "${query}"`,
      `Clip 2 matching "${query}"`,
      `Clip 3 matching "${query}"`,
    ]);
  };

  return (
    <div className="w-full p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">
        {uploadedFileName
          ? "🔍 Start Searching in Your Video"
          : "Upload a Video to Search"}
      </h2>

      {uploadedFileName && (
        <>
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg shadow-sm">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search your video..."
              className="w-full bg-transparent text-white outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold transition-all"
            >
              Search
            </button>
          </div>

          {/* Search Results */}
          <div className="mt-4 space-y-2">
            {results.length > 0 ? (
              results.map((clip, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
                >
                  🎬 {clip}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center mt-4">
                No results found.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchVideo;
