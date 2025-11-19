import React, { useState } from "react";
import { motion } from "framer-motion";
import FileUploader from "./components/FileUploader";
import SlideList from "./components/SlideList";
import EditorPanel from "./components/EditorPanel";
import { uploadFile, editFile } from "./api";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [structure, setStructure] = useState(null);
  const [slides, setSlides] = useState([]);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Select a file first");
    setUploading(true);
    try {
      const data = await uploadFile(file);
      setFileId(data.file_id);
      setStructure(data.structure);
      setSlides(data.structure.slides || []);
      setSelectedSlideId(data.structure.slides?.[0]?.slide_id || null);
      setDownloadUrl(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleApplyInstruction(instr) {
    if (!fileId) return alert("Upload first");
    setProcessing(true);
    try {
      const res = await editFile(fileId, instr);
      if (res.download)
        setDownloadUrl(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${res.download}`);
      alert("Edit applied! Download available below.");
    } catch (e) {
      console.error(e);
      alert("Edit failed");
    } finally {
      setProcessing(false);
    }
  }

  async function handleApplyElementEdit(elementId, newText) {
    if (!fileId) return alert("Upload first");
    setProcessing(true);
    try {
      const planInstr = JSON.stringify({
        edits: [
          {
            slide_id: selectedSlideId,
            actions: [
              {
                type: "replace_text",
                element_id: elementId,
                new_text: newText
              }
            ]
          }
        ]
      });
      const res = await editFile(fileId, `__APPLY_PLAN__::${planInstr}`);
      if (res.download)
        setDownloadUrl(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${res.download}`);
      alert("Manual edit applied.");
    } catch (e) {
      console.error(e);
      alert("Manual edit failed");
    } finally {
      setProcessing(false);
    }
  }

  const selectedSlide = slides.find((s) => s.slide_id === selectedSlideId);

  return (
    <div className="min-h-screen p-8 bg-black text-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="mb-6">
            <FileUploader file={file} setFile={setFile} onUpload={handleUpload} uploading={uploading} />
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }}>
            <div className="card p-6 rounded-2xl">
              <h4 className="text-lg font-semibold mb-3">Project</h4>
              <div className="text-sm small-muted">File ID: {fileId || "-"}</div>
              <div className="mt-3 text-sm small-muted">Slides: {slides.length}</div>
              <div className="mt-3">
                {downloadUrl && <a href={downloadUrl} className="btn-brand px-4 py-2 rounded inline-block">Download Edited PPT</a>}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="col-span-5">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <SlideList slides={slides} onSelect={setSelectedSlideId} />
          </motion.div>
        </div>

        <div className="col-span-3">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.28 }}>
            <EditorPanel slide={selectedSlide} onApplyInstruction={handleApplyInstruction} onApplyElementEdit={handleApplyElementEdit} />
          </motion.div>
        </div>
      </div>

      {processing && <div className="fixed right-6 bottom-6 bg-black/70 p-4 rounded shadow-lg">Processing…</div>}
    </div>
  );
}
