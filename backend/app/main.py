# main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from services.parser import extract_pptx_structure
from services.orchestrator import call_gemini_structured
from services.executor import apply_edit_plan
import os, uuid, json

app = FastAPI()
UPLOAD_DIR = "tmp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_pptx(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")
    with open(path,"wb") as f:
        f.write(await file.read())
    structure = extract_pptx_structure(path)
    # save structure for session mapping, in prod use DB
    with open(path + ".json","w") as jf:
        json.dump(structure, jf)
    return {"file_id": file_id, "structure": structure}

@app.post("/edit")
async def edit_pptx(file_id: str = Form(...), instruction: str = Form(...)):
    orig_path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")
    if not os.path.exists(orig_path):
        return {"error":"file not found"}
    with open(orig_path + ".json") as jf:
        extracted = json.load(jf)
    # Call Gemini (or simulate)
    # schema_str = ...  # you can load the JSON Schema string
    edit_plan = call_gemini_structured(extracted, instruction, schema_str=None)
    out_path = os.path.join(UPLOAD_DIR, f"{file_id}_edited.pptx")
    apply_edit_plan(orig_path, edit_plan, out_path)
    return {"file_id": file_id, "download": f"/download?file_id={file_id}"}

@app.get("/download")
async def download(file_id: str):
    path = os.path.join(UPLOAD_DIR, f"{file_id}_edited.pptx")
    if not os.path.exists(path):
        path = os.path.join(UPLOAD_DIR, f"{file_id}.pptx")  # fallback
    return FileResponse(path, filename=os.path.basename(path))
