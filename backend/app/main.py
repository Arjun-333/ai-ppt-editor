# main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from .services.parser import extract_pptx_structure
from .services.orchestrator import get_edit_plan_from_gemini
from .services.executor import apply_edit_plan
from .schemas.edit_plan_schema import EditPlan
from .services.debug_shapes import inspect_ppt

import os, uuid, json

# ---------------------------------------------
# MUST COME FIRST
# ---------------------------------------------
app = FastAPI()
UPLOAD_DIR = "tmp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------
# DEBUG ENDPOINT (NOW VALID)
# ---------------------------------------------
@app.get("/debug")
async def debug(file_id: str):
    path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")
    if not os.path.exists(path):
        return {"error": "file not found"}

    print("\n=== RUNNING DEBUG ===")
    inspect_ppt(path)
    print("=== DEBUG COMPLETE ===\n")

    return {"message": "Debug printed in backend terminal"}

# ---------------------------------------------
# UPLOAD ENDPOINT
# ---------------------------------------------
@app.post("/upload")
async def upload_pptx(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    orig_path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")

    with open(orig_path, "wb") as f:
        f.write(await file.read())

    structure = extract_pptx_structure(orig_path)

    with open(orig_path + ".json", "w") as jf:
        json.dump(structure, jf, indent=2)

    return {
        "file_id": file_id,
        "structure": structure,
        "message": "File uploaded and parsed"
    }

# ---------------------------------------------
# EDIT ENDPOINT
# ---------------------------------------------
@app.post("/edit")
async def edit_pptx(file_id: str = Form(...), instruction: str = Form(...)):
    orig_path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")
    json_path = orig_path + ".json"
    out_path = os.path.join(UPLOAD_DIR, f"{file_id}_edited.pptx")

    if not os.path.exists(orig_path):
        raise HTTPException(status_code=404, detail="Original PPTX not found")

    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Extracted structure not found")

    with open(json_path) as jf:
        extracted = json.load(jf)

    edit_plan = get_edit_plan_from_gemini(extracted, instruction)

    if not edit_plan:
        raise HTTPException(status_code=500, detail="Gemini failed to generate an edit plan")

    try:
        EditPlan.model_validate(edit_plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema error: {e}")

    apply_edit_plan(orig_path, edit_plan, out_path)

    return {
        "file_id": file_id,
        "download": f"/download?file_id={file_id}",
        "plan_executed": edit_plan
    }

# ---------------------------------------------
# DOWNLOAD ENDPOINT
# ---------------------------------------------
@app.get("/download")
async def download(file_id: str):
    edited = os.path.join(UPLOAD_DIR, f"{file_id}_edited.pptx")
    orig = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")

    if os.path.exists(edited):
        path = edited
    elif os.path.exists(orig):
        path = orig
    else:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path, filename=os.path.basename(path))
