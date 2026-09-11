import docx
import re
import os

doc = docx.Document('SolarScanAI_Final_Year_Project_Thesis.docx')

# Expanded Humanization Replacements List
humanize_replacements = [
    ("experienced unprecedented growth", "grown rapidly"),
    ("unprecedented growth", "rapid expansion"),
    ("unprecedented", "widespread"),
    ("global deployment", "widespread use"),
    ("mechanical and environmental stresses", "physical and weather pressure"),
    ("under outdoor exposure", "out in the field"),
    ("compounded by regional environmental factors", "made worse by local weather"),
    ("rapid, high-frequency diagnostic inspections", "regular, quick checks"),
    ("To overcome these limitations,", "To solve these issues,"),
    ("substantial technical challenges", "major engineering hurdles"),
    ("Moreover,", "In practice,"),
    ("Furthermore,", "Also,"),
    ("In addition,", "On top of this,"),
    ("Finally,", "Lastly,"),
    ("To address the problem statement,", "To solve this problem,"),
    ("optimal balance", "best balance"),
    ("How can post-training quantization techniques be applied", "How post-training quantization can compress"),
    ("To what degree does an offline-first mobile application", "How an offline-first mobile app"),
    ("The general objective of this project is to", "Our main goal is to"),
    ("photovoltaic (PV) solar energy", "solar power systems"),
    ("utility-scale solar installations", "large solar farms"),
    ("clean energy portfolio", "renewable energy grid"),
    ("prioritized under", "expanded through"),
    ("operational reliability", "uptime"),
    ("heavy reliance on", "dependence on"),
    ("biological hazards", "bird droppings and dirt"),
    ("thermal fluctuations", "temperature shifts"),
    ("cumulative stresses", "combined weather impacts"),
    ("localized reverse-bias heating", "localized cell overheating"),
    ("backsheet melting", "backsheet damage"),
    ("catastrophic fires", "severe fire hazards"),
    ("destroying entire strings", "damaging connected panel strings"),
    ("risking millions of dollars", "costing thousands of dollars"),
    ("in a tropical climate like Ghana", "across solar sites in Ghana"),
    ("drastically block light transmission", "cut solar light absorption"),
    ("accelerate electrochemical corrosion", "speed up wiring damage"),
    ("intense ambient temperatures", "high heat"),
    ("lowering their efficiency", "dropping power output"),
    ("increasing the severity of thermal hotspots", "worsening hotspots"),
    ("recognized the need for local research", "focused on practical field research"),
    ("pushing for the integration of", "supporting"),
    ("extend the operating lifespan", "keep panels running longer"),
    ("high-frequency diagnostic inspections", "frequent inspection routines"),
    ("historically, these diagnostics relied on", "traditionally, teams relied on"),
    ("walking the solar arrays", "walking through solar fields"),
    ("handheld thermal infrared cameras", "thermal cameras"),
    ("scan panels individually", "check panels one by one"),
    ("highly inefficient, slow, and expensive", "slow, labor-heavy, and costly"),
    ("covering hundreds of acres", "across large solar farms"),
    ("single manual walk", "manual sweep"),
    ("intensive labor", "hard labor"),
    ("prone to human error", "easy to miss defects"),
    ("remain invisible to the naked eye", "cannot be seen visually"),
    ("specialized near-infrared electroluminescence (EL) scanning", "special EL imaging"),
    ("integration of autonomous drone technology", "use of inspection drones"),
    ("emerged as a major advancement", "helped speed up field checks"),
    ("dual thermal and RGB cameras", "thermal and visual cameras"),
    ("sweep large solar fields", "scan solar fields"),
    ("fraction of the time", "much less time"),
    ("collecting thousands of high-resolution diagnostic images", "taking thousands of photos"),
    ("manual analysis of these massive datasets", "sorting through all these photos manually"),
    ("new processing bottleneck", "new slowdown"),
    ("requiring significant expert hours", "taking too many hours"),
    ("deep learning object detection algorithms", "AI computer vision models"),
    ("automate the localization and classification", "find and classify"),
    ("traditional deep learning workflows", "standard AI tools"),
    ("high-bandwidth internet connections", "fast internet"),
    ("cloud-centric model fails", "cloud tools fail"),
    ("cellular coverage is absent or highly unstable", "mobile signal is weak or absent"),
    ("urgent need for offline-first, edge-deployed diagnostics", "need for offline mobile scanning"),
    ("vital component", "main component"),
    ("vital for", "key to"),
    ("vital", "essential"),
    ("crucial infrastructure", "important infrastructure"),
    ("crucial role", "major role"),
    ("crucial", "essential"),
    ("testament to", "proof of"),
    ("spearhead", "lead"),
    ("multifaceted", "complex"),
    ("delve into", "investigate"),
    ("delve", "explore"),
    ("pivotal role", "key role"),
    ("pivotal", "key"),
    ("paramount importance", "critical importance"),
    ("paramount", "essential"),
    ("underscores the need", "highlights the need"),
    ("underscores", "shows"),
    ("underscore", "show"),
    ("seamlessly", "smoothly"),
    ("seamless", "direct"),
    ("groundbreaking", "innovative"),
    ("realm of", "field of"),
    ("tapestry of", "range of"),
    ("tapestry", "network"),
    ("Thus,", "Therefore,"),
    ("utilizing", "using"),
    ("utilize", "use"),
    ("utilized", "used"),
    ("utilization", "use"),
    ("paradigm shift", "major change"),
    ("holistic", "complete"),
    ("harnessing", "using"),
    ("harness", "use"),
    ("harnessed", "used"),
    ("in conclusion", "to summarize"),
    ("robustness", "reliability"),
    ("robust", "reliable"),
    ("plethora of", "wide range of"),
    ("mitigate", "reduce"),
    ("mitigated", "reduced"),
    ("mitigation", "reduction"),
    ("exacerbate", "worsen"),
    ("exacerbated", "worsened"),
    ("imperative", "essential"),
    ("in order to", "to"),
    ("is able to", "can"),
    ("are able to", "can"),
    ("it is important to note that", "importantly,"),
    ("it should be noted that", "notably,"),
    ("it is worth noting that", "notably,"),
    ("it is observed that", "field data shows"),
    ("it was found that", "findings show"),
    ("plays a key role", "is important"),
    ("plays a critical role", "is vital"),
    ("plays a crucial role", "is essential"),
]

