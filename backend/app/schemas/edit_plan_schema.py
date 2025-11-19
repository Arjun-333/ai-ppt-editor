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

Action = ReplaceTextAction | AddTextAction | ReplaceImageAction | ChangeLayoutAction

class SlideEdit(BaseModel):
    slide_id: int
    actions: List[Action]

class EditPlan(BaseModel):
    edits: List[SlideEdit]
