from fastapi import FastAPI, Request, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

# Import external modules (assume these are available in your project)
from policy_scraper import fetch_main_page, extract_prop_blocks, fetch_prop_details
from gemini import (
    simplify_description,
    simplify_paragraph,
    people_affected,
    personalize_proposition,
)

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

# Add session middleware (just like Flask's session)
app.add_middleware(SessionMiddleware, secret_key="secretkey")

# Set up Jinja2 templates (ensure your HTML files are in the "templates" directory)
templates = Jinja2Templates(directory="templates")

# Setup MongoDB connection using PyMongo
client = MongoClient("mongodb+srv://mbhagatw:878298347235@cluster0.rjnq2ff.mongodb.net/loginapp?retryWrites=true&w=majority&appName=Cluster0")
db = client.get_database("loginapp")

# In-memory propositions cache (for scraped propositions)
propositions_cache: List[Dict] = []


# ----------- Helper Functions -----------

def add_flash(request: Request, message: str):
    """Imitate Flask flash messaging by storing messages in the session."""
    flashes = request.session.get("flash", [])
    flashes.append(message)
    request.session["flash"] = flashes


def get_flash(request: Request):
    """Retrieve and clear flash messages."""
    flashes = request.session.get("flash", [])
    request.session["flash"] = []
    return flashes


def init_profile_session(request: Request):
    """Initialize a temporary profile session (if missing)."""
    if "profile" not in request.session:
        request.session["profile"] = {}


