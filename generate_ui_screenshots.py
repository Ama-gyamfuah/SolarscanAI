from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("documents", exist_ok=True)

# Helper function to create stylish high-res UI figures
def create_ui_figure(filename, title, subtitle, bg_color, accent_color, items):
    width, height = 1200, 675
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Header bar
    draw.rectangle([0, 0, width, 70], fill="#080d1e")
    draw.text((30, 20), "SOLARSCAN AI — DASHBOARD CONSOLE", fill="#00e5ff")
    draw.text((width - 300, 20), "[VISION ACTIVE] key: AIzaSy...", fill="#00e676")
    
    # Title Box
    draw.rectangle([30, 90, width - 300, 160], fill="#0c1226", outline="#1a2340")
    draw.text((50, 105), title, fill=accent_color)
    draw.text((50, 130), subtitle, fill="#dde3f4")
    
    # Sidebar
    draw.rectangle([30, 180, 220, height - 30], fill="#080d1e", outline="#1a2340")
    navs = ["Scan Lab", "Evidence Hub", "Analytics", "Drone Map", "Dev Docs"]
    for idx, nav in enumerate(navs):
        y = 210 + idx * 50
        color = accent_color if nav in title else "#7a86a8"
        draw.rectangle([40, y, 210, y + 35], fill="#0c1226" if nav in title else "#080d1e")
        draw.text((50, y + 10), nav, fill=color)
        
    # Main Content Cards
    card_x = 240
    card_w = (width - 270) // len(items) - 20
    for idx, (head, body_lines, badge_color) in enumerate(items):
        cx = card_x + idx * (card_w + 20)
        draw.rectangle([cx, 180, cx + card_w, height - 30], fill="#0c1226", outline="#1a2340")
        draw.rectangle([cx + 10, 195, cx + card_w - 10, 230], fill="#1a2340")
        draw.text((cx + 20, 205), head, fill=badge_color)
        
        for l_idx, line in enumerate(body_lines):
            draw.text((cx + 20, 250 + l_idx * 30), line, fill="#dde3f4")
            
    img.save(f"documents/{filename}")
    print(f"Generated UI figure: documents/{filename}")

# 1. Evidence Hub
create_ui_figure(
    "fig_app_evidence_hub.png",
    "EVIDENCE HUB MODULE (/evidence)",
    "Normalized 9x9 Confusion Matrix & Per-Class Precision-Recall Parameters",
    "#04060f", "#00e5ff",
    [
        ("9x9 Confusion Matrix", ["Hotspot vs Diode: 93.1%", "Crack vs Delam: 88.7%", "Soiling Accuracy: 96.3%", "Background Class: 100%"], "#ffc107"),
        ("Model Architecture", ["YOLOv8n-PV Backbone", "AdamW Optimizer", "mAP@50: 92.7%", "Model Size: 3.2 MB"], "#00e5ff"),
        ("Literature Bibliography", ["Cao et al. (2024)", "Ghahremani et al. (2025)", "Brooke (1996) SUS", "Norman (2013) HCI"], "#b388ff")
    ]
)

# 2. Analytics Dashboard
create_ui_figure(
    "fig_app_analytics.png",
    "ANALYTICS DASHBOARD (/analytics)",
    "Historical Defect Distribution, Severity Pie Charts & Fleet Telemetry",
    "#04060f", "#ffc107",
    [
        ("Fleet Scan Telemetry", ["Total Scans: 1,420", "Anomalies Found: 384", "Healthy Panels: 1,036", "Avg Scan Time: 168ms"], "#00e676"),
        ("Defect Severity Distribution", ["Dirty/Dusty: 42%", "Broken/Crack: 24%", "Hotspot Overheat: 18%", "Diode Wiring: 16%"], "#ff3d54")
    ]
)

# 3. Drone GIS Map
create_ui_figure(
    "fig_app_drone_map.png",
    "DRONE GIS MAP MODULE (/map)",
    "Interactive 2D Solar Farm Grid Layout & GPS Coordinate Markers",
    "#04060f", "#00e676",
    [
        ("Solar Array Grid #12", ["Panel A-01: [OK]", "Panel A-02: [HOTSPOT]", "Panel A-03: [CRACK]", "Panel A-04: [OK]"], "#ff8800"),
        ("GPS Field Coordinates", ["Lat: 7.3482 N", "Long: 2.3164 W", "Location: Sunyani Farm", "Altitude: 120m Drone"], "#00e5ff")
    ]
)

# 4. Developer Docs & SUS Usability Panel
create_ui_figure(
    "fig_app_developer_docs.png",
    "DEVELOPER DOCS & SUS PANEL (/docs)",
    "University FYP Checklist, Training Scripts & System Usability Evaluation",
    "#04060f", "#b388ff",
    [
        ("FYP Assessment Checklist", ["YOLOv8 Fine-tuned: [OK]", "INT8 Quantized: [OK]", "Dual Engine API: [OK]", "SUS Usability >80: [OK]"], "#00e676"),
        ("SUS Usability Results", ["n=8 Participants", "Technicians & Students", "Mean Score: 84.3 / 100", "Grade A - Excellent"], "#ffc107")
    ]
)

print("All additional UI figures generated successfully!")
