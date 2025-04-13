# main.py (or wherever you put your “run” logic)
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found")

genai.configure(api_key=api_key)

# 1. Proposition data from your config.json
with open("config.json", "r", encoding="utf-8") as f:
    PROPOSITIONS = json.load(f)

# 2. Sample user profile
user_profile = {
    "first_name": "Alex",
    "last_name": "Doe",
    "date_of_birth": "1990-01-15",
    "email": "alex@example.com",
    "gender": "Non-Binary",
    "county": "Los Angeles",
    "income_bracket": "50k-75k",
    "education_level": "Bachelor's Degree",
    "occupation": "Software Developer",
    "family_size": 10,
    "race_ethnicity": "Hispanic",
    "policy_preferences": {
        "Climate change": "Right",
        "Universal healthcare": "Right",
        "Prison reform": "Right",
        "Abortion": "Right",
        "Education": "Right",
        "Immigration": "Right",
        "Military spending": "Right"
    }
}

def extract_user_interests(user_profile: dict) -> list[str]:
    """
    Extract a list of policy topics from user_profile['policy_preferences'],
    ignoring 'Neutral' stances.
    """
    prefs = user_profile.get("policy_preferences", {})
    # Just get the keys if stance != 'Neutral'
    user_interests = [topic for topic, stance in prefs.items() if stance.lower() != "neutral"]
    return user_interests

def pick_top_3_propositions(user_interests: list[str]) -> list[dict]:
    """
    Example GPT prompt that ranks propositions by how well they match the user_interests.
    Returns a list of 3 dicts: [{number, title, summary, score}, ...].
    """
    # Create a minimal version of your proposition data for the prompt
    mini_proposals = [
        {
            "number": prop["number"],
            "title": prop["title"],
            "summary": prop["simplified_description"],
            "paragraph": prop["simplified_paragraph"],
            "affected people": prop["affected_people"]
        }
        for prop in PROPOSITIONS
    ]

    # Build a prompt that asks GPT to rank them
    prompt_text = (
        f"The user cares most about: {', '.join(user_interests)}.\n\n"
        "Here are some ballot propositions:\n"
        f"{json.dumps(mini_proposals, indent=2)}\n\n"
        "Please assign an alignment score (1=low, 5=high). "
        "Then return the TOP 3 in JSON, sorted by score descending, in this format:\n"
        "[\n"
        "  { \"number\": \"...\", \"title\": \"...\", \"summary\": \"...\", \"score\": 5 },\n"
        "  ...\n"
        "]"
    )

    resp = genai.generate_text(
        model="gemini-1.5-pro-latest",  # or whichever you have
        prompt=prompt_text,
        temperature=0.0,
        max_output_tokens=512
    )
    
    raw_output = resp.candidates[0].output
    try:
        top3 = json.loads(raw_output)
    except:
        top3 = []
    return top3

def main():
    # 1) Convert user profile to a list of interests
    interests_list = extract_user_interests(user_profile)

    # 2) Get the top 3 propositions
    top_3 = pick_top_3_propositions(interests_list)

    # 3) Print or return them
    print(json.dumps(top_3, indent=2))

if __name__ == "__main__":
    main()
