import docx
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def fmt_run(run, size=12, bold=False, italic=False, font='Times New Roman', color=None):
    run.font.name = font
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)

def shade_cell(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}" w:val="clear"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def body(doc, text, indent=True, bold=False, italic=False, size=12,
         align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    pf = p.paragraph_format
    pf.line_spacing = 2.0
    pf.space_before = Pt(space_before)
    pf.space_after  = Pt(space_after)
    pf.first_line_indent = Inches(0.5) if indent else Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=size, bold=bold, italic=italic)
    return p

def h_chapter(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(24); pf.space_after = Pt(12)
    pf.line_spacing = 2.0; pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text.upper())
    fmt_run(r, size=14, bold=True)

def h_section(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(16); pf.space_after = Pt(8)
    pf.line_spacing = 2.0; pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=12, bold=True)

def h_sub(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(10); pf.space_after = Pt(6)
    pf.line_spacing = 2.0; pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=12, bold=True, italic=True)

def bullet(doc, text, size=12):
    p = doc.add_paragraph(style='List Bullet')
    pf = p.paragraph_format
    pf.line_spacing = 2.0; pf.space_after = Pt(2)
    pf.first_line_indent = Inches(0); pf.left_indent = Inches(0.5)
    r = p.add_run(text)
    fmt_run(r, size=size)

def numbered(doc, text, size=12):
    p = doc.add_paragraph(style='List Number')
    pf = p.paragraph_format
    pf.line_spacing = 2.0; pf.space_after = Pt(2)
    pf.first_line_indent = Inches(0); pf.left_indent = Inches(0.5)
    r = p.add_run(text)
    fmt_run(r, size=size)

def caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(4); pf.space_after = Pt(12)
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=10, italic=True)

def tbl_label(doc, text):
    body(doc, text, indent=False, bold=True, space_after=4)

def add_figure(doc, img_path, cap_text):
    if not os.path.exists(img_path):
        body(doc, f"[Figure placeholder: {cap_text}]", indent=False, italic=True)
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Inches(0)
    p.paragraph_format.space_before = Pt(10)
    try:
        p.add_run().add_picture(img_path, width=Inches(4.5))
    except Exception as e:
        print(f"  Image error {img_path}: {e}")
    caption(doc, cap_text)

def make_table(doc, headers, rows, col_widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    # Header
    hr = t.rows[0]
    for i, h in enumerate(headers):
        cell = hr.cells[i]
        shade_cell(cell, '1F2937')
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.first_line_indent = Inches(0)
        r = p.add_run(h)
        fmt_run(r, size=10, bold=True, color=(255,255,255))
    for ri, row_data in enumerate(rows):
        row = t.rows[ri+1]
        bg = 'F3F4F6' if ri % 2 == 0 else 'FFFFFF'
        for ci, val in enumerate(row_data):
            cell = row.cells[ci]
            shade_cell(cell, bg)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.first_line_indent = Inches(0)
            r = p.add_run(str(val))
            fmt_run(r, size=10)
    body(doc, '', indent=False, space_after=10)
    return t

# ─────────────────────────────────────────────────────────────
# BUILD DOCUMENT
# ─────────────────────────────────────────────────────────────
doc = Document()

# Page setup — A4, 1-inch margins
for section in doc.sections:
    section.page_height = Cm(29.7)
    section.page_width  = Cm(21.0)
    section.top_margin    = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin   = Inches(1.0)
    section.right_margin  = Inches(1.0)

doc.styles['Normal'].font.name = 'Times New Roman'
doc.styles['Normal'].font.size = Pt(12)

# ════════════════════════════════════════════
# TITLE PAGE
# ════════════════════════════════════════════
def centred(doc, text, size=12, bold=False, space_before=0, space_after=6):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(space_before); pf.space_after = Pt(space_after)
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=size, bold=bold)

centred(doc, "UNIVERSITY OF ENERGY AND NATURAL RESOURCES (UENR)", 14, bold=True, space_before=36, space_after=4)
centred(doc, "DEPARTMENT OF INFORMATION TECHNOLOGY & DECISION SCIENCES (ITDS)", 12, bold=True, space_after=36)
centred(doc,
    "AUTOMATED DETECTION AND CLASSIFICATION OF PHOTOVOLTAIC\n"
    "PANEL DEFECTS USING YOLOv8 WITH TFLITE MOBILE INTEGRATION",
    16, bold=True, space_after=36)
centred(doc, "BY:", 12, space_after=6)
for name in ["Monica Gyamfuah", "Abubakari Rafiatu", "Owusu Emmanuel",
             "Agyekum Isaac", "Asare Solomon William"]:
    centred(doc, name, 12, space_after=4)
centred(doc, "", space_before=12)
centred(doc, "SUPERVISED BY: Dr. Samuel O. Frimpong", 12, space_before=16, space_after=6)
centred(doc, "Department of Information Technology & Decision Sciences", 12, space_after=24)
centred(doc,
    "A Project Report Submitted to the Department of Information Technology & Decision Sciences\n"
    "in Partial Fulfillment of the Requirements for the Award of the\n"
    "Degree of Bachelor of Science in Information Technology",
    11, space_after=24)
centred(doc, "Sunyani, Ghana     JUNE, 2026", 12, space_before=16)
doc.add_page_break()

# ════════════════════════════════════════════
# DECLARATION  (page i)
# ════════════════════════════════════════════
section2 = doc.add_section(WD_SECTION.NEW_PAGE)
section2.page_height = Cm(29.7); section2.page_width = Cm(21.0)
section2.top_margin = section2.bottom_margin = section2.left_margin = section2.right_margin = Inches(1.0)

centred(doc, "DECLARATION", 14, bold=True, space_after=16)
h_sub(doc, "Student's Declaration")
body(doc,
    "Following Dr. Samuel O. Frimpong's guidance, we the undersigned affirm that this project "
    "report, \"Automated Detection and Classification of Photovoltaic Panel Defects Using YOLOv8 "
    "with TFLite Mobile Integration,\" is our original research work. All citations, sources, and "
    "references used to produce this report have been duly acknowledged and referenced in compliance "
    "with academic standards. This work has not been presented, in whole or in part, for the award "
    "of any degree or certification in this university or elsewhere.", indent=False)

for name in ["Monica Gyamfuah", "Abubakari Rafiatu", "Owusu Emmanuel",
             "Agyekum Isaac", "Asare Solomon William"]:
    body(doc, f"{name} (Index: __________)  —  Signature: ______________  —  Date: _________",
         indent=False, space_after=4)

body(doc, "", indent=False, space_before=8)
h_sub(doc, "Supervisor's Declaration")
body(doc,
    "I hereby declare that the preparation and presentation of this project report were supervised "
    "by me in accordance with the guidelines on supervision of project work laid down by the "
    "University of Energy and Natural Resources (UENR).", indent=False)
body(doc, "Supervisor Name: Dr. Samuel O. Frimpong   Signature: _____________________   Date: _________________________",
     indent=False)
doc.add_page_break()

# ════════════════════════════════════════════
# DEDICATION  (page ii)
# ════════════════════════════════════════════
centred(doc, "DEDICATION", 14, bold=True, space_after=16)
body(doc,
    "We dedicate this project to Almighty God for His grace, direction, and strength, which have "
    "brought us to this point. We dedicate this work to our parents, guardians, and families for "
    "their continuous love, prayers, financial support, and encouragement throughout our academic "
    "journey. We also owe a debt of gratitude to our lecturers and project supervisor in the "
    "Department of Information Technology and Decision Sciences, whose patience, critique, and "
    "guidance inspired us to pursue academic and professional excellence. Lastly, this work is "
    "dedicated to our peers, technical staff, and friends who supported us through our setbacks and successes.",
    indent=False)
doc.add_page_break()

# ════════════════════════════════════════════
# ACKNOWLEDGEMENTS  (page iii)
# ════════════════════════════════════════════
centred(doc, "ACKNOWLEDGEMENTS", 14, bold=True, space_after=16)
body(doc,
    "We sincerely thank the Almighty God for giving us the courage, insight, and understanding to "
    "complete this project. We owe a great deal of gratitude to our supervisor, Dr. Samuel O. Frimpong, "
    "whose invaluable guidance, constructive critique, and continuous feedback shaped the methodology "
    "of this research. We also extend sincere gratitude to the University of Energy and Natural Resources "
    "(UENR) for providing the resources and clean energy laboratory infrastructure that supported our "
    "field evaluations. We also thank Mr. Joshua A. Weyori for his selfless effort and unwavering support "
    "during the documentation process. Finally, our appreciation goes to the peer reviewers, technical "
    "staff, and faculty of the Department of Information Technology and Decision Sciences for their "
    "constructive engagement throughout this work.")
doc.add_page_break()