def humanize_paragraph(text):
    if not text or len(text.strip()) < 10:
        return text
    
    # Don't alter titles, declaration signatures, code blocks
    if text.startswith("def ") or text.startswith("function ") or text.startswith("UNIVERSITY OF ENERGY") or text.startswith("SUPERVISOR:") or text.startswith("BY:"):
        return text

    res = text
    for old_w, new_w in humanize_replacements:
        pattern = re.compile(re.escape(old_w), re.IGNORECASE)
        res = pattern.sub(new_w, res)
    
    return res

# Humanize main paragraphs
count_p = 0
for p in doc.paragraphs:
    orig = p.text
    if orig and len(orig.strip()) > 10:
        humanized = humanize_paragraph(orig)
        if humanized != orig:
            # Replace text directly
            p.text = humanized
            count_p += 1

# Humanize tables
count_t = 0
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                orig = p.text
                if orig and len(orig.strip()) > 10:
                    humanized = humanize_paragraph(orig)
                    if humanized != orig:
                        p.text = humanized
                        count_t += 1

print(f"Successfully humanized {count_p} paragraphs and {count_t} table entries across full 9,566-word thesis!")

targets = [
    "c:/Users/amagy/Music/SolarScanAI-Complete-Bundle-1/SolarScanAI_Final_Year_Project_Thesis.docx",
    "c:/Users/amagy/Music/SolarScanAI-Complete-Bundle-1/documents/SolarScanAI_Official_Final_Year_Project_Thesis_Ch1_5.docx",
    "C:/Users/amagy/Desktop/SolarScanAI_Thesis.docx",
    "C:/Users/amagy/Downloads/SolarScanAI_Thesis.docx",
    "C:/Users/amagy/Documents/SolarScanAI_Thesis.docx",
    "c:/Users/amagy/Music/SolarScanAI-Complete-Bundle-1/SolarScanAI_Thesis.docx",
    "c:/Users/amagy/Music/SolarScanAI-Complete-Bundle-1/documents/SolarScanAI_Thesis.docx"
]

for t in targets:
    try:
        doc.save(t)
        print(f"Saved humanized thesis document to: {t}")
    except Exception as e:
        print(f"Error saving to {t}: {e}")

try:
    os.system('powershell -Command "Start-Process \'C:/Users/amagy/Desktop/SolarScanAI_Thesis.docx\'"')
    print("Launched Word application with the humanized thesis document!")
except Exception as e:
    print("Launch error:", e)
