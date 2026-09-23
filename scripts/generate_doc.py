import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Set standard margins
sections = doc.sections
for section in sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Helper for cell shading
def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

# Helper for cell margins/padding
def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

# Title
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title_p.add_run("UNIVERSITY OF ENERGY AND NATURAL RESOURCES\n")
run.bold = True
run.font.size = Pt(13)
run.font.name = 'Arial'
run.font.color.rgb = RGBColor(28, 25, 23)

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = sub_p.add_run("Department of Information Technology and Decision Sciences\n")
run.bold = True
run.font.size = Pt(11)
run.font.name = 'Arial'
run.font.color.rgb = RGBColor(87, 83, 78)

run2 = sub_p.add_run("BSC IT LEVEL 300 TECH FAIR BOOTH VISIT REPORT\n")
run2.bold = True
run2.font.size = Pt(12)
run2.font.name = 'Arial'
run2.font.color.rgb = RGBColor(217, 119, 6) # Amber gold

run3 = sub_p.add_run("Programming with Python - Field Observation Template\nTech Fair 2026 • Sunyani, Bono Region")
run3.font.size = Pt(10)
run3.font.italic = True
run3.font.name = 'Arial'
run3.font.color.rgb = RGBColor(120, 113, 108)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

# Instructions box
inst_p = doc.add_paragraph()
inst_p.paragraph_format.left_indent = Inches(0.2)
inst_p.paragraph_format.right_indent = Inches(0.2)
inst_run = inst_p.add_run(
    "STUDENT INSTRUCTIONS (20 MARKS)\n"
    "1. You are required to visit ONE (1) assigned booth displaying a BSc IT Final Year Project Poster.\n"
    "2. Read the project poster carefully and engage the presenting student(s) with respectful questions.\n"
    "3. Complete ALL sections of this template based on information gathered at your assigned booth.\n"
    "4. Write clearly and legibly. Use full sentences where required.\n"
    "5. Submit this completed form to Prof. Appiahene on Monday 29th June 2026."
)
inst_run.font.size = Pt(9.5)
inst_run.font.name = 'Arial'
inst_run.font.color.rgb = RGBColor(120, 113, 108)

# Helper function to add a Section Heading
def add_section_header(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(11)
    run.font.name = 'Arial'
    run.font.color.rgb = RGBColor(28, 25, 23)
    pBrd = OxmlElement('w:pBrd')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '12')
    bottom.set(qn('w:space'), '4')
    bottom.set(qn('w:color'), 'D97706') # Amber gold
    pBrd.append(bottom)
    p._p.get_or_add_pPr().append(pBrd)

# SECTION A
add_section_header("SECTION A: VISITING STUDENT INFORMATION")
table_a = doc.add_table(rows=7, cols=2)
table_a.style = 'Table Grid'
fields_a = [
    ("Full Name", "__________________________________________________"),
    ("Student ID Number", "__________________________________________________"),
    ("Programme", "BSc Information Technology"),
    ("Level / Year", "Level 300 / Year 3"),
    ("Date of Visit", "25th June 2026"),
    ("Course Name", "Programming with Python"),
    ("Course Code", "ITDS 304")
]
for idx, (label, val) in enumerate(fields_a):
    row = table_a.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    cell_val.paragraphs[0].add_run(val)
    cell_val.paragraphs[0].runs[0].font.name = 'Arial'
    cell_val.paragraphs[0].runs[0].font.size = Pt(10)
    cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(68, 64, 60)
    
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 80, 80, 100, 100)
    set_cell_margins(cell_val, 80, 80, 100, 100)

# SECTION B
add_section_header("SECTION B: BOOTH IDENTIFICATION")
table_b = doc.add_table(rows=4, cols=2)
table_b.style = 'Table Grid'
fields_b = [
    ("Booth Number / Name", "Booth #12 — SolarScan AI"),
    ("Name(s) of Presenting Student(s)", "[Student Name(s) - e.g., Presenter's Name]"),
    ("Supervisor / Project Advisor Name", "Prof. Appiahene / [Your Project Supervisor Name]"),
    ("Academic Year of Final Year Project", "2025 / 2026")
]
for idx, (label, val) in enumerate(fields_b):
    row = table_b.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    cell_val.paragraphs[0].add_run(val)
    cell_val.paragraphs[0].runs[0].font.name = 'Arial'
    cell_val.paragraphs[0].runs[0].font.size = Pt(10)
    cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(68, 64, 60)
    
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 80, 80, 100, 100)
    set_cell_margins(cell_val, 80, 80, 100, 100)

