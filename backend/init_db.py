import os
import sqlite3
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "solarscan.db")

def hash_password(password: str) -> str:
    salt = "solarscan_salt_2025"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        facility TEXT,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_uuid TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        user_name TEXT,
        user_role TEXT,
        filename TEXT,
        modality TEXT,
        defect_type TEXT,
        confidence REAL,
        health_score REAL,
        watts_lost REAL,
        sla_urgency TEXT,
        sha256_hash TEXT,
        detections_json TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_uuid TEXT NOT NULL,
        user_id INTEGER,
        user_name TEXT,
        user_role TEXT,
        original_prediction TEXT,
        actual_defect TEXT,
        accuracy_rating INTEGER,
        technician_notes TEXT,
        environmental_factors TEXT,
        status TEXT DEFAULT 'pending_review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS work_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        work_order_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        panel_id TEXT NOT NULL,
        assigned_to TEXT NOT NULL,
        urgency TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        remediation_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        default_pwd_hash = hash_password("solarscan2025!")
        seed_users = [
            ("tech@solarscan.ai", default_pwd_hash, "Kwame Mensah", "technician", "Accra Solar Station #2", "+233 24 555 0101"),
            ("drone@solarscan.ai", default_pwd_hash, "Akosua Osei", "drone_pilot", "West African Drone Survey Unit", "+233 20 555 0202"),
            ("manager@solarscan.ai", default_pwd_hash, "Dr. Emmanuel Frimpong", "asset_manager", "Regional Solar Plant Operations", "+233 27 555 0303"),
            ("auditor@solarscan.ai", default_pwd_hash, "Kofi Boateng", "auditor", "Clean Energy QA & Warranty Bureau", "+233 26 555 0404"),
            ("admin@solarscan.ai", default_pwd_hash, "System Administrator", "admin", "Enterprise Central IT Command", "+233 24 555 9999")
        ]
        cursor.executemany(
            "INSERT INTO users (email, password_hash, full_name, role, facility, phone) VALUES (?, ?, ?, ?, ?, ?)",
            seed_users
        )
        conn.commit()
        print("Database: Pre-seeded 5 enterprise users into SQLite database.")

    cursor.execute("SELECT COUNT(*) FROM work_orders")
    wo_count = cursor.fetchone()[0]
    if wo_count == 0:
        seed_wos = [
            ("WO-2025-0891", "Inverter Array #4 Bypass Diode Overheating", "MOD-GH-B4-02", "Kwame Mensah", "P1 - CRITICAL", "OPEN", "Hotspot observed > +25C deltaT. Immediate bypass diode junction replacement required to prevent thermal runaway."),
            ("WO-2025-0892", "Sub-string Micro-crack Electrical Isolation", "MOD-GH-A1-19", "Kwame Mensah", "P2 - HIGH", "OPEN", "Hairline silicon fracture detected via electroluminescence. Test string DC insulation resistance to verify ground fault risk."),
            ("WO-2025-0893", "Harmattan Dust Heavy Soiling Remediation", "MOD-GH-C7-44", "Kwame Mensah", "P3 - MEDIUM", "IN_PROGRESS", "Dust obscuration causing 12% output drop. Run demineralized water wash cycle before peak solar hours."),
            ("WO-2025-0894", "West Wing Aerial Orthomosaic Survey", "FLIGHT-GRID-09", "Akosua Osei", "P2 - HIGH", "RESOLVED", "Automated drone sweep covering 120MW array. Captured 420 geotagged frames.")
        ]
        cursor.executemany(
            "INSERT INTO work_orders (work_order_id, title, panel_id, assigned_to, urgency, status, remediation_notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            seed_wos
        )
        conn.commit()
        print("Database: Pre-seeded field work orders into SQLite database.")

    cursor.execute("SELECT id, email, full_name, role FROM users")
    print("CURRENT USERS IN DB:")
    for row in cursor.fetchall():
        print(f" - [{row['role']}] {row['full_name']} <{row['email']}>")
    conn.close()

if __name__ == "__main__":
    init_db()