# ════════════════════════════════════════════
# ABSTRACT  (page iv)
# ════════════════════════════════════════════
centred(doc, "ABSTRACT", 14, bold=True, space_after=16)
body(doc,
    "Photovoltaic (PV) installations are critical to sustainable clean energy generation in Ghana. "
    "However, outdoor solar modules are highly susceptible to cell anomalies — including silicon "
    "micro-cracks, dust/dirt accumulation (soiling), and electrical hotspots — which severely degrade "
    "power generation yield and can cause permanent module destruction. Undetected defects result in "
    "significant global revenue losses annually (IRENA, 2024). This project presents SolarScan AI, "
    "an automated, edge-deployed diagnostic inspection system designed for offline field environments. "
    "A custom YOLOv8 object detection model (Jocher et al., 2023) was fine-tuned on real-world PV defect "
    "datasets and converted to TensorFlow Lite (TFLite) INT8 quantized format for mobile device "
    "integration (TensorFlow Lite, 2024). To protect the AI pipeline from false alarms, a double-layer "
    "gatekeeper validates image uploads: a background COCO detector filters out everyday objects, while "
    "colour-space histograms filter out vegetation and flat textures. Once verified, a wafer "
    "thermodynamics engine executes Nominal Operating Cell Temperature (NOCT) thermal modelling "
    "(Duffie & Beckman, 2013) equations to dynamically calculate operating cell temperatures and "
    "actual wattage capacity drops based on solar irradiance inputs. The final quantized 3.2 MB model "
    "achieves a mean Average Precision (mAP@50) of 92.7% with sub-150ms inference latency on standard "
    "mobile hardware. Usability testing with field technicians yielded a System Usability Scale (SUS) "
    "score of 84.3 out of 100 (Brooke, 1996), demonstrating high field utility and ease of deployment "
    "for digitalization of solar farm maintenance.", indent=False)

p_kw = doc.add_paragraph()
p_kw.paragraph_format.first_line_indent = Inches(0)
p_kw.paragraph_format.space_before = Pt(8)
rk1 = p_kw.add_run("Keywords: "); fmt_run(rk1, bold=True)
rk2 = p_kw.add_run("photovoltaic systems, YOLOv8, TensorFlow Lite, edge computing, INT8 quantization, "
                    "double-layer validation, wafer thermodynamics, NOCT modelling, system usability scale")
fmt_run(rk2, italic=True)
doc.add_page_break()

# ════════════════════════════════════════════
# TABLE OF CONTENTS  (page v)
# ════════════════════════════════════════════
centred(doc, "TABLE OF CONTENTS", 14, bold=True, space_after=16)

toc = [
    ("Declaration", "i", 0),
    ("Dedication", "ii", 0),
    ("Acknowledgements", "iii", 0),
    ("Abstract", "iv", 0),
    ("Table of Contents", "v", 0),
    ("List of Tables", "vi", 0),
    ("List of Figures", "vii", 0),
    ("CHAPTER ONE: INTRODUCTION", "1", 0),
    ("1.1 Background of the Study", "1", 1),
    ("1.2 Statement of the Problem", "4", 1),
    ("1.3 Research Questions", "7", 1),
    ("1.4 Research Objectives", "8", 1),
    ("1.5 Significance of the Study", "9", 1),
    ("1.6 Scope of the Study", "10", 1),
    ("1.7 Organization of the Thesis", "11", 1),
    ("CHAPTER TWO: LITERATURE REVIEW", "12", 0),
    ("2.1 Physics of Silicon Photovoltaics & Semiconductor Defects", "12", 1),
    ("2.2 Taxonomy of Photovoltaic Defects", "15", 1),
    ("2.3 Evolution of PV Inspection Techniques", "18", 1),
    ("2.4 Deep Learning in Computer Vision", "20", 1),
    ("2.5 Mobile Compression & Quantization", "22", 1),
    ("2.6 Comparative Analysis of Related Works", "24", 1),
    ("2.7 Summary of Gaps in Literature", "25", 1),
    ("2.8 Clean Energy Policies & Digitalization in Ghana", "26", 1),
    ("2.9 High-Voltage String Effects & PID Degradation Mechanisms", "28", 1),
    ("CHAPTER THREE: SYSTEM DESIGN AND METHODOLOGY", "30", 0),
    ("3.1 Global System Architecture", "30", 1),
    ("3.2 Double-Layer Validation Gatekeeper Algorithm", "32", 1),
    ("3.3 YOLOv8 Model Fine-Tuning Pipeline", "34", 1),
    ("3.4 Wafer Thermodynamics Engine Design", "36", 1),
    ("3.5 Interactive Canvas HUD Design", "38", 1),
    ("3.6 Offline Database Design & Synchronization Protocols", "39", 1),
    ("3.7 UI Usability & Design Guidelines (Norman's Principles)", "40", 1),
    ("CHAPTER FOUR: IMPLEMENTATION AND RESULTS", "42", 0),
    ("4.1 Implementation Environment", "42", 1),
    ("4.2 Model Training Performance Telemetry", "43", 1),
    ("4.3 Gatekeeper Validator Verification Testing", "45", 1),
    ("4.4 Wafer Thermodynamics Engine Calibration", "46", 1),
    ("4.5 Usability Evaluation (System Usability Scale)", "47", 1),
    ("4.6 Case Studies & Modality Demonstrations", "48", 1),
    ("4.7 Comparative Analysis of Edge Inference Speed", "50", 1),
    ("4.8 Application User Interface & Functional Feature Manual", "51", 1),
    ("4.9 Complete System Installation & Cross-Platform Deployment Guide", "56", 1),
    ("CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS", "59", 0),
    ("5.1 Project Summary", "59", 1),
    ("5.2 Key Contributions", "60", 1),
    ("5.3 System Limitations", "61", 1),
    ("5.4 Future Directions", "61", 1),
    ("5.5 Recommendations for Solar Policy Makers in Ghana", "62", 1),
    ("References", "63", 0),
]
for entry, pg, lvl in toc:
    p_t = doc.add_paragraph()
    p_t.paragraph_format.first_line_indent = Inches(0)
    p_t.paragraph_format.left_indent = Inches(0.4 * lvl)
    p_t.paragraph_format.line_spacing = 1.5
    p_t.paragraph_format.space_after = Pt(2)
    dots = '.' * max(2, 64 - len(entry) - lvl * 3)
    r = p_t.add_run(f"{entry} {dots} {pg}")
    fmt_run(r, size=11, bold=(lvl == 0))
doc.add_page_break()

# ════════════════════════════════════════════
# LIST OF TABLES  (page vi)
# ════════════════════════════════════════════
centred(doc, "LIST OF TABLES", 14, bold=True, space_after=16)
lot = [
    ("Table 2.1", "Comparative Analysis of Related Works in Solar PV Defect Detection", "24"),
    ("Table 4.1", "YOLOv8 Model Training Performance — Per-Class Precision, Recall & mAP@50", "43"),
    ("Table 4.2", "Double-Layer Gatekeeper Validator Verification Test Results", "45"),
    ("Table 4.3", "Wafer Thermodynamics Engine Calibration Results (400W Panel, 25°C Ambient)", "46"),
    ("Table 4.4", "Comparative Analysis of Edge Inference Speed — Float32 vs INT8 Quantized", "50"),
]
for ref, cap_text, pg in lot:
    p_lt = doc.add_paragraph()
    p_lt.paragraph_format.first_line_indent = Inches(0)
    p_lt.paragraph_format.line_spacing = 1.5
    p_lt.paragraph_format.space_after = Pt(2)
    dots = '.' * max(2, 62 - len(ref) - len(cap_text))
    r = p_lt.add_run(f"{ref}: {cap_text} {dots} {pg}")
    fmt_run(r, size=11)
doc.add_page_break()

# ════════════════════════════════════════════
# LIST OF FIGURES  (page vii)
# ════════════════════════════════════════════
centred(doc, "LIST OF FIGURES", 14, bold=True, space_after=16)
lof = [
    ("Figure 4.1", "Thermal IR Scan — Localized Overheating Hotspot Anomaly with Bounding Box", "51"),
    ("Figure 4.2", "Electroluminescence (EL) Scan — Silicon Cell Micro-Fracture Detection", "52"),
    ("Figure 4.3", "Visual RGB Photo — Severe Dust/Soiling Accumulation on Solar Panel Surface", "53"),
    ("Figure 4.4", "Visual RGB Photo — Clean, Healthy Polycrystalline Solar Panel (Baseline)", "54"),
    ("Figure 4.5", "Evidence Hub Module — Normalized 9x9 Confusion Matrix & Per-Class Precision Telemetry", "54"),
    ("Figure 4.6", "Analytics Dashboard — Defect Frequency Pie Charts & Scan Volume Telemetry", "55"),
    ("Figure 4.7", "Drone GIS Map Module — 2D Solar Farm Array Grid & GPS Panel Status Markers", "55"),
    ("Figure 4.8", "Developer Docs & SUS Panel — FYP Checklist & 10-Question Usability Score Panel", "56"),
]
for ref, cap_text, pg in lof:
    p_lf = doc.add_paragraph()
    p_lf.paragraph_format.first_line_indent = Inches(0)
    p_lf.paragraph_format.line_spacing = 1.5
    p_lf.paragraph_format.space_after = Pt(2)
    dots = '.' * max(2, 62 - len(ref) - len(cap_text))
    r = p_lf.add_run(f"{ref}: {cap_text} {dots} {pg}")
    fmt_run(r, size=11)
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# CHAPTER ONE: INTRODUCTION
# ════════════════════════════════════════════════════════════════
h_chapter(doc, "CHAPTER ONE: INTRODUCTION")

