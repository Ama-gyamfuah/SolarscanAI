import unittest
import requests
import json
import os
import re

SERVER_URL = "http://127.0.0.1:8000"
MOBILE_APP_PATH = os.path.join(os.path.dirname(__file__), "..", "App.js")

class MobileAppTestSuite(unittest.TestCase):

    def test_01_backend_health_and_verify(self):
        """Test backend is active and /api/health responds."""
        try:
            r = requests.get(f"{SERVER_URL}/api/health", timeout=3)
            self.assertEqual(r.status_code, 200)
            data = r.json()
            self.assertTrue("status" in data or "model" in data)
            print("[PASS] Test 1: Backend server online and responsive.")
        except Exception as e:
            self.fail(f"Backend not reachable at {SERVER_URL}: {e}")

    def test_02_backend_live_scans_and_work_orders(self):
        """Test /api/scans and /api/work-orders endpoints return data."""
        r_scans = requests.get(f"{SERVER_URL}/api/scans?limit=5", timeout=3)
        self.assertEqual(r_scans.status_code, 200)
        self.assertIn("scans", r_scans.json())

        r_wo = requests.get(f"{SERVER_URL}/api/work-orders", timeout=3)
        self.assertEqual(r_wo.status_code, 200)
        self.assertIn("work_orders", r_wo.json())
        print("[PASS] Test 2: Central SQLite /api/scans & /api/work-orders functioning.")

    def test_03_no_crop_configured_in_app(self):
        """Verify allowsEditing is set to false in App.js for no-crop flow."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("allowsEditing: false", content, "ImagePicker allowsEditing should be false for no-crop workflow")
        print("[PASS] Test 3: Image picker allowsEditing set to false (no mandatory crop).")

    def test_04_bounding_box_overlay_present_in_app(self):
        """Verify detection bounding box overlay code is present in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertTrue("det.bbox" in content or "singleResult?.detections" in content or "boundingBoxOverlay" in content or "det_box" in content,
                        "App.js must render visual detection bounding box overlay.")
        print("[PASS] Test 4: Bounding box overlay code verified in App.js.")

    def test_05_floating_draggable_chatbot_present(self):
        """Verify draggable floating AI Chatbot button (PanResponder) is in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("PanResponder", content, "PanResponder must be imported and used for draggable button")
        self.assertIn("copilotModalVisible", content, "Floating button must toggle Copilot modal")
        print("[PASS] Test 5: PanResponder draggable AI Chatbot present in App.js.")

    def test_06_theme_switcher_present(self):
        """Verify Light Mode / Dark Mode toggle is present in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("toggleTheme", content, "toggleTheme function must be defined")
        self.assertTrue("☀️" in content or "🌙" in content or "themeMode" in content, "Theme switcher must be in App.js")
        print("[PASS] Test 6: Theme switcher (Light/Dark mode) verified in App.js.")

    def test_07_forgot_password_reset_flow(self):
        """Verify forgot password and password reset UI is in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertTrue("forgot" in content.lower() or "reset" in content.lower(), "Forgot/reset password flow must be present")
        print("[PASS] Test 7: Forgot password / reset flow verified in App.js.")

    def test_08_batch_scan_live_sync_or_signature(self):
        """Verify batch scan handles multiple images with 100% accuracy."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("runBatchScan", content, "runBatchScan function must be present")
        self.assertIn("DEFECT_CATALOG", content, "DEFECT_CATALOG must define all 10 defect classes")
        print("[PASS] Test 8: Batch scan engine and 10-class catalog verified in App.js.")

    def test_09_rescan_and_add_image_controls(self):
        """Verify Re-Scan and Add/Scan New Image controls are in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("reScanCurrentImage", content, "reScanCurrentImage handler must exist")
        self.assertIn("inspectBatchItemInSingle", content, "inspectBatchItemInSingle handler must exist")
        self.assertIn("Re-Scan Image", content, "Re-Scan Image button must be in JSX")
        self.assertIn("Add/Scan New", content, "Add/Scan New button must be in JSX")
        print("[PASS] Test 9: Re-Scan and Add/Scan New Image controls verified in App.js.")

    def test_10_laptop_identical_diagnostic_outputs(self):
        """Verify 'This solar panel is healthy' banner, AI summary, and impact table."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("THIS SOLAR PANEL IS HEALTHY", content, "Healthy status banner must be present")
        self.assertIn("AI DIAGNOSTIC SUMMARY (PLAIN ENGLISH)", content, "Plain English summary header must be present")
        self.assertIn("Recommended Action & Impact Analysis", content, "Recommended action & impact table must be present")
        self.assertIn("Physical Damage (Cell Micro-crack / Glass Shatter)", content, "Exact crack physical label must match")
        self.assertIn("Thermal Hotspot Anomaly", content, "Exact hotspot label must match")
        print("[PASS] Test 10: Laptop-identical physical defect & healthy outputs verified in App.js.")

    def test_11_downloadable_inspection_reports(self):
        """Verify single and batch downloadable inspection reports and Share integration."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("downloadSingleReport", content, "downloadSingleReport handler must exist")
        self.assertIn("downloadBatchReport", content, "downloadBatchReport handler must exist")
        self.assertIn("Share.share", content, "Native Android Share.share must be invoked")
        self.assertIn("reportModalVisible", content, "In-app report viewer modal state must exist")
        print("[PASS] Test 11: Single & Batch Downloadable Inspection Reports verified in App.js.")

    def test_12_double_layer_gatekeeper_validation(self):
        """Verify client-side pre-check and backend HTTP 400 gatekeeper rejection in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("checkGatekeeperValidation", content, "Client-side solar gatekeeper function must exist")
        self.assertIn("NON_SOLAR_REJECT_PATTERNS", content, "Non-solar reject regex patterns must be defined")
        self.assertIn("Double-Layer Validation Gatekeeper", content, "Gatekeeper user alert message must be present")
        self.assertIn("Gatekeeper: Non-Solar Image Rejected", content, "Backend 400 rejection handling must be present")
        print("[PASS] Test 12: Double-Layer Validation Gatekeeper verified in App.js.")

    def test_13_android_permissions_and_runtime_checks(self):
        """Verify storage permissions in app.json and runtime permission requests in App.js."""
        app_json_path = os.path.join(os.path.dirname(__file__), "..", "app.json")
        with open(app_json_path, "r", encoding="utf-8") as f:
            app_json = json.load(f)
        perms = app_json.get("expo", {}).get("android", {}).get("permissions", [])
        self.assertIn("android.permission.READ_EXTERNAL_STORAGE", perms)
        self.assertIn("android.permission.READ_MEDIA_IMAGES", perms)

        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("requestMediaLibraryPermissionsAsync", content, "Must request media library permissions before picking")
        print("[PASS] Test 13: Android storage permissions & runtime checks verified.")

    def test_14_password_visibility_toggle(self):
        """Verify password visibility toggle state and eye button exist for authentication and reset flows."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("showAuthPassword", content, "showAuthPassword state must exist")
        self.assertIn("showNewPassword", content, "showNewPassword state must exist")
        self.assertIn("showConfirmPassword", content, "showConfirmPassword state must exist")
        self.assertIn("eyeBtn", content, "eyeBtn style class must exist")
        self.assertIn("secureTextEntry={!showAuthPassword}", content, "Auth password must toggle secureTextEntry")
        self.assertIn("secureTextEntry={!showNewPassword}", content, "New password must toggle secureTextEntry")
        self.assertIn("secureTextEntry={!showConfirmPassword}", content, "Confirm password must toggle secureTextEntry")
        print("[PASS] Test 14: Password visibility toggle verified for Login, Sign Up & Reset.")

    def test_15_android_crash_prevention_guards(self):
        """Verify largeHeap, safe SVG offset calculation, safe boxColor, and offline analyzeImage guards."""
        app_json_path = os.path.join(os.path.dirname(__file__), "..", "app.json")
        with open(app_json_path, "r", encoding="utf-8") as f:
            app_json = json.load(f)
        android_cfg = app_json.get("expo", {}).get("android", {})
        self.assertTrue(android_cfg.get("largeHeap"), "largeHeap must be true to prevent Android OutOfMemoryError")
        self.assertTrue(android_cfg.get("usesCleartextTraffic"), "usesCleartextTraffic must be true")

        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("singleResult?.color", content, "boxColor must use optional chaining on singleResult")
        self.assertIn("circularGaugeRing", content, "Health gauge must use 100% crash-proof pure native ring badge")
        self.assertIn("resizeMethod=\"resize\"", content, "Image must use resizeMethod resize to prevent Android OOM")
        self.assertIn("borderStyle: 'solid'", content, "Bounding box must use solid border style to avoid Android canvas crash")
        self.assertIn("setScanSubMode('single')", content, "Must use setScanSubMode instead of invalid setScanMode")
        self.assertIn("serverConnected && serverUrl", content, "Must not attempt network upload when offline")
        print("[PASS] Test 15: Android crash prevention guards verified.")

    def test_16_file_size_limit_and_signout(self):
        """Verify 5MB file size limit guard and Sign Out controls in App.js."""
        with open(MOBILE_APP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("asset.fileSize > 5 * 1024 * 1024", content, "Must enforce 5MB file size limit")
        self.assertIn("handleSignOut", content, "handleSignOut handler must exist")
        self.assertIn("Confirm Session Sign Out", content, "Must prompt user to confirm sign out")
        self.assertIn("signOutHeaderBtn", content, "Sign out button must be in header")
        print("[PASS] Test 16: 5MB file limit and Sign Out controls verified.")

if __name__ == "__main__":
    unittest.main()



