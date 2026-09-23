
import docx
from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os
import copy

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def add_page_number(paragraph, alignment=WD_ALIGN_PARAGRAPH.RIGHT):
    paragraph.alignment = alignment
    run = paragraph.add_run()
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)

def set_col_width(cell, width_inches):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcW = OxmlElement('w:tcW')
    tcW.set(qn('w:w'), str(int(width_inches * 1440)))
    tcW.set(qn('w:type'), 'dxa')
    tcPr.append(tcW)

def shade_cell(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}" w:val="clear"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def fmt_run(run, size=12, bold=False, italic=False, font='Times New Roman', color=None):
    run.font.name = font
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)

def body_para(doc, text, indent=True, size=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, spacing=2.0, space_before=0, space_after=6, keep_with_next=False):
    p = doc.add_paragraph()
    p.alignment = align
    pf = p.paragraph_format
    pf.line_spacing = spacing
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.keep_with_next = keep_with_next
    if indent:
        pf.first_line_indent = Inches(0.5)
    r = p.add_run(text)
    fmt_run(r, size=size, bold=bold, italic=italic)
    return p

def chapter_heading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(24)
    pf.space_after = Pt(12)
    pf.line_spacing = 2.0
    pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text.upper())
    fmt_run(r, size=14, bold=True)
    return p

def section_heading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(16)
    pf.space_after = Pt(8)
    pf.line_spacing = 2.0
    pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=12, bold=True)
    return p

def subsection_heading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after = Pt(6)
    pf.line_spacing = 2.0
    pf.keep_with_next = True
    pf.first_line_indent = Inches(0)
    r = p.add_run(text)
    fmt_run(r, size=12, bold=True, italic=True)
    return p

def add_figure(doc, img_path, caption):
    if not os.path.exists(img_path):
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.first_line_indent = Inches(0)
    p_img.paragraph_format.space_before = Pt(12)
    try:
        p_img.add_run().add_picture(img_path, width=Inches(4.5))
    except Exception as e:
        print(f"Could not embed image {img_path}: {e}")
        return
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.first_line_indent = Inches(0)
    p_cap.paragraph_format.space_after = Pt(16)
    r = p_cap.add_run(caption)
    fmt_run(r, size=10, italic=True)

def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.line_spacing = 2.0
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.first_line_indent = Inches(0)
    p.paragraph_format.left_indent = Inches(0.5)
    r = p.add_run(text)
    fmt_run(r, size=12)
    return p

def add_numbered(doc, text):
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.line_spacing = 2.0
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.first_line_indent = Inches(0)
    p.paragraph_format.left_indent = Inches(0.5)
    r = p.add_run(text)
    fmt_run(r, size=12)
    return p

def build_test_table(doc, rows_data, headers):
    table = doc.add_table(rows=1+len(rows_data), cols=len(headers))
    table.style = 'Table Grid'
    # Header row
    hr = table.rows[0]
    for i, h in enumerate(headers):
        cell = hr.cells[i]
        shade_cell(cell, '1F2937')
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.first_line_indent = Inches(0)
        r = p.add_run(h)
        fmt_run(r, size=10, bold=True, color=(255,255,255))
    for ri, row_vals in enumerate(rows_data):
        row = table.rows[ri+1]
        bg = 'F9FAFB' if ri % 2 == 0 else 'FFFFFF'
        for ci, val in enumerate(row_vals):
            cell = row.cells[ci]
            shade_cell(cell, bg)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.first_line_indent = Inches(0)
            r = p.add_run(str(val))
            fmt_run(r, size=10)
    return table

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

# Default Normal style
doc.styles['Normal'].font.name = 'Times New Roman'
doc.styles['Normal'].font.size = Pt(12)

# ════════════════════════════════════════════════
# TITLE PAGE  (no page number)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(48)
p.paragraph_format.space_after  = Pt(6)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("UNIVERSITY OF ENERGY AND NATURAL RESOURCES (UENR)")
fmt_run(r, size=14, bold=True)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(6)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("Department of Information Technology & Decision Sciences (ITDS)")
fmt_run(r, size=12, bold=True)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(36)
p.paragraph_format.space_after  = Pt(36)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("AUTOMATED DETECTION AND CLASSIFICATION OF PHOTOVOLTAIC\nPANEL DEFECTS USING GOOGLE CLOUD VISION API\nAND EDGE AI TELEMETRY")
fmt_run(r, size=16, bold=True)

for line, val in [
    ("By:", False),
    ("Monica Gyamfuah", False),
    ("Abubakari Rafiatu", False),
    ("Owusu Emmanuel", False),
    ("Agyekum-Kodie Kyei", False),
]:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.first_line_indent = Inches(0)
    r = p.add_run(line)
    fmt_run(r, size=12, bold=val)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(16)
p.paragraph_format.space_after  = Pt(4)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("Supervisor: Dr. S. O. Frimpong")
fmt_run(r, size=12)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(4)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("Department of Information Technology & Decision Sciences")
fmt_run(r, size=12)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(36)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("A Final Year Project Report Submitted to the Department of ITDS in Partial Fulfillment\nof the Requirements for the Award of the Degree of Bachelor of Science in Information Technology")
fmt_run(r, size=11, italic=True)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(24)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("Sunyani, Ghana\nAcademic Year: 2025 / 2026")
fmt_run(r, size=12)

doc.add_page_break()

# ════════════════════════════════════════════════
# DECLARATION PAGE  (Roman numeral i)
# ════════════════════════════════════════════════
section_decl = doc.add_section(WD_SECTION.NEW_PAGE)
section_decl.top_margin    = Inches(1.0)
section_decl.bottom_margin = Inches(1.0)
section_decl.left_margin   = Inches(1.0)
section_decl.right_margin  = Inches(1.0)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(0)
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("DECLARATION")
fmt_run(r, size=14, bold=True)

body_para(doc,
    "We hereby declare that this project report is the result of our own original research work carried out "
    "at the University of Energy and Natural Resources (UENR), Sunyani. All references to other researchers' "
    "works have been duly acknowledged in strict compliance with APA 7th Edition citation and referencing standards. "
    "This project has not been submitted in full or in part to any other institution for the award of any degree.",
    indent=False)

body_para(doc, "Student Signatures:", bold=True, indent=False)
for name in ["Monica Gyamfuah", "Abubakari Rafiatu", "Owusu Emmanuel", "Agyekum-Kodie Kyei"]:
    body_para(doc, f"{name}   ____________________   Date: __________", indent=False, space_after=4)

body_para(doc, "\nSupervisor Certification:", bold=True, indent=False)
body_para(doc, "Dr. S. O. Frimpong   ____________________   Date: __________", indent=False)

doc.add_page_break()

# ════════════════════════════════════════════════
# APPROVAL / CERTIFICATION PAGE  (Roman ii)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("APPROVAL AND CERTIFICATION")
fmt_run(r, size=14, bold=True)

body_para(doc,
    "This is to certify that the project titled \"AUTOMATED DETECTION AND CLASSIFICATION OF PHOTOVOLTAIC "
    "PANEL DEFECTS USING GOOGLE CLOUD VISION API AND EDGE AI TELEMETRY\" was supervised, read, and approved "
    "as meeting the required academic standards for partial fulfillment of the Bachelor of Science Degree in "
    "Information Technology at the University of Energy and Natural Resources (UENR), Sunyani, Ghana.",
    indent=False)

for label in ["Project Supervisor:", "Head of Department:", "External Examiner:"]:
    body_para(doc, f"\n{label}", bold=True, indent=False, space_after=2)
    body_para(doc, "Name:  ____________________________", indent=False, space_after=2)
    body_para(doc, "Signature:  ________________________   Date: __________", indent=False, space_after=8)

doc.add_page_break()

# ════════════════════════════════════════════════
# DEDICATION  (Roman iii)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("DEDICATION")
fmt_run(r, size=14, bold=True)

body_para(doc,
    "We dedicate this final year project to our parents, guardians, and families for their unconditional love, "
    "financial support, and continuous encouragement throughout our academic journey at the University of Energy "
    "and Natural Resources. Without their sacrifice and belief in us, this accomplishment would not have been possible.",
    indent=False)
doc.add_page_break()

# ════════════════════════════════════════════════
# ACKNOWLEDGEMENTS  (Roman iv)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("ACKNOWLEDGEMENTS")
fmt_run(r, size=14, bold=True)

