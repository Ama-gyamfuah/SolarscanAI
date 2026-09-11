import docx

doc = docx.Document('SolarScanAI_Final_Year_Project_Thesis.docx')

lines = []
for p in doc.paragraphs:
    text = p.text.strip()
    if not text:
        continue
    
    # Check if heading
    if text.startswith("CHAPTER") or text.startswith("1.") or text.startswith("2.") or text.startswith("3.") or text.startswith("4.") or text.startswith("5."):
        lines.append(f"\n## {text}\n")
    elif text in ["ABSTRACT", "DECLARATION", "DEDICATION", "ACKNOWLEDGEMENTS", "TABLE OF CONTENTS", "LIST OF FIGURES", "LIST OF TABLES", "REFERENCES"]:
        lines.append(f"\n# {text}\n")
    else:
        lines.append(text + "\n")

# Write to markdown artifact file
with open("C:/Users/amagy/.gemini/antigravity/brain/dd5ab81c-e9c6-4d54-856e-59de7e59fddb/solarscan_official_thesis_ch1_5.md", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Extracted full thesis to solarscan_official_thesis_ch1_5.md successfully!")