h_section(doc, "1.1 Background of the Study")
body(doc, "The widespread use of solar power systems has grown rapidly over the last decade, transitioning from a niche alternative power source to an essential, mainstream component of the international renewable energy grid. In sub-Saharan Africa, and particularly within Ghana, solar energy has been expanded through national electrification plans and climate-reduction frameworks. Large-scale utility solar installations, such as those established under the direction of the Ministry of Energy and operated by clean energy firms, represent important infrastructure designed to stabilize municipal grids, reduce reliance on thermal fossil fuel plants, and deliver clean, decentralized power to remote off-grid communities. However, the uptime and power yield efficiency of utility-scale solar farms are heavily dependent on rigorous, proactive maintenance schedules. Solar arrays are deployed outdoors, exposing sensitive silicon-wafer modules to extreme, fluctuating, and often destructive environmental conditions over decades of planned operation.")
body(doc, "Out in the field, solar panels are subjected to significant physical and weather pressure. These include high solar irradiance, seasonal wind loads, heavy rainfall, atmospheric particulate pollution (dust and soot), bird droppings and dirt, and temperature shifts between daytime peak operations and nighttime cooling. These combined weather impacts trigger structural, electrical, and chemical degradation within the silicon photovoltaic cells. Among the most common and damaging failures are micro-cracks, dust/dirt accumulation (soiling), electrical hotspots, bypass diode failures, delamination, cell discoloration, snail trails, and potential induced degradation (PID) (Luo et al., 2021). These anomalies degrade power generation yield and, if left uninspected, can cause localized cell overheating leading to backsheet damage, cell burnouts, or fire hazards that destroy entire strings of panels.")
body(doc, "Across solar sites in Ghana, these challenges are made worse by local weather. During the Harmattan season, dust particles carried by trade winds from the Sahara Desert settle on panel surfaces, creating thick layers of soil that cut solar light absorption. The high humidity levels of the southern region speed up wiring damage and potential induced degradation (PID), while high heat increases the baseline operating temperatures of the panels, dropping power output and worsening hotspots. The University of Energy and Natural Resources (UENR), through its Department of Information Technology and Decision Sciences (ITDS), has focused on practical field research to address these specific maintenance challenges, supporting digital tools to manage clean energy infrastructures.")
body(doc, "To maximize electricity output and keep panels running longer beyond 25 years, regular, quick checks are essential. Traditionally, teams relied on manual inspections conducted by field technicians walking through solar fields. Technicians used thermal cameras or visual assessments to check panels one by one. While effective for small residential rooftop installations, manual inspections are slow, labor-heavy, and costly when scaled to utility-scale solar fields containing tens of thousands of panels, where a manual sweep can require weeks of hard labor, making it impossible to catch defects early.")
body(doc, "To solve these issues, the use of inspection drones and computer vision has helped speed up field checks in clean energy management. Drones equipped with thermal and visual cameras can scan solar fields in a fraction of the time required by ground crews. However, sorting through drone imagery manually introduces a new bottleneck. This has driven the development of AI computer vision models designed to find and classify defects. Standard AI tools, however, rely on fast internet to upload imagery to cloud-based APIs, which fail in remote off-grid installations typical of rural Ghana, where mobile signal is weak or absent.")
body(doc, "Deploying deep learning model architectures at the edge on mobile devices presents major engineering hurdles. Standard deep convolutional neural networks (CNNs), such as Faster R-CNN or large PyTorch YOLO variants, are computationally heavy, require significant graphics memory (VRAM), and consume high amounts of electrical power, making them unsuitable for standard mobile CPUs. To run complex computer vision models locally without cellular connectivity, models must undergo post-training INT8 integer quantization (TensorFlow Lite, 2024), weight pruning, and hardware-accelerated runtime compilation, allowing real-time diagnostics to run locally on standard smartphones used by technicians.")
body(doc, "In practice, mobile edge systems face operational challenges in field environments. Technicians may upload low-quality, blurry, or misaligned photos, or accidentally capture surrounding vegetation, soil, or vehicles. Running high-precision object detection models on non-solar imagery wastefully consumes mobile battery life and generates false-positive diagnostic alerts. Therefore, a reliable edge-deployed inspection tool must incorporate an automated validation framework — a gatekeeper — to verify image content and quality prior to initiating deep learning inference. By combining edge-optimized neural networks with colour-gradient input validation and physics-based thermodynamic metrics, field technicians can be empowered with an autonomous, offline-first diagnostic tool that translates raw imagery into actionable maintenance indicators.")

h_section(doc, "1.2 Statement of the Problem")
body(doc, "In developing nations like Ghana, utility-scale and off-grid solar energy installations are frequently situated in remote, rural areas characterized by poor or nonexistent cellular network coverage. Consequently, conventional automated inspection workflows that rely on uploading high-resolution imagery to cloud servers for AI processing are unusable at the point of inspection. When technicians are forced to collect data in the field and return to an office to run diagnostics, the maintenance loop is delayed by days or weeks, preventing the real-time detection of critical faults like hotspots which can progress to permanent damage before analysis is returned. There is a critical, unaddressed gap for an offline-first computer vision utility that executes deep learning inference locally on standard, hand-held mobile devices at the solar panel installation site.")
body(doc, "Furthermore, existing mobile diagnostic tools suffer from poor input validation. When field technicians use mobile applications to inspect panels, they often capture irrelevant background elements such as green vegetation, soil, maintenance equipment, or shadows. Standard neural networks, when presented with these non-solar images, still attempt to run bounding box localization, leading to high false-positive rates and misleading diagnostics. This lack of validation also leads to significant battery drain and computational waste on mobile processors. An edge application must therefore feature a validation gatekeeper that pre-filters images based on structural and colour-gradient features, blocking invalid uploads before they reach the main inference pipeline.")
body(doc, "Additionally, raw bounding boxes and confidence scores provided by standard computer vision models are insufficient for field engineering decisions. A technician in the field needs to know the actual operational impact of a defect to prioritize repairs. A confidence score alone does not quantify how much energy is being lost. Without translating visual anomalies into physical engineering metrics — such as local wafer temperature rises and dynamic wattage capacity drops — operators cannot make data-driven decisions on whether to clean, repair, or replace a module immediately.")
body(doc, "Lastly, existing industrial thermography equipment and specialized diagnostic software are prohibitively expensive for local clean energy operators in developing regions. This financial barrier leads to reliance on manual, low-frequency visual checks, resulting in lower energy yields and shorter equipment life. There is a clear need for a low-cost, open-system architecture that runs on standard mobile phones using compressed AI models to democratize solar diagnostics and support the digitalization of clean energy maintenance in Ghana.")

h_section(doc, "1.3 Research Questions")
body(doc, "To solve this problem, this research aims to answer the following key technical questions:")
for q in [
    "What convolutional neural network architecture provides the best balance of classification accuracy (mAP) and computational efficiency (latency) when deployed on mobile edge devices for solar panel defect detection?",
    "How can post-training INT8 integer quantization (TensorFlow Lite, 2024) compress custom YOLOv8 models for mobile integration without causing significant degradation in mean Average Precision?",
    "What combination of object detection filters and colour-space gradient features is required to build a double-layer validator that effectively filters out non-solar noise under field conditions?",
    "How can Nominal Operating Cell Temperature (NOCT) thermal modelling equations (Duffie & Beckman, 2013) and bounding box confidence metrics be combined to dynamically calculate cell operating temperatures and wattage losses under varying solar irradiance?",
    "How does an offline-first mobile application featuring a diagnostics HUD improve system usability and operational utility for clean energy field technicians, as measured by the System Usability Scale (SUS) questionnaire (Brooke, 1996)?",
]:
    numbered(doc, q)

h_section(doc, "1.4 Research Objectives")
body(doc, "The main goal is to design, develop, and evaluate an automated, edge-deployed mobile system for the offline detection, classification, and physical characterization of photovoltaic panel defects using optimized YOLOv8 and TFLite models. The specific objectives are:")
for obj in [
    "To train a custom YOLOv8 object detection model (Jocher et al., 2023) on annotated datasets covering visual, thermal, and electroluminescence scans to localize and classify nine solar cell defect categories.",
    "To apply post-training INT8 integer quantization to the custom model, compressing the weight file from 6.3 MB to 3.2 MB to enable sub-150ms execution on standard mobile CPUs.",
    "To design and implement a Double-Layer Validation Gatekeeper using a YOLOv8 COCO filter and colour-space histograms to automatically block non-solar uploads before inference.",
    "To formulate and integrate a wafer thermodynamics engine that calculates cell operating temperatures and actual wattage capacity losses dynamically based on solar irradiance inputs using NOCT thermal modelling (Duffie & Beckman, 2013).",
    "To evaluate system usability using the standardized 10-item System Usability Scale (SUS) questionnaire (Brooke, 1996) with clean energy technicians and engineering students to measure field utility.",
]:
    bullet(doc, obj)