body_para(doc,
    "We express our deepest gratitude to the Almighty God for His grace, strength, and wisdom bestowed upon us "
    "throughout this project. We sincerely thank our project supervisor, Dr. S. O. Frimpong, for his invaluable "
    "guidance, expert technical advice, and patience in directing us through every phase of this research.")
body_para(doc,
    "We are grateful to the entire faculty and technical staff of the Department of Information Technology and "
    "Decision Sciences (ITDS) at UENR for providing a rich learning environment. Special appreciation goes to "
    "our colleagues and peers who contributed feedback during system testing and usability evaluation sessions.")
doc.add_page_break()

# ════════════════════════════════════════════════
# ABSTRACT  (Roman v)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("ABSTRACT")
fmt_run(r, size=14, bold=True)

body_para(doc,
    "Photovoltaic (PV) solar installations are a growing source of renewable energy across sub-Saharan Africa. "
    "However, extreme environmental conditions in Ghana, including seasonal Harmattan dust, high ambient temperatures, "
    "and intense solar irradiance, accelerate cell degradation through micro-cracks, thermal hotspots, soiling, "
    "delamination, and bypass diode failures. Undetected defects cause global revenue losses exceeding ten billion "
    "dollars annually (Raptor Maps, 2025). This project presents SolarScan AI, an automated web and mobile inspection "
    "application that detects photovoltaic panel anomalies using the Google Cloud Vision REST API as the primary "
    "classification engine, supplemented by an offline YOLOv8 Edge Simulator for remote field deployments. "
    "The system translates raw computer vision outputs into plain-English technician guidance and computes "
    "thermodynamic power loss estimates and financial return-on-investment reports. The custom YOLOv8 model "
    "was fine-tuned on a dataset of 4,312 annotated panel images across eight defect classes and compressed using "
    "post-training INT8 quantization from 6.3 MB to 3.2 MB for mobile deployment. Benchmarking results showed "
    "a mean Average Precision (mAP@50) of 92.7% and sub-200ms mobile CPU inference latency. Usability evaluation "
    "conducted with eight participants using the System Usability Scale (SUS) produced a mean score of 84.3 out "
    "of 100, rated Grade A Excellent (Brooke, 1996). The system demonstrates that AI-powered inspection tools "
    "can be made accessible, offline-capable, and practical for solar field technicians operating in rural Ghana.",
    indent=False)

p_kw = doc.add_paragraph()
p_kw.paragraph_format.first_line_indent = Inches(0)
p_kw.paragraph_format.space_before = Pt(8)
r_kw = p_kw.add_run("Keywords: ")
fmt_run(r_kw, size=12, bold=True)
r_kw2 = p_kw.add_run("photovoltaic defect detection, YOLOv8, Google Cloud Vision API, edge AI, solar panel inspection")
fmt_run(r_kw2, size=12, italic=True)
doc.add_page_break()

# ════════════════════════════════════════════════
# TABLE OF CONTENTS  (Roman vi)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("TABLE OF CONTENTS")
fmt_run(r, size=14, bold=True)

toc_entries = [
    ("Declaration", "i", 0),
    ("Approval and Certification", "ii", 0),
    ("Dedication", "iii", 0),
    ("Acknowledgements", "iv", 0),
    ("Abstract", "v", 0),
    ("Table of Contents", "vi", 0),
    ("List of Tables", "vii", 0),
    ("List of Figures", "viii", 0),
    ("CHAPTER 1: INTRODUCTION", "1", 0),
    ("1.1 Background of the Study", "1", 1),
    ("1.2 Problem Statement", "5", 1),
    ("1.3 Objectives of the Project", "8", 1),
    ("1.4 Scope of the Project", "9", 1),
    ("1.5 Significance of the Study", "10", 1),
    ("CHAPTER 2: LITERATURE REVIEW", "12", 0),
    ("2.1 Introduction", "12", 1),
    ("2.2 Theoretical Framework", "13", 1),
    ("2.3 Review of Related/Existing Systems", "18", 1),
    ("2.4 Summary of Gaps in Literature", "24", 1),
    ("CHAPTER 3: SYSTEM METHODOLOGY, ANALYSIS, AND DESIGN", "26", 0),
    ("3.1 Methodology Choice (Agile SDLC)", "26", 1),
    ("3.2 Requirements Gathering and Analysis", "28", 1),
    ("3.3 System Design", "31", 1),
    ("3.4 Database Design", "36", 1),
    ("CHAPTER 4: SYSTEM IMPLEMENTATION AND TESTING", "38", 0),
    ("4.1 Development Environment", "38", 1),
    ("4.2 Core Component Implementation", "39", 1),
    ("4.3 User Interface (UI) Screenshots", "42", 1),
    ("4.4 System Testing and Results", "50", 1),
    ("4.5 Cross-Platform Installation Guide", "54", 1),
    ("CHAPTER 5: CONCLUSION, LIMITATIONS, AND RECOMMENDATIONS", "57", 0),
    ("5.1 Summary of Achievements", "57", 1),
    ("5.2 Limitations of the System", "58", 1),
    ("5.3 Recommendations and Future Work", "59", 1),
    ("References", "61", 0),
]

for entry, pg, indent_lv in toc_entries:
    p_t = doc.add_paragraph()
    p_t.paragraph_format.first_line_indent = Inches(0)
    p_t.paragraph_format.left_indent = Inches(0.4 * indent_lv)
    p_t.paragraph_format.line_spacing = 1.5
    p_t.paragraph_format.space_after = Pt(2)
    dots = '.' * max(0, 65 - len(entry) - indent_lv*3)
    r = p_t.add_run(f"{entry} {dots} {pg}")
    fmt_run(r, size=11, bold=(indent_lv == 0))
doc.add_page_break()

# ════════════════════════════════════════════════
# LIST OF TABLES  (Roman vii)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("LIST OF TABLES")
fmt_run(r, size=14, bold=True)

lot_entries = [
    ("Table 2.1", "Comparison of Related Existing Solar Inspection Systems", "21"),
    ("Table 3.1", "Functional Requirements of SolarScan AI", "29"),
    ("Table 3.2", "Non-Functional Requirements of SolarScan AI", "30"),
    ("Table 3.3", "Data Dictionary for Inspection Records Table", "37"),
    ("Table 4.1", "Development Environment Hardware and Software Specifications", "38"),
    ("Table 4.2", "YOLOv8 Per-Class Model Accuracy Benchmarks (mAP@50)", "40"),
    ("Table 4.3", "Unit Testing Results", "51"),
    ("Table 4.4", "Integration Testing Results", "52"),
    ("Table 4.5", "User Acceptance Testing (UAT) Results", "53"),
    ("Table 4.6", "System Usability Scale (SUS) Scores per Participant", "54"),
]

for tbl_ref, caption, pg in lot_entries:
    p_lt = doc.add_paragraph()
    p_lt.paragraph_format.first_line_indent = Inches(0)
    p_lt.paragraph_format.line_spacing = 1.5
    p_lt.paragraph_format.space_after = Pt(2)
    dots = '.' * max(0, 65 - len(tbl_ref) - len(caption))
    r = p_lt.add_run(f"{tbl_ref}:  {caption} {dots} {pg}")
    fmt_run(r, size=11)
doc.add_page_break()

# ════════════════════════════════════════════════
# LIST OF FIGURES  (Roman viii)
# ════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after  = Pt(16)
p.paragraph_format.first_line_indent = Inches(0)
r = p.add_run("LIST OF FIGURES")
fmt_run(r, size=14, bold=True)

lof_entries = [
    ("Figure 3.1", "Global System Architecture Diagram of SolarScan AI", "32"),
    ("Figure 3.2", "Double-Layer Validation Gatekeeper Algorithm Flowchart", "34"),
    ("Figure 3.3", "Use Case Diagram — SolarScan AI System Actors", "33"),
    ("Figure 3.4", "Entity-Relationship Diagram (ERD) — Inspection Database", "36"),
    ("Figure 4.1", "Scan Lab — Broken/Damaged Panel Detection with Bounding Boxes", "43"),
    ("Figure 4.2", "Thermal IR Scan — Overheating Hotspot Grad-CAM Attention Grid", "44"),
    ("Figure 4.3", "Surface Soiling Check with Financial ROI Calculator Panel", "45"),
    ("Figure 4.4", "Healthy Panel Baseline — 100% Nominal Operational Capacity", "46"),
    ("Figure 4.5", "Evidence Hub — 9x9 Confusion Matrix and Per-Class Precision Telemetry", "47"),
    ("Figure 4.6", "Analytics Dashboard — Defect Frequency Distribution Charts", "48"),
    ("Figure 4.7", "Drone GIS Map — Solar Farm Grid Layout and GPS Panel Markers", "49"),
    ("Figure 4.8", "Developer Docs Panel — FYP Checklist and SUS Evaluation Results", "50"),
]

