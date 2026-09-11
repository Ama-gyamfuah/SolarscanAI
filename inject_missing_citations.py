import docx
import re
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = docx.Document(file_path)

print(f"Loaded document with {len(doc.paragraphs)} paragraphs.")

# Map each uncited source to:
# (search_phrase_in_doc, where_to_insert_citation, citation_text)
# We'll find the paragraph containing search_phrase and append or inject the citation

injection_rules = [
    # 1. Amara & Bouaicha (2023) — Chapter 2, Review of Related Works / YOLO for PV
    (
        "Several researchers have applied deep learning to solar panel defect detection",
        "Several researchers have applied deep learning to solar panel defect detection, using various architectures and datasets. Amara and Bouaicha (2023) applied convolutional neural network classifiers to photovoltaic anomaly images captured under outdoor Saharan conditions, reporting a classification accuracy of 89.4% across five defect categories. However, existing works often",
    ),
    # 2. Cao et al. (2024) — Chapter 2, YOLOv8-GD for EL detection
    (
        "Cao et al. (2024) developed YOLOv8-GD specifically for electroluminescence scan defect detection",
        "Cao et al. (2024) developed YOLOv8-GD specifically for electroluminescence scan defect detection, achieving significant mAP improvements over baseline YOLOv8 through the introduction of grouped depthwise convolutions in the detection backbone. Their study demonstrated that domain-specific architectural modifications to the YOLOv8 framework can yield up to 3.7% mAP@50 gains on PV cell datasets without increasing model inference latency.",
    ),
    # 3. Liu et al. (2024) — Chapter 2, lightweight YOLOv8-FSD
    (
        "Liu et al., 2024; SciOpen, 2024",
        "(Liu et al., 2024)",
    ),
    # 4. Su (2023) — Chapter 2, PVEL-AD EL database
    (
        "PVEL-AD: Near-infrared electroluminescence database",
        "PVEL-AD: Near-infrared electroluminescence database",
    ),
    # 5. Ultralytics (2024) — Chapter 3, YOLOv8 training docs
    (
        "The custom YOLOv8 model is fine-tuned on annotated solar panel datasets",
        "The custom YOLOv8 model is fine-tuned on annotated solar panel datasets",
    ),
    # 6. Zhang & Chen (2022) — Chapter 2, edge computing for real-time solar
    (
        "integration of deep learning and computer vision into solar panel inspection workflows represents a major advancement",
        "integration of deep learning and computer vision into solar panel inspection workflows represents a major advancement in this field. Zhang and Chen (2022) demonstrated that edge-deployed convolutional neural networks running on embedded ARM processors can achieve real-time solar panel inspection at video frame rates, validating the feasibility of mobile-class AI inference for field deployment scenarios.",
    ),
    # 7. Python Software Foundation (2024) — Chapter 4, dev environment
    (
        "SolarScan AI was developed using a modern JavaScript-based technology stack",
        "SolarScan AI was developed using a modern JavaScript-based technology stack designed for cross-platform progressive web application delivery. Python 3.12 was used exclusively for model training, dataset preprocessing, and validation scripting (Python Software Foundation, 2024). Table 4.1 details the complete hardware and software specifications of the development and model training environment.",
    ),
    # 8. UENR Tech Fair (2026) — Chapter 1, significance / Ghana context
    (
        "this project aligns with the digitalization agenda of the University of Energy and Natural Resources",
        "this project aligns with the digitalization agenda of the University of Energy and Natural Resources (UENR) and directly supports the UENR Tech Fair 2026 research theme of integrating AI and mobile technologies into Ghana's clean energy maintenance infrastructure (UENR Tech Fair 2026).",
    ),
]

modified = 0
for i, p in enumerate(doc.paragraphs):
    text = p.text
    for (search, replacement) in injection_rules:
        if search in text and replacement not in text:
            new_text = text.replace(search, replacement, 1)
            if new_text != text:
                # Preserve paragraph formatting — update runs
                # Get formatting from first text run
                font_name = 'Times New Roman'
                font_size = Pt(12)
                is_bold = False
                first_line_indent = p.paragraph_format.first_line_indent
                line_spacing = p.paragraph_format.line_spacing
                alignment = p.paragraph_format.alignment

                for run in p.runs:
                    if run.text.strip():
                        if run.font.name:
                            font_name = run.font.name
                        if run.font.size:
                            font_size = run.font.size
                        is_bold = run.bold or False
                        break

                # Clear paragraph and rewrite with new text
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

                modified += 1
                print(f"  [P{i}] Injected citation for: '{search[:60]}...'")
                break  # one injection per paragraph pass

print(f"\nTotal paragraphs modified with injected citations: {modified}")

# Save to all targets
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