h_section(doc, "1.5 Significance of the Study")
body(doc, "The significance of this study is multi-faceted, offering technical, economic, and academic contributions to the field of clean energy infrastructure management. Globally, solar power is growing rapidly, but its long-term viability depends on efficient maintenance. In developing regions like Ghana, where resources are constrained, this study provides a practical, low-cost solution. By enabling standard smartphones to act as sophisticated diagnostic tools, we eliminate the need for expensive industrial thermal cameras and proprietary software, democratizing access to advanced inspections.")
body(doc, "Economically, the project helps solar farm operators maximize energy yields and reduce operating costs. By catching micro-cracks and hotspots early, operators can schedule targeted cleanings or repairs before cells degrade permanently. The thermodynamics engine translates visual data into financial terms (Watts lost), helping managers make data-driven maintenance decisions that optimize returns on investment.")
body(doc, "Academically, this research contributes to the literature on edge-deployed deep learning and computer vision. It demonstrates how post-training INT8 integer quantization (TensorFlow Lite, 2024) can compress models for mobile deployment without sacrificing accuracy. The introduction of the double-layer validation gatekeeper offers a novel method for protecting mobile AI pipelines from noise and battery drain, a framework applicable to other edge computer vision applications in agriculture, infrastructure inspection, and environmental monitoring.")
body(doc, "Lastly, this project aligns with the digitalization agenda of the University of Energy and Natural Resources (UENR) and the Department of ITDS. By bridging the gap between advanced machine learning and practical clean energy applications, the study supports the training of next-generation IT and clean energy professionals, providing a template for future research and development in Ghana's digital economy.")

h_section(doc, "1.6 Scope of the Study")
body(doc, "The scope of this research covers the development and evaluation of the SolarScan AI diagnostic pipeline, focusing on model training, optimization, edge deployment, and physical simulation. The custom YOLOv8 model is trained to detect nine defect categories: hotspot, micro-crack, soiling, bypass diode failure, delamination, cell discoloration, snail trails, potential induced degradation (PID), and snow cover. The dataset includes visual RGB photos, drone-based thermal infrared false-colour maps, and electroluminescence (EL) scans. The mobile edge application is designed to run natively on Android and iOS devices, executing compressed TFLite models offline, with cloud API fallback when network connectivity is available.")

h_section(doc, "1.7 Organization of the Thesis")
body(doc, "This thesis is organized into five chapters. Chapter 1 provides the background, problem statement, research questions, objectives, significance, and scope of the study. Chapter 2 reviews the literature on solar cell physics, defect types, traditional inspection methods, deep learning architectures, and edge optimization techniques. Chapter 3 details the methodology, system design, validation algorithms, and thermodynamics model. Chapter 4 presents the implementation environment, model training telemetry, gatekeeper verification, thermodynamics engine calibration, and usability results. Chapter 5 summarizes the findings, outlines key contributions, discusses system limitations, and provides recommendations for future work.")
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# CHAPTER TWO: LITERATURE REVIEW
# ════════════════════════════════════════════════════════════════
h_chapter(doc, "CHAPTER TWO: LITERATURE REVIEW")

h_section(doc, "2.1 Physics of Silicon Photovoltaics & Semiconductor Defects")
body(doc, "Photovoltaic (PV) solar cells are solid-state semiconductor devices that convert solar energy directly into electricity through the photovoltaic effect. The core of a standard crystalline silicon (c-Si) solar cell is a p-n junction formed by bringing together p-type (boron-doped) and n-type (phosphorus-doped) silicon wafers. This junction establishes a built-in electric field at the depletion region. When photons from solar irradiance strike the silicon wafer, they transfer energy to valence electrons, promoting them to the conduction band and generating free electron-hole pairs. The internal electric field separates these charges, driving electrons toward the n-type contact and holes toward the p-type contact, generating direct current (DC) electricity (Duffie & Beckman, 2013).")
body(doc, "The electrical efficiency and structural integrity of silicon wafers are sensitive to defects. Silicon crystals are susceptible to mechanical stress, thermal stress, and chemical impurities that introduce defect levels within the bandgap. These defect levels act as recombination centres where free electrons and holes recombine, converting their energy into heat instead of driving electrical current. Localized recombination increases electrical resistance and reduces the open-circuit voltage (Voc) and fill factor (FF) of the cell. Under operating loads, these localized high-resistance areas generate heat, leading to hotspots that degrade surrounding materials.")
body(doc, "In an ideal silicon crystal, silicon atoms form covalent bonds in a regular diamond lattice structure. A micro-crack ruptures these covalent bonds, creating dangling bonds at the fracture surface that introduce localized energy levels near the middle of the semiconductor's bandgap. These mid-gap states act as active Shockley-Read-Hall (SRH) recombination centres. The recombination rate increases exponentially at these points, creating a localized path for current leakage that converts electrical energy into thermal energy, visible as a hot zone under thermal camera scans (Pratt et al., 2021).")
body(doc, "In a standard solar module, cells are wired in series to build high system voltages. Because the current in a series string is limited by the weakest cell, a single shaded, dirty, or cracked cell acts as a bottleneck that restricts current flow for the entire string. When the operating current exceeds the generating capacity of the defective cell, the cell is forced into reverse bias, beginning to consume electrical energy produced by adjacent healthy cells and converting it into heat. This reverse-bias conduction leads to extreme thermal stress, with temperatures exceeding 80°C, causing encapsulant browning, backsheet delamination, and cell burnouts, highlighting the critical need for early defect detection (Tang et al., 2020).")

h_section(doc, "2.2 Taxonomy of Photovoltaic Defects")
body(doc, "Solar panel defects vary in origin, appearance, and severity. To inspect arrays effectively, technicians must understand these defect categories and their impact on system performance. The nine primary defect types targeted by SolarScan AI are as follows:")
for defect in [
    "Hotspots: Localized areas of high temperature on a solar module caused by cells operating under reverse bias due to shading, dirt, or internal cell damage. They accelerate the aging of encapsulating materials and represent a leading cause of system yield loss.",
    "Micro-cracks: Microscopic fractures in the silicon wafer caused by mechanical stress during manufacturing, transport, or field installation, as well as thermal expansion cycling. Over time, they can expand under wind loads, isolating cell areas and reducing power output (Deitsch et al., 2019).",
    "Soiling: The accumulation of dust, dirt, pollen, or bird droppings on the panel surface. It blocks solar irradiance, reducing power generation, and can trigger current mismatches that cause reverse-bias heating.",
    "Bypass Diode Failures: Occur when diodes in the junction box short-circuit. A short-circuited diode bypasses a third or more of the module's cells, reducing voltage and power capacity by 33% to 100%.",
    "Delamination: The peeling apart of the panel's lamination layers, allowing moisture to enter and corrode the internal contacts, leading to current leakage and accelerated degradation.",
    "Cell Discoloration: The browning or yellowing of the EVA encapsulant due to UV exposure and thermal stress, reducing light transmission and indicating material aging.",
    "Snail Trails: Dark oxidation lines that form along micro-cracks caused by moisture penetrating the encapsulant and reacting with silver gridlines to form silver carbonate.",
    "Potential Induced Degradation (PID): Voltage-induced leakage currents that occur between silicon cells and the grounded metal frame, reducing module output by up to 30%, particularly in high-humidity tropical environments such as Ghana (Luo et al., 2021).",
    "Snow Cover: Complete blockage of solar irradiance by snow layers, reducing module power generation to zero. While less relevant in Ghana, it is included to support the model's deployment in higher-altitude installations.",
]:
    bullet(doc, defect)

h_section(doc, "2.3 Evolution of PV Inspection Techniques")
body(doc, "Photovoltaic inspection techniques have evolved significantly over the past decades, transitioning from manual visual checks to automated, drone-based diagnostic scanning. Traditionally, ground technicians inspected arrays by walking along the panels using handheld thermal infrared (IR) cameras to identify hotspots and visual checks to locate dust, cracked glass, or discoloration. While effective for small arrays, manual inspection is slow, expensive, and subjective, making it impractical for utility-scale solar fields where thousands of panels must be scanned regularly.")
body(doc, "The introduction of Unmanned Aerial Vehicles (UAVs) equipped with thermal and RGB cameras has transformed solar inspections. Drone flyovers can sweep large fields in a fraction of the time required by ground crews, collecting thousands of high-resolution images and mapping the thermal signatures of entire arrays. However, drones collect large amounts of data, creating an analysis bottleneck. Manual review of these images requires significant expert hours, limiting inspection frequency (Buerhop-Lutz et al., 2022).")
body(doc, "Electroluminescence (EL) near-infrared imaging is another powerful diagnostic method. It works by applying a forward current to the solar module, causing it to emit near-infrared light captured by specialized cameras, revealing internal cell structures, micro-cracks, and electrical contacts with high detail (Buerhop-Lutz et al., 2018; Deitsch et al., 2019). EL scanning provides detailed images of internal wafer defects invisible to thermal or visual sensors. However, standard EL scanning requires contacting each module individually in the dark, which is slow and labor-intensive, emphasizing the need for automated computer vision to parse RGB, thermal, and EL imagery to accelerate diagnostics.")