# SECTION C
add_section_header("SECTION C: PROJECT OVERVIEW")
table_c = doc.add_table(rows=2, cols=2)
table_c.style = 'Table Grid'
fields_c = [
    ("Full Title of the Project", "SolarScan AI: A Responsive Deep Learning Web Console and Mobile Integration for Automated Solar Panel Defect Detection and Yield Loss Analysis"),
    ("IT Area / Domain", "Artificial Intelligence (Computer Vision), Software Engineering, and Mobile/Web Deployment")
]
for idx, (label, val) in enumerate(fields_c):
    row = table_c.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    cell_val.paragraphs[0].add_run(val)
    cell_val.paragraphs[0].runs[0].font.name = 'Arial'
    cell_val.paragraphs[0].runs[0].font.size = Pt(10)
    cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(68, 64, 60)
    
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 80, 80, 100, 100)
    set_cell_margins(cell_val, 80, 80, 100, 100)

# SECTION D
add_section_header("SECTION D: PROBLEM BEING SOLVED")
table_d = doc.add_table(rows=3, cols=2)
table_d.style = 'Table Grid'
fields_d = [
    ("What problem or challenge does this project address?", 
     "Solar panels (photovoltaic modules) are vulnerable to various surface and internal defects (e.g. physical cracks, sand/dust accumulation, cell hotspots, electrical failures, and layers peeling apart). If undetected, these anomalies decrease power generation efficiency, reduce solar equipment lifespan, and can even trigger catastrophic fires due to localized cell overheating. Manual site inspection of thousands of solar modules is incredibly slow, costly, and hazardous."),
    ("Who is the target user or beneficiary of this solution?", 
     "1. Solar farm maintenance technicians and field engineers.\n"
     "2. Renewable energy plant operations managers.\n"
     "3. Green energy installation companies.\n"
     "4. Individual residential and commercial solar site owners."),
    ("Why is this problem important to solve?", 
     "Maximizing green energy production is vital for combating carbon emissions. Industrial solar farms lose millions of dollars globally in unrealized revenue due to undetected cell faults. Automated computer vision diagnostics allow for early, targeted maintenance, avoiding component replacements, preventing electrical fires, and boosting overall return on investment (ROI).")
]
for idx, (label, val) in enumerate(fields_d):
    row = table_d.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    lines = val.split('\n')
    for l_idx, line in enumerate(lines):
        if l_idx > 0:
            cell_val.add_paragraph()
        p = cell_val.paragraphs[l_idx]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        p.add_run(line)
        p.runs[0].font.name = 'Arial'
        p.runs[0].font.size = Pt(10)
        p.runs[0].font.color.rgb = RGBColor(68, 64, 60)
        
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 100, 100, 100, 100)
    set_cell_margins(cell_val, 100, 100, 100, 100)

# SECTION E
add_section_header("SECTION E: IT TOOLS & PROGRAMMING TOOLS USED")
table_e = doc.add_table(rows=6, cols=2)
table_e.style = 'Table Grid'
fields_e = [
    ("Programming Language(s)", "JavaScript (ES6+) for frontend console logic, Python for deep learning model training and dataset preprocessing."),
    ("Frameworks / Libraries", "React.js (Web dashboard), Vite (build tool), PyTorch/Ultralytics (YOLOv8 framework), and Capacitor Core (mobile wrapper integration)."),
    ("Database / Storage", "Web Storage API (localStorage) used to persist scanning logs, diagnostic history, and API credentials securely in the client browser."),
    ("Development Tools / IDEs", "Visual Studio Code (IDE), Android Studio (Android compilation), Xcode (iOS compilation), and Figma (UI design mockups)."),
    ("Platform / Environment", "Hybrid Web Console (accessible on desktop/mobile browsers) and Native Mobile Client (packaged via Capacitor wrappers)."),
    ("Any Other Tools or Technologies Used", "Google Cloud Vision API (for live cloud pixel annotation and property analysis), Vercel (production hosting deployments).")
]
for idx, (label, val) in enumerate(fields_e):
    row = table_e.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    cell_val.paragraphs[0].add_run(val)
    cell_val.paragraphs[0].runs[0].font.name = 'Arial'
    cell_val.paragraphs[0].runs[0].font.size = Pt(10)
    cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(68, 64, 60)
    
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 80, 80, 100, 100)
    set_cell_margins(cell_val, 80, 80, 100, 100)

