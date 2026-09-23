import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = docx.Document(file_path)

print(f"Loaded document with {len(doc.paragraphs)} paragraphs.")

# Set document-wide default style to Times New Roman 12pt Double-Spaced
style_normal = doc.styles['Normal']
font = style_normal.font
font.name = 'Times New Roman'
font.size = Pt(12)

# Format all paragraphs in the document
for p in doc.paragraphs:
    if not p.text or len(p.text.strip()) == 0:
        continue

    # Set 2.0 line spacing (double spacing)
    p.paragraph_format.line_spacing = 2.0
    
    # Check if heading or body text
    text_s = p.text.strip()
    is_chapter = text_s.startswith("CHAPTER") or text_s.startswith("STUDENT") or text_s.startswith("ABSTRACT") or text_s.startswith("TABLE OF CONTENTS") or text_s.startswith("REFERENCES")
    is_heading_2 = text_s.startswith("1.") or text_s.startswith("2.") or text_s.startswith("3.") or text_s.startswith("4.") or text_s.startswith("5.")
    
    for r in p.runs:
        r.font.name = 'Times New Roman'
        
        if is_chapter:
            r.font.size = Pt(14)
            r.bold = True
            r.font.color.rgb = RGBColor(0, 0, 0)
        elif is_heading_2:
            r.font.size = Pt(12)
            r.bold = True
            r.font.color.rgb = RGBColor(0, 0, 0)
        else:
            r.font.size = Pt(12)
            r.font.color.rgb = RGBColor(0, 0, 0)

# Format all table cells to Times New Roman 12pt 2.0 line spacing
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.line_spacing = 1.5 # 1.5 inside tables for clean layout
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(10.5)
                    r.font.color.rgb = RGBColor(0, 0, 0)

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
        print(f"Saved Times New Roman 12pt Double-Spaced document to {t}")
    except Exception as e:
        print(f"Error saving to {t}: {e}")

# Launch Microsoft Word
try:
    os.system('powershell -Command "Start-Process \'documents/Solar Scan Final Year Project Documentation.docx\'"')
    print("Launched Microsoft Word with updated formatting!")
except Exception as e:
    print("Launch error:", e)