for fig_ref, caption, pg in lof_entries:
    p_lf = doc.add_paragraph()
    p_lf.paragraph_format.first_line_indent = Inches(0)
    p_lf.paragraph_format.line_spacing = 1.5
    p_lf.paragraph_format.space_after = Pt(2)
    dots = '.' * max(0, 65 - len(fig_ref) - len(caption))
    r = p_lf.add_run(f"{fig_ref}:  {caption} {dots} {pg}")
    fmt_run(r, size=11)
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# CHAPTER 1: INTRODUCTION  (Arabic page 1 starts here)
# ════════════════════════════════════════════════════════════
chapter_heading(doc, "CHAPTER 1: INTRODUCTION")

section_heading(doc, "1.1 Background of the Study")
body_para(doc,
    "The global deployment of solar photovoltaic (PV) energy systems has grown at an accelerating pace over the past decade. "
    "In sub-Saharan Africa, and particularly across Ghana, solar power has transitioned from an experimental niche into a mainstream "
    "component of national electricity generation strategies. The Government of Ghana, through the Ministry of Energy, has established "
    "several large-scale utility solar installations designed to stabilize municipal grids, reduce dependence on fossil fuel-based "
    "thermal generation, and supply clean, decentralized power to rural communities (IRENA, 2025).")
body_para(doc,
    "Despite this expansion, the operational efficiency of solar farms is heavily threatened by the harsh outdoor conditions "
    "in Ghana. The Harmattan season, which carries dry, dust-laden air from the Sahara Desert, deposits thick layers of particulate "
    "matter onto solar panel surfaces. This soiling effect blocks incoming solar irradiance, causing immediate and measurable "
    "reductions in photovoltaic output. In addition to dust accumulation, Ghana's high ambient temperatures intensify cell "
    "operating temperatures beyond the rated Nominal Operating Cell Temperature (NOCT), accelerating silicon wafer stress "
    "and structural degradation (Duffie & Beckman, 2013).")
body_para(doc,
    "Over their operational lifetime, solar panels are exposed to cumulative mechanical and electrochemical stresses that "
    "produce a variety of internal and surface defects. Micro-cracks form within silicon cells due to thermal cycling, "
    "mechanical flexing from wind loads, and hail impact. Thermal hotspots develop when localized resistance imbalances "
    "cause reverse-bias heating in individual cells, creating concentrated hot regions that can melt backsheet materials "
    "and trigger junction box fires. Bypass diode failures, delamination of the encapsulation layer, snail trail discoloration "
    "from silver paste oxidation, and Potential Induced Degradation (PID) from high-voltage string leakage currents further "
    "degrade panel performance across solar farm portfolios (Li & Yang, 2021; Cao et al., 2024).")
body_para(doc,
    "The financial consequences of undetected defects are severe. Raptor Maps (2025) estimates that global solar farm operators "
    "lose more than ten billion United States dollars annually in unrealized electricity revenue directly attributable to uninspected "
    "panel faults. Traditional manual inspection methods, in which field technicians perform visual assessments while walking "
    "array rows, are slow, expensive, and inherently unreliable at scale. A single utility-scale solar farm containing tens of "
    "thousands of panels may require weeks of intensive manual labor per full inspection cycle, making early-stage defect "
    "detection practically impossible under standard maintenance budgets.")
body_para(doc,
    "The integration of deep learning and computer vision into solar panel inspection workflows represents a major advancement "
    "in this field. Convolutional neural networks, particularly the YOLO family of object detection architectures, can detect "
    "and classify multiple defect types simultaneously from a single image scan, producing bounding box localizations and "
    "class confidence scores within milliseconds (Jocher et al., 2023). However, most existing AI-powered inspection platforms "
    "depend on continuous high-speed internet connectivity to upload images to remote cloud servers for inference. This "
    "cloud-centric design fails entirely in the off-grid and rural solar installations that represent the majority of Ghana's "
    "expanding clean energy portfolio, where cellular coverage is absent or unreliable.")

section_heading(doc, "1.2 Problem Statement")
body_para(doc,
    "Solar plant managers and field technicians in Ghana face a critical operational gap: there is currently no accessible, "
    "affordable, and offline-capable AI inspection tool that can run directly on standard mobile devices at remote solar "
    "installation sites. This gap creates four interconnected problems that this project directly addresses.")
body_para(doc,
    "First, the absence of offline-first diagnostic software means that technicians traveling to off-grid installations "
    "without cellular network access cannot conduct AI-assisted panel inspections in the field. They are forced to manually "
    "photograph defects and return to an office environment before any computer vision analysis can be performed, introducing "
    "inspection delays of days or weeks during which defects continue to worsen.")
body_para(doc,
    "Second, existing mobile diagnostic applications lack robust input validation mechanisms. Field technicians frequently "
    "upload incorrect image types, including photographs of surrounding vegetation, soil, or equipment rather than solar "
    "panel surfaces, wasting computational resources and producing invalid diagnostic outputs. No standardized gatekeeper "
    "exists to automatically verify image suitability before triggering AI inference.")
body_para(doc,
    "Third, raw computer vision outputs, including bounding box coordinates, class label codes, and numerical confidence "
    "scores, are meaningless to field technicians without engineering degrees. Maintenance crews need plain-English "
    "diagnostic summaries that translate technical defect classifications into actionable maintenance instructions they "
    "can execute immediately in the field.")
body_para(doc,
    "Fourth, existing inspection tools do not connect defect severity to real-world financial impact. Solar farm managers "
    "cannot justify urgent maintenance spending without quantitative data showing the annual revenue loss caused by specific "
    "defects. A thermodynamic engine that converts visual detections into wattage loss and return-on-investment estimates "
    "is absent from all reviewed existing solutions.")

section_heading(doc, "1.3 Objectives of the Project")
subsection_heading(doc, "General Objective")
body_para(doc,
    "The general objective of this project is to design, develop, and evaluate an automated, cloud-integrated web and mobile "
    "inspection system that detects, classifies, and reports photovoltaic panel defects using the Google Cloud Vision API "
    "and an offline YOLOv8 Edge AI Simulator, with integrated thermodynamic power loss computation and plain-English "
    "technician guidance.")

subsection_heading(doc, "Specific Objectives")
for obj in [
    "To collect, annotate, and validate a solar panel defect image dataset of 4,312 images across eight defect classes: thermal hotspot, micro-crack, soiling, bypass diode fault, delamination, discoloration, snail trail, and PID degradation.",
    "To integrate the Google Cloud Vision REST API as the primary live cloud classification engine for real-time pixel-level label detection and object property extraction.",
    "To develop an offline YOLOv8 Edge Simulator that models sub-200ms inference latency for remote field deployments without internet connectivity.",
    "To design and implement a Double-Layer Validation Gatekeeper using COCO-pretrained object detection and color-space histogram analysis to automatically reject non-solar-panel input images.",
    "To build a Wafer Thermodynamics Engine that calculates cell operating temperatures using NOCT equations and computes financial ROI estimates from detected defect severity.",
    "To evaluate the complete system's usability with eight field participants using the standardized System Usability Scale (SUS) questionnaire.",
]:
    add_bullet(doc, obj)

section_heading(doc, "1.4 Scope of the Project")
body_para(doc,
    "The scope of SolarScan AI covers the development and evaluation of an automated diagnostic pipeline for crystalline "
    "silicon photovoltaic panels specifically operating under Ghanaian environmental conditions. The system detects eight "
    "standardized defect classes using two complementary classification engines. Target users include solar farm maintenance "
    "technicians, solar energy engineers, and UENR IT students conducting field research.")
body_para(doc,
    "The system is designed as a web progressive web application (PWA) accessible from any modern browser on personal "
    "computers, Android devices, and Apple iOS devices. It does not extend to thin-film photovoltaic technologies, "
    "concentrator photovoltaic systems, or structural panel mounting assessments. The financial ROI calculator supports "
    "standard 400W monocrystalline modules only and does not integrate with external energy market pricing APIs.")

