import React, { useState } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import FileUploader from "./components/FileUploader";
import SlideList from "./components/SlideList";
import EditorPanel from "./components/EditorPanel";
import { uploadFile, editFile, getDownloadLink } from "./api";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import { Download, Layout } from "lucide-react";

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
    if (!file) return toast.error("Please select a file");
    setUploading(true);
    try {
      const data = await uploadFile(file);
      setFileId(data.file_id);
      setStructure(data.structure);
      setSlides(data.structure.slides || []);
      setSelectedSlideId(data.structure.slides?.[0]?.slide_id || null);
      setDownloadUrl(null);
      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleApplyInstruction(instr) {
    if (!fileId) return toast.error("Please upload a file first");
    if (!instr.trim()) return toast.error("Please enter an instruction");
    
    setProcessing(true);
    const loadingToast = toast.loading("Applying AI edits...");
    
    try {
      const res = await editFile(fileId, instr);
      if (res.download) {
        setDownloadUrl(getDownloadLink(res.download));
      }
      if (res.structure) {
        setStructure(res.structure);
        setSlides(res.structure.slides || []);
      }
      toast.success("AI edit applied successfully!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Edit failed. Please try again.", { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  }

  async function handleApplyElementEdit(elementId, newText) {
    if (!fileId) return toast.error("Please upload a file first");

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
    const loadingToast = toast.loading("Applying manual edit...");

    try {
      const res = await editFile(fileId, `__APPLY_PLAN__::${planInstr}`);
      if (res.download) {
        setDownloadUrl(getDownloadLink(res.download));
      }
      if (res.structure) {
        setStructure(res.structure);
        setSlides(res.structure.slides || []);
      }
      toast.success("Manual edit applied!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Manual edit failed.", { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  }

  const selectedSlide = slides.find((s) => s.slide_id === selectedSlideId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' } }} />
      
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">AI PPT Editor</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {downloadUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button asChild className="gap-2" size="sm">
                <a href={downloadUrl} download>
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Slides */}
        <aside className="w-80 border-r border-border bg-card/30 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Project Files</h2>
            <FileUploader 
              file={file} 
              setFile={setFile} 
              onUpload={handleUpload} 
              uploading={uploading} 
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Slides ({slides.length})</h2>
            <SlideList 
              slides={slides} 
              onSelect={setSelectedSlideId} 
              selected={selectedSlideId} 
            />
          </div>
        </aside>

        {/* Main Content - Editor */}
        <div className="flex-1 bg-muted/10 p-6 overflow-y-auto flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            {selectedSlideId ? (
              <motion.div 
                key={selectedSlideId}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EditorPanel 
                  slide={selectedSlide} 
                  onApplyInstruction={handleApplyInstruction} 
                  onApplyElementEdit={handleApplyElementEdit} 
                />
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 mt-20">
                <div className="p-4 bg-muted rounded-full">
                  <Layout className="w-8 h-8 opacity-50" />
                </div>
                <p>Select a slide from the sidebar to start editing</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
