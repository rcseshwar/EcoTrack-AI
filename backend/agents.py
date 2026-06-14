import os
import json
from google.adk import Agent, Runner
from google.adk.sessions.in_memory_session_service import InMemorySessionService

# Load environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# 1. Conversational Coach Agent
coach_agent = Agent(
    name="sustainability_coach",
    model="gemini-2.5-flash",
    instruction=(
        "You are EcoTrack AI's Sustainability Coach. Your goal is to guide users to "
        "understand and reduce their carbon footprint. Answer questions about carbon impact, "
        "suggest eco-friendly alternatives (e.g. comparing flights vs driving), and provide "
        "practical tips. Be positive, encouraging, and informative. Keep responses concise and "
        "actionable."
    )
)

# 2. Personalized Recommendation Agent
recommendation_agent = Agent(
    name="recommendation_engine",
    model="gemini-2.5-flash",
    instruction=(
        "You are the EcoTrack AI Recommendation Engine. You receive a JSON string containing the "
        "user's carbon footprint profile and habits. Analyze this profile and suggest exactly 4 "
        "personalized, actionable reduction tasks. Each task must have: 'title', 'category', 'co2_reduction' (kg), "
        "'cost_savings' ($), 'difficulty' ('Easy', 'Medium', 'Hard'), and 'time_required' ('1 day', '1 week', 'Ongoing'). "
        "Return the output as a valid JSON array only, without any markdown formatting or comments."
    )
)

# 3. Bill Analysis Agent
bill_agent = Agent(
    name="bill_analyzer",
    model="gemini-2.5-flash",
    instruction=(
        "You are the EcoTrack AI Utility Bill Analyzer. You receive the text content from a utility statement, "
        "receipt, or bill. Extract the consumption data such as 'electricity_kwh', 'fuel_liters', or 'flight_km' if present, "
        "and estimate the carbon footprint in kg CO2. Return a JSON object with: 'extracted_value', 'unit', "
        "'estimated_co2_kg', and a short 'explanation'. Return the output as valid JSON only, without markdown formatting."
    )
)

# Initialize Session Service and Runners
session_service = InMemorySessionService()
coach_runner = Runner(agent=coach_agent, session_service=session_service, app_name="eco_coach")
recommendation_runner = Runner(agent=recommendation_agent, session_service=session_service, app_name="eco_recommendations")
bill_runner = Runner(agent=bill_agent, session_service=session_service, app_name="eco_bill_analyzer")

def run_agent_safely(runner: Runner, session_id: str, prompt: str, fallback_data=None) -> str:
    """Runs the agent using ADK, falling back to mock response if GEMINI_API_KEY is not set."""
    if not GEMINI_API_KEY:
        # Fallback Mock Logic
        if fallback_data is not None:
            return json.dumps(fallback_data)
        return "I am operating in offline mode. Please configure GEMINI_API_KEY to enable live AI responses. For now, try reducing electricity consumption and choosing walking over driving!"
    
    try:
        response_text = ""
        events = runner.run(user_id="user_main", session_id=session_id, new_message=prompt)
        for event in events:
            if event.message and event.message.parts:
                for part in event.message.parts:
                    if hasattr(part, "text") and part.text:
                        response_text += part.text
                    elif isinstance(part, str):
                        response_text += part
        return response_text
    except Exception as e:
        print(f"Agent execution error: {e}")
        if fallback_data is not None:
            return json.dumps(fallback_data)
        return f"Sorry, I encountered an issue while processing your request: {str(e)}"

# Helper functions for endpoints
def ask_coach(session_id: str, query: str) -> str:
    return run_agent_safely(coach_runner, session_id, query)

def get_recommendations(session_id: str, profile_json: str) -> list:
    fallback = [
        {"title": "Switch to LED Bulbs", "category": "Energy", "co2_reduction": 15, "cost_savings": 5, "difficulty": "Easy", "time_required": "1 day"},
        {"title": "One Meat-Free Day Weekly", "category": "Food", "co2_reduction": 20, "cost_savings": 10, "difficulty": "Easy", "time_required": "Ongoing"},
        {"title": "Commute by Bicycle", "category": "Transportation", "co2_reduction": 45, "cost_savings": 25, "difficulty": "Medium", "time_required": "Ongoing"},
        {"title": "Compost Organic Waste", "category": "Waste", "co2_reduction": 12, "cost_savings": 2, "difficulty": "Easy", "time_required": "Ongoing"}
    ]
    res = run_agent_safely(recommendation_runner, session_id, profile_json, fallback_data=fallback)
    try:
        # Clean potential markdown block wrapper
        cleaned = res.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return fallback

def analyze_bill_text(session_id: str, text: str) -> dict:
    fallback = {
        "extracted_value": 350.0,
        "unit": "kWh",
        "estimated_co2_kg": 140.0,
        "explanation": "Extracted 350 kWh from bill (mock parsing). Estimated emission rate: 0.4 kg CO2/kWh."
    }
    res = run_agent_safely(bill_runner, session_id, text, fallback_data=fallback)
    try:
        cleaned = res.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return fallback