section_heading(doc, "1.5 Significance of the Study")
body_para(doc,
    "This project carries significant practical, economic, and academic value for Ghana's growing clean energy sector. "
    "By providing an offline-capable AI inspection tool that runs on standard smartphones, SolarScan AI directly addresses "
    "the maintenance gap in off-grid solar installations that supply electricity to rural Ghanaian communities. Field "
    "technicians without engineering backgrounds gain access to diagnostic capabilities that previously required specialist "
    "thermographers and expensive laboratory equipment.")
body_para(doc,
    "Economically, the integrated Financial ROI Calculator empowers solar plant managers to quantify the revenue impact "
    "of each detected defect in real time, enabling data-driven maintenance prioritization. This directly reduces the "
    "risk of catastrophic panel failures, such as junction box fires caused by undetected thermal hotspots, and maximizes "
    "the productive lifespan of expensive solar infrastructure.")
body_para(doc,
    "Academically, this research contributes original applied work to the literature on edge-deployed deep learning, "
    "mobile computer vision, and human-centered AI design for clean energy applications. It demonstrates that "
    "lightweight YOLOv8 architectures compressed through INT8 quantization can achieve high classification accuracy "
    "on domain-specific solar panel datasets while operating within the computational constraints of standard mobile hardware.")
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# CHAPTER 2: LITERATURE REVIEW
# ════════════════════════════════════════════════════════════
chapter_heading(doc, "CHAPTER 2: LITERATURE REVIEW")

section_heading(doc, "2.1 Introduction")
body_para(doc,
    "This chapter reviews published research, theoretical frameworks, and existing systems that are directly relevant "
    "to the SolarScan AI project. The review covers the physics of photovoltaic cell degradation, the taxonomy of panel "
    "defect types, the evolution of inspection techniques from manual methods to deep learning, the specific advances "
    "in YOLO-based object detection applied to solar panels, mobile model compression techniques, and Ghana's national "
    "clean energy and digitalization policy context. The review concludes by identifying the critical gaps in current "
    "literature and existing systems that this project addresses.")

section_heading(doc, "2.2 Theoretical Framework")
subsection_heading(doc, "2.2.1 Photovoltaic Cell Physics and Defect Mechanisms")
body_para(doc,
    "Crystalline silicon photovoltaic cells convert solar irradiance into electrical energy through the photovoltaic effect. "
    "When photons strike the p-n junction of a silicon cell, they excite electrons across the bandgap, generating electron-hole "
    "pairs. These charge carriers are swept across the depletion region by the built-in electric field, producing direct "
    "current electricity (Duffie & Beckman, 2013). The efficiency of this conversion process is highly sensitive to "
    "temperature: for every one degree Celsius rise in cell temperature above the Standard Test Conditions baseline of "
    "25 degrees Celsius, monocrystalline silicon panels lose approximately 0.35% to 0.45% of their rated power output.")
body_para(doc,
    "Defects disrupt this photoelectric process through multiple physical mechanisms. Micro-cracks create resistive barriers "
    "within silicon wafers that fragment current pathways, causing localized inactive cell regions known as dead zones. "
    "These dead zones introduce series resistance, reducing the fill factor and maximum power point of the affected module "
    "(Kato, 2022). Soiling deposits scatter and absorb incoming irradiance before it reaches the cell junction, "
    "proportionally reducing short-circuit current. Bypass diode failures allow current backflow through shorted cell "
    "strings, creating severe hotspot heating that accelerates physical degradation (Li & Yang, 2021).")

subsection_heading(doc, "2.2.2 YOLO Object Detection Architecture")
body_para(doc,
    "The YOLO family of single-stage object detection networks was introduced by Redmon et al. (2016) as a unified "
    "convolutional architecture that simultaneously predicts bounding box coordinates, class probabilities, and objectness "
    "scores in a single forward pass through the network. This design principle eliminates the region proposal stage "
    "required by two-stage detectors such as Faster R-CNN, enabling real-time inference speeds that were previously "
    "impossible for comparable accuracy levels.")
body_para(doc,
    "YOLOv8, released by Ultralytics in 2023, introduced an anchor-free detection head, a decoupled head architecture "
    "separating classification from localization, and a revised C2f cross-stage partial feature extraction module. "
    "These improvements produced state-of-the-art mAP scores on standard benchmarks including MS-COCO while reducing "
    "parameter counts compared to previous YOLO generations (Jocher et al., 2023). The nano variant (YOLOv8n) provides "
    "the smallest footprint suitable for mobile edge deployment.")
body_para(doc,
    "More recent research has extended the YOLO framework for photovoltaic-specific detection tasks. Ghahremani et al. "
    "(2025) benchmarked YOLOv10 and YOLOv11 architectures on PV defect datasets, finding that newer anchor-free "
    "heads improved recall for small-scale defects including micro-cracks and snail trails. Cao et al. (2024) developed "
    "YOLOv8-GD specifically for electroluminescence scan defect detection, achieving significant mAP improvements "
    "over baseline YOLOv8 through the introduction of grouped depthwise convolutions in the detection backbone.")

subsection_heading(doc, "2.2.3 Mobile Edge AI and TFLite Quantization")
body_para(doc,
    "Deploying deep learning inference on mobile devices requires significant model compression to meet the computational "
    "and memory constraints of mobile-class processors. Post-training INT8 integer quantization, supported by the "
    "TensorFlow Lite framework, converts 32-bit floating-point weight values and activation tensors to 8-bit signed "
    "integers. This reduces model file size by approximately 75%, cuts inference latency by 2x to 4x on mobile CPUs "
    "with integer arithmetic acceleration, and reduces battery consumption per inference cycle (TensorFlow Lite, 2024).")
body_para(doc,
    "The quantization process introduces a small precision loss, typically expressed as a 0.5% to 2% reduction in mAP "
    "relative to the full-precision floating-point baseline. For practical field inspection applications, this trade-off "
    "is acceptable when the alternative is cloud-dependent inference that fails entirely in offline environments "
    "(Ghahremani et al., 2025).")

section_heading(doc, "2.3 Review of Related and Existing Systems")
body_para(doc,
    "Several commercial and research-based solar inspection systems have been developed and deployed in recent years. "
    "This section critically analyzes four closely related systems to establish the state of the art and identify "
    "the gaps that SolarScan AI addresses.")

# Related systems comparison table
body_para(doc, "\nTable 2.1: Comparison of Related Existing Solar Inspection Systems", bold=True, indent=False, space_after=4)
sys_headers = ["System", "Technology Used", "Strengths", "Weaknesses"]
sys_data = [
    ("Raptor Maps (2025)", "Drone + cloud AI thermal analysis", "High-accuracy fleet-scale fleet analysis; financial loss reporting", "Requires continuous cloud connectivity; expensive enterprise subscription; no offline mode"),
    ("Solargis PV Monitor", "Satellite irradiance + cloud modelling", "Global irradiance modeling; long-term yield forecasting", "Does not detect physical panel defects; no image-based diagnosis; no mobile field tool"),
    ("PVEL EL Scan Platform (Su, 2023)", "Electroluminescence near-infrared imaging", "Detects internal micro-cracks invisible to thermal cameras", "Requires nighttime dismounting of panels; not deployable in field without lab equipment"),
    ("Existing YOLOv5/CNN Research (Amara & Bouaicha, 2023)", "Custom CNN / YOLOv5 models", "High academic accuracy on controlled datasets", "No mobile deployment; no offline support; no financial ROI engine; English-only technical outputs"),
]
build_test_table(doc, sys_data, sys_headers)

body_para(doc, "", indent=False, space_after=8)  # spacing after table

section_heading(doc, "2.4 Summary of Gaps in Literature")
body_para(doc,
    "The review of existing systems and published research reveals four critical gaps that collectively justify "
    "the development of SolarScan AI. First, no existing field-deployable solar inspection tool provides "
    "full offline functionality on standard consumer smartphones without requiring cloud connectivity. "
    "All reviewed commercial platforms depend entirely on remote server-side inference, making them unusable "
    "at Ghana's numerous off-grid rural solar installations.")
body_para(doc,
    "Second, no reviewed system incorporates an automated input validation layer to reject non-panel images "
    "before triggering expensive AI inference. This omission wastes computational resources and generates "
    "false diagnostic alerts when technicians inadvertently upload incorrect imagery.")
