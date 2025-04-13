# simplies legal text 
import os
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


# Personalization summary (AI-based alignment)
def personalize_proposition(user_profile: dict, proposition_text: str) -> str:
    user_info_parts = []
    for key, value in user_profile.items():
        if key == "policy_preferences":
            prefs = " | ".join([f"{k}: {v}" for k, v in value.items()])
            user_info_parts.append(f"Policy Preferences: {prefs}")
        else:
            user_info_parts.append(f"{key}: {value}")
    user_info_str = " ; ".join(user_info_parts)

    prompt = (
        "Using the user profile and proposition below, determine how well the proposition aligns with the user's interests. "
        "Only reply with one of the following labels: 'Highly aligned', 'Moderately aligned', or 'Not aligned'. "
        "After the label, give one short sentence (≈10 words) explaining why. Do not use any formatting or markdown.\n\n"
        f"User Profile: {user_info_str}\n\n"
        f"Proposition Text: {proposition_text}"
    )
    
    resp = model.generate_content(prompt)
    return resp.text.strip()



if __name__ == "__main__":
    sample_text = (
        "In accordance with Section 4.2 of the Municipal Code, all residents are hereby required to comply "
        "with newly instated waste management procedures effective June 1st, 2025. This includes the segregation "
        "of biodegradable and non-biodegradable waste, adherence to designated disposal schedules, and the use of "
        "city-approved recycling containers. Non-compliance may result in monetary fines or other penalties as "
        "outlined by city ordinances."
    )

    print("\nSimplified Description:\n", simplify_description(sample_text))
    print("\nSimplified Paragraph:\n", simplify_paragraph(sample_text))
    print("\nPeople Affected:\n", people_affected(sample_text))
    
    # Test the personalization function with a sample user profile.
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
    print("\nPersonalization Result:\n", personalize_proposition(sample_user_profile, sample_text))
