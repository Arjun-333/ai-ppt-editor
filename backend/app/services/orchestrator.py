# backend/app/services/orchestrator.py

import os
import json
from google import genai
from dotenv import load_dotenv
from ..schemas.edit_plan_schema import EditPlan

load_dotenv()

def get_edit_plan_from_gemini(extracted_json: dict, user_instruction: str) -> dict:
    """
    Calls the Gemini API to generate a structured JSON edit plan.
    """

    # If no API key → return mock JSON plan for testing
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"[DEBUG] API Key present: {bool(api_key)}")
    
    if not api_key:
        print("⚠️  GEMINI_API_KEY not found — using mock edit plan.")
        return {
            "edits": [
                {
                    "slide_id": 1,
                    "actions": [
                        {
                            "type": "replace_text",
                            "element_id": "s1_sh1",
                            "new_text": "AI Hackathon MVP Title"
                        }
                    ]
                }
            ]
        }

    client = genai.Client(api_key=api_key)

    system_instruction = (
    "You can now also STYLE text using the 'style_text' action type. "
    "Supported styles: font_size (pt), font_color (hex), bold (bool), italic (bool)."
    "You can also CREATE new slides using 'create_slide'. "
    "Provide a 'title' and a list of 'content' strings (bullet points)."
)
    
    print(f"[DEBUG] Sending prompt to Gemini: {user_instruction}")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_instruction, prompt],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": EditPlan.model_json_schema(),
            },
        )
        
        print(f"[DEBUG] Gemini Raw Response: {response.text}")

        # Validate & return JSON
        validated = EditPlan.model_validate_json(response.text)
        return validated.model_dump()

    except Exception as e:
        print("❌ Gemini error:", e)
        import traceback
        traceback.print_exc()
        return None
