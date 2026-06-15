import os
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import sqlite3
import numpy as np
from sklearn.linear_model import LinearRegression

from database import init_db, get_db_connection
from passlib.context import CryptContext
import agents

app = FastAPI(title="EcoTrack AI API", version="1.0.0")

# CORS middleware
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Restrict CORS to known dev origins instead of allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Auth Dependency — reads from Authorization header (email used as token for simplicity)
from fastapi import Header
def get_current_user_email(authorization: Optional[str] = Header(default="demo@ecotrack.ai")):
    # Strip 'Bearer ' prefix if present
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization or "demo@ecotrack.ai"

# Request Pydantic Models
class FootprintInput(BaseModel):
    month: str
    commute_distance: float
    vehicle_type: str
    fuel_type: str
    public_transport: float
    flights: int
    electricity: float
    renewables: float
    appliances: str
    diet: str
    meat_freq: str
    food_source: str
    fashion_purchases: int
    electronics_purchases: int
    online_shopping: str
    recycling: str
    composting: str
    plastic_use: str

class AuthInput(BaseModel):
    email: str
    password: str

class GoalInput(BaseModel):
    title: str
    target_reduction: float
    target_date: str

class PostInput(BaseModel):
    content: str

# Helper: Calculate footprint
def calculate_co2(inputs: FootprintInput) -> dict:
    # 1. Transport CO2
    t_factor = 0.0
    if inputs.vehicle_type == "car":
        if inputs.fuel_type == "petrol":
            t_factor = 0.18
        elif inputs.fuel_type == "diesel":
            t_factor = 0.20
        elif inputs.fuel_type == "hybrid":
            t_factor = 0.10
        elif inputs.fuel_type == "electric":
            t_factor = 0.05
    elif inputs.vehicle_type == "motorbike":
        t_factor = 0.12
    
    commute_co2 = inputs.commute_distance * t_factor * 30.4  # Monthly commute
    public_co2 = inputs.public_transport * 0.04 * 30.4       # Public transit
    flight_co2 = inputs.flights * 250.0                      # Average flight impact
    transport_total = commute_co2 + public_co2 + flight_co2

    # 2. Energy CO2
    grid_co2 = inputs.electricity * 0.4  # 0.4 kg CO2 per kWh
    renewable_credit = grid_co2 * (inputs.renewables / 100.0)
    energy_total = grid_co2 - renewable_credit

    # 3. Food CO2
    diet_base = 5.0  # Meat-eater default
    if inputs.diet == "vegetarian":
        diet_base = 2.5
    elif inputs.diet == "vegan":
        diet_base = 1.5
    
    meat_factor = 0.0
    if inputs.meat_freq == "daily":
        meat_factor = 2.0
    elif inputs.meat_freq == "weekly":
        meat_factor = 0.5
    
    source_factor = 0.5 if inputs.food_source == "local" else 1.5
    food_total = (diet_base + meat_factor + source_factor) * 30.4

    # 4. Shopping CO2
    fashion_co2 = inputs.fashion_purchases * 15.0
    elec_co2 = inputs.electronics_purchases * 80.0
    shop_total = fashion_co2 + elec_co2

    # 5. Waste CO2
    waste_base = 15.0
    if inputs.recycling == "always":
        waste_base -= 8.0
    if inputs.composting == "always":
        waste_base -= 4.0
    waste_total = max(2.0, waste_base)

    total = transport_total + energy_total + food_total + shop_total + waste_total

    return {
        "total": round(total, 2),
        "transport": round(transport_total, 2),
        "energy": round(energy_total, 2),
        "food": round(food_total, 2),
        "shopping": round(shop_total, 2),
        "waste": round(waste_total, 2),
    }

# ----------------- Auth Routes -----------------
@app.post("/api/auth/register")
def register(data: AuthInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Hash the password before storing
        hashed = pwd_context.hash(data.password)
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (data.email, hashed))
        conn.commit()
        # Seed default habits for user
        cursor.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        user_id = cursor.fetchone()["id"]
        default_habits = ["Reusable Bottle", "Walk to Work/School", "Turn Off Appliances"]
        for habit in default_habits:
            cursor.execute("INSERT OR IGNORE INTO habits (user_id, habit_name, streak) VALUES (?, ?, 0)", (user_id, habit))
        conn.commit()
        return {"status": "success", "token": data.email}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

