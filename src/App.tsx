import { useState } from "react";
import Footer from "./components/Footer";
import SearchVideo from "./components/SearchVideo";
import UploadVideo from "./components/UploadVideo";

export default function App() {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>("");

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="text-center text-3xl font-semibold p-6 bg-gradient-to-r from-blue-500 to-purple-600 shadow-md rounded-b-lg">
        🚀 FrameFinder - Search Videos Instantly!
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center gap-6 px-6 py-10">
        {/* Upload Section - Hide after successful upload */}
        {!uploadedFileName && (
          <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-md">
            <UploadVideo onUploadSuccess={setUploadedFileName} />
          </section>
        )}

        {/* Show uploaded file name after success */}
        {uploadedFileName && (
          <p className="text-green-400 text-center text-lg font-semibold">
            ✅ Uploaded successfully!
          </p>
        )}

        {/* Search Section - Change text after upload */}
        {uploadedFileName && (
          <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-md">
            <SearchVideo uploadedFileName={uploadedFileName} />
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
