# executor.py
from pptx import Presentation
from typing import Dict

def apply_edit_plan(pptx_path: str, edit_plan: Dict, out_path: str):
    prs = Presentation(pptx_path)

    # map element ids to shapes (simple approach)
    for slide_edit in edit_plan.get("edits", []):
        slide_index = slide_edit["slide_id"] - 1
        slide = prs.slides[slide_index]
        # build a list of shapes with generated ids matching parser convention
        shapes = list(slide.shapes)
        for action in slide_edit["actions"]:
            if action["type"] == "replace_text":
                eid = action["element_id"]  # e.g., 's1_sh1'
                # extract shape index
                try:
                    parts = eid.split("_sh")
                    s_idx = int(parts[1]) - 1
                    shape = shapes[s_idx]
                    if shape.has_text_frame:
                        shape.text = action["new_text"]
                except Exception as e:
                    print("replace_text failed", e)
            elif action["type"] == "replace_image":
                # find image by id mapping — simplified: replace first picture
                for shape in slide.shapes:
                    try:
                        if shape.shape_type == 13 or getattr(shape, "image", None):
                            # replace with new image path
                            image_path = action["upload_path"]
                            left, top, width, height = shape.left, shape.top, shape.width, shape.height
                            # remove existing shape: python-pptx has no remove, hack: recreate slide without that shape OR overlay new picture
                            slide.shapes.add_picture(image_path, left, top, width, height)
                            break
                    except Exception as e:
                        print("replace_image failed", e)
            # add other action handlers...

    prs.save(out_path)
    return out_path
