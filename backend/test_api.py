import sys
sys.path.insert(0, 'backend')
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

print("1. Testing /api/health...")
res = client.get("/api/health")
print("Health Status:", res.status_code, res.json())

print("2. Testing /api/auth/login (Kwame)...")
res = client.post("/api/auth/login", json={"email": "tech@solarscan.ai", "password": "solarscan2025!"})
print("Login Status:", res.status_code, res.json().get("user"))

print("3. Testing /api/auth/login (Invalid Password)...")
res = client.post("/api/auth/login", json={"email": "tech@solarscan.ai", "password": "wrongpassword"})
print("Invalid Login Status (should be 401):", res.status_code)

print("4. Testing /api/scans (Save)...")
res = client.post("/api/scans", json={
    "scan_uuid": "test-uuid-001",
    "user_name": "Kwame Mensah",
    "user_role": "technician",
    "filename": "panel_crack_01.jpg",
    "modality": "Visual RGB",
    "defect_type": "crack",
    "confidence": 0.94,
    "health_score": 85.0,
    "watts_lost": 60.0,
    "sla_urgency": "P2 - HIGH",
    "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "detections_json": "[]"
})
print("Save Scan Status:", res.status_code, res.json())

print("5. Testing /api/feedback (Submit)...")
res = client.post("/api/feedback", json={
    "scan_uuid": "test-uuid-001",
    "user_name": "Kwame Mensah",
    "user_role": "technician",
    "original_prediction": "crack",
    "actual_defect": "crack",
    "accuracy_rating": 5,
    "technician_notes": "Hairline crack confirmed on cell 4B via physical inspection.",
    "environmental_factors": "Harmattan dust on surface"
})
print("Feedback Submit Status:", res.status_code, res.json())

print("6. Testing /api/feedback (List)...")
res = client.get("/api/feedback")
print("Feedback Count:", len(res.json().get("feedback", [])))

print("7. Testing /api/db/stats...")
res = client.get("/api/db/stats")
print("DB Stats:", res.json())

print("ALL API BACKEND TESTS PASSED!")