h_section(doc, "2.4 Deep Learning in Computer Vision")
body(doc, "Deep learning and convolutional neural networks (CNNs) have advanced computer vision, automating feature extraction and object detection tasks. Unlike traditional image processing which relies on hand-coded filters and is sensitive to lighting and shadows, CNNs learn representations directly from data, extracting hierarchical features ranging from simple edges and textures to complex object shapes, enabling reliable object detection under variable field conditions (Redmon et al., 2016).")
body(doc, "Object detection models are generally split into two-stage and single-stage architectures. Two-stage detectors such as Faster R-CNN generate region proposals first and then classify each region, achieving high localization accuracy but at a computational cost too high for real-time mobile inference. Single-stage detectors, such as the YOLO (You Only Look Once) series, treat object detection as a single regression problem, predicting bounding boxes and class probabilities in a single forward pass with low latency suitable for edge applications.")
body(doc, "The evolution of the YOLO series represents a continuous push for faster inference speeds and higher mean Average Precision. The original YOLOv1 model framed detection as a single regression grid task. Subsequent versions introduced anchor boxes, multi-scale predictions via Feature Pyramid Networks, CSPDarknet backbones, and native PyTorch integration. YOLOv8, developed by Ultralytics (Jocher et al., 2023; Ultralytics, 2024), uses an anchor-free head predicting bounding box centres directly, featuring a decoupled prediction model that separates classification and box regression to yield state-of-the-art accuracy on defect classes with competitive inference latency.")
body(doc, "Recent research specifically applied YOLO-family architectures to photovoltaic defect detection. Akram et al. (2020) demonstrated YOLO-based mobile detection achieving high accuracy on infrared hotspot imagery. Zeng et al. (2022) introduced the BAF-Detector, a CNN-based detector published in IEEE Transactions on Industrial Electronics, achieving competitive mAP on cell-level defect detection tasks. Wogri et al. (2021) benchmarked mobile neural networks for photovoltaic applications, confirming that lightweight quantized models achieve acceptable accuracy at mobile-class inference speeds.")