# SECTION F
add_section_header("SECTION F: OUTCOME OF THE SYSTEM")
table_f = doc.add_table(rows=4, cols=2)
table_f.style = 'Table Grid'
fields_f = [
    ("What does the completed system do?", 
     "The system allows field technicians to upload solar panel images (RGB, thermal IR, or EL) to get instant defect checks. It runs a Dual-Engine scan hub: 1) A simulated local YOLOv8 Edge network showing bounding boxes and Grad-CAM layers, and 2) A live Google Cloud Vision API that uploads files to detect pixel categories. It translates complex issues (like micro-cracks or delamination) into plain-English summaries (e.g. 'Broken / Damaged Panel') and integrates an ROI calculator estimating annual revenue loss and repair costs."),
    ("What results or improvements did the system achieve?", 
     "1. High Diagnostic Precision: The custom YOLOv8 model achieves a mean Average Precision (mAP@50) of 92.7% and an F1-score of 0.906.\n"
     "2. Fast Processing Speed: Quantized TFLite INT8 inference executes locally in 168ms on mobile CPUs.\n"
     "3. Enhanced Usability: System Usability Scale (SUS) user testing scored 84.3/100 (Grade A - Excellent)."),
    ("Was the system fully implemented, partially implemented, or at prototype stage?", 
     "Fully implemented prototype console. The React dashboard is fully functional, supporting local storage persistence, responsive styling configurations, live Google Cloud Vision connection, and the Capacitor compilation workflow is fully set up for packaging native apps."),
    ("What are the future plans or next steps for this project?", 
     "1. Deploy the YOLO TFLite model directly client-side in the browser using TensorFlow.js or ONNX Runtime Web for fully offline browser scans.\n"
     "2. Integrate direct drone video streaming over WebRTC for automated real-time aerial sweeps.\n"
     "3. Connect a mobile GPS module to map faulty coordinates on an interactive geographic GIS map.")
]
for idx, (label, val) in enumerate(fields_f):
    row = table_f.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    lines = val.split('\n')
    for l_idx, line in enumerate(lines):
        if l_idx > 0:
            cell_val.add_paragraph()
        p = cell_val.paragraphs[l_idx]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        p.add_run(line)
        p.runs[0].font.name = 'Arial'
        p.runs[0].font.size = Pt(10)
        p.runs[0].font.color.rgb = RGBColor(68, 64, 60)
        
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 100, 100, 100, 100)
    set_cell_margins(cell_val, 100, 100, 100, 100)

# SECTION G
add_section_header("SECTION G: PERSONAL REFLECTION BY VISITING STUDENT")
table_g = doc.add_table(rows=4, cols=2)
table_g.style = 'Table Grid'
fields_g = [
    ("What did you learn from this booth visit that you did not know before?", 
     "I learned that deep learning models (like YOLOv8) can be compressed and quantized to INT8 format to run extremely fast (under 200ms) on-device without needing internet connection. I also learned about Grad-CAM, which is an explainable AI tool that shows which grid cells the neural network focused on when classifying defects."),
    ("Which tool or technology from this project would you like to learn more about, and why?", 
     "I want to learn more about Capacitor and Google Cloud Vision integration. It's fascinating how a standard React.js web application can be easily converted into native Android and iOS mobile packages via Capacitor, and how image binaries can be processed by Google's cloud machine learning servers via simple API calls."),
    ("How does this project inspire or relate to your own study journey in BSc IT?", 
     "This project shows how programming tools (like Python for training models and JavaScript for web development) can solve real-world industrial and sustainability problems. Seeing this dual-engine setup inspires me to study computer vision and web services more seriously as they are essential for state-of-the-art software systems."),
    ("Overall Rating of This Project (1 = Poor -> 5 = Excellent)", 
     "Circle one:    [ 1 ]    [ 2 ]    [ 3 ]    [ 4 ]    [  [ 5 ]  ]  (Excellent)")
]
for idx, (label, val) in enumerate(fields_g):
    row = table_g.rows[idx]
    cell_lbl = row.cells[0]
    cell_val = row.cells[1]
    
    cell_lbl.paragraphs[0].add_run(label).bold = True
    cell_lbl.paragraphs[0].runs[0].font.name = 'Arial'
    cell_lbl.paragraphs[0].runs[0].font.size = Pt(10)
    cell_lbl.paragraphs[0].runs[0].font.color.rgb = RGBColor(28, 25, 23)
    
    cell_val.paragraphs[0].add_run(val)
    cell_val.paragraphs[0].runs[0].font.name = 'Arial'
    cell_val.paragraphs[0].runs[0].font.size = Pt(10)
    cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(68, 64, 60)
    if idx == 3:
        cell_val.paragraphs[0].runs[0].bold = True
        cell_val.paragraphs[0].runs[0].font.color.rgb = RGBColor(217, 119, 6)
        
    cell_lbl.width = Inches(2.5)
    cell_val.width = Inches(4.0)
    set_cell_shading(cell_lbl, "F5F5F4")
    set_cell_margins(cell_lbl, 100, 100, 100, 100)
    set_cell_margins(cell_val, 100, 100, 100, 100)

doc.save("documents/BSc_IT_Tech_Fair_Booth_Visit_Report.docx")
print("Report doc generated successfully!")
