"""
restructure_objectives.py
Splits Section 1.6 Research Objectives into:
  - General Objective  (the overarching goal)
  - Specific Objectives (the 5 bullet points that achieve the general objective)
Does NOT rebuild the document - works only on the current file.
"""

import docx
from docx import Document
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def make_xml_para(text, bold=False, italic=False, size_pt=12,
                  first_line_indent_twips=0, space_before_pt=10, space_after_pt=4):
    """Build a raw XML paragraph element with given formatting."""
    p = OxmlElement('w:p')

    pPr = OxmlElement('w:pPr')
    spacing = OxmlElement('w:spacing')
    spacing.set(qn('w:before'), str(int(space_before_pt * 20)))
    spacing.set(qn('w:after'), str(int(space_after_pt * 20)))
    spacing.set(qn('w:line'), '480')          # 240 twips × 2 = double spacing
    spacing.set(qn('w:lineRule'), 'auto')
    pPr.append(spacing)

    if first_line_indent_twips:
        ind = OxmlElement('w:ind')
        ind.set(qn('w:firstLine'), str(first_line_indent_twips))
        pPr.append(ind)

    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), 'left')
    pPr.append(jc)

    p.append(pPr)

    # Run properties
    rPr = OxmlElement('w:rPr')
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), 'Times New Roman')
    rFonts.set(qn('w:hAnsi'), 'Times New Roman')
    rPr.append(rFonts)
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), str(size_pt * 2))
    rPr.append(sz)
    if bold:
        rPr.append(OxmlElement('w:b'))
    if italic:
        rPr.append(OxmlElement('w:i'))

    # Run
    r = OxmlElement('w:r')
    r.append(rPr)
    t = OxmlElement('w:t')
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t.text = text
    r.append(t)
    p.append(r)
    return p


# ─────────────────────────────────────────────────────────────
# LOAD DOCUMENT
# ─────────────────────────────────────────────────────────────
file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = Document(file_path)
body = doc.element.body

print(f"Loaded: {len(doc.paragraphs)} paragraphs.")

# ─────────────────────────────────────────────────────────────
# LOCATE THE SECTION 1.6 RESEARCH OBJECTIVES HEADING
# ─────────────────────────────────────────────────────────────
objectives_heading_idx = None
for i, p in enumerate(doc.paragraphs):
    if 'Research Objectives' in p.text and ('1.6' in p.text or '1.4' in p.text):
        objectives_heading_idx = i
        print(f"Found Research Objectives heading at P{i}: {p.text}")
        break

if objectives_heading_idx is None:
    # Try broader search
    for i, p in enumerate(doc.paragraphs):
        if 'Research Objectives' in p.text:
            objectives_heading_idx = i
            print(f"Found Research Objectives heading at P{i}: {p.text}")
            break

if objectives_heading_idx is None:
    print("ERROR: Could not find Research Objectives heading!")
    exit(1)

# The intro paragraph (general objective) is the next non-empty paragraph
intro_idx = objectives_heading_idx + 1
while intro_idx < len(doc.paragraphs) and not doc.paragraphs[intro_idx].text.strip():
    intro_idx += 1

intro_para = doc.paragraphs[intro_idx]
print(f"Intro paragraph at P{intro_idx}: {intro_para.text[:100]}")

# Find all consecutive bullet paragraphs that follow
bullet_paras = []
j = intro_idx + 1
while j < len(doc.paragraphs):
    bp = doc.paragraphs[j]
    style = (bp.style.name or '').lower()
    if 'list' in style or bp.text.strip().startswith('To '):
        bullet_paras.append((j, bp))
        j += 1
    elif not bp.text.strip():
        j += 1
    else:
        break

print(f"Found {len(bullet_paras)} specific objective bullets.")
for idx, bp in bullet_paras:
    print(f"  P{idx}: {bp.text[:100]}")

# ─────────────────────────────────────────────────────────────
# STEP 1: Replace the intro paragraph text with the General Objective
# ─────────────────────────────────────────────────────────────
general_obj_text = (
    "The general objective of this study is to design, develop, and evaluate an automated, "
    "edge-deployed mobile system for the offline detection, classification, and physical "
    "characterization of photovoltaic panel defects. This is achieved through an optimized "
    "YOLOv8 deep learning model combined with TensorFlow Lite (TFLite) mobile integration, "
    "giving field technicians in Ghana and other developing regions a reliable, low-cost "
    "diagnostic tool that works without any internet connection."
)

# Clear existing runs
for r in list(intro_para._element.findall(qn('w:r'))):
    intro_para._element.remove(r)

# Build new run
new_r = OxmlElement('w:r')
rPr = OxmlElement('w:rPr')
rFonts = OxmlElement('w:rFonts')
rFonts.set(qn('w:ascii'), 'Times New Roman')
rFonts.set(qn('w:hAnsi'), 'Times New Roman')
rPr.append(rFonts)
sz = OxmlElement('w:sz'); sz.set(qn('w:val'), '24'); rPr.append(sz)
new_r.append(rPr)
t_el = OxmlElement('w:t')
t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
t_el.text = general_obj_text
new_r.append(t_el)
intro_para._element.append(new_r)

# Ensure first-line indent for the body paragraph
pPr = intro_para._element.find(qn('w:pPr'))
if pPr is None:
    pPr = OxmlElement('w:pPr')
    intro_para._element.insert(0, pPr)
ind = pPr.find(qn('w:ind'))
if ind is None:
    ind = OxmlElement('w:ind')
    pPr.append(ind)
ind.set(qn('w:firstLine'), '720')   # 0.5 inch = 720 twips

print("General Objective paragraph rewritten.")

# ─────────────────────────────────────────────────────────────
# STEP 2: Insert 'General Objective' label BEFORE the intro paragraph
# ─────────────────────────────────────────────────────────────
gen_label_xml = make_xml_para(
    'General Objective',
    bold=True, size_pt=12, space_before_pt=12, space_after_pt=4
)
intro_para_xml = intro_para._element
body.insert(list(body).index(intro_para_xml), gen_label_xml)
print("'General Objective' label inserted.")

# ─────────────────────────────────────────────────────────────
# STEP 3: Insert 'Specific Objectives' label BEFORE the first bullet
# ─────────────────────────────────────────────────────────────
if bullet_paras:
    first_bullet_idx, first_bullet_para = bullet_paras[0]
    # Note: after step 2 insertion, the XML index shifted by 1
    # Use element reference directly
    first_bullet_xml = first_bullet_para._element

    spec_label_xml = make_xml_para(
        'Specific Objectives',
        bold=True, size_pt=12, space_before_pt=14, space_after_pt=4
    )
    body.insert(list(body).index(first_bullet_xml), spec_label_xml)
    print("'Specific Objectives' label inserted before first bullet.")

    # Add an intro sentence before the bullets
    spec_intro_xml = make_xml_para(
        'The following specific objectives are set out to achieve the general objective stated above:',
        bold=False, size_pt=12, first_line_indent_twips=720,
        space_before_pt=4, space_after_pt=4
    )
    body.insert(list(body).index(first_bullet_xml), spec_intro_xml)
    print("Specific objectives intro sentence inserted.")
else:
    print("WARNING: No bullet paragraphs found to insert Specific Objectives label before.")

# ─────────────────────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────────────────────
targets = [
    'documents/Solar Scan Final Year Project Documentation.docx',
    'C:/Users/amagy/Desktop/Solar Scan Final Year Project Documentation.docx',
    'C:/Users/amagy/Downloads/Solar Scan Final Year Project Documentation.docx',
    'C:/Users/amagy/Documents/Solar Scan Final Year Project Documentation.docx',
]
for t in targets:
    try:
        doc.save(t)
        print(f"Saved: {t}")
    except Exception as e:
        print(f"Error saving {t}: {e}")

# Verify
doc2 = Document('documents/Solar Scan Final Year Project Documentation.docx')
print("\n=== VERIFICATION — Research Objectives Section ===")
in_section = False
for p in doc2.paragraphs:
    if 'Research Objectives' in p.text:
        in_section = True
    if in_section:
        if p.text.strip():
            print(f"  [{p.style.name}] {p.text[:120]}")
    if in_section and 'Organization' in p.text:
        break

import os
os.startfile('documents\\Solar Scan Final Year Project Documentation.docx')
print("\nDone! Document opened in Word.")
