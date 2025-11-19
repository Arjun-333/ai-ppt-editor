from pptx import Presentation
from typing import Dict

def apply_edit_plan(pptx_path: str, edit_plan: Dict, out_path: str):
    prs = Presentation(pptx_path)

    for slide_edit in edit_plan.get("edits", []):
        slide_index = slide_edit["slide_id"] - 1
        slide = prs.slides[slide_index]

        # Match executor shapes exactly with parser
        filtered_shapes = [
            shape for shape in slide.shapes 
            if hasattr(shape, "text_frame") and shape.text_frame is not None
        ]

        for action in slide_edit["actions"]:

            if action["type"] == "replace_text":
                element_id = action["element_id"]
                new_text = action["new_text"]

                try:
                    shape_index = int(element_id.split("_sh")[1]) - 1
                    shape = filtered_shapes[shape_index]
                    tf = shape.text_frame

                    # --- 🔥 PROPER FORMATTING PRESERVE START ---
                    if tf.paragraphs and tf.paragraphs[0].runs:
                        # Use the first existing run's formatting
                        first_run = tf.paragraphs[0].runs[0]
                        font = first_run.font

                        # Clear text, keep run
                        first_run.text = new_text

                        # Reapply preserved formatting
                        first_run.font.size = font.size
                        first_run.font.bold = font.bold
                        first_run.font.italic = font.italic
                        first_run.font.color.rgb = font.color.rgb
                        first_run.font.name = font.name

                    else:
                        # Fallback if no run exists
                        shape.text = new_text
                    # --- 🔥 PROPER FORMATTING PRESERVE END ---

                    print(f"[OK] replaced text for {element_id}")

                except Exception as e:
                    print(f"[ERROR] failed replacing text for {element_id}: {e}")

    prs.save(out_path)
    print("[SAVED]", out_path)
    return out_path
