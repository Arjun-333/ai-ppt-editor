# parser.py
from pptx import Presentation
import json

def extract_pptx_structure(path: str) -> dict:
    prs = Presentation(path)
    slides = []
    for i, slide in enumerate(prs.slides, start=1):
        elements = []
        images = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                text = shape.text
                # simple id: slide index + shape idx
                elements.append({
                    "id": f"s{i}_sh{len(elements)+1}",
                    "type": "text",
                    "text": text
                })
            if shape.shape_type == 13 or getattr(shape, "image", None):  # picture shape
                try:
                    img = shape.image
                    images.append({
                        "id": f"s{i}_img{len(images)+1}",
                        "ext": img.ext,
                        "size": len(img.blob)
                    })
                except Exception:
                    pass
        slides.append({
            "slide_id": i,
            "layout": slide.slide_layout.name if hasattr(slide.slide_layout,"name") else "layout",
            "elements": elements,
            "images": images
        })
    return {"meta":{"title":prs.core_properties.title or "" , "slide_count": len(prs.slides)}, "slides": slides}
