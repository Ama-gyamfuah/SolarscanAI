import subprocess
import os
import time

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
browser = chrome_path if os.path.exists(chrome_path) else edge_path

out_dir = os.path.abspath("documents/screenshots")
os.makedirs(out_dir, exist_ok=True)

light_path = os.path.join(out_dir, "solarscan_light_mode.png")
dark_path = os.path.join(out_dir, "solarscan_dark_mode.png")

# 1. Capture Light Mode
cmd_light = [
    browser,
    "--headless",
    "--disable-gpu",
    "--window-size=1366,850",
    f"--screenshot={light_path}",
    "http://localhost:5173"
]

print("Capturing Light Mode...")
p1 = subprocess.run(cmd_light, capture_output=True, text=True, timeout=20)
print("Light returncode:", p1.returncode)
print("Light exists:", os.path.exists(light_path), os.path.getsize(light_path) if os.path.exists(light_path) else 0)

# Let's check if we can capture dark mode by injecting localstorage or by visiting with dark theme