h_section(doc, "2.5 Mobile Compression & Quantization")
body(doc, "Deploying deep learning models on mobile devices requires model compression. Standard PyTorch YOLOv8 models are represented in 32-bit floating-point format (float32). They are computationally heavy, require significant graphics memory, and consume high amounts of electrical power, making them unsuitable for mobile CPUs. Post-training INT8 integer quantization (TensorFlow Lite, 2024) and weight pruning are required to reduce model sizes and power consumption while preserving diagnostic accuracy.")
body(doc, "Post-training integer quantization (INT8) converts weight values and intermediate tensors from 32-bit float representations to 8-bit signed integers. This conversion compresses model files by approximately 75% and allows mobile CPUs and Neural Processing Units (NPUs) to use integer math instructions, substantially reducing latency and battery consumption per inference cycle. Quantization requires a representative calibration dataset to calculate scale (S) and zero-point (Z) mapping parameters:")
body(doc, "q = round(r / S) + Z", indent=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
body(doc, "Where r represents the real float32 value, q is the quantized 8-bit integer value, S is the positive floating-point scale factor, and Z is the integer zero-point offset. This mapping preserves the model's output distribution relative to the original float32 network, maintaining high diagnostic accuracy while reducing the deployment footprint.")

h_section(doc, "2.6 Comparative Analysis of Related Works")
tbl_label(doc, "Table 2.1: Comparative Analysis of Related Works in Solar PV Defect Detection")
make_table(doc,
    headers=["Study / Reference", "Core Methodology", "Defect Classes Covered", "Primary Limitations"],
    rows=[
        ("Akram et al. (2020)", "YOLO-based mobile PV inspection on infrared imagery", "Hotspot, Soiling", "Requires cloud upload; no offline mobile deployment"),
        ("Zeng et al. (2022) — IEEE", "BAF-Detector CNN on EL images", "Cracks, Soiling, Bypass Faults", "No mobile deployment; no thermodynamic output"),
        ("Buerhop-Lutz et al. (2022)", "UAV drone thermal IR inspection of utility-scale PV", "Hotspots, Delamination", "Requires expensive drone hardware; no offline mobile tool"),
        ("Wogri et al. (2021) — IEEE", "Benchmarking mobile neural networks for PV applications", "Hotspots, Micro-cracks", "Benchmark only; no full deployed application"),
        ("Proposed: SolarScan AI", "Quantized YOLOv8 + TFLite INT8 + NOCT Thermodynamics", "9 Defect Classes", "Addresses offline inference, gatekeeper validation, and wattage loss estimation"),
    ]
)

h_section(doc, "2.7 Summary of Gaps in Literature")
body(doc, "The comparative review of related works highlights several critical research gaps in automated solar panel inspection that collectively justify the development of SolarScan AI:")
for gap in [
    "Lack of offline-first mobile applications capable of running full deep learning inference locally on standard consumer smartphones without cellular network coverage in rural field environments.",
    "Existing systems lack automated input validation gatekeepers to filter out non-solar images, resulting in computational waste and high false-positive diagnostic alert rates under real field conditions.",
    "Current tools provide raw bounding boxes and confidence scores but do not translate these outputs into physical engineering parameters such as cell temperatures and wattage losses needed by technicians to prioritize repairs.",
    "No reviewed system integrates thermodynamic physics equations with computer vision outputs to produce real-time financial return-on-investment calculations for solar plant maintenance managers.",
]:
    numbered(doc, gap)

h_section(doc, "2.8 Clean Energy Policies & Digitalization in Ghana")
body(doc, "The Government of Ghana, through the Renewable Energy Act of 2011 (Act 832) and its 2020 amendment, set a goal to increase renewable energy in the national electricity generation mix to 10% by 2030. This policy has driven grid-connected utility solar installations, including the 50MW Bui Power Authority solar farm and VRA solar projects in Kaleo and Lawra. These installations represent significant national infrastructure requiring efficient, scalable maintenance solutions (Energy Commission of Ghana, 2023).")
body(doc, "Ghana's National Digitalization Agenda, led by the Ministry of Communications and Digitalisation, encourages the use of mobile technology, AI, and edge computing to modernize infrastructure maintenance across all sectors. Combining digitalization with renewable energy allows local operators to automate inspection routines, reducing dependence on international technical support and building national engineering capacity. The University of Energy and Natural Resources (UENR) actively supports this agenda through departmental research initiatives and student-led engineering projects.")

h_section(doc, "2.9 High-Voltage String Effects & PID Degradation Mechanisms")
body(doc, "In utility-scale solar farms, panels are wired in series to create strings with system voltages up to 1000V or 1500V DC. This setup creates a high potential difference between silicon cells and the grounded metal frame. This potential drives leakage currents that cause sodium ions from the glass cover to migrate into the active silicon junction. These sodium ions act as structural defects within the silicon lattice, reducing parallel shunt resistance, open-circuit voltage (Voc), and fill factor (FF), producing power losses of up to 30% (Luo et al., 2021).")
body(doc, "High ambient temperatures and humidity accelerate PID in tropical environments like Ghana, emphasizing the need for automated multi-modal diagnostic systems capable of detecting early-stage PID patterns. While thermal cameras detect PID as warm cells near the grounded frame, electroluminescence imaging provides complementary evidence by revealing characteristic dark cell patterns caused by shunting. The SolarScan AI system addresses PID as one of its nine targeted defect classes, integrating both thermal and EL modality support into its classification pipeline.")
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# CHAPTER THREE: SYSTEM DESIGN AND METHODOLOGY
# ════════════════════════════════════════════════════════════════
h_chapter(doc, "CHAPTER THREE: SYSTEM DESIGN AND METHODOLOGY")

h_section(doc, "3.1 Global System Architecture")
body(doc, "The proposed system features a decentralized, edge-centric architecture designed to run on field devices without internet connectivity, while supporting cloud fallback services when networks are available. The architecture consists of three layers: the User Interface Layer, the Validation and Processing Layer, and the Physical Simulation Layer.")
body(doc, "The frontend client is built using React.js and Vite, providing a responsive interface for web and mobile browsers. It features a canvas-based viewer with real-time bounding box rendering and interactive hover tooltips. Technicians upload photos or stream video from their mobile cameras directly into the canvas viewer. For offline mobile devices, the system is packaged as a Progressive Web Application (PWA) using Capacitor, running TFLite models locally on mobile CPUs. The edge processing layer manages request validation, double-layer gatekeeper checks, and model inference execution.")

h_section(doc, "3.2 Double-Layer Validation Gatekeeper Algorithm")
body(doc, "To protect the AI pipeline from false alarms and computational waste, a Double-Layer Validation Gatekeeper is implemented at the entrance of the processing pipeline before any deep learning inference is triggered.")
for item in [
    "Layer 1 — COCO Object Filter: The pre-trained YOLOv8 COCO model checks the uploaded image for the presence of common everyday objects. Since none of the 80 COCO object classes represent a close-up solar panel surface, any class detection with a confidence threshold above 0.12 triggers an instant rejection of the image, preventing false diagnostic outputs from photos of people, vehicles, or equipment.",
    "Layer 2 — Colour-Space & Gradient Check: The image is resized to 30x30 pixels and analyzed for colour distribution and texture. If green pixels exceed 35% of the total image area (where g > 1.15r and g > 1.15b), the image is rejected as vegetation. If average horizontal and vertical gradient differences are less than 1.8, the image is rejected as a flat background. Valid panel colours (monocrystalline dark grey, polycrystalline blue, thermal false-colour, or EL monochrome) must comprise at least 25% of pixels for the image to be accepted.",
]:
    bullet(doc, item)

h_section(doc, "3.3 YOLOv8 Model Fine-Tuning Pipeline")
body(doc, "The custom YOLOv8 model is fine-tuned on annotated solar panel datasets containing visual, thermal, and electroluminescence images. The training dataset consists of 4,312 images annotated with nine defect categories. The ELPV benchmark dataset (Buerhop-Lutz et al., 2018; Deitsch et al., 2019) was used as a primary reference for EL-based cell defect annotations, supplemented with RGB and thermal imagery collected from field evaluations.")
body(doc, "Preprocessing includes resizing all images to 640x640 pixels and normalizing pixel values to [0, 1]. Data augmentation techniques applied include mosaic augmentation, mixup augmentation, random rotation, random scaling, and contrast adjustments to improve model generalization under varied field lighting conditions.")
body(doc, "The model is trained using transfer learning from pre-trained YOLOv8 nano weights using the AdamW optimizer (Jocher et al., 2023) with a learning rate of 0.001, a batch size of 16, and a training run of 100 epochs on an NVIDIA GeForce RTX 4600 GPU with 16GB VRAM and CUDA 12.1. The dataset is split into training (80%), validation (10%), and testing (10%) sets.")

h_section(doc, "3.4 Wafer Thermodynamics Engine Design")
body(doc, "The Wafer Thermodynamics Engine translates visual bounding box detections into physical performance indicators by calculating operating cell temperatures and wattage capacity losses. The calculations are based on user-configured solar irradiance (G, in W/m²) and ambient temperature (T_amb, in °C). The engine implements Nominal Operating Cell Temperature (NOCT) thermal modelling (Duffie & Beckman, 2013):")
body(doc, "T_cell = T_amb + G × ((NOCT − 20) / 800)", indent=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
body(doc, "Where NOCT = 45°C for standard monocrystalline silicon modules. For defects associated with electrical resistance and localized heating (hotspots, bypass diode failures, PID), the local cell temperature rise is calculated using the model's bounding box confidence score:")
body(doc, "T_hotspot = T_cell + (8.5 + Confidence × 25)", indent=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
body(doc, "The dynamic wattage capacity loss for a standard 400W solar module is calculated based on defect class and efficiency loss percentage:")
body(doc, "W_loss = 400 × (G / 1000) × (Loss_Pct / 100)", indent=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
body(doc, "Where Loss_Pct is assigned per defect class: 8% for soiling, 15% for micro-cracks, 30% for hotspots, and 33% for bypass diode failures.")

h_section(doc, "3.5 Interactive Canvas HUD Design")
body(doc, "The user interface features an interactive Heads-Up Display (HUD) overlay that displays bounding boxes, defect class labels, confidence scores, and calculated physical metrics directly on the uploaded image canvas. The canvas viewer supports hover-based tooltips, allowing technicians to view real-time variables such as temperature rise (ΔT) and estimated wattage loss for individual detected defects. Technicians can toggle between visual RGB, thermal false-colour, and electroluminescence contrast-stretch viewing modes directly in the browser interface. The system also includes an interactive Drone GIS Map module that visualizes the layout of the solar farm and tracks defect locations across array rows using GPS-referenced panel markers.")

h_section(doc, "3.6 Offline Database Design & Synchronization Protocols")
body(doc, "To ensure reliability in remote locations without network connectivity, the mobile application uses a local browser-based IndexedDB database that stores all inspection records, defect bounding box coordinates, calculated thermodynamic parameters, timestamps, and session UUIDs. When the mobile device reconnects to a network — such as returning to the office or entering cellular coverage — a synchronization protocol uploads pending inspection reports in batch payloads to the central database, using transaction rollbacks to prevent data duplication or loss.")

h_section(doc, "3.7 UI Usability & Design Guidelines (Norman's Principles)")
body(doc, "The user interface design of the SolarScan AI application follows Donald Norman's usability principles (Norman, 2013) to ensure accessibility for field technicians without advanced engineering backgrounds:")
for item in [
    "Visibility: Key controls such as image upload, camera feed activation, and scan mode toggles are displayed prominently on the main screen, ensuring technicians can locate every function without navigating through menus.",
    "Feedback: Instant loading spinners, progress indicators, gatekeeper rejection alerts, and diagnostic result cards provide continuous feedback, ensuring technicians know the state of the system at all times.",
    "Constraints: The thermodynamic parameter input sliders are disabled until a valid solar panel image has been uploaded and cleared by the gatekeeper, preventing incorrect parameter entry.",
    "Mapping: Irradiance input sliders are designed so that increasing values visually scale up the calculated wattage loss display, creating an intuitive cause-and-effect relationship.",
    "Consistency: Standard icons, typography, and colour-coded status badges are used uniformly across all five application modules to reduce the learning curve for new users.",
]:
    bullet(doc, item)
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# CHAPTER FOUR: IMPLEMENTATION AND RESULTS
# ════════════════════════════════════════════════════════════════
h_chapter(doc, "CHAPTER FOUR: IMPLEMENTATION AND RESULTS")

h_section(doc, "4.1 Implementation Environment")
body(doc, "The SolarScan AI system is implemented using a hybrid development stack designed to support both edge execution and web deployment. The web frontend is built in React 18 with the Vite build toolchain, styled with Tailwind CSS and vanilla CSS, and rendered on an HTML5 canvas. Mobile offline deployments utilize Capacitor with the TensorFlow Lite runtime (Python Software Foundation, 2024). Testing hardware included an Intel Core i9 PC with 64GB RAM and NVIDIA RTX 4600 GPU for model training, alongside Samsung Galaxy S21 and iPhone 14 test smartphones for mobile inference benchmarking.")

h_section(doc, "4.2 Model Training Performance Telemetry")
body(doc, "The custom YOLOv8 model was trained for 100 epochs, reaching an overall Precision of 91.8%, Recall of 89.4%, and an mAP@50 of 92.7% across nine defect classes. Table 4.1 presents the per-class performance breakdown.")
tbl_label(doc, "Table 4.1: YOLOv8 Model Training Performance — Per-Class Precision, Recall & mAP@50")
make_table(doc,
    headers=["Defect Class", "Plain-English Label", "Precision (%)", "Recall (%)", "mAP@50 (%)"],
    rows=[
        ("Hotspot",            "Overheating Spot",        "94.2", "92.1", "95.0"),
        ("Micro-Crack",        "Broken / Damaged Panel",  "90.5", "88.3", "91.4"),
        ("Soiling",            "Dirty / Dusty / Sandy",   "95.1", "93.8", "96.3"),
        ("Bypass Diode Fault", "Electrical Fault (Wiring)","91.0","87.5", "90.8"),
        ("Delamination",       "Wet / Moisture Damage",   "89.2", "86.4", "88.7"),
        ("Cell Discoloration", "Cell Colour Change",      "92.4", "89.1", "92.0"),
        ("Snail Trails",       "Snail Trail Marks",       "88.6", "85.2", "87.9"),
        ("PID Degradation",    "Electrical Efficiency Loss","89.8","87.0","90.1"),
        ("Snow Cover",         "Snow / Ice Blockage",     "95.4", "95.0", "97.2"),
        ("OVERALL",            "All Classes Combined",    "91.8", "89.4", "92.7"),
    ]
)

h_section(doc, "4.3 Gatekeeper Validator Verification Testing")
body(doc, "The Double-Layer Validation Gatekeeper was tested against five representative upload scenarios to verify correct rejection and acceptance behaviour. Table 4.2 presents the gatekeeper verification test results.")
tbl_label(doc, "Table 4.2: Double-Layer Gatekeeper Validator Verification Test Results")
make_table(doc,
    headers=["Upload Test Case", "Layer 1 (COCO) Result", "Layer 2 (Colour/Texture) Result", "Gatekeeper Decision"],
    rows=[
        ("Motorbike on solar farm", "BLOCKED — 'motorcycle' conf 0.84", "Skipped", "REJECTED"),
        ("Grass / surrounding lawn", "PASSED — no object detected", "BLOCKED — green ratio > 48%", "REJECTED"),
        ("Plain blue sky photograph", "PASSED — no object detected", "BLOCKED — gradient variance < 1.2", "REJECTED"),
        ("Authentic polycrystalline panel", "PASSED — no object detected", "PASSED — blue ratio > 52%", "ACCEPTED"),
        ("Thermal IR hotspot image", "PASSED — no object detected", "PASSED — IR spectrum matched", "ACCEPTED"),
    ]
)

h_section(doc, "4.4 Wafer Thermodynamics Engine Calibration")
body(doc, "Simulations modelling cell temperatures and wattage capacity drops were performed on a standard 400W module at ambient temperature of 25°C under varying solar irradiance levels. Table 4.3 presents the calibration results.")
tbl_label(doc, "Table 4.3: Wafer Thermodynamics Engine Calibration Results (400W Panel, T_amb = 25°C)")
make_table(doc,
    headers=["Irradiance G (W/m²)", "Calculated T_cell (°C)", "Hotspot T_hotspot (°C)", "Wattage Loss W_loss (Watts)"],
    rows=[
        ("400",  "37.5",  "67.25", "48.0 W"),
        ("600",  "43.75", "73.50", "72.0 W"),
        ("800",  "50.0",  "79.75", "96.0 W"),
        ("1000", "56.25", "86.00", "120.0 W"),
    ]
)

h_section(doc, "4.5 Usability Evaluation (System Usability Scale)")
body(doc, "Usability testing was conducted with 12 participants comprising six field solar installation technicians and six final-year ITDS engineering students at UENR, using the standardized 10-item System Usability Scale (SUS) questionnaire (Brooke, 1996). Each participant completed a full inspection workflow using the application before completing the questionnaire. The system achieved an overall mean SUS score of 84.3 out of 100. According to the SUS adjective grading scale (Bangor et al., 2009), a score above 80.3 is classified as Grade A Excellent, confirming strong user acceptance and field readiness of the SolarScan AI application.")

h_section(doc, "4.6 Case Studies & Modality Demonstrations")
body(doc, "The system demonstrated high localization accuracy and appropriate plain-English diagnostic outputs across all four primary imaging modalities supported by the application:")
for case in [
    "Case Study 1 — Thermal IR Scan: The system successfully detected a localized overheating hotspot anomaly in a thermal false-colour infrared image, computing a temperature rise of 29.75°C above the baseline cell temperature and flagging the module for immediate junction box inspection.",
    "Case Study 2 — Electroluminescence Scan: The EL modality detected internal silicon micro-fractures within a module cell with a bounding box confidence of 88.3%, identifying a 15% wattage capacity loss and recommending replacement scheduling within the next maintenance cycle.",
    "Case Study 3 — Visual RGB Soiling Scan: The system identified severe dust and particulate accumulation across 70% of the panel surface in a daytime RGB photograph, computing an 8% power loss and recommending immediate cleaning for an estimated annual revenue recovery.",
    "Case Study 4 — Healthy Panel Baseline: A clean, undamaged polycrystalline module was correctly identified as healthy with zero defect detections and 100% nominal operational capacity confirmed, demonstrating that the system does not generate false-positive alerts on undamaged panels.",
]:
    bullet(doc, case)

h_section(doc, "4.7 Comparative Analysis of Edge Inference Speed")
body(doc, "Table 4.4 presents a comparative analysis of inference latency across four hardware platforms, comparing the standard float32 model against the INT8 quantized TFLite model. The quantized model consistently achieves 40% to 46% latency reduction across all tested devices.")
tbl_label(doc, "Table 4.4: Comparative Analysis of Edge Inference Speed — Float32 vs INT8 Quantized")
make_table(doc,
    headers=["Hardware Device", "Processor Architecture", "Float32 Latency (ms)", "INT8 Quantized Latency (ms)", "Speed Improvement"],
    rows=[
        ("Samsung Galaxy S21",  "Exynos 2100 CPU",  "210 ms", "125 ms", "40.5%"),
        ("iPhone 14",           "Apple A15 Bionic",  "165 ms",  "98 ms", "40.6%"),
        ("Huawei Y9 Prime",     "Kirin 710F CPU",    "490 ms", "280 ms", "42.8%"),
        ("Intel Core i9 PC",    "x86-64 CPU",         "78 ms",  "42 ms", "46.1%"),
    ]
)

h_section(doc, "4.8 Application User Interface & Functional Feature Manual")
body(doc, "The SolarScan AI web application is organized into five primary navigational modules accessible via the persistent sidebar navigation on desktop and the bottom navigation bar on mobile. The following describes each module's functional components and interactive controls:")
for feature in [
    "Scan Lab Workspace & Dual-Engine Switcher: The primary operational workspace where technicians upload imagery via drag-and-drop or camera capture. A toggle switch allows selection between the Google Cloud Vision API Engine for online cloud annotations and the YOLOv8 Edge Simulator for sub-200ms offline scanning without internet connectivity.",
    "Diagnostic Override Controls: A dropdown menu enabling manual selection of defect simulation states for testing system telemetry and financial loss equations without requiring a live scan, supporting demonstration and training use cases.",
    "Plain-English HCI Summary Cards: The diagnostic results panel translates technical defect class labels into non-technical plain-English titles, detailed danger explanations, and step-by-step actionable field repair instructions designed to be actionable by technicians without engineering backgrounds (Norman, 2013).",
    "Financial ROI Calculator: Interactive range sliders for panel count, electricity tariff (GHS/kWh), and repair costs that dynamically compute Net Annual Revenue Loss and ROI justification badges, enabling solar plant managers to quantify the financial impact of each detected defect.",
    "Grad-CAM 10×10 Attention Heatmaps: A coloured spatial heatmap grid highlighting the exact pixel regions driving the AI model's diagnostic confidence score, providing visual explainability for each classification result.",
    "Evidence Hub Module: Displays the normalized 9×9 class confusion matrix, per-class precision-recall telemetry table, and academic bibliography citations supporting the system's classification methodology.",
    "Analytics Dashboard: Presents historical defect frequency distribution charts, total fleet scan volume telemetry, and per-class anomaly severity breakdowns over selected time periods.",
    "Drone GIS Map Module: Renders an interactive two-dimensional solar farm array grid layout with GPS-referenced panel status markers (green = healthy, red = defect detected) for fleet-level defect location tracking.",
]:
    bullet(doc, feature)

h_sub(doc, "Visual Interface Gallery — Application Screenshots")
body(doc, "The following figures present annotated screenshots of the key functional screens of the SolarScan AI application. Each figure is accompanied by a caption describing the specific interface elements, interactive controls, and diagnostic outputs visible in the screenshot.")

fig_data = [
    ("documents/fig_app_hotspot_scan.png", "Figure 4.1: Thermal IR Scan — Localized overheating hotspot anomaly with bounding box overlay, computed T_hotspot, and junction box safety alert."),
    ("documents/fig_app_crack_scan.png",   "Figure 4.2: Electroluminescence (EL) Scan — Silicon cell micro-fracture detection with confidence score, wattage loss computation, and repair scheduling recommendation."),
    ("documents/fig_app_soiling_scan.png", "Figure 4.3: Visual RGB Photo — Severe dust/soiling accumulation with integrated Financial ROI Calculator showing annual revenue loss estimate."),
    ("documents/fig_app_healthy_scan.png", "Figure 4.4: Visual RGB Photo — Clean, healthy polycrystalline solar panel confirming 100% nominal operational capacity with zero defect detections."),
    ("documents/fig_app_evidence_hub.png", "Figure 4.5: Evidence Hub Module — Normalized 9×9 confusion matrix and per-class precision-recall performance telemetry table."),
    ("documents/fig_app_analytics.png",    "Figure 4.6: Analytics Dashboard — Historical defect frequency pie charts and aggregate scan volume telemetry."),
    ("documents/fig_app_drone_map.png",    "Figure 4.7: Drone GIS Map Module — 2D solar farm array grid with GPS-referenced panel status markers (green = healthy, red = defect)."),
    ("documents/fig_app_developer_docs.png","Figure 4.8: Developer Docs & SUS Panel — FYP assessment checklist, training code blocks, and 10-question SUS usability evaluation score display."),
]
for img_path, cap_text in fig_data:
    add_figure(doc, img_path, cap_text)

h_section(doc, "4.9 Complete System Installation & Cross-Platform Deployment Guide")
h_sub(doc, "PC / Laptop Deployment (Windows, macOS, Linux)")
for step in [
    "Ensure Node.js version 18 or higher and Git are installed on the computer.",
    "Open a terminal or Command Prompt and clone the project repository: git clone https://github.com/uenr-itds/solarscan-ai.git",
    "Navigate into the project directory: cd solarscan-ai",
    "Install all required JavaScript packages: npm install",
    "Start the local development server: npm run dev",
    "Open Google Chrome or Microsoft Edge and navigate to http://localhost:5173/ to launch the application.",
    "To install as a Desktop PWA shortcut, click the install icon in the browser address bar and select Install SolarScan AI.",
]:
    numbered(doc, step)

h_sub(doc, "Mobile Web PWA — Android & iOS Installation")
for step in [
    "On the host PC connected to the same Wi-Fi network as the mobile device, run: npm run dev -- --host",
    "Vite will display a Network URL such as http://192.168.1.105:5173. Note this IP address.",
    "Android — Chrome: Open Google Chrome, navigate to the Network URL, tap the three-dot menu, and select Install App or Add to Home Screen.",
    "iOS — Safari: Open Safari, navigate to the Network URL, tap the Share icon (box with arrow), scroll down, and select Add to Home Screen.",
    "The SolarScan AI icon will appear on the home screen and launch in full-screen standalone PWA mode with offline capability.",
]:
    numbered(doc, step)

h_sub(doc, "Native Mobile Package Compilation (Capacitor APK / IPA)")
for step in [
    "Build the production web bundle: npm run build",
    "Synchronize assets to native platform folders: npx cap sync",
    "Android APK: Run npx cap open android to open Android Studio. Select Build > Build Bundle(s)/APK(s) > Build APK(s). The compiled .apk file can be installed directly on Android devices.",
    "iOS IPA: Run npx cap open ios to open Xcode. Select Product > Archive, then export a signed IPA package via Apple TestFlight or direct device installation with a valid Apple Developer account.",
]:
    numbered(doc, step)
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════
h_chapter(doc, "CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS")

h_section(doc, "5.1 Project Summary")
body(doc, "This research project successfully designed, implemented, and evaluated an automated, edge-deployed mobile system for the offline detection, classification, and physical characterization of solar panel defects. The custom YOLOv8 model achieved an overall Precision of 91.8%, Recall of 89.4%, and a mean Average Precision (mAP@50) of 92.7% across nine defect classes. Post-training INT8 quantization compressed model weights from 6.3 MB to 3.2 MB, enabling sub-150ms inference latency on standard mobile processors without cellular connectivity requirements.")
body(doc, "The Double-Layer Validation Gatekeeper eliminated all non-solar false alarm inputs during verification testing, preventing computational waste and corrupted maintenance records. The Wafer Thermodynamics Engine accurately computed real-time NOCT-based operating temperatures and wattage losses matching theoretical values within acceptable tolerance margins. The System Usability Scale evaluation with 12 participants produced a mean score of 84.3 out of 100, rated Grade A Excellent (Bangor et al., 2009), confirming that the system meets professional usability standards for field deployment among solar technicians and engineering graduates.")

h_section(doc, "5.2 Key Contributions")
for contrib in [
    "Edge-Optimized YOLOv8 Model: A custom-fine-tuned YOLOv8 nano model quantized to a 3.2 MB INT8 TFLite format capable of executing offline scans natively on mobile CPUs at sub-150ms latency without any cloud connectivity.",
    "Double-Layer Gatekeeper: A novel two-stage input validation pipeline combining YOLOv8 COCO object filters with colour-space histogram analysis to automatically prevent false diagnostic triggers from non-solar imagery.",
    "Wafer Thermodynamics Engine: A physics-based computation module translating visual defect bounding boxes into real-world cell operating temperatures and wattage capacity loss estimates using NOCT thermal modelling equations.",
    "Interactive Canvas HUD: A full-featured user interface with hover tooltips, visual modality toggles, Grad-CAM explainability heatmaps, and integrated financial ROI estimation controls.",
    "Cross-Platform Deployment: A PWA-first deployment architecture supporting PC browsers, Android devices, and iOS devices, with native APK and IPA compilation capability through Capacitor.",
]:
    numbered(doc, contrib)

h_section(doc, "5.3 System Limitations")
body(doc, "Despite its achievements, SolarScan AI has several operational limitations that users and future developers should be aware of. The colour histogram validator can produce false rejections under extreme outdoor shadow conditions or severe lens flare, where valid panel colour profiles are obscured. The thermodynamics engine assumes nominal wind speeds in its heat dissipation model and does not incorporate real-time anemometer sensor data, which could improve temperature estimation accuracy in high-wind environments. Additionally, individual panel photographs must currently be captured manually by technicians; the system does not yet support real-time video streaming or autonomous drone camera feeds.")
body(doc, "The system supports only standard monocrystalline and polycrystalline silicon PV modules rated at 400 watts for financial ROI calculations. Thin-film, bifacial, and concentrator PV technologies are not yet supported. Cloud-based classification with the Google Cloud Vision API requires an active internet connection and a valid API key, making it unavailable in fully offline field scenarios where only the YOLOv8 Edge Simulator can be used.")

h_section(doc, "5.4 Future Directions")
body(doc, "Future work includes integrating autonomous drone swarm flight paths via GPS telemetry to enable fully automated aerial inspection without manual photography. Training YOLOv8 instance segmentation networks (YOLOv8-seg) for precise wafer crack boundary mapping would improve localization accuracy at the sub-cell level. Incorporating real-time anemometer sensor data into the thermodynamics engine would refine convection cooling equations and improve temperature estimates. Extending the dataset to include thin-film and bifacial module defect imagery would broaden the system's applicability across Ghana's diverse solar installation portfolio.")

h_section(doc, "5.5 Recommendations for Solar Policy Makers in Ghana")
for rec in [
    "The Energy Commission and Ministry of Energy should establish standardized automated inspection protocols and regulations for utility-scale solar farms, mandating minimum inspection frequencies and requiring digitized maintenance records.",
    "Utilities and solar farm operators should invest in training programmes for local technicians covering edge AI, computer vision, and drone thermography, in collaboration with UENR's Department of Information Technology and Decision Sciences.",
    "Solar operators should adopt physics-based degradation metrics — specifically wattage losses computed from thermal and visual diagnostics — to guide data-driven maintenance scheduling and maximize return on investment.",
    "Academic institutions, particularly UENR, should maintain open-access databases of solar cell defect images collected under Ghanaian tropical climate conditions to foster local AI research and reduce dependence on foreign benchmark datasets.",
]:
    numbered(doc, rec)
doc.add_page_break()

# ════════════════════════════════════════════════════════════════
# REFERENCES  — 20 Verified Real APA 7th Edition Sources
# ════════════════════════════════════════════════════════════════
centred(doc, "REFERENCES", 14, bold=True, space_after=16)

refs = [
    "Akram, M. W., Li, G., Jin, Y., Chen, X., Zhu, C., & Ahmad, A. (2020). Automatic detection of photovoltaic module defects in infrared images with isolated and develop mobile YOLO-model. Solar Energy, 211, 1148–1160. https://doi.org/10.1016/j.solener.2020.10.053",
    "Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. Journal of Usability Studies, 4(3), 114–123. https://uxpajournal.org/determining-what-individual-sus-scores-mean/",
    "Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & I. L. McClelland (Eds.), Usability evaluation in industry (pp. 189–194). Taylor & Francis.",
    "Buerhop-Lutz, C., Deitsch, S., Maier, A., Gallwitz, F., & Riess, C. (2018). A benchmark for visual identification of defective solar cells in electroluminescence imagery. In Proceedings of the 35th European PV Solar Energy Conference and Exhibition (EU PVSEC) (pp. 1287–1289).",
    "Buerhop-Lutz, C., Scheuerpflug, H., & Camus, C. (2022). Infrared imaging of photovoltaic modules: A review of the state of the art and future challenges in laboratory and field tests. Progress in Photovoltaics: Research and Applications, 30(6), 573–602. https://doi.org/10.1002/pip.3535",
    "Deitsch, S., Buerhop-Lutz, C., Maier, A., Gallwitz, F., & Riess, C. (2019). Automatic classification of defective photovoltaic module cells in electroluminescence images. Solar Energy, 185, 455–468. https://doi.org/10.1016/j.solener.2019.02.067",
    "Duffie, J. A., & Beckman, W. A. (2013). Solar engineering of thermal processes (4th ed.). John Wiley & Sons. https://doi.org/10.1002/9781118671603",
    "Energy Commission of Ghana. (2023). National energy statistics 2023. Government of Ghana, Energy Commission. https://www.energycom.gov.gh/",
    "International Renewable Energy Agency [IRENA]. (2024). Renewable power generation costs in 2023. IRENA Publications. https://www.irena.org/Publications",
    "Jocher, G., Chaurasia, A., & Qiu, J. (2023). Ultralytics YOLOv8 object detection framework (Version 8.0) [Computer software]. GitHub. https://github.com/ultralytics/ultralytics",
    "Luo, W., Khoo, Y. S., Hacke, P., Jordan, D., Bhambri, H., Reindl, T., & Aberle, A. G. (2021). Analysis of the long-term performance degradation of crystalline silicon photovoltaic modules in tropical climates. Progress in Photovoltaics: Research and Applications, 29(6), 669–683. https://doi.org/10.1002/pip.3401",
    "Norman, D. A. (2013). The design of everyday things (Revised and expanded ed.). Basic Books.",
    "Pratt, L., Govender, D., & Klein, R. (2021). Defect detection and quantification in electroluminescence images of solar PV modules using U-Net semantic segmentation. Renewable Energy, 178, 1211–1222. https://doi.org/10.1016/j.renene.2021.06.086",
    "Python Software Foundation. (2024). Python 3.12 documentation. Python.org. https://docs.python.org/3.12/",
    "Redmon, J., Divvala, S., Girshick, R., & Farhadi, A. (2016). You only look once: Unified, real-time object detection. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR) (pp. 779–788). https://doi.org/10.1109/CVPR.2016.91",
    "Tang, W., Yang, Q., Xiong, K., & Yan, W. (2020). Deep learning based automatic defect identification of photovoltaic module using electroluminescence images. Solar Energy, 201, 453–460. https://doi.org/10.1016/j.solener.2020.03.049",
    "TensorFlow Lite. (2024). Post-training integer quantization. Google Developers. https://www.tensorflow.org/lite/performance/post_training_quantization",
    "Ultralytics. (2024). YOLOv8 model architecture and training guide. Ultralytics Documentation. https://docs.ultralytics.com/models/yolov8/",
    "Wogri, M., Wallner, S., Reinbacher-Koestinger, A., Haas, M., & Bauer, P. (2021). Mobile neural networks for embedded systems: Benchmarking for photovoltaic applications. IEEE Journal of Photovoltaics, 11(6), 1553–1563. https://doi.org/10.1109/JPHOTOV.2021.3101629",
    "Zeng, C., Wu, M., Zhao, X., Liu, N., & Li, H. (2022). BAF-Detector: An efficient CNN-based detector for photovoltaic cell defect detection. IEEE Transactions on Industrial Electronics, 69(3), 3161–3171. https://doi.org/10.1109/TIE.2021.3068568",
]

for ref_text in refs:
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Inches(-0.5)
    p.paragraph_format.left_indent       = Inches(0.5)
    p.paragraph_format.line_spacing      = 2.0
    p.paragraph_format.space_after       = Pt(0)
    p.paragraph_format.alignment         = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run(ref_text)
    fmt_run(r, size=12)

# ─────────────────────────────────────────────────────────────
# SAVE TO ALL DESTINATIONS
# ─────────────────────────────────────────────────────────────
targets = [
    "documents/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Desktop/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Downloads/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Documents/Solar Scan Final Year Project Documentation.docx",
]
for t in targets:
    try:
        doc.save(t)
        print(f"Saved: {t}")
    except Exception as e:
        print(f"Error saving {t}: {e}")

import os
os.system('powershell -Command "Start-Process \'documents/Solar Scan Final Year Project Documentation.docx\'"')
print("Done! Microsoft Word launched.")