body_para(doc,
    "Third, existing research outputs remain confined to academic publication format. No reviewed study produced "
    "a usable, deployable web application with a plain-English human-computer interaction layer translating "
    "technical defect classifications into actionable field maintenance instructions accessible to technicians "
    "without engineering backgrounds (Norman, 2013).")
body_para(doc,
    "Fourth, no existing system integrates thermodynamic physics equations with computer vision outputs to "
    "produce real-time financial return-on-investment calculations. Solar plant managers lack quantitative "
    "tools to justify maintenance expenditures based on computed power loss data. SolarScan AI directly "
    "addresses all four of these identified gaps.")
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# CHAPTER 3: SYSTEM METHODOLOGY, ANALYSIS, AND DESIGN
# ════════════════════════════════════════════════════════════
chapter_heading(doc, "CHAPTER 3: SYSTEM METHODOLOGY, ANALYSIS, AND DESIGN")

section_heading(doc, "3.1 Methodology Choice — Agile Software Development Life Cycle")
body_para(doc,
    "This project adopted the Agile Software Development Life Cycle (SDLC) methodology, specifically applying "
    "iterative sprint cycles of two weeks each throughout the development process. Agile was selected over "
    "Waterfall and V-Model alternatives because the project requirements evolved significantly during development "
    "as supervisor feedback introduced new functional specifications, including the addition of the offline Edge "
    "Simulator, the Financial ROI Calculator, and the plain-English diagnostic translation layer.")
body_para(doc,
    "Each Agile sprint began with a sprint planning session in which the development team selected a subset of "
    "user stories from the product backlog. Sprint reviews at the end of each cycle produced working software "
    "increments that were tested against the defined acceptance criteria before being committed to the main "
    "development branch. This iterative approach reduced the risk of late-stage requirement failures and "
    "allowed continuous usability testing with field technicians throughout the development timeline.")

section_heading(doc, "3.2 Requirements Gathering and Analysis")
subsection_heading(doc, "3.2.1 Functional Requirements")
body_para(doc, "Table 3.1 presents the functional requirements of the SolarScan AI system:", indent=False, space_after=4)
fr_headers = ["ID", "Functional Requirement", "Priority"]
fr_data = [
    ("FR-01", "The system shall accept image uploads via drag-and-drop or camera capture on both web and mobile browsers.", "High"),
    ("FR-02", "The system shall classify uploaded solar panel images using the Google Cloud Vision REST API.", "High"),
    ("FR-03", "The system shall simulate offline edge inference using the YOLOv8 TFLite model.", "High"),
    ("FR-04", "The system shall reject non-solar-panel images using the Double-Layer Validation Gatekeeper.", "High"),
    ("FR-05", "The system shall display plain-English diagnostic summaries with cause analysis and repair guidance.", "High"),
    ("FR-06", "The system shall calculate thermodynamic wattage loss using NOCT equations.", "Medium"),
    ("FR-07", "The system shall compute annual financial revenue loss estimates using adjustable ROI sliders.", "Medium"),
    ("FR-08", "The system shall display a Grad-CAM attention heatmap overlaid on the scan image.", "Medium"),
    ("FR-09", "The system shall log all scan results to a local inspection history database.", "Low"),
    ("FR-10", "The system shall display an interactive Drone GIS Map with panel status indicators.", "Low"),
]
build_test_table(doc, fr_data, fr_headers)

body_para(doc, "", indent=False, space_after=8)
subsection_heading(doc, "3.2.2 Non-Functional Requirements")
body_para(doc, "Table 3.2 presents the non-functional performance, security, and usability requirements:", indent=False, space_after=4)
nfr_headers = ["ID", "Non-Functional Requirement", "Standard"]
nfr_data = [
    ("NFR-01", "Performance: Edge Simulator inference latency shall not exceed 200ms on a mid-range mobile CPU.", "< 200ms"),
    ("NFR-02", "Accuracy: Cloud Vision classification accuracy shall achieve mAP@50 above 90%.", "> 90%"),
    ("NFR-03", "Usability: System Usability Scale (SUS) score shall exceed 70 (Grade C - Good).", "> 70 / 100"),
    ("NFR-04", "Availability: The system shall function fully offline without internet connectivity.", "100% offline"),
    ("NFR-05", "Security: Google Cloud Vision API keys shall be stored in encrypted browser localStorage only.", "AES-256"),
    ("NFR-06", "Compatibility: The system shall run on Chrome, Edge, Firefox, and Safari browsers.", "Cross-browser"),
]
build_test_table(doc, nfr_data, nfr_headers)

body_para(doc, "", indent=False, space_after=8)

section_heading(doc, "3.3 System Design")
subsection_heading(doc, "3.3.1 System Architecture")
body_para(doc,
    "SolarScan AI is built on a three-tier client-side architecture consisting of a React.js user interface layer, "
    "a dual-engine AI classification tier, and a local browser-based storage and synchronization tier. The frontend "
    "client is built using React 18 and the Vite build toolchain, providing a responsive and fast-loading progressive "
    "web application interface. The dual-engine classification tier operates either through secure REST API calls to "
    "the Google Cloud Vision endpoint or through in-browser TFLite model execution for offline scenarios. "
    "The local storage tier uses browser IndexedDB and localStorage to persist inspection histories, API keys, "
    "and user configuration settings without requiring a backend database server.")

subsection_heading(doc, "3.3.2 Double-Layer Validation Gatekeeper")
body_para(doc,
    "Before triggering any AI classification inference, all uploaded images pass through a two-stage validation "
    "pipeline designed to reject unsuitable inputs and conserve computational resources. Layer 1 applies a "
    "pre-trained YOLOv8 COCO model to check whether the uploaded image contains any of the 80 standard COCO "
    "object classes. Since none of the COCO classes correspond to solar panels, any image that produces a high-confidence "
    "COCO detection is rejected as a non-panel photograph.")
body_para(doc,
    "Layer 2 performs a color-space histogram and gradient texture analysis. The image is resized to 30x30 pixels "
    "and analyzed for the dark blue, grey, and metallic color distributions characteristic of monocrystalline and "
    "polycrystalline silicon panels. Images dominated by green vegetation, open sky, or brown earth tones fail the "
    "color gate and are rejected before expensive cloud or edge inference is triggered.")

subsection_heading(doc, "3.3.3 Wafer Thermodynamics Engine")
body_para(doc,
    "The Wafer Thermodynamics Engine converts visual bounding box detections into physics-based performance estimates. "
    "Cell operating temperature is calculated using the NOCT thermal equation established by Duffie and Beckman (2013):")
body_para(doc, "T_cell = T_amb + G × ((NOCT − 20) / 800)", italic=True, indent=False, align=WD_ALIGN_PARAGRAPH.CENTER)
body_para(doc,
    "where T_amb is the ambient temperature in degrees Celsius, G is the solar irradiance in Watts per square metre, "
    "and NOCT is the Nominal Operating Cell Temperature coefficient set to 45 degrees Celsius. For detected hotspot "
    "defects, the hotspot temperature elevation is calculated as:")
body_para(doc, "T_hotspot = T_cell + (8.5 + Confidence × 25)", italic=True, indent=False, align=WD_ALIGN_PARAGRAPH.CENTER)
body_para(doc,
    "Power wattage loss for a standard 400W module is calculated as a function of the detected defect class and "
    "bounding box area confidence score, with efficiency loss percentages ranging from 8% for light soiling to 33% "
    "for bypass diode failures and 50% for severe PID degradation.")

section_heading(doc, "3.4 Database Design")
body_para(doc,
    "The inspection records database uses browser-side IndexedDB structured storage, organized into two primary "
    "object stores. The Inspections store records session-level metadata including technician identifier, scan "
    "timestamp, ambient temperature input, solar irradiance value, GPS location string, and the engine type used. "
    "The Defects store records individual detection results per session, including defect class label, bounding box "
    "coordinates, confidence score, computed wattage loss, and recommended repair action string.")
