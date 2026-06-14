# EcoTrack AI: Personal Carbon Footprint Awareness and Reduction Platform

EcoTrack AI is a production-ready, full-stack web application designed to help individuals understand, track, and reduce their carbon footprint through gamification, interactive data visualization, daily habits tracking, and personalized, AI-powered insights.

## 🌿 Chosen Vertical (Problem Statement Alignment)
This solution aligns with the **Carbon Footprint Awareness Platform** vertical. It targets the core challenge that many individuals are unaware of how their daily activities contribute to global greenhouse gas emissions. The platform translates complex ecological metrics into simple, gamified, and actionable goals tailored to individual lifestyles (commutes, utilities, shopping, diet, and waste).

---

## ⚙️ Approach and Logic

### 1. Unified Architecture
- **Backend**: Python FastAPI serving clean JSON REST APIs and persisting data in a local `sqlite3` database. It utilizes `scikit-learn` (Linear Regression) to predict future emissions and models carbon calculators from standard EPA (Environmental Protection Agency) emission factors.
- **AI Agents**: Powered by the **Google Agent Development Kit (ADK)**, utilizing Gemini models (`gemini-2.5-flash`) for multi-agent execution:
  - `sustainability_coach`: Conversational assistant providing daily eco-tips and comparative analyses (e.g. flights vs driving).
  - `recommendation_engine`: Analyzes user footprint history to yield exactly 4 customized tasks with CO₂ reductions, dollar savings, and difficulty parameters.
  - `bill_analyzer`: Parses uploaded utility statements/receipt text to extract consumption values (kWh, liters, etc.).
- **Frontend**: A React SPA styled with Tailwind CSS, utilizing Recharts for data visualizations (Pie charts for source breakdowns, Area charts for historical trends + AI predictive overlays), and custom CSS animations for the interactive "Carbon Tree" gamified growth engine.

---

## 🚀 How the Solution Works

1. **Calculate & Track**: Users fill out the **CO2 Calculator** with metrics on travel, electricity usage, eating habits, and shopping. The backend calculates carbon impact using specific emission coefficients and saves it to the SQLite history log.
2. **AI Recommendations**: The **ADK Recommendation Agent** inspects the user's latest footprint and generates localized tips.
3. **Conversational Coaching**: The **AI Coach** is a chat interface connecting users to the Gemini ADK agent for custom, context-aware queries.
4. **Gamification & Habit Streaks**: Check off daily habits (reusable bottle, walking) to grow your **Carbon Tree** (gamified levels) and earn Green Points. You can spend points in the **Offset Marketplace** to support verified reforestation or renewable energy projects.
5. **Community & Learning**: Share achievements on the community feed, and play interactive educational quizzes.

---

## 📝 Assumptions Made
- **Emission Factors**: Calculations use standardized averages:
  - Petrol car: 0.18 kg CO₂/km; Hybrid: 0.10 kg CO₂/km; Electric: 0.05 kg CO₂/km.
  - Electricity: 0.4 kg CO₂/kWh (offset by user's renewable energy percentage).
  - Vegan diet base: 1.5 kg CO₂/day; Vegetarian: 2.5 kg CO₂/day; Meat eater: 5.0 kg CO₂/day.
- **Offline / Fallback Robustness**: Since API keys are required for Vertex AI/Gemini, if `GEMINI_API_KEY` is not present in the environment variables, the system executes simulated local responses, ensuring the platform remains fully functional and robust.

---

## 🛠️ Verification & Testing
To run the automated calculations unit tests:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python backend/test_main.py
```

To run the full stack locally:
```bash
npm run install:all
npm run dev
```

To run using Docker (production build):
```bash
docker build -t ecotrack-ai .
docker run -p 8080:8080 ecotrack-ai
```
