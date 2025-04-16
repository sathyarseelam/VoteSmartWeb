from fastapi import FastAPI, Request, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import date
from typing import List, Dict, Optional
from policy_scraper import fetch_main_page, extract_prop_blocks, fetch_prop_details
from gemini import simplify_description, simplify_paragraph, people_affected, personalize_proposition
from dotenv import load_dotenv
import os

app = FastAPI()

# Set up CORS for your frontend
origins = ["http://localhost:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup MongoDB connection using PyMongo
load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))
db = client.get_database("voteSmart") 
users = db["users"]

# ---------------------------

class PolicyChoice(str, Enum):
    left = "Left"
    neutral = "Neutral"
    right = "Right"

class PolicyPreferences(BaseModel):
    civil_rights: PolicyChoice
    climate: PolicyChoice
    criminal_justice: PolicyChoice
    education: PolicyChoice
    economy: PolicyChoice
    healthcare: PolicyChoice
    housing: PolicyChoice
    immigration_global_affairs: PolicyChoice
    infrastructure: PolicyChoice
    tech_innovation: PolicyChoice

class UserProfile(BaseModel):
    # required
    first_name: str
    last_name: str
    date_of_birth: date
    email: EmailStr

    # everything from here is optional
    gender: Optional[str] = None
    county: Optional[str] = None
    income_bracket: Optional[str] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    family_size: Optional[int] = None
    race_ethnicity: Optional[str] = None

    # now your exact policy list, optional
    policy_preferences: Optional[PolicyPreferences] = None

# In-memory propositions cache (for scraped propositions)
propositions_cache: List[Dict] = []


# ----------- Proposition API Endpoints -----------

class Proposition(BaseModel):
    number: str
    title: str
    url: str
    details: Optional[str] = None
    simplified_description: Optional[str] = None
    simplified_paragraph: Optional[str] = None
    affected_people: Optional[str] = None
    personalization_summary: Optional[str] = None


@app.get("/scrape-propositions", response_model=List[Proposition])
def get_scraped_propositions():
    try:
        soup = fetch_main_page()  # Scraper function
        props = extract_prop_blocks(soup)
        for prop in props:
            prop["details"] = fetch_prop_details(prop["url"])
        global propositions_cache
        propositions_cache = props
        return props
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping propositions: {str(e)}")


@app.get("/simplify-propositions", response_model=List[Proposition])
def get_simplified_propositions():
    if not propositions_cache:
        raise HTTPException(
            status_code=404,
            detail="No propositions have been scraped yet. Call /scrape-propositions first.",
        )
    simplified_props = []
    for prop in propositions_cache:
        details = prop.get("details", "")
        try:
            simple_desc = simplify_description(details)
            simple_para = simplify_paragraph(details)
            people_aff = people_affected(details)
        except Exception as e:
            simple_desc = f"Error in simplification: {str(e)}"
            simple_para = f"Error in simplification: {str(e)}"
            people_aff = f"Error formulating: {str(e)}"
        prop["simplified_description"] = simple_desc
        prop["simplified_paragraph"] = simple_para
        prop["affected_people"] = people_aff
        simplified_props.append(prop)
    return simplified_props


@app.get("/personalized-feed", response_model=List[Proposition])
def get_personalized_feed():
    # Hardcoded user profile for personalization (simulate signup data)
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
            "Civil Rights": "Right",
            "Climate ": "Right",
            "Criminal Justice": "Right",
            "Education": "Right",
            "Economy": "Right",
            "Healthcare": "Right",
            "Housing": "Right",
            "Immigration & Global Affairs": "Right",
            "Infrastructure": "Right",
            "Tech & Innovation": "Right",
        }
    }
    if not propositions_cache:
        raise HTTPException(
            status_code=404,
            detail="No propositions available. Please scrape them first.",
        )
    personalized_props = []
    for prop in propositions_cache:
        details = prop.get("details", "")
        if not details:
            continue
        personalization = personalize_proposition(user_profile, details)
        # Skip propositions that are "Not aligned"
        if "Not aligned" in personalization:
            continue
        prop["personalization_summary"] = personalization
        personalized_props.append(prop)
    return personalized_props


# ----------- Main Section -----------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)