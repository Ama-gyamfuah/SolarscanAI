import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os
import re

file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = docx.Document(file_path)

print(f"Loaded {file_path} with {len(doc.paragraphs)} paragraphs.")

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

# Add Section 4.8: Enhanced Screenshot Descriptions for all 8 UI Modules
p_m_title = doc.add_paragraph()
p_m_title.paragraph_format.space_before = Pt(22)
p_m_title.paragraph_format.space_after = Pt(8)
p_m_title.paragraph_format.keep_with_next = True
r_mt = p_m_title.add_run("4.8 Visual Interface Gallery & Module Screenshots Reference")
r_mt.bold = True
r_mt.font.size = Pt(13)
r_mt.font.name = 'Arial'
r_mt.font.color.rgb = RGBColor(217, 119, 6)

p_intro_gallery = doc.add_paragraph()
p_intro_gallery.paragraph_format.line_spacing = 1.15
p_intro_gallery.paragraph_format.space_after = Pt(8)
p_intro_gallery.add_run(
    "To provide visual proof of the working software and allow evaluators to verify every system module, "
    "this section embeds annotated screenshots for all primary workspaces across the SolarScan AI platform, "
    "accompanied by operational feature descriptions."
)

all_ui_figures = [
    ("Figure 4.5: Scan Lab Workspace — 'Broken / Damaged Panel' diagnostic scan showing bounding boxes, plain-English summary card, and thermodynamic yield loss telemetry.", "documents/fig_app_crack_scan.png"),
    ("Figure 4.6: Thermal IR Scan Workspace — Localized 'Overheating Spot' hotspot detection displaying 10x10 Grad-CAM attention grid overlay, cell temperature rise metrics, and junction box safety alerts.", "documents/fig_app_hotspot_scan.png"),
    ("Figure 4.7: Surface Soiling Workspace — 'Dirty / Dusty / Sandy' scan integrated with the Financial ROI Calculator, annual revenue loss slider ($), and cleaning cost analysis.", "documents/fig_app_soiling_scan.png"),
    ("Figure 4.8: Healthy Panel Baseline — Diagnostic check verifying 100% nominal operational capacity and zero power loss for perfect photovoltaic modules.", "documents/fig_app_healthy_scan.png"),
    ("Figure 4.9: Evidence Hub Module — Normalized 9x9 confusion matrix, per-class precision-recall performance telemetry, system architecture, and academic bibliography.", "documents/fig_app_evidence_hub.png"),
    ("Figure 4.10: Analytics Dashboard — Historical fleet scan telemetry, defect frequency distribution pie charts, and operational uptime tracking.", "documents/fig_app_analytics.png"),
    ("Figure 4.11: Drone GIS Map Module — Interactive 2D solar farm array grid layout, panel status markers (green = healthy, red = defect), and GPS field coordinates.", "documents/fig_app_drone_map.png"),
    ("Figure 4.12: Developer Docs & SUS Panel — University FYP assessment checklist, PyTorch/YOLOv8 training scripts with copy-code controls, and standardized 10-question SUS usability evaluation results.", "documents/fig_app_developer_docs.png")
]

for caption, img_path in all_ui_figures:
    if os.path.exists(img_path):
        doc.add_paragraph().paragraph_format.space_before = Pt(12)
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_path, width=Inches(4.4))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_c = p_cap.add_run(caption)
        r_c.font.name = 'Arial'
        r_c.font.size = Pt(9)
        r_c.font.italic = True
        r_c.font.color.rgb = RGBColor(120, 113, 108)

# Add Section 4.9: Complete System Installation & Cross-Platform Deployment Guide
p_inst_title = doc.add_paragraph()
p_inst_title.paragraph_format.space_before = Pt(24)
p_inst_title.paragraph_format.space_after = Pt(8)
p_inst_title.paragraph_format.keep_with_next = True
r_it = p_inst_title.add_run("4.9 Complete System Installation & Cross-Platform Deployment Guide")
r_it.bold = True
r_it.font.size = Pt(13)
r_it.font.name = 'Arial'
r_it.font.color.rgb = RGBColor(217, 119, 6)

p_inst_intro = doc.add_paragraph()
p_inst_intro.paragraph_format.line_spacing = 1.15
p_inst_intro.paragraph_format.space_after = Pt(8)
p_inst_intro.add_run(
    "To address supervisor requirements regarding software deployment, this section provides step-by-step instructions for installing and running "
    "the SolarScan AI system across Personal Computers (Windows, Mac, Linux), Android mobile devices, and Apple iOS devices."
)

# Subsection 4.9.1: Desktop / Laptop PC Installation
p_pc = doc.add_paragraph()
p_pc.paragraph_format.space_before = Pt(14)
p_pc.paragraph_format.space_after = Pt(4)
r_pc = p_pc.add_run("4.9.1 Installation on Personal Computer / Laptop (Windows, Mac, Linux)")
r_pc.bold = True
r_pc.font.size = Pt(11)
r_pc.font.color.rgb = RGBColor(28, 25, 23)