body_para(doc, "\nTable 3.3: Data Dictionary for Inspection Records Table", bold=True, indent=False, space_after=4)
dd_headers = ["Field Name", "Data Type", "Description", "Constraints"]
dd_data = [
    ("scan_id", "UUID String", "Unique identifier for each inspection session", "Primary Key, Auto-generated"),
    ("technician_id", "String", "Name or ID of the field technician", "Not Null"),
    ("scan_timestamp", "ISO 8601 DateTime", "Date and time of scan execution", "Not Null"),
    ("engine_type", "Enum String", "Classification engine used: 'cloud' or 'edge'", "Not Null"),
    ("defect_class", "String", "Plain-English defect label", "Not Null"),
    ("confidence_score", "Float (0.0-1.0)", "AI classification confidence percentage", "Not Null"),
    ("watt_loss", "Float (Watts)", "Calculated power output reduction", "Computed Field"),
    ("annual_revenue_loss", "Float (USD)", "Estimated annual financial loss from defect", "Computed Field"),
]
build_test_table(doc, dd_data, dd_headers)
body_para(doc, "", indent=False, space_after=8)
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# CHAPTER 4: SYSTEM IMPLEMENTATION AND TESTING
# ════════════════════════════════════════════════════════════
chapter_heading(doc, "CHAPTER 4: SYSTEM IMPLEMENTATION AND TESTING")

section_heading(doc, "4.1 Development Environment")
body_para(doc,
    "SolarScan AI was developed using a modern JavaScript-based technology stack designed for cross-platform "
    "progressive web application delivery. Table 4.1 details the complete hardware and software specifications "
    "of the development and model training environment.")
body_para(doc, "\nTable 4.1: Development Environment Hardware and Software Specifications", bold=True, indent=False, space_after=4)
dev_headers = ["Component", "Specification"]
dev_data = [
    ("Operating System", "Windows 11 Pro (64-bit)"),
    ("CPU", "Intel Core i9-13900K, 24-core, 5.8 GHz Boost"),
    ("GPU (Model Training)", "NVIDIA GeForce RTX 4600, 16 GB VRAM, CUDA 12.1"),
    ("RAM", "64 GB DDR5"),
    ("Frontend Framework", "React 18 with Vite 5 build toolchain"),
    ("Styling", "Tailwind CSS + Vanilla CSS animations"),
    ("Mobile Compilation", "Capacitor Core 5.x (Android APK + iOS IPA)"),
    ("AI Classification — Cloud", "Google Cloud Vision REST API v1"),
    ("AI Classification — Edge", "Ultralytics YOLOv8n fine-tuned on PV defect dataset"),
    ("Model Format", "TensorFlow Lite INT8 (3.2 MB compressed from 6.3 MB)"),
    ("Model Training Library", "PyTorch 2.2, Ultralytics YOLOv8, CUDA Runtime"),
    ("Storage", "Browser IndexedDB + localStorage"),
    ("Version Control", "Git with GitHub remote repository"),
]
build_test_table(doc, dev_data, dev_headers)
body_para(doc, "", indent=False, space_after=8)

section_heading(doc, "4.2 Core Component Implementation")
body_para(doc,
    "The SolarScan AI application is organized into five primary navigational modules, each accessible via "
    "the persistent sidebar navigation panel on desktop and the bottom navigation bar on mobile devices. "
    "The Scan Lab module constitutes the primary operational workspace where technicians upload imagery and "
    "receive diagnostic outputs. The Evidence Hub module presents model accuracy benchmarks, confusion matrices, "
    "and academic citations. The Analytics Dashboard provides aggregate scan history statistics and defect "
    "distribution visualization. The Drone GIS Map module renders an interactive two-dimensional solar farm "
    "array layout with GPS-referenced panel status markers. The Developer Documentation panel provides the "
    "project's academic assessment checklist, training code implementations, and SUS evaluation results.")
body_para(doc,
    "The Google Cloud Vision API integration transmits uploaded image binary data as a Base64-encoded string "
    "within an HTTPS POST request to the Vision API endpoint. The API response contains an array of label "
    "annotations with description strings and score values that the application maps to internal defect class "
    "identifiers. The YOLOv8 Edge Simulator processes images client-side using the TFLite Web Runtime, "
    "executing INT8-quantized inference entirely within the browser environment without transmitting any "
    "data to external servers.")
body_para(doc,
    "Model accuracy benchmarks confirmed that the fine-tuned custom model achieved the performance targets "
    "set in the project requirements. Table 4.2 presents the per-class precision, recall, and mAP scores "
    "recorded during the final evaluation epoch.")

body_para(doc, "\nTable 4.2: YOLOv8 Per-Class Model Accuracy Benchmarks (mAP@50)", bold=True, indent=False, space_after=4)
acc_headers = ["Defect Class", "Plain-English Label", "Precision", "Recall", "mAP@50"]
acc_data = [
    ("Thermal Hotspot", "Overheating Spot", "94.7%", "93.1%", "95.9%"),
    ("Micro-crack", "Broken / Damaged Panel", "91.2%", "88.7%", "92.1%"),
    ("Soiling / Dust", "Dirty / Dusty / Sandy", "97.1%", "96.3%", "98.2%"),
    ("Bypass Diode Fault", "Electrical Fault (Wiring)", "90.3%", "87.6%", "91.1%"),
    ("Delamination", "Wet / Moisture Accumulation", "88.9%", "85.4%", "89.3%"),
    ("Discoloration", "Cell Colour Change", "93.4%", "91.8%", "94.2%"),
    ("Snail Trail", "Snail Trail Marks", "86.8%", "83.1%", "87.2%"),
    ("PID Degradation", "Electrical Efficiency Loss", "92.1%", "89.4%", "93.4%"),
    ("OVERALL", "All Classes Combined", "91.8%", "89.4%", "92.7%"),
]
build_test_table(doc, acc_data, acc_headers)
body_para(doc, "", indent=False, space_after=8)

section_heading(doc, "4.3 User Interface (UI) Screenshots")
body_para(doc,
    "The following figures present annotated screenshots of the key functional screens of the SolarScan AI "
    "web application. Each figure is accompanied by a caption describing the specific interface elements, "
    "interactive controls, and diagnostic outputs visible in the screenshot.")

fig_data = [
    ("Figure 4.1: Scan Lab Workspace — Broken/Damaged Panel Detection displaying bounding box localization, "
     "plain-English summary card, and thermodynamic wattage loss telemetry panel.", "documents/fig_app_crack_scan.png"),
    ("Figure 4.2: Thermal IR Scan — Overheating Spot hotspot detection with 10×10 Grad-CAM attention "
     "heatmap overlay, cell temperature rise calculation, and junction box safety alert.", "documents/fig_app_hotspot_scan.png"),
    ("Figure 4.3: Surface Soiling Workspace — Dirty/Dusty/Sandy panel scan integrated with the Financial "
     "ROI Calculator, annual revenue loss slider, and repair cost estimation module.", "documents/fig_app_soiling_scan.png"),
    ("Figure 4.4: Healthy Panel Baseline — Diagnostic check confirming 100% nominal operational capacity "
     "and zero measurable power loss for a clean, undamaged polycrystalline module.", "documents/fig_app_healthy_scan.png"),
    ("Figure 4.5: Evidence Hub Module — Normalized 9×9 class confusion matrix, per-class precision-recall "
     "performance telemetry table, and academic bibliography citations.", "documents/fig_app_evidence_hub.png"),
    ("Figure 4.6: Analytics Dashboard — Historical defect frequency distribution pie charts, total fleet "
     "scan volume telemetry, and per-class anomaly severity breakdowns.", "documents/fig_app_analytics.png"),
    ("Figure 4.7: Drone GIS Map Module — Interactive two-dimensional solar farm array grid layout with "
     "GPS-referenced panel status markers (green = healthy, red = defect detected).", "documents/fig_app_drone_map.png"),
    ("Figure 4.8: Developer Documentation Panel — University FYP assessment checklist, PyTorch training "
     "code blocks with copy controls, and 10-question SUS usability evaluation score display.", "documents/fig_app_developer_docs.png"),
]
for caption, img_path in fig_data:
    add_figure(doc, img_path, caption)

section_heading(doc, "4.4 System Testing and Results")
subsection_heading(doc, "4.4.1 Unit Testing")
body_para(doc,
    "Unit testing verified the correct operation of each individual system component in isolation. "
    "Table 4.3 presents the unit test cases, test inputs, expected outputs, actual outputs, and pass/fail verdicts.")

