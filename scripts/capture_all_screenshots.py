import subprocess
import os
import time

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
browser = chrome_path if os.path.exists(chrome_path) else edge_path

out_dir = os.path.abspath("documents/screenshots")
os.makedirs(out_dir, exist_ok=True)

targets = [
    ("solarscan_light_scanlab.png", "http://localhost:5173/?tab=scan&theme=light"),
    ("solarscan_dark_scanlab.png", "http://localhost:5173/?tab=scan&theme=dark"),
    ("solarscan_light_analytics.png", "http://localhost:5173/?tab=analytics&theme=light"),
    ("solarscan_dark_analytics.png", "http://localhost:5173/?tab=analytics&theme=dark"),
    ("solarscan_light_dronemap.png", "http://localhost:5173/?tab=drone&theme=light"),
    ("solarscan_dark_dronemap.png", "http://localhost:5173/?tab=drone&theme=dark"),
    ("solarscan_light_evidence.png", "http://localhost:5173/?tab=evidence&theme=light"),
    ("solarscan_dark_evidence.png", "http://localhost:5173/?tab=evidence&theme=dark"),
]

for filename, url in targets:
    out_file = os.path.join(out_dir, filename)
    cmd = [
        browser,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1366,850",
        f"--screenshot={out_file}",
        url
    ]
    print(f"Capturing {filename} from {url}...")
    subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    print("  -> Exists:", os.path.exists(out_file), f"({os.path.getsize(out_file)} bytes)" if os.path.exists(out_file) else "")

print("All captures completed.")
