# simplies legal text 
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")

# blurb on the tab
# Simplified description (tab blurb)
def simplify_description(text: str) -> str:
    prompt = (
        "Rewrite the following in clear, everyday language using two short sentences. "
        "Avoid all legal, technical, or formal language. No markdown or formatting—just plain text.\n\n"
        f"{text}"
    )
    resp = model.generate_content(prompt)
    return resp.text.strip()


# Simplified paragraph (popup info)
def simplify_paragraph(text: str) -> str:
    prompt = (
        "Rewrite the following in 3–4 plain sentences using everyday language. "
        "Avoid legal or technical jargon. Do not include any formatting or markdown.\n\n"
        f"{text}"
    )
    resp = model.generate_content(prompt)
    return resp.text.strip()


# People affected (popup info)
def people_affected(text: str) -> str:
    prompt = (
        "In plain text, list who would benefit and who might be hurt by this proposition. "
        "Use two short bullet lists, titled 'Positively Affected' and 'Negatively Affected'. "
        "Use hyphens (-) for bullets. Do not use any markdown or formatting.\n\n"
        f"{text}"
    )
    resp = model.generate_content(prompt)
    return resp.text.strip()