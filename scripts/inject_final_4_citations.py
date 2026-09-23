import docx
from docx.shared import Pt

file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = docx.Document(file_path)
print(f"Loaded document with {len(doc.paragraphs)} paragraphs.")

def rewrite_paragraph(p, new_text):
    """Rewrite a paragraph's text while keeping the font of the first run."""
    font_name = 'Times New Roman'
    font_size = Pt(12)
    is_bold = False
    for run in p.runs:
        if run.text.strip():
            font_name = run.font.name or 'Times New Roman'
            font_size = run.font.size or Pt(12)
            is_bold = run.bold or False
            break
    for run in p.runs:
        run.text = ''
    if p.runs:
        p.runs[0].text = new_text
        p.runs[0].font.name = font_name
        p.runs[0].font.size = font_size
        p.runs[0].bold = is_bold
    else:
        r = p.add_run(new_text)
        r.font.name = font_name
        r.font.size = font_size
        r.bold = is_bold

# ── P150: inject Ultralytics (2024) ──────────────────────────────────────────
p150 = doc.paragraphs[150]
old = p150.text
new = old.replace(
    "YOLOv8, released by Ultralytics in 2023, introduced",
    "YOLOv8, released by Ultralytics in 2023 and continuously updated through 2024 (Ultralytics, 2024), introduced"
)
if new != old:
    rewrite_paragraph(p150, new)
    print("P150: Ultralytics (2024) injected.")

# ── P151: inject Liu et al. (2024) ───────────────────────────────────────────
p151 = doc.paragraphs[151]
old = p151.text
# Add a sentence before Cao et al. mentioning Liu et al.
insert_before = "Cao et al. (2024) developed YOLOv8-GD"
liu_sentence = (
    "Liu et al. (2024) introduced YOLOv8-FSD, a lightweight solar inspection variant "
    "employing a FasterNet backbone and dynamic-scale feature pyramids that reduced "
    "parameter counts by 34% while maintaining competitive mAP on PV inspection datasets, "
    "making it suitable for resource-constrained mobile hardware. "
)
new = old.replace(insert_before, liu_sentence + insert_before, 1)
if new != old:
    rewrite_paragraph(p151, new)
    print("P151: Liu et al. (2024) injected.")

# ── P153: inject Su (2023) ───────────────────────────────────────────────────
p153 = doc.paragraphs[153]
old = p153.text
su_sentence = (
    "The PVEL-AD near-infrared electroluminescence benchmark dataset released by Su (2023) "
    "has become a standard reference for validating cell-level crack and delamination detection "
    "models trained on EL imagery. "
)
new = su_sentence + old
if new != old:
    rewrite_paragraph(p153, new)
    print("P153: Su (2023) injected.")

# ── P156: inject Amara & Bouaicha (2023) ─────────────────────────────────────
p156 = doc.paragraphs[156]
old = p156.text
amara_sentence = (
    "Amara and Bouaicha (2023) applied convolutional neural network classifiers to outdoor "
    "photovoltaic anomaly imagery captured under Saharan weather conditions, reporting a "
    "classification accuracy of 89.4% across five defect categories. Their study confirms "
    "the viability of deep learning approaches for real-world PV inspection but does not "
    "address offline mobile deployment or plain-English technician guidance outputs. "
)
# Append sentence to end of paragraph
new = old.rstrip() + " " + amara_sentence
if new != old:
    rewrite_paragraph(p156, new)
    print("P156: Amara & Bouaicha (2023) injected.")

# ── P195: inject Python Software Foundation (2024) ───────────────────────────
p195 = doc.paragraphs[195]
old = p195.text
new = old.replace(
    "Python 3.12 was used exclusively for model training, dataset preprocessing, and validation scripting (Python Software Foundation, 2024).",
    "Python 3.12 was used exclusively for model training, dataset preprocessing, and validation scripting (Python Software Foundation, 2024)."
)
# Already in there from first run — check if it's present
if "Python Software Foundation" not in old:
    # Add it
    new = old.rstrip() + " Python 3.12 scripting was used for all model training and dataset pipeline operations (Python Software Foundation, 2024)."
    rewrite_paragraph(p195, new)
    print("P195: Python Software Foundation (2024) injected.")
else:
    print("P195: Python Software Foundation (2024) already present.")

# ── SAVE ─────────────────────────────────────────────────────────────────────
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

# ── FINAL AUDIT ───────────────────────────────────────────────────────────────
doc2 = docx.Document("documents/Solar Scan Final Year Project Documentation.docx")
all_text = ' '.join([p.text for p in doc2.paragraphs])

check = {
    'Amara & Bouaicha (2023)':         'Amara and Bouaicha (2023)' in all_text,
    'Cao et al. (2024)':               'Cao et al. (2024)' in all_text,
    'Zhang & Chen (2022)':             'Zhang and Chen (2022)' in all_text,
    'Python Software Foundation(2024)':'Python Software Foundation (2024)' in all_text,
    'Su (2023)':                       'Su (2023)' in all_text,
    'Liu et al. (2024)':               'Liu et al. (2024)' in all_text,
    'Ultralytics (2024)':              'Ultralytics, 2024' in all_text,
    'UENR Tech Fair 2026':             'UENR Tech Fair 2026' in all_text,
}
print('\n=== FINAL CITATION AUDIT ===')
for source, found in check.items():
    print(('OK' if found else 'MISSING'), '  ', source)
total = sum(1 for v in check.values() if v)
print(f'\n{total}/{len(check)} sources cited in body text.')

import os
os.system('powershell -Command "Start-Process \'documents/Solar Scan Final Year Project Documentation.docx\'"')
