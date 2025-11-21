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
    if not os.getenv("GEMINI_API_KEY"):
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

    client = genai.Client()

    system_instruction = (
    "You are an AI PowerPoint structural editor. "
    "You will ONLY produce JSON that matches the schema provided. "
    "DO NOT target group shapes, decorative shapes, or empty shapes. "
    "ONLY modify elements that appear in the provided PPT structure JSON. "
    "The PPT structure already contains only editable text and images. "
    "Your output MUST reference exact element_id values from that structure. "
    "Do NOT invent element IDs."
    "You can now also STYLE text using the 'style_text' action type. "
    "Supported styles: font_size (pt), font_color (hex), bold (bool), italic (bool)."
)


    prompt = (
        f"PPT Structure:\n{json.dumps(extracted_json, indent=2)}\n\n"
        f"User Request:\n{user_instruction}\n\n"
        "Now generate the JSON edit plan."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_instruction, prompt],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": EditPlan.model_json_schema(),
            },
        )

        # Validate & return JSON
        validated = EditPlan.model_validate_json(response.text)
        return validated.model_dump()

    except Exception as e:
        print("❌ Gemini error:", e)
        return None