# ----------- Authentication & Profile Routes -----------

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    flashes = get_flash(request)
    email = request.session.get("email")
    if email:
        content = f"Logged in as: {email}<br><a href='/logout'>Logout</a>"
    else:
        content = "Welcome to the LoginApp!<br><a href='/login'>Login</a> | <a href='/register'>Register</a>"
    html_content = f"""
    <html>
      <head>
        <title>Login App</title>
      </head>
      <body>
        {''.join([f"<p>{msg}</p>" for msg in flashes])}
        <p>{content}</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.get("/register", response_class=HTMLResponse)
def register_get(request: Request):
    flashes = get_flash(request)
    return "success"


@app.post("/register")
async def register_post(request: Request, email: str = Form(...), password: str = Form(...)):
    # Check if the user exists
    existing = db.users.find_one({"email": email})
    if existing:
        add_flash(request, "Email already exists. Try logging in.")
        return RedirectResponse(url="/register", status_code=status.HTTP_302_FOUND)
    
    # Hash and store the password
    hashed = generate_password_hash(password)
    db.users.insert_one({"email": email, "password": hashed})
    
    # Render a confirmation page
    return "success"


@app.get("/login", response_class=HTMLResponse)
def login_get(request: Request):
    flashes = get_flash(request)
    return "success"


@app.post("/login")
async def login_post(request: Request, email: str = Form(...), password: str = Form(...)):
    user = db.users.find_one({"email": email})
    if user and check_password_hash(user["password"], password):
        request.session["email"] = email
        add_flash(request, "Logged in successfully!")
        return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    else:
        add_flash(request, "Invalid email or password. Please try again.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


@app.get("/logout")
def logout(request: Request):
    request.session.pop("email", None)
    add_flash(request, "You have been logged out.")
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)

@app.get("/getUserData", response_class=JSONResponse)
def get_user_data(request: Request):
    # Ensure the user is logged in
    if "email" not in request.session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email = request.session["email"]
    # Find the user in MongoDB by email
    user = db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Try to get the first name from the user's data, or fallback to a generic name
    first_name = user.get("first_name", "User")
    
    return JSONResponse(content={"userName": first_name})


# ---- Multi-Step Profile Update Routes ----

@app.get("/profile/step1", response_class=HTMLResponse)
def profile_step1_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    init_profile_session(request)
    return "success"


@app.post("/profile/step1", response_class=HTMLResponse)
async def profile_step1_post(request: Request, first_name: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    init_profile_session(request)
    request.session["profile"]["first_name"] = first_name
    return RedirectResponse(url="/profile/step2", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step2", response_class=HTMLResponse)
def profile_step2_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step2", response_class=HTMLResponse)
async def profile_step2_post(request: Request, last_name: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["last_name"] = last_name
    return RedirectResponse(url="/profile/step3", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step3", response_class=HTMLResponse)
def profile_step3_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step3", response_class=HTMLResponse)
async def profile_step3_post(request: Request, birth_date: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["birth_date"] = birth_date
    return RedirectResponse(url="/profile/step4", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step4", response_class=HTMLResponse)
def profile_step4_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step4", response_class=HTMLResponse)
async def profile_step4_post(request: Request, gender: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["gender"] = gender
    return RedirectResponse(url="/profile/step5", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step5", response_class=HTMLResponse)
def profile_step5_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step5", response_class=HTMLResponse)
async def profile_step5_post(request: Request, county: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["county"] = county
    return RedirectResponse(url="/profile/step6", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step6", response_class=HTMLResponse)
def profile_step6_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step6", response_class=HTMLResponse)
async def profile_step6_post(request: Request, income_bracket: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["income_bracket"] = income_bracket
    # Redirect to new Step 7: Education Level
    return RedirectResponse(url="/profile/step7", status_code=status.HTTP_302_FOUND)


# New Step 7: Education Level
@app.get("/profile/step7", response_class=HTMLResponse)
def profile_step7_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step7", response_class=HTMLResponse)
async def profile_step7_post(request: Request, education_level: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["education_level"] = education_level
    return RedirectResponse(url="/profile/step8", status_code=status.HTTP_302_FOUND)


# New Step 8: Occupation
@app.get("/profile/step8", response_class=HTMLResponse)
def profile_step8_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step8", response_class=HTMLResponse)
async def profile_step8_post(request: Request, occupation: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["occupation"] = occupation
    return RedirectResponse(url="/profile/step9", status_code=status.HTTP_302_FOUND)


# Adjusted Step 9: Family Size (previously step7)
@app.get("/profile/step9", response_class=HTMLResponse)
def profile_step9_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step9", response_class=HTMLResponse)
async def profile_step9_post(request: Request, family_size: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["family_size"] = family_size
    return RedirectResponse(url="/profile/step10", status_code=status.HTTP_302_FOUND)


# Adjusted Step 10: Race/Ethnicity (previously step8)
@app.get("/profile/step10", response_class=HTMLResponse)
def profile_step10_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step10", response_class=HTMLResponse)
async def profile_step10_post(request: Request, race_ethnicity: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["race_ethnicity"] = race_ethnicity
    return RedirectResponse(url="/profile/step11", status_code=status.HTTP_302_FOUND)


# Adjusted Step 11: Policy Preferences (previously step9)
@app.get("/profile/step11", response_class=HTMLResponse)
def profile_step11_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return "success"


@app.post("/profile/step11", response_class=HTMLResponse)
async def profile_step11_post(request: Request, policy_preferences: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["policy_preferences"] = policy_preferences
    # Final update: update the MongoDB user document with all collected profile data
    profile_data = request.session.get("profile", {})
    db.users.update_one({"email": request.session["email"]}, {"$set": profile_data})
    request.session.pop("profile", None)
    add_flash(request, "Profile updated successfully!")
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


# ---- Updated API Endpoint for Profile Step Endpoints ----
@app.get("/profile/endpoints", response_class=JSONResponse)
def get_profile_endpoints():
    endpoints = {
        "step1": {
            "url": "/profile/step1",
            "method": "GET (form) / POST (expects 'first_name')",
            "description": "Enter your first name."
        },
        "step2": {
            "url": "/profile/step2",
            "method": "GET (form) / POST (expects 'last_name')",
            "description": "Enter your last name."
        },
        "step3": {
            "url": "/profile/step3",
            "method": "GET (form) / POST (expects 'birth_date' in YYYY-MM-DD format)",
            "description": "Enter your birth date."
        },
        "step4": {
            "url": "/profile/step4",
            "method": "GET (form) / POST (expects 'gender')",
            "description": "Choose your gender."
        },
        "step5": {
            "url": "/profile/step5",
            "method": "GET (form) / POST (expects 'county')",
            "description": "Enter your county."
        },
        "step6": {
            "url": "/profile/step6",
            "method": "GET (form) / POST (expects 'income_bracket')",
            "description": "Choose your income bracket."
        },
        "step7": {
            "url": "/profile/step7",
            "method": "GET (form) / POST (expects 'education_level')",
            "description": "Enter your education level."
        },
        "step8": {
            "url": "/profile/step8",
            "method": "GET (form) / POST (expects 'occupation')",
            "description": "Enter your occupation."
        },
        "step9": {
            "url": "/profile/step9",
            "method": "GET (form) / POST (expects 'family_size')",
            "description": "Choose your family size."
        },
        "step10": {
            "url": "/profile/step10",
            "method": "GET (form) / POST (expects 'race_ethnicity')",
            "description": "Choose your race/ethnicity."
        },
        "step11": {
            "url": "/profile/step11",
            "method": "GET (form) / POST (expects 'policy_preferences' with one of: 'Right Leaning', 'Middle', 'Left Leaning')",
            "description": "Select your policy preferences."
        }
    }
    return JSONResponse(content=endpoints)


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


@app.get("/prop-api-root")
def prop_api_root():
    return {"message": "Welcome to the Proposition API!"}


# ----------- Main Section -----------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)