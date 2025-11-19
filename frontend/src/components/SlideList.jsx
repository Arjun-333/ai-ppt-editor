import React from "react";

function SlideCard({ slide, onSelect, selected }) {
  return (
    <div
      onClick={() => onSelect(slide.slide_id)}
      className={`${
        selected === slide.slide_id ? "slide-item-active" : "slide-item"
      }`}
    >
      <div className="h-28 w-full bg-black/40 flex items-center justify-center text-sm small-muted rounded">
        Thumbnail
      </div>
      <div className="mt-2 text-sm small-muted">Slide {slide.slide_id}</div>
    </div>
  );
}

export default function SlideList({ slides = [], onSelect, selected }) {
  return (
    <div className="card">
      <div className="section-title">Slides</div>
      <div className="grid grid-cols-3 gap-3">
        {slides.map((s) => (
          <SlideCard
            key={s.slide_id}
            slide={s}
            onSelect={onSelect}
            selected={selected}
          />
        ))}
      </div>
    </div>
  );
}
