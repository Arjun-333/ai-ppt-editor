import React from "react";

export default function FileUploader({ file, setFile, onUpload, uploading }) {
  return (
    <div className="card p-6 rounded-2xl shadow-xl">
      <div className="text-xl font-semibold mb-2">Upload PPTX</div>
      <div className="small-muted text-sm mb-4">
        Supported: .pptx (Max ~20 MB)
      </div>

      <label className="w-full flex items-center gap-4">
        <input
          type="file"
          accept=".pptx"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="flex-1 py-3 px-4 border border-white/6 rounded cursor-pointer bg-black/20">
          {file ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs small-muted">
                  {Math.round(file.size / 1024)} KB
                </div>
              </div>
              <div className="text-sm small-muted">Change</div>
            </div>
          ) : (
            <div className="text-sm small-muted">Click to choose a file</div>
          )}
        </div>
      </label>

      <button
        onClick={onUpload}
        className={`btn-brand mt-4 w-full py-2 rounded-lg font-medium ${
          uploading ? "btn-disabled" : ""
        }`}
        disabled={uploading}
      >
        {uploading ? "Uploading…" : "Upload & Parse"}
      </button>
    </div>
  );
}
