import React from "react";

function SlideCard({ slide, onSelect }) {
  return (
    <div onClick={() => onSelect(slide.slide_id)} className="slide-item">
      <div className="h-28 w-40 bg-black/40 flex items-center justify-center text-sm small-muted rounded">
        Thumbnail
      </div>
      <div className="mt-2 text-sm small-muted">Slide {slide.slide_id}</div>
    </div>
  );
}

export default function SlideList({ slides = [], onSelect }) {
  return (
    <div className="space-y-3">
      <div className="text-sm small-muted">Slides</div>
      <div className="grid grid-cols-3 gap-3">
        {slides.map((s) => (
          <SlideCard key={s.slide_id} slide={s} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
