import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [resultLink, setResultLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const backend = "http://127.0.0.1:8000";

  // --- UPLOAD ---
  const uploadPpt = async () => {
    if (!file) return alert("Please select a PPTX file");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${backend}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setFileId(data.file_id);
    setLoading(false);

    alert("Upload successful! Now enter your instruction.");
  };

  // --- EDIT ---
  const editPpt = async () => {
    if (!fileId) return alert("No file uploaded yet!");
    if (!instruction.trim()) return alert("Enter an instruction!");

    setLoading(true);

    const formData = new FormData();
    formData.append("file_id", fileId);
    formData.append("instruction", instruction);

    const res = await fetch(`${backend}/edit`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.download) {
      setResultLink(`${backend}${data.download}`);
      alert("Edit completed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">AI PowerPoint Editor</h1>

      {/* UPLOAD CARD */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl space-y-4">
        <h2 className="text-2xl font-semibold">1. Upload PPTX File</h2>

        <input
          type="file"
          accept=".pptx"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full bg-gray-700 p-3 rounded"
        />

        <button
          onClick={uploadPpt}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded text-lg font-medium"
        >
          Upload
        </button>
      </div>

      {/* INSTRUCTION CARD */}
      {fileId && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl mt-6 space-y-4">
          <h2 className="text-2xl font-semibold">2. Enter Instruction</h2>

          <textarea
            placeholder="e.g., Replace title on slide 1 with 'AI Success'"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded h-32"
          />

          <button
            onClick={editPpt}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded text-lg font-medium"
          >
            Apply Edit
          </button>
        </div>
      )}

      {/* DOWNLOAD CARD */}
      {resultLink && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl mt-6 text-center">
          <h2 className="text-xl font-semibold mb-4">
            3. Download Your Edited PPT
          </h2>

          <a
            href={resultLink}
            className="bg-purple-600 hover:bg-purple-700 p-3 rounded text-lg font-medium inline-block"
            download
          >
            Download Edited PPTX
          </a>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-yellow-400">Processing... please wait</p>
      )}
    </div>
  );
}
