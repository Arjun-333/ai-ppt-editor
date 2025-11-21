from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from ..services.parser import extract_pptx_structure
from ..services.orchestrator import get_edit_plan_from_gemini
from ..services.executor import apply_edit_plan
from ..schemas.edit_plan_schema import EditPlan
from ..services.debug_shapes import inspect_ppt
from ..core.config import settings
import os, uuid, json

router = APIRouter()

@router.get("/debug")
async def debug(file_id: str):
    path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pptx")
    if not os.path.exists(path):
        return {"error": "file not found"}
    inspect_ppt(path)
    return {"message": "Debug printed in backend terminal"}

@router.post("/upload")
async def upload_pptx(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    orig_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pptx")
    with open(orig_path, "wb") as f:
        f.write(await file.read())
    structure = extract_pptx_structure(orig_path)
    with open(orig_path + ".json", "w") as jf:
        json.dump(structure, jf, indent=2)
    return {"file_id": file_id, "structure": structure, "message": "File uploaded and parsed"}

@router.post("/edit")
async def edit_pptx(file_id: str = Form(...), instruction: str = Form(...)):
    orig_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pptx")
    json_path = orig_path + ".json"
    out_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_edited.pptx")

    if not os.path.exists(orig_path):
        raise HTTPException(status_code=404, detail="Original PPTX not found")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Extracted structure not found")

    with open(json_path) as jf:
        extracted = json.load(jf)

    if instruction.startswith("__APPLY_PLAN__::"):
        try:
            import json as _json
            plan_json = instruction.split("::", 1)[1]
            edit_plan = _json.loads(plan_json)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid manual plan: {e}")
    else:
        edit_plan = get_edit_plan_from_gemini(extracted, instruction)

    if not edit_plan:
        raise HTTPException(status_code=500, detail="Gemini failed to generate an edit plan")

    try:
        EditPlan.model_validate(edit_plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema error: {e}")

    try:
        apply_edit_plan(orig_path, edit_plan, out_path)
        
        # Re-extract structure of the EDITED file so frontend can update
        new_structure = extract_pptx_structure(out_path)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Execution error: {e}")

    return {
        "file_id": file_id, 
        "download": f"/download?file_id={file_id}", 
        "plan_executed": edit_plan,
        "structure": new_structure
    }

@router.get("/download")
async def download(file_id: str):
    edited = os.path.join(settings.UPLOAD_DIR, f"{file_id}_edited.pptx")
    orig = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pptx")
    if os.path.exists(edited):
        path = edited
    elif os.path.exists(orig):
        path = orig
    else:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=os.path.basename(path))