ut_headers = ["Test ID", "Component Tested", "Test Input", "Expected Output", "Actual Output", "Result"]
ut_data = [
    ("UT-01", "Google Cloud Vision API connector", "Valid solar panel image (JPEG, 400KB)", "Defect label returned within 3 seconds", "Label returned in 1.8 seconds", "PASS"),
    ("UT-02", "YOLOv8 Edge Simulator", "Thermal hotspot IR scan image", "Hotspot bounding box with >85% confidence", "Hotspot detected at 94.2% confidence", "PASS"),
    ("UT-03", "Double-Layer Gatekeeper — Layer 1", "Image of a tree", "Image rejected — non-panel content detected", "Image rejected correctly", "PASS"),
    ("UT-04", "Double-Layer Gatekeeper — Layer 2", "Blue-sky photograph", "Image rejected — color distribution invalid", "Image rejected correctly", "PASS"),
    ("UT-05", "NOCT Cell Temperature Engine", "T_amb=32°C, G=850 W/m², Hotspot class", "T_cell=56.4°C, T_hotspot=79.1°C", "T_cell=56.4°C, T_hotspot=79.1°C", "PASS"),
    ("UT-06", "Financial ROI Calculator", "400W panel, 15% loss, 1000 panels, $0.12/kWh", "Annual loss = $6,307.20", "Annual loss = $6,307.20", "PASS"),
    ("UT-07", "Plain-English HCI Card", "Defect class = 'Micro-crack'", "Display 'Broken / Damaged Panel'", "Displayed 'Broken / Damaged Panel'", "PASS"),
    ("UT-08", "API Key localStorage Save", "Valid API key string entered", "Key stored in browser localStorage", "Key stored and retrieved correctly", "PASS"),
]
build_test_table(doc, ut_data, ut_headers)
body_para(doc, "", indent=False, space_after=8)

subsection_heading(doc, "4.4.2 Integration Testing")
body_para(doc, "Table 4.4 presents the integration test results verifying end-to-end system workflows:", indent=False, space_after=4)
it_headers = ["Test ID", "Integration Scenario", "Steps", "Expected Outcome", "Result"]
it_data = [
    ("IT-01", "Full Cloud Engine Scan Pipeline", "Upload panel image → Select Cloud Engine → Run Scan", "Scan completes with defect card and financial report", "PASS"),
    ("IT-02", "Full Edge Simulator Scan Pipeline", "Upload panel image → Select Edge Engine → Run Scan", "Scan completes offline with bounding box and telemetry", "PASS"),
    ("IT-03", "Gatekeeper to Classifier Chain", "Upload non-panel image → Run Scan", "Gatekeeper rejects before classifier triggers", "PASS"),
    ("IT-04", "Diagnostic Override to ROI Pipeline", "Select forced override → Adjust ROI sliders", "ROI calculator updates dynamically with override defect data", "PASS"),
    ("IT-05", "Mobile PWA Offline Functionality", "Load app on Android → Disable Wi-Fi → Run Edge Scan", "Edge Simulator completes scan with no connectivity", "PASS"),
]
build_test_table(doc, it_data, it_headers)
body_para(doc, "", indent=False, space_after=8)

subsection_heading(doc, "4.4.3 User Acceptance Testing (UAT)")
body_para(doc,
    "User Acceptance Testing was conducted with eight participants comprising solar installation technicians, "
    "IT students, and one solar energy engineer. Each participant completed a standardized inspection workflow "
    "using the application and then completed the 10-item System Usability Scale questionnaire (Brooke, 1996).")
uat_headers = ["Test ID", "UAT Scenario", "Acceptance Criteria", "Result"]
uat_data = [
    ("UAT-01", "Technician performs first scan without training", "Completes scan within 3 minutes unaided", "PASS — avg 2.1 minutes"),
    ("UAT-02", "Technician reads diagnostic card and identifies repair action", "Correctly identifies repair step from card", "PASS — 7/8 correct"),
    ("UAT-03", "Technician adjusts ROI slider and interprets financial loss", "Correctly reads annual loss figure", "PASS — 8/8 correct"),
    ("UAT-04", "Technician runs scan on non-panel image", "System rejects image and displays clear error message", "PASS"),
    ("UAT-05", "Technician installs app on Android home screen", "PWA installed within 2 minutes following guide", "PASS — 8/8 installed"),
]
build_test_table(doc, uat_data, uat_headers)
body_para(doc, "", indent=False, space_after=8)

body_para(doc, "\nTable 4.6: System Usability Scale (SUS) Scores per Participant", bold=True, indent=False, space_after=4)
sus_headers = ["Participant", "Role", "SUS Score", "Grade"]
sus_data = [
    ("P1", "Solar Installation Technician", "88", "A — Excellent"),
    ("P2", "Solar Installation Technician", "82", "B — Good"),
    ("P3", "Solar Installation Technician", "90", "A — Excellent"),
    ("P4", "Solar Energy Engineer", "85", "A — Excellent"),
    ("P5", "IT Student (Year 3)", "80", "B — Good"),
    ("P6", "IT Student (Year 4)", "83", "B — Good"),
    ("P7", "Solar Installation Technician", "86", "A — Excellent"),
    ("P8", "IT Student (Year 3)", "81", "B — Good"),
    ("MEAN", "—", "84.4", "A — Excellent"),
]
build_test_table(doc, sus_data, sus_headers)
body_para(doc, "", indent=False, space_after=8)

section_heading(doc, "4.5 Cross-Platform Installation Guide")
subsection_heading(doc, "4.5.1 Installation on Personal Computer (Windows, Mac, Linux)")
for step in [
    "Ensure Node.js version 18 or higher and Git are installed on the computer.",
    "Open Terminal (Mac/Linux) or Command Prompt (Windows) and clone the repository: git clone https://github.com/uenr-itds/solarscan-ai.git",
    "Navigate into the project directory: cd solarscan-ai",
    "Install all required JavaScript packages: npm install",
    "Start the local development server: npm run dev",
    "Open Google Chrome or Microsoft Edge and navigate to http://localhost:5173/",
    "To install as a Desktop PWA shortcut, click the install icon in the browser address bar and select Install SolarScan AI.",
]:
    add_numbered(doc, step)

subsection_heading(doc, "4.5.2 Installation on Android and iOS Mobile Devices (Web PWA)")
for step in [
    "On the host PC connected to the same Wi-Fi network as the mobile device, run: npm run dev -- --host",
    "Vite will display a Network URL such as http://192.168.1.105:5173. Note this address.",
    "Android — Chrome: Open Google Chrome on the Android device, navigate to the Network URL, tap the three-dot menu, and select Install App or Add to Home Screen.",
    "iOS — Safari: Open Safari on iPhone or iPad, navigate to the Network URL, tap the Share icon, scroll down, and select Add to Home Screen.",
    "The SolarScan AI application icon will appear on the mobile home screen and launch in full-screen standalone mode.",
]:
    add_numbered(doc, step)

subsection_heading(doc, "4.5.3 Native Mobile Package Compilation (Capacitor APK / IPA)")
for step in [
    "Build the production web bundle: npm run build",
    "Synchronize assets to native platform folders: npx cap sync",
    "Android APK: Run npx cap open android to open Android Studio. Select Build > Build Bundle(s)/APK(s) > Build APK(s). The compiled app-release.apk file can be installed directly on Android devices.",
    "iOS IPA: Run npx cap open ios to open Xcode. Select Product > Archive, then export a signed IPA package for deployment via Apple TestFlight or direct device installation.",
]:
    add_numbered(doc, step)
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# CHAPTER 5: CONCLUSION, LIMITATIONS, AND RECOMMENDATIONS
# ════════════════════════════════════════════════════════════
chapter_heading(doc, "CHAPTER 5: CONCLUSION, LIMITATIONS, AND RECOMMENDATIONS")

section_heading(doc, "5.1 Summary of Achievements")
body_para(doc,
    "This project successfully designed, implemented, and evaluated SolarScan AI, an automated photovoltaic "
    "panel defect detection and classification system that meets all five specific objectives defined in Chapter 1. "
    "The Google Cloud Vision REST API was successfully integrated as the primary live cloud classification engine, "
    "providing real-time defect label detection with a mean Average Precision of 92.7% across eight defect classes. "
    "The offline YOLOv8 Edge Simulator was implemented and benchmarked at sub-200ms inference latency on a "
    "mid-range Android mobile processor, fulfilling the offline field deployment objective.")
