import React from "react";
import { Button } from "./ui/Button";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "../lib/utils";

export default function FileUploader({ file, setFile, onUpload, uploading }) {
  if (file) {
    return (
      <div className="p-3 border border-border rounded-lg bg-background">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <FileIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" title={file.name}>{file.name}</div>
            <div className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</div>
          </div>
          <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
        <Button
          onClick={onUpload}
          className="w-full"
          disabled={uploading}
          isLoading={uploading}
          size="sm"
        >
          {uploading ? "Uploading..." : "Parse File"}
        </Button>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border-muted-foreground/25 group">
      <input
        type="file"
        accept=".pptx"
        className="hidden"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Click to upload PPTX</span>
    </label>
  );
}
