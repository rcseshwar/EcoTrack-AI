from fastapi.testclient import TestClient
import sqlite3
from database import DB_PATH
from main import app

client = TestClient(app)

TEST_EMAIL = "test_user@example.com"
TEST_PASS = "s3cretpass"


def test_register_and_login_and_calculator():
    # Clean up pre-existing test user if present
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE email = ?", (TEST_EMAIL,))
    conn.commit()
    conn.close()

    # Register
    res = client.post("/api/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASS})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "token" in data

    # Login
    res = client.post("/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

    token = data["token"]

    # Submit a footprint
    payload = {
        "month": "2026-06",
        "commute_distance": 5.0,
        "vehicle_type": "car",
        "fuel_type": "petrol",
        "public_transport": 0.0,
        "flights": 0,
        "electricity": 120.0,
        "renewables": 10.0,
        "appliances": "low",
        "diet": "vegetarian",
        "meat_freq": "weekly",
        "food_source": "local",
        "fashion_purchases": 0,
        "electronics_purchases": 0,
        "online_shopping": "never",
        "recycling": "always",
        "composting": "always",
        "plastic_use": "low"
    }

    headers = {"Authorization": token}
    res = client.post("/api/calculator/submit", json=payload, headers=headers)
    assert res.status_code == 200
    d = res.json()
    assert "footprint" in d
    assert "total" in d["footprint"]


if __name__ == '__main__':
    test_register_and_login_and_calculator()
