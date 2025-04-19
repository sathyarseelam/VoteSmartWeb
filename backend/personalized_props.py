import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")

def load_json(filepath:str):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def clean_json(raw_text):
    cleaned = re.sub(r"```(?:json)?", "", raw_text)
    cleaned = cleaned.replace("```", "").strip()
    return cleaned

def rank_props(user_profile:dict, props_data:dict, top_n: int = 3) -> list:
    ranked = []
    for prop in props_data:
        prompt = (
            "You are an AI that evaluates how relevant a political proposition is for a specific user.\n"
            "Given the user's profile and one proposition, analyze the alignment and impact.\n\n"
            "Return only a single JSON object with the following fields:\n"
            "- proposition_title\n"
            "- alignment (one of: 'Highly aligned', 'Moderately aligned', 'Not aligned')\n"
            "- reason (a short sentence explaining the alignment in ~15 words)\n"
            "- impact (one sentence on how this proposition might affect this user)\n"
            "- relevance_score (a float between 0 and 1, with two decimal places for precision)\n\n"
            "Return a valid JSON object only. Do NOT use triple backticks, markdown formatting, or any extra text.\n\n"
            f"User Profile:\n{json.dumps(user_profile, indent=2)}\n\n"
            f"Proposition:\n"
            f"Title: {prop.get('title')}\n"
            f"Details: {prop.get('details')}\n"
            f"Affected People: {prop.get('affected_people')}\n"
        )
        try:
            response = model.generate_content(prompt)
            raw_output = response.text.strip()
            cleaned_output = clean_json(raw_output)
            parsed = json.loads(cleaned_output)
            ranked.append(parsed)
        except Exception as e:
            print(f"Error processing proposition '{prop.get('title')}': {e}")

    # now sort once, and take top_n
    ranked.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    return ranked[:top_n]

if __name__ == '__main__':
    USER_JSON_PATH = 'test_user_profile.json'
    PROPS_JSON_PATH = 'propositions_data.json'
    OUTPUT_PATH    = 'top3_props.json'

    user_profile = load_json(USER_JSON_PATH)
    props_data    = load_json(PROPS_JSON_PATH)

    top3_props = rank_props(user_profile, props_data, top_n=3)

    # Print to console
    print("Top 3 Personalized Propositions:\n")
    for i, prop in enumerate(top3_props, 1):
        print(f"#{i}:")
        print(json.dumps(prop, indent=2))
        print("\n" + "-"*40 + "\n")

    # **Write to JSON file**
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(top3_props, f, ensure_ascii=False, indent=2)
    print(f"Saved top 3 propositions to {OUTPUT_PATH}")
