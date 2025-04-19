from fastapi import FastAPI, Request, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pymongo import MongoClient, IndexModel
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from datetime import date
from typing import List, Dict, Optional
from policy_scraper import fetch_main_page, extract_prop_blocks, fetch_prop_details
from gemini import simplify_description, simplify_paragraph, people_affected, personalize_proposition
from dotenv import load_dotenv
import os, uuid
from passlib.hash import bcrypt
from fastapi.encoders import jsonable_encoder
import certifi                         # NEW



app = FastAPI()

# Set up CORS for your frontend
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET"))


# Setup MongoDB connection using PyMongo
load_dotenv()
client = MongoClient(
    os.getenv("MONGO_URL"),            # e.g. mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true&w=majority
    tls=True,                          # ensure TLS
    tlsCAFile=certifi.where()          # use certifi’s CA bundle
)
db = client.voteSmart
users = db.users

# make sure email is unique
users.create_indexes([IndexModel("email", unique=True)])

# ----------- Base Models ---------------- #

class PolicyChoice(str, Enum):
    """Allowed stances for each policy area"""
    Left = "Left"
    Neutral = "Neutral"
    Right = "Right"

class UserProfile(BaseModel):
    first_name: str       = Field(alias="firstName")
    last_name: str        = Field(alias="lastName")
    date_of_birth: str    = Field(alias="dateOfBirth")  # ISO "YYYY-MM-DD"
    email: EmailStr       # validated email address

    # Truly optional fields (can be omitted or null)
    gender: Optional[str]          = None
    county: Optional[str]          = None
    income_bracket: Optional[str]  = Field(None, alias="incomeBracket")
    education_level: Optional[str] = Field(None, alias="educationLevel")
    occupation: Optional[str]      = None
    family_size: Optional[str]     = Field(None, alias="familySize")
    race_ethnicity: Optional[str]  = Field(None, alias="raceEthnicity")
    benefits: Optional[List[str]]  = None

    # Map of policy IDs (e.g. 'civil-rights') to stance enums
    policy_preferences: Optional[Dict[str, PolicyChoice]] = Field(
        None,
        alias="policyStances",
        description="Keys are policy IDs, values are one of 'Left', 'Neutral', 'Right'"
    )

class RegistrationRequest(BaseModel):
    profile: UserProfile
    password: str 
    uid: str


class Proposition(BaseModel):
    number: str
    title: str
    url: str
    details: Optional[str] = None
    simplified_description: Optional[str] = None
    simplified_paragraph: Optional[str] = None
    affected_people: Optional[str] = None
    personalization_summary: Optional[str] = None

# In-memory propositions cache (for scraped propositions)
propositions_cache: List[Dict] = []




# ----------- Routes -----------
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>VoteSmart API</title>
        </head>
        <body>
            <h1>Welcome to the VoteSmart API</h1>
            <p>Use the endpoints to scrape and simplify propositions.</p>
        </body>
    </html>
    """

@app.post("/auth/register")
async def register(body: RegistrationRequest):
    # 1. make sure email isn’t taken

    doc = body.profile.model_dump(by_alias=False)
    doc["password_hash"] = bcrypt.hash(body.password)
    doc["uid"] = body.uid

    # 3. insert
    users.insert_one(doc)

    # 4. return lightweight success payload
    return {"uid": doc["uid"]}

@app.get("/users/{uid}")
async def get_user(uid: str):
    # Look up the user document in MongoDB, omit the password_hash
    doc = users.find_one({"uid": uid}, {"password_hash": 0})
    if not doc:
        raise HTTPException(404, "user not found")
    # Convert MongoDB's special ObjectId to a string for JSON serialization
    doc["_id"] = str(doc["_id"])
    return jsonable_encoder(doc)



# ----------- Proposition API Endpoints -----------


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
            "civil_rights": "Right",
            "climate ": "Right",
            "criminal Justice": "Right",
            "education": "Right",
            "economy": "Right",
            "healthcare": "Right",
            "housing": "Right",
            "immigration_global_affairs": "Right",
            "infrastructure": "Right",
            "tech_innovation": "Right",
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