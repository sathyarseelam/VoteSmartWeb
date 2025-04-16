from fastapi import FastAPI, Request, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import date
from typing import List, Dict, Optional
from policy_scraper import fetch_main_page, extract_prop_blocks, fetch_prop_details
from gemini import simplify_description, simplify_paragraph, people_affected, personalize_proposition

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

# Setup MongoDB connection using PyMongo
client = MongoClient("mongodb+srv://mbhagatw:878298347235@cluster0.rjnq2ff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client.get_database("voteSmart")  # Use your database name here
collection_name = db["users"]

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
    return templates.TemplateResponse("register.html", {"request": request, "flash": flashes})


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
    return templates.TemplateResponse("register_confirmation.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
def login_get(request: Request):
    flashes = get_flash(request)
    return templates.TemplateResponse("login.html", {"request": request, "flash": flashes})


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


# ---- Profile Update Steps ----

@app.get("/profile/step1", response_class=HTMLResponse)
def profile_step1_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    init_profile_session(request)
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step1.html", {"request": request, "flash": flashes})


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
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step2.html", {"request": request, "flash": flashes})


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
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step3.html", {"request": request, "flash": flashes})


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
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step4.html", {"request": request, "flash": flashes})


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
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step5.html", {"request": request, "flash": flashes})


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
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step6.html", {"request": request, "flash": flashes})


@app.post("/profile/step6", response_class=HTMLResponse)
async def profile_step6_post(request: Request, income_bracket: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["income_bracket"] = income_bracket
    return RedirectResponse(url="/profile/step7", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step7", response_class=HTMLResponse)
def profile_step7_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step7.html", {"request": request, "flash": flashes})


@app.post("/profile/step7", response_class=HTMLResponse)
async def profile_step7_post(request: Request, family_size: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["family_size"] = family_size
    return RedirectResponse(url="/profile/step8", status_code=status.HTTP_302_FOUND)


@app.get("/profile/step8", response_class=HTMLResponse)
def profile_step8_get(request: Request):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    flashes = get_flash(request)
    return templates.TemplateResponse("profile_step8.html", {"request": request, "flash": flashes})


@app.post("/profile/step8", response_class=HTMLResponse)
async def profile_step8_post(request: Request, race_ethnicity: str = Form(...)):
    if "email" not in request.session:
        add_flash(request, "You need to log in to update your profile.")
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    request.session["profile"]["race_ethnicity"] = race_ethnicity

    # Update user document in MongoDB with profile data from session
    profile_data = request.session.get("profile", {})
    db.users.update_one({"email": request.session["email"]}, {"$set": profile_data})
    # Clear temporary profile data
    request.session.pop("profile", None)

    add_flash(request, "Profile updated successfully!")
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


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
            "Climate change": "Right",
            "Universal healthcare": "Right",
            "Prison reform": "Right",
            "Abortion": "Right",
            "Education": "Right",
            "Immigration": "Right",
            "Military spending": "Right"
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