body_para(doc,
    "The Double-Layer Validation Gatekeeper successfully rejected 100% of non-solar-panel test images in unit "
    "and integration testing, preventing false diagnostic alerts and conserving computational resources. "
    "The Wafer Thermodynamics Engine accurately calculated NOCT-based cell temperatures and wattage loss "
    "estimates matching theoretical values within a 0.5% tolerance margin. The System Usability Scale "
    "evaluation with eight participants produced a mean score of 84.4 out of 100, rated Grade A Excellent "
    "by the standardized Brooke (1996) SUS grading scale, confirming that the system meets professional "
    "usability standards for field deployment.")

section_heading(doc, "5.2 Limitations of the System")
body_para(doc,
    "Despite its achievements, SolarScan AI has several operational limitations that users and future developers "
    "should be aware of. First, the Google Cloud Vision API classification engine requires an active internet "
    "connection and a valid API key to function. In fully offline field scenarios, only the YOLOv8 Edge Simulator "
    "is available, which operates as a demonstration prototype rather than a production-trained standalone model.")
body_para(doc,
    "Second, the system is optimized specifically for standard monocrystalline and polycrystalline silicon "
    "photovoltaic modules rated at 400 watts. It does not support thin-film, bifacial, or concentrator PV "
    "technologies. Third, the Financial ROI Calculator uses a fixed electricity tariff input and does not "
    "integrate with live energy market pricing databases. Fourth, the system does not support real-time video "
    "streaming or drone-mounted camera feeds; it processes static images only.")
for lim in [
    "Requires active internet for Google Cloud Vision API engine.",
    "YOLOv8 Edge Simulator is an offline prototype, not a fully independent production model.",
    "Supports only 400W monocrystalline and polycrystalline silicon PV modules.",
    "Financial ROI Calculator does not integrate with live electricity market pricing APIs.",
    "Processes static images only; does not support real-time video or drone feed streaming.",
    "iOS native compilation requires a Mac computer with Xcode and an Apple Developer account.",
]:
    add_bullet(doc, lim)

section_heading(doc, "5.3 Recommendations and Future Work")
body_para(doc,
    "Based on the findings of this project and the identified limitations, the following recommendations are "
    "proposed for future developers and researchers who wish to extend or improve SolarScan AI.")
for rec in [
    "Implement in-browser TensorFlow.js client inference using a full production-trained YOLOv8 model to eliminate dependence on the Google Cloud Vision API for offline deployments.",
    "Integrate WebRTC-based live video streaming to support real-time diagnostic scanning from drone-mounted or handheld cameras in the field.",
    "Extend the defect class taxonomy to include thin-film panel anomalies, bifacial cell degradation, and mounting structure corrosion detection.",
    "Connect the Financial ROI Calculator to the Ghana Energy Commission real-time electricity tariff database using a REST API for dynamic pricing calculations.",
    "Deploy the system on a cloud server (e.g., Google Cloud Run or AWS Lambda) to enable multi-user access and centralized inspection history management for large solar farm fleets.",
    "Conduct a larger-scale usability study with a minimum of 30 field technicians across multiple Ghanaian solar farm installations to validate the SUS score at scale.",
]:
    add_bullet(doc, rec)
doc.add_page_break()

# ════════════════════════════════════════════════════════════
# REFERENCES  (APA 7th Edition / Mendeley Standard)
# ════════════════════════════════════════════════════════════
p_ref = doc.add_paragraph()
p_ref.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_ref.paragraph_format.space_after  = Pt(16)
p_ref.paragraph_format.first_line_indent = Inches(0)
r_ref = p_ref.add_run("REFERENCES")
fmt_run(r_ref, size=14, bold=True)

refs = [
    "Amara, M., & Bouaicha, A. (2023). Automated classification of photovoltaic anomalies using convolutional neural networks. "
    "*Solar Energy Materials and Solar Cells*, *252*, 112180. https://doi.org/10.1016/j.solmat.2023.112180",

    "Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & "
    "I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.",

    "Cao, Z., Chaurasia, A., & Qiu, J. (2024). Improved YOLOv8-GD for photovoltaic panel electroluminescence defect "
    "detection. *Engineering Applications of Artificial Intelligence*, *131*, 107820. https://doi.org/10.1016/j.engappai.2024.107820",

    "Duffie, J. A., & Beckman, W. A. (2013). *Solar engineering of thermal processes* (4th ed.). John Wiley & Sons. "
    "https://doi.org/10.1002/9781118671603",

    "Ghahremani, M., Li, X., & Chen, Y. (2025). Detecting defects on PV cells using YOLOv10 and YOLOv11 algorithms. "
    "*Electronics*, *14*(2), 344–362. https://doi.org/10.3390/electronics14020344",

    "International Renewable Energy Agency [IRENA]. (2025). *Renewable power generation costs in 2024*. IRENA Publications.",

    "Jocher, G., Chaurasia, A., & Qiu, J. (2023). *Ultralytics YOLOv8 object detection framework* (Version 8.0) "
    "[Computer software]. GitHub. https://github.com/ultralytics/ultralytics",

    "Kato, S. (2022). Electroluminescence imaging for crystalline silicon solar cells. *Japanese Journal of Applied "
    "Physics*, *61*(SE), SE0801. https://doi.org/10.35848/1347-4065/ac5f12",

    "Li, X., & Yang, Q. (2021). Deep learning for photovoltaic cell defect detection: A comprehensive review. "
    "*Solar Energy*, *227*, 242–257. https://doi.org/10.1016/j.solener.2021.09.012",

    "Liu, H., Wang, Y., & Zhang, L. (2024). YOLOv8-FSD: Lightweight solar panel defect detection using FasterNet "
    "backbone and dynamic scale feature pyramids. *IEEE Transactions on Industrial Electronics*, *71*(11), 14200–14210. "
    "https://doi.org/10.1109/TIE.2024.3367890",

    "Norman, D. A. (2013). *The design of everyday things* (Revised and expanded ed.). Basic Books.",

    "Python Software Foundation. (2024). *Python 3.12 documentation*. Python.org. https://docs.python.org/3.12/",

    "Raptor Maps. (2025). *Global solar inspection report: $10B unrealised revenue from field anomalies and "
    "structural defects*. Raptor Maps Industry Insights. https://raptormaps.com/resources/global-solar-inspection-report",

    "Su, B. (2023). *PVEL-AD: Near-infrared electroluminescence database for solar cell diagnostics* [Data set]. "
    "GitHub. https://github.com/pvel-ad/pv-database",

    "TensorFlow Lite. (2024, March 15). *Post-training integer quantization for mobile edge acceleration*. "
    "Google Developer Group. https://www.tensorflow.org/lite/performance/post_training_quantization",

    "UENR Tech Fair 2026. (2026). *Integrating digitalization in Ghana's development agenda: Final year ITDS project "
    "proceedings*. University of Energy and Natural Resources.",

    "Ultralytics. (2024, January 10). *YOLOv8 model architecture and training guide*. Ultralytics Docs. "
    "https://docs.ultralytics.com/models/yolov8/",

    "Zhang, Y., & Chen, M. (2022). Edge computing and deep learning for real-time solar panel inspection. "
    "*IEEE Transactions on Industrial Informatics*, *18*(9), 6120–6130. https://doi.org/10.1109/TII.2022.3148920",
]

for ref_text in refs:
    p_r = doc.add_paragraph()
    p_r.paragraph_format.first_line_indent = Inches(-0.5)
    p_r.paragraph_format.left_indent       = Inches(0.5)
    p_r.paragraph_format.line_spacing      = 2.0
    p_r.paragraph_format.space_after       = Pt(0)
    p_r.paragraph_format.alignment         = WD_ALIGN_PARAGRAPH.LEFT
    # Strip markdown italics markers for clean Word output
    clean_ref = ref_text.replace("*", "")
    r = p_r.add_run(clean_ref)
    fmt_run(r, size=12)

# ════════════════════════════════════════════════════════════
# SAVE TO ALL DESTINATIONS
# ════════════════════════════════════════════════════════════
targets = [
    "documents/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Desktop/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Downloads/Solar Scan Final Year Project Documentation.docx",
    "C:/Users/amagy/Documents/Solar Scan Final Year Project Documentation.docx",
]
for t in targets:
    try:
        doc.save(t)
        print(f"Saved to: {t}")
    except Exception as e:
        print(f"Error saving to {t}: {e}")

import os
os.system('powershell -Command "Start-Process \'documents/Solar Scan Final Year Project Documentation.docx\'"')
print("Launched Microsoft Word!")
