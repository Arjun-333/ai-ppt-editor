# edit_plan_schema.py
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class ReplaceTextAction(BaseModel):
    type: Literal["replace_text"]
    element_id: str
    new_text: str

class AddTextAction(BaseModel):
    type: Literal["add_text"]
    position: Optional[str] = None
    text: str

class ReplaceImageAction(BaseModel):
    type: Literal["replace_image"]
    image_id: str
    upload_path: str

class ChangeLayoutAction(BaseModel):
    type: Literal["change_layout"]
    layout_id: str

class StyleTextAction(BaseModel):
    type: Literal["style_text"]
    element_id: str
    font_size: Optional[int] = None
    font_color: Optional[str] = None  # Hex code e.g. "#FF0000"
    bold: Optional[bool] = None
    italic: Optional[bool] = None

Action = ReplaceTextAction | AddTextAction | ReplaceImageAction | ChangeLayoutAction | StyleTextAction

class SlideEdit(BaseModel):
    slide_id: int
    actions: List[Action]

class EditPlan(BaseModel):
    edits: List[SlideEdit]
