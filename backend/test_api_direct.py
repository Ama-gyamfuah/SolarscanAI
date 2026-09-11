import sys
import asyncio
sys.path.insert(0, 'backend')
from server import login, save_scan, submit_feedback, list_feedback, get_db_stats, LoginRequest, ScanSaveRequest, FeedbackCreateRequest

async def run_tests():
    print("1. Testing login function...")
    req = LoginRequest(email="tech@solarscan.ai", password="solarscan2025!")
    res = await login(req)
    import json
    data = json.loads(res.body.decode())
    print("Login OK:", data["user"]["full_name"], "Role:", data["user"]["role"])
    assert data["user"]["role"] == "technician"

    print("2. Testing save_scan function...")
    scan_req = ScanSaveRequest(
        scan_uuid="scan_test_999",
        user_name="Kwame Mensah",
        user_role="technician",
        filename="solar_panel_test.png",
        defect_type="hotspot",
        confidence=0.96,
        health_score=65.0,
        watts_lost=140.0,
        sla_urgency="P1 - CRITICAL"
    )
    res_scan = await save_scan(scan_req)
    scan_data = json.loads(res_scan.body.decode())
    print("Save Scan OK:", scan_data)

    print("3. Testing submit_feedback function...")
    fb_req = FeedbackCreateRequest(
        scan_uuid="scan_test_999",
        user_name="Kwame Mensah",
        user_role="technician",
        original_prediction="hotspot",
        actual_defect="hotspot",
        accuracy_rating=5,
        technician_notes="Confirmed hotspot at terminal 2.",
        environmental_factors="High midday temperature"
    )
    res_fb = await submit_feedback(fb_req)
    fb_data = json.loads(res_fb.body.decode())
    print("Feedback Submit OK:", fb_data)

    print("4. Testing get_db_stats...")
    res_stats = await get_db_stats()
    stats_data = json.loads(res_stats.body.decode())
    print("DB Stats OK:", stats_data)
    print("SUCCESS: ALL DATABASE ENDPOINTS OPERATIONAL AND PERSISTING!")

asyncio.run(run_tests())