p_pc_steps = doc.add_paragraph()
p_pc_steps.paragraph_format.line_spacing = 1.15
p_pc_steps.paragraph_format.space_after = Pt(6)
p_pc_steps.add_run(
    "Prerequisites: Node.js (version 18.0 or higher), Git, and a modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).\n\n"
    "Step 1: Open Terminal or Command Prompt and clone the project workspace repository:\n"
    "   git clone https://github.com/uenr-itds/solarscan-ai.git\n"
    "   cd solarscan-ai\n\n"
    "Step 2: Install required JavaScript packages and dependencies:\n"
    "   npm install\n\n"
    "Step 3: Launch the local development server:\n"
    "   npm run dev\n\n"
    "Step 4: Open your web browser and navigate to http://localhost:5173/\n"
    "Step 5 (Desktop App Shortcut): Click the install icon in the browser address bar (or select 'Install SolarScan AI' from Chrome menu) to create a standalone Desktop PWA app shortcut."
)

# Subsection 4.9.2: Mobile Installation (Android & iOS PWA)
p_mob = doc.add_paragraph()
p_mob.paragraph_format.space_before = Pt(14)
p_mob.paragraph_format.space_after = Pt(4)
r_mob = p_mob.add_run("4.9.2 Installing & Running on Mobile Devices (Android & iOS Web PWA)")
r_mob.bold = True
r_mob.font.size = Pt(11)
r_mob.font.color.rgb = RGBColor(28, 25, 23)

p_mob_steps = doc.add_paragraph()
p_mob_steps.paragraph_format.line_spacing = 1.15
p_mob_steps.paragraph_format.space_after = Pt(6)
p_mob_steps.add_run(
    "Field technicians can run the application directly on mobile phones and tablets without needing app store downloads:\n\n"
    "Step 1 (Expose Network IP): On the host PC connected to the local Wi-Fi router, start Vite with network access:\n"
    "   npm run dev -- --host\n"
    "Vite will output a Network URL (e.g. http://192.168.1.105:5173).\n\n"
    "Step 2A (Android Installation via Google Chrome):\n"
    "   1. Open Google Chrome on the Android device and type the Network URL (http://192.168.1.105:5173).\n"
    "   2. Tap the three-dot menu icon in the top right corner.\n"
    "   3. Select 'Install App' or 'Add to Home Screen'.\n"
    "   4. The SolarScan AI app icon will appear on the Android home screen, running full-screen offline.\n\n"
    "Step 2B (iOS Installation via Apple Safari):\n"
    "   1. Open Safari on iPhone or iPad and navigate to the Network URL.\n"
    "   2. Tap the 'Share' icon (square with arrow pointing up) at the bottom toolbar.\n"
    "   3. Scroll down and select 'Add to Home Screen'.\n"
    "   4. Tap 'Add'. The SolarScan AI app icon will launch as a native-like standalone iOS app."
)

# Subsection 4.9.3: Native Mobile Compilation (Capacitor APK & IPA)
p_cap = doc.add_paragraph()
p_cap.paragraph_format.space_before = Pt(14)
p_cap.paragraph_format.space_after = Pt(4)
r_cap = p_cap.add_run("4.9.3 Native Mobile Package Compilation (Capacitor Android APK & iOS Xcode IPA)")
r_cap.bold = True
r_cap.font.size = Pt(11)
r_cap.font.color.rgb = RGBColor(28, 25, 23)

p_cap_steps = doc.add_paragraph()
p_cap_steps.paragraph_format.line_spacing = 1.15
p_cap_steps.paragraph_format.space_after = Pt(6)
p_cap_steps.add_run(
    "To compile standalone native binaries (.apk for Android and .ipa for iOS) using Capacitor Core:\n\n"
    "Step 1: Build production web bundle:\n"
    "   npm run build\n\n"
    "Step 2: Sync assets to native mobile platforms:\n"
    "   npx cap sync\n\n"
    "Step 3A (Compile Android APK via Android Studio):\n"
    "   npx cap open android\n"
    "   In Android Studio, select Build > Build Bundle(s) / APK(s) > Build APK(s).\n"
    "   The compiled file `app-release.apk` can be transferred directly to Android phones.\n\n"
    "Step 3B (Compile iOS IPA via Xcode):\n"
    "   npx cap open ios\n"
    "   In Xcode, select Product > Archive, then export signed `.ipa` package for Apple TestFlight or iOS devices."
)

# Save destination targets
targets = [
    "documents/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Desktop/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Downloads/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Documents/Solar Scan Final Year Project Documentation.docx",
    "Solar Scan Final Year Project Documentation.docx"
]

for t in targets:
    try:
        doc.save(t)
        print(f"Saved ultimate thesis with screenshots & installation guide to {t}")
    except Exception as e:
        print(f"Error saving to {t}: {e}")

# Launch Microsoft Word
try:
    os.system('powershell -Command "Start-Process \'documents/Solar Scan Final Year Project Documentation.docx\'"')
    print("Launched Microsoft Word with updated documentation!")
except Exception as e:
    print("Launch error:", e)
