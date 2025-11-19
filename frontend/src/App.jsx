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
  const [slides, setSlides] = useState([]);
  const [structure, setStructure] = useState(null);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Please select a file");
    setUploading(true);
    try {
      const data = await uploadFile(file);
      setFileId(data.file_id);
      setStructure(data.structure);
      setSlides(data.structure.slides || []);
      setSelectedSlideId(data.structure.slides?.[0]?.slide_id || null);
      setDownloadUrl(null);
    } catch {
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
      if (res.download) {
        setDownloadUrl(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${res.download}`
        );
      }
      alert("AI edit applied.");
    } catch {
      alert("Edit failed.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleApplyElementEdit(elementId, newText) {
    if (!fileId) return alert("Upload first");

    const planInstr = JSON.stringify({
      edits: [
        {
          slide_id: selectedSlideId,
          actions: [
            { type: "replace_text", element_id: elementId, new_text: newText }
          ]
        }
      ]
    });

    setProcessing(true);
    try {
      const res = await editFile(fileId, `__APPLY_PLAN__::${planInstr}`);
      if (res.download) {
        setDownloadUrl(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${res.download}`
        );
      }
      alert("Manual edit applied.");
    } catch {
      alert("Manual edit failed.");
    } finally {
      setProcessing(false);
    }
  }

  const selectedSlide = slides.find((s) => s.slide_id === selectedSlideId);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 lg:p-12 flex justify-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <FileUploader file={file} setFile={setFile} onUpload={handleUpload} uploading={uploading} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="card">
              <h3 className="section-title">Project</h3>
              <div className="small-muted text-sm">File ID: {fileId || "-"}</div>
              <div className="small-muted text-sm mt-1">Slides: {slides.length}</div>
              {downloadUrl && <a href={downloadUrl} className="btn-brand mt-4 inline-block">Download Edited PPT</a>}
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <SlideList slides={slides} onSelect={setSelectedSlideId} selected={selectedSlideId} />
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <EditorPanel slide={selectedSlide} onApplyInstruction={handleApplyInstruction} onApplyElementEdit={handleApplyElementEdit} />
          </motion.div>
        </div>
      </div>

      {processing && <div className="fixed right-6 bottom-6 bg-black/70 p-4 rounded-lg shadow-xl text-soft">Processing…</div>}
    </div>
  );
}
