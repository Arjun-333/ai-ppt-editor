import React, { useState } from "react";

export default function EditorPanel({
  slide,
  onApplyInstruction,
  onApplyElementEdit,
}) {
  const [instruction, setInstruction] = useState("");

  return (
    <div className="card p-6 rounded-2xl">
      <h3 className="text-xl font-semibold mb-3">
        Slide {slide?.slide_id ?? "-"}
      </h3>

      <div className="mb-4">
        <textarea
          rows="3"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Write a natural instruction (e.g. Make this slide more professional)"
          className="w-full bg-black/0 border border-white/6 p-3 rounded"
        />
        <button
          onClick={() => onApplyInstruction(instruction)}
          className="btn-brand mt-3 w-full py-2 rounded"
        >
          Apply AI Instruction
        </button>
      </div>

      <div>
        <h4 className="text-sm small-muted mb-2">Manual edits</h4>
        {slide?.elements?.map((el) => (
          <ElementEditor
            key={el.id}
            element={el}
            onApply={onApplyElementEdit}
          />
        ))}
      </div>
    </div>
  );
}

function ElementEditor({ element, onApply }) {
  const [val, setVal] = useState(element.text || "");

  return (
    <div className="border border-white/5 p-3 rounded mb-3">
      <div className="text-xs small-muted mb-1">{element.id}</div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full p-2 bg-black/0 rounded"
        rows="2"
      />
      <button
        onClick={() => onApply(element.id, val)}
        className="mt-2 w-full py-2 btn-brand rounded"
      >
        Apply to element
      </button>
    </div>
  );
}
