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

def get_top_propositions(user_profile: dict, propositions: list) -> list:
    """
    Get the top 3 propositions that resonate most with the user based on their profile.

    Args:
        user_profile (dict): The user's profile data.
        propositions (list): A list of propositions, each as a dictionary with keys like 'number' and 'details'.

    Returns:
        list: A list of the top 3 propositions with their alignment, reason, and impact.
    """
    results = []

    for proposition in propositions:
        # Use the personalize_proposition function to evaluate alignment
        proposition_text = proposition.get("details", "")
        result = personalize_proposition(user_profile, proposition_text)
        result["proposition_number"] = proposition.get("number", "Unknown")
        result["proposition_title"] = proposition.get("title", "Untitled")
        results.append(result)

    # Sort the results by alignment priority (Highly aligned > Moderately aligned > Not aligned)
    alignment_priority = {"Highly aligned": 3, "Moderately aligned": 2, "Not aligned": 1}
    results.sort(key=lambda x: alignment_priority.get(x["alignment"], 0), reverse=True)

    # Return the top 3 propositions
    return results[:3]

# Personalization summary (AI-based alignment)
# Enhanced personalization function in gemini.py
def personalize_proposition(user_profile: dict, proposition_text: str) -> dict:
    user_info_parts = []
    for key, value in user_profile.items():
        if key == "policy_preferences":
            prefs = " | ".join([f"{k}: {v}" for k, v in value.items()])
            user_info_parts.append(f"Policy Preferences: {prefs}")
        else:
            user_info_parts.append(f"{key}: {value}")
    user_info_str = " ; ".join(user_info_parts)

    prompt = (
        "Using the user profile and proposition below, create a personalized response with the following format:\n"
        "1. Alignment: One of 'Highly aligned', 'Moderately aligned', or 'Not aligned'\n"
        "2. Reason: A short sentence (≈15 words) explaining the alignment reasoning\n"
        "3. Impact: One sentence on how this would directly impact this specific user\n"
        "4. Format as a JSON with these fields. No markdown or additional text.\n\n"
        f"User Profile: {user_info_str}\n\n"
        f"Proposition Text: {proposition_text}"
    )
    
    resp = model.generate_content(prompt)
    response_text = resp.text.strip()
    
    # Parse the JSON response (with error handling)
    try:
        import json
        return json.loads(response_text)
    except:
        # Fallback if JSON parsing fails
        return {
            "alignment": "Unknown",
            "reason": "Could not determine alignment",
            "impact": "Impact analysis unavailable"
        }

if __name__ == "__main__":
    # Load propositions from props.json
    props_file_path = "/Users/avnigandhi/Documents/VoteSmartWeb/backend/props.json"
    with open(props_file_path, "r") as file:
        propositions = json.load(file)

    # Example user profile (hardcoded for now)
    sample_user_profile = {
        "first_name": "Alex",
        "last_name": "Doe",
        "date_of_birth": "1990-01-15",
        "email": "alex@example.com",
        "gender": "Non-Binary",
        "county": "Los Angeles",
        "income_bracket": "50k-75k",
        "education_level": "Bachelor's Degree",
        "occupation": "Software Developer",
        "family_size": 1,
        "race_ethnicity": "Hispanic",
        "policy_preferences": {
            "Climate change": "Left",
            "Universal healthcare": "Left",
            "Prison reform": "Neutral",
            "Abortion": "Right",
            "Education": "Left",
            "Immigration": "Left",
            "Military spending": "Right"
        }
    }

    # Get the top 3 propositions
    top_propositions = get_top_propositions(sample_user_profile, propositions)

    # Print the results (for debugging purposes)
    print("\nTop 3 Propositions:")
    for prop in top_propositions:
        print(f"Proposition {prop['proposition_number']} - {prop['proposition_title']}")

    # Output the top 3 propositions for the frontend
    output_file_path = "/Users/avnigandhi/Documents/VoteSmartWeb/backend/top_propositions.json"
    with open(output_file_path, "w") as output_file:
        json.dump(top_propositions, output_file, indent=4)