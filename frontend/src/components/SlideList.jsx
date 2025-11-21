import React from "react";
import { cn } from "../lib/utils";

function SlideCard({ slide, onSelect, selected }) {
  return (
    <div
      onClick={() => onSelect(slide.slide_id)}
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent group flex items-center gap-3",
        selected === slide.slide_id ? "bg-accent border-primary/50 ring-1 ring-primary/20" : "bg-card border-border"
      )}
    >
      <div className="h-12 w-20 bg-muted rounded-sm flex items-center justify-center text-[10px] text-muted-foreground shrink-0 border border-border/50">
        Slide {slide.slide_id}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium group-hover:text-primary transition-colors">Slide {slide.slide_id}</span>
        <span className="text-xs text-muted-foreground">{slide.elements?.length || 0} elements</span>
      </div>
    </div>
  );
}

export default function SlideList({ slides = [], onSelect, selected }) {
  return (
    <div className="space-y-2">
      {slides.map((s) => (
        <SlideCard
          key={s.slide_id}
          slide={s}
          onSelect={onSelect}
          selected={selected}
        />
      ))}
    </div>
  );
}