@app.post("/api/auth/login")
def login(data: AuthInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (data.email,))
    user = cursor.fetchone()
    conn.close()
    # Verify hashed password
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "success", "token": data.email}

@app.get("/api/user/profile")
def get_profile(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT points, level FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return {"points": 0, "level": 1}
    return dict(user)

# ----------------- Calculator & Predictions -----------------
@app.post("/api/calculator/submit")
def submit_footprint(data: FootprintInput, email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user id
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if not user:
        # Auto-create user on first footprint submission
        # Store a hashed default password for auto-created users
        hashed_auto = pwd_context.hash('changeme')
        cursor.execute("INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)", (email, hashed_auto))
        conn.commit()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user_id = cursor.fetchone()["id"]
    else:
        user_id = user["id"]
        
    co2 = calculate_co2(data)
    
    # Insert or update footprint
    cursor.execute("""
    INSERT INTO footprints (
        user_id, month, commute_distance, vehicle_type, fuel_type, public_transport, flights,
        electricity, renewables, appliances, diet, meat_freq, food_source,
        fashion_purchases, electronics_purchases, online_shopping, recycling, composting, plastic_use,
        total_co2, transport_co2, energy_co2, food_co2, shopping_co2, waste_co2, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, data.month, data.commute_distance, data.vehicle_type, data.fuel_type, data.public_transport, data.flights,
        data.electricity, data.renewables, data.appliances, data.diet, data.meat_freq, data.food_source,
        data.fashion_purchases, data.electronics_purchases, data.online_shopping, data.recycling, data.composting, data.plastic_use,
        co2["total"], co2["transport"], co2["energy"], co2["food"], co2["shopping"], co2["waste"], datetime.now().isoformat()
    ))
    
    # Award points for calculating footprint
    cursor.execute("UPDATE users SET points = points + 50 WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    
    # Compare with averages
    # National Average (US): ~1300 kg/month, Global average: ~400 kg/month
    return {
        "footprint": co2,
        "averages": {
            "national": 1300,
            "global": 400
        }
    }

@app.get("/api/calculator/history")
def get_history(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT footprints.* FROM footprints 
    JOIN users ON footprints.user_id = users.id 
    WHERE users.email = ? 
    ORDER BY footprints.month ASC
    """, (email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/calculator/predict")
def predict_footprint(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT footprints.total_co2, footprints.month FROM footprints 
    JOIN users ON footprints.user_id = users.id 
    WHERE users.email = ? 
    ORDER BY footprints.month ASC
    """, (email,))
    rows = cursor.fetchall()
    conn.close()
    
    if len(rows) < 2:
        return {"predictions": []}
    
    # Simple linear regression based on months
    y = np.array([row["total_co2"] for row in rows]).reshape(-1, 1)
    X = np.arange(len(rows)).reshape(-1, 1)
    
    model = LinearRegression()
    model.fit(X, y)
    
    predictions = []
    # Predict next 3 months
    for i in range(1, 4):
        next_month_val = len(rows) + i - 1
        predicted_val = max(0.0, float(model.predict([[next_month_val]])[0][0]))
        predictions.append({
            "month": f"Future Month +{i}",
            "total_co2": round(predicted_val, 2)
        })
        
    return {"predictions": predictions}

# ----------------- AI Services -----------------
@app.get("/api/recommendations")
def recommendations(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT footprints.* FROM footprints 
    JOIN users ON footprints.user_id = users.id 
    WHERE users.email = ? 
    ORDER BY footprints.id DESC LIMIT 1
    """, (email,))
    row = cursor.fetchone()
    conn.close()
    
    profile = dict(row) if row else {"diet": "meat", "commute_distance": 20}
    return agents.get_recommendations(email, json.dumps(profile))

@app.post("/api/coach")
def coach_chat(data: dict, email: str = Depends(get_current_user_email)):
    query = data.get("query", "")
    return {"response": agents.ask_coach(email, query)}

# ----------------- Habits & Goals -----------------
@app.get("/api/habits")
def get_habits(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT habits.* FROM habits 
    JOIN users ON habits.user_id = users.id 
    WHERE users.email = ?
    """, (email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/habits/complete")
def complete_habit(data: dict, email: str = Depends(get_current_user_email)):
    habit_name = data.get("habit_name")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user
    cursor.execute("SELECT id, points FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    user_id = user["id"]
    
    # Get habit
    cursor.execute("SELECT streak, last_completed FROM habits WHERE user_id = ? AND habit_name = ?", (user_id, habit_name))
    habit = cursor.fetchone()
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    new_streak = 1
    if habit:
        last = habit["last_completed"]
        if last == today_str:
            # Already completed today
            new_streak = habit["streak"]
        else:
            new_streak = habit["streak"] + 1
            
        cursor.execute("UPDATE habits SET streak = ?, last_completed = ? WHERE user_id = ? AND habit_name = ?", (new_streak, today_str, user_id, habit_name))
    else:
        cursor.execute("INSERT INTO habits (user_id, habit_name, streak, last_completed) VALUES (?, ?, 1, ?)", (user_id, habit_name, today_str))
        
    # Reward points
    points_earned = 10 + (min(new_streak, 10) * 2)  # Base + streak bonus
    cursor.execute("UPDATE users SET points = points + ?, level = (points + ?) / 100 + 1 WHERE id = ?", (points_earned, points_earned, user_id))
    
    conn.commit()
    conn.close()
    return {"status": "success", "streak": new_streak, "points_earned": points_earned}

@app.get("/api/goals")
def get_goals(email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT goals.* FROM goals 
    JOIN users ON goals.user_id = users.id 
    WHERE users.email = ?
    """, (email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/goals")
def create_goal(data: GoalInput, email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user_id = cursor.fetchone()["id"]
    
    cursor.execute("INSERT INTO goals (user_id, title, target_reduction, current_progress, target_date) VALUES (?, ?, ?, 0, ?)",
                   (user_id, data.title, data.target_reduction, data.target_date))
    conn.commit()
    conn.close()
    return {"status": "success"}

# ----------------- Gamification & Community -----------------
@app.get("/api/leaderboard")
def get_leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT email, points, level FROM users ORDER BY points DESC LIMIT 10")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/community")
def get_posts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM community_posts ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/community")
def create_post(data: PostInput, email: str = Depends(get_current_user_email)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO community_posts (user_email, content, timestamp) VALUES (?, ?, ?)",
                   (email, data.content, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return {"status": "success"}

# ----------------- Learning & Offset Marketplace -----------------
@app.get("/api/offsets")
def get_offsets():
    return [
        {"id": 1, "title": "Amazon Rainforest Reforestation", "type": "Forestry", "cost_per_ton": 15.0, "impact": "Restores native tree species and protects biodiverse habitats.", "status": "Verified (Gold Standard)"},
        {"id": 2, "title": "Wind Energy Farm Development", "type": "Renewable", "cost_per_ton": 10.0, "impact": "Offsets fossil fuel grid dependency in rural communities.", "status": "Verified (VCS)"},
        {"id": 3, "title": "Clean Water Wells Project", "type": "Water", "cost_per_ton": 18.0, "impact": "Saves fuel burned to boil contaminated water for consumption.", "status": "Verified (Gold Standard)"}
    ]

@app.get("/api/learning/quiz")
def get_quiz():
    return [
        {
            "id": 1,
            "question": "Which of these travel methods produces the lowest carbon emissions per passenger-kilometer?",
            "options": ["Flying", "Electric Car (solo)", "Train/Railway", "Petrol Car"],
            "answer": "Train/Railway",
            "explanation": "Trains operate with high passenger capacity and high energy efficiency, yielding the lowest footprint."
        },
        {
            "id": 2,
            "question": "What percentage of global greenhouse gases is estimated to come from food supply chains?",
            "options": ["~5%", "~12%", "~26%", "~50%"],
            "answer": "~26%",
            "explanation": "Food production accounts for roughly 26% of global greenhouse emissions, with meat and dairy contributing the largest share."
        }
    ]

# ----------------- Image / Bill Parsing -----------------
@app.post("/api/bill/upload")
async def upload_bill(file: UploadFile = File(...), email: str = Depends(get_current_user_email)):
    # Simulating bill analysis: reads content/filename and extracts mock data
    contents = await file.read()
    filename = file.filename.lower()
    
    # Search for hints in name or text contents
    text = f"File name: {filename}. Content snippet: " + contents[:200].decode("utf-8", errors="ignore")
    parsed = agents.analyze_bill_text(email, text)
    return parsed

# Mount frontend static build files if they exist (for production on Cloud Run)
# Dockerfile copies frontend dist to /app/backend/frontend/dist
# When running as 'python -m uvicorn backend.main:app', CWD is /app
STATIC_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
