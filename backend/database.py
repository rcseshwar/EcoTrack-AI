import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite3")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1
    )
    """)
    
    # Footprints table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS footprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        commute_distance REAL DEFAULT 0,
        vehicle_type TEXT,
        fuel_type TEXT,
        public_transport REAL DEFAULT 0,
        flights INTEGER DEFAULT 0,
        electricity REAL DEFAULT 0,
        renewables REAL DEFAULT 0,
        appliances TEXT,
        diet TEXT,
        meat_freq TEXT,
        food_source TEXT,
        fashion_purchases INTEGER DEFAULT 0,
        electronics_purchases INTEGER DEFAULT 0,
        online_shopping TEXT,
        recycling TEXT,
        composting TEXT,
        plastic_use TEXT,
        total_co2 REAL DEFAULT 0,
        transport_co2 REAL DEFAULT 0,
        energy_co2 REAL DEFAULT 0,
        food_co2 REAL DEFAULT 0,
        shopping_co2 REAL DEFAULT 0,
        waste_co2 REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Habits table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        habit_name TEXT NOT NULL,
        streak INTEGER DEFAULT 0,
        last_completed TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, habit_name)
    )
    """)
    
    # Goals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        target_reduction REAL NOT NULL,
        current_progress REAL DEFAULT 0,
        target_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Community posts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Seed default community posts and offset marketplace if empty
    cursor.execute("SELECT COUNT(*) FROM community_posts")
    if cursor.fetchone()[0] == 0:
        posts = [
            ("eco_warrior@example.com", "Switched to LED lights today! Easy way to cut energy consumption.", 12, datetime.now().isoformat()),
            ("green_commuter@example.com", "Walked to work 4 days in a row! Carbon savings feeling great.", 25, datetime.now().isoformat()),
            ("organic_eater@example.com", "Prepared a fully local vegan dinner today. Super delicious and zero emissions!", 8, datetime.now().isoformat())
        ]
        cursor.executemany("INSERT INTO community_posts (user_email, content, likes, timestamp) VALUES (?, ?, ?, ?)", posts)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
