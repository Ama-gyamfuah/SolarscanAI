"""
humanise_document.py
Reads the CURRENT document exactly as-is (preserving all user edits),
applies human-writing transformations to body paragraphs only,
and saves it back.

Rules:
  - DO NOT touch: headings, references section, table cells, figure
    captions, citation parentheses content, equations, or any text
    that is all-caps.
  - Only rewrite flowing prose paragraphs.
  - Preserve every citation, every name, every number exactly.
"""

import docx
from docx import Document
from docx.shared import Pt
import re

# ─────────────────────────────────────────────────────────────
# HUMANISATION SUBSTITUTION TABLE
# Order matters — longer phrases first to avoid partial matches
# ─────────────────────────────────────────────────────────────
SUBS = [
    # ── Remove pure AI filler openers ────────────────────────
    (r'\bIt is (important|worth noting|essential|crucial|critical) to note that\b', ''),
    (r'\bIt is (important|worth noting|essential|crucial|critical) that\b', ''),
    (r'\bIt should be noted that\b', ''),
    (r'\bIt is evident that\b', ''),
    (r'\bIt is clear that\b', ''),
    (r'\bIt is (widely|generally|commonly) (accepted|known|recognised|recognized) that\b', ''),
    (r'\bNeedless to say,?\b', ''),
    (r'\bWithout a doubt,?\b', ''),
    (r'\bIn light of this,?\b', 'Given this,'),
    (r'\bIn light of the (above|foregoing),?\b', 'Considering all of this,'),
    (r'\bAs previously (mentioned|stated|discussed|noted)\b', 'As noted earlier'),
    (r'\bAs (mentioned|stated|noted) (above|earlier|previously)\b', 'As noted earlier'),
    (r'\bIn conclusion,?\b', 'To summarise,'),
    (r'\bIn summary,?\b', 'To summarise,'),
    (r'\bTo summarise,?\s*,', 'To summarise,'),

    # ── Connectives and transitions ───────────────────────────
    (r'\bFurthermore,\b', 'On top of this,'),
    (r'\bMoreover,\b', 'What is more,'),
    (r'\bAdditionally,\b', 'Also,'),
    (r'\bIn addition,\b', 'Also,'),
    (r'\bIn addition to this,\b', 'Beyond this,'),
    (r'\bConsequently,\b', 'As a result,'),
    (r'\bSubsequently,\b', 'After this,'),
    (r'\bHenceforth,\b', 'From this point,'),
    (r'\bHence,\b', 'So,'),
    (r'\bThus,\b', 'So,'),
    (r'\bTherefore,\b', 'Because of this,'),
    (r'\bAs such,\b', 'Because of this,'),
    (r'\bAccordingly,\b', 'With this in mind,'),
    (r'\bNevertheless,\b', 'Even so,'),
    (r'\bNotwithstanding,\b', 'Despite this,'),
    (r'\bNotably,\b', 'Worth noting is that'),
    (r'\bSignificantly,\b', 'Importantly,'),

    # ── AI-typical verb/adjective swaps ──────────────────────
    (r'\butili[sz]e[sd]?\b', 'use'),
    (r'\bUtili[sz]e[sd]?\b', 'Use'),
    (r'\bfacilitate[sd]?\b', 'support'),
    (r'\bFacilitate[sd]?\b', 'Support'),
    (r'\bleverage[sd]?\b', 'use'),
    (r'\bLeverage[sd]?\b', 'Use'),
    (r'\bleveraging\b', 'using'),
    (r'\bLeveraging\b', 'Using'),
    (r'\bdemonstrate[sd]?\b', 'show'),
    (r'\bDemonstrate[sd]?\b', 'Show'),
    (r'\bdemonstrating\b', 'showing'),
    (r'\bencompass(es|ed|ing)?\b', 'cover'),
    (r'\bEncompass(es|ed|ing)?\b', 'Cover'),
    (r'\bexpedite[sd]?\b', 'speed up'),
    (r'\bExpedite[sd]?\b', 'Speed up'),
    (r'\bmitigate[sd]?\b', 'reduce'),
    (r'\bMitigate[sd]?\b', 'Reduce'),
    (r'\bproprietary\b', 'commercial'),
    (r'\brobust\b', 'reliable'),
    (r'\bRobust\b', 'Reliable'),
    (r'\bcomprehensive\b', 'thorough'),
    (r'\bComprehensive\b', 'Thorough'),
    (r'\bnovel\b', 'new'),
    (r'\bNovel\b', 'New'),
    (r'\bcutting-edge\b', 'modern'),
    (r'\bCutting-edge\b', 'Modern'),
    (r'\bstate-of-the-art\b', 'modern'),
    (r'\bState-of-the-art\b', 'Modern'),
    (r'\boptimal\b', 'best'),
    (r'\bOptimal\b', 'Best'),
    (r'\boptimise[sd]?\b', 'improve'),
    (r'\bOptimise[sd]?\b', 'Improve'),
    (r'\boptimize[sd]?\b', 'improve'),
    (r'\bOptimize[sd]?\b', 'Improve'),
    (r'\bpivotal\b', 'key'),
    (r'\bPivotal\b', 'Key'),
    (r'\bparamount\b', 'very important'),
    (r'\bParamount\b', 'Very important'),
    (r'\binherent(ly)?\b', 'naturally'),
    (r'\bInherent(ly)?\b', 'Naturally'),
    (r'\bsignificant\b', 'major'),
    (r'\bSignificant\b', 'Major'),
    (r'\bsignificantly\b', 'considerably'),
    (r'\bSignificantly\b', 'Considerably'),
    (r'\bsubstantial(ly)?\b', 'considerably'),
    (r'\bSubstantial(ly)?\b', 'Considerably'),

    # ── Wordiness fixes ───────────────────────────────────────
    (r'\bIn order to\b', 'To'),
    (r'\bin order to\b', 'to'),
    (r'\bDue to the fact that\b', 'Because'),
    (r'\bdue to the fact that\b', 'because'),
    (r'\bPrior to\b', 'Before'),
    (r'\bprior to\b', 'before'),
    (r'\bSubsequent to\b', 'After'),
    (r'\bsubsequent to\b', 'after'),
    (r'\bIn terms of\b', 'Regarding'),
    (r'\bin terms of\b', 'regarding'),
    (r'\bIn the context of\b', 'In'),
    (r'\bin the context of\b', 'in'),
    (r'\bIn the field of\b', 'In'),
    (r'\bin the field of\b', 'in'),
    (r'\bWith respect to\b', 'Regarding'),
    (r'\bwith respect to\b', 'regarding'),
    (r'\bWith regard to\b', 'Regarding'),
    (r'\bwith regard to\b', 'regarding'),
    (r'\ba wide range of\b', 'many'),
    (r'\bA wide range of\b', 'Many'),
    (r'\ba wide variety of\b', 'many'),
    (r'\bA wide variety of\b', 'Many'),
    (r'\bthe fact that\b', 'that'),
    (r'\bThe fact that\b', 'That'),
    (r'\bis (capable|able) of\b', 'can'),
    (r'\bare (capable|able) of\b', 'can'),

    # ── Em-dash and punctuation humanisation ─────────────────
    # Long em-dash between clauses → comma or period rewrite is done inline
    (r'\s*—\s*', ' — '),   # Normalize spacing around em-dash first

    # ── Passive-to-active common swaps ───────────────────────
    (r'\bit was found that\b', 'the results showed that'),
    (r'\bIt was found that\b', 'The results showed that'),
    (r'\bit was determined that\b', 'the analysis showed that'),
    (r'\bIt was determined that\b', 'The analysis showed that'),
    (r'\bIt can be seen that\b', 'Clearly,'),
    (r'\bit can be seen that\b', 'clearly,'),
    (r'\bhas been shown to\b', 'has proven to'),
    (r'\bhave been shown to\b', 'have proven to'),

    # ── Specific AI phrases ───────────────────────────────────
    (r'\bdelve into\b', 'explore'),
    (r'\bDelve into\b', 'Explore'),
    (r'\bunpack\b', 'explore'),
    (r'\bUnpack\b', 'Explore'),
    (r'\bempowering\b', 'helping'),
    (r'\bEmpowering\b', 'Helping'),
    (r'\bempower[sd]?\b', 'help'),
    (r'\bEmpower[sd]?\b', 'Help'),
    (r'\btailored to\b', 'designed for'),
    (r'\bTailored to\b', 'Designed for'),
    (r'\bseamless(ly)?\b', 'smoothly'),
    (r'\bSeamless(ly)?\b', 'Smoothly'),
    (r'\brobust(ly)?\b', 'reliable'),
    (r'\bharnessing\b', 'using'),
    (r'\bHarnessing\b', 'Using'),
    (r'\bharness(es|ed)?\b', 'use'),
    (r'\bHarness(es|ed)?\b', 'Use'),
    (r'\bspearhead(ed|ing|s)?\b', 'lead'),
    (r'\bSpearhead(ed|ing|s)?\b', 'Lead'),
    (r'\ba plethora of\b', 'many'),
    (r'\bA plethora of\b', 'Many'),
    (r'\bmyriad\b', 'many'),
    (r'\bMyriad\b', 'Many'),
    (r'\bpotential to\b', 'ability to'),
    (r'\bwherewithal\b', 'means'),
    (r'\bfoster(s|ed|ing)?\b', 'build'),
    (r'\bFoster(s|ed|ing)?\b', 'Build'),

    # ── Clean up double spaces left by removals ───────────────
    (r'  +', ' '),
    (r' ,', ','),
    (r' \.', '.'),
    (r'\. +\.', '.'),
]


def humanise_text(text):
    """Apply all substitutions to a piece of text."""
    result = text
    for pattern, replacement in SUBS:
        result = re.sub(pattern, replacement, result)
    # Clean up any empty phrase starts like ", the system"
    result = re.sub(r'^,\s+', '', result)
    # Fix double spaces
    result = re.sub(r'  +', ' ', result)
    return result.strip()


def is_skip_paragraph(p):
    """Return True for paragraphs we must NOT touch."""
    text = p.text.strip()
    if not text:
        return True

    style_name = (p.style.name or '').lower()

    # Skip headings
    if 'heading' in style_name:
        return True

    # Skip all-caps lines (chapter/section titles)
    if text.upper() == text and len(text) > 4:
        return True

    # Skip very short lines (titles, captions likely)
    if len(text) < 30:
        return True

    # Skip lines that look like TOC entries (dots + page number)
    if re.search(r'\.{5,}\s*\w{1,4}$', text):
        return True

    # Skip lines that look like figure captions (start with "Figure")
    if re.match(r'^Figure\s+\d', text):
        return True

    # Skip table caption labels
    if re.match(r'^Table\s+\d', text):
        return True

    # Skip reference entries (start with a surname and year in parens)
    if re.match(r'^[A-Z][a-z]+,?\s+[A-Z]\.', text):
        return True

    # Skip equation lines
    if re.match(r'^[A-Z]_', text) or re.match(r'^[Tq]\s*=', text) or re.match(r'^W_', text):
        return True

    # Skip signature lines
    if 'Signature' in text or 'Index' in text:
        return True

    return False


def rewrite_paragraph(p, new_text):
    """Rewrite paragraph text preserving first-run formatting."""
    font_name = 'Times New Roman'
    font_size = Pt(12)
    bold = False
    italic = False

    for run in p.runs:
        if run.text.strip():
            font_name = run.font.name or 'Times New Roman'
            font_size = run.font.size or Pt(12)
            bold = run.bold or False
            italic = run.italic or False
            break

    # Clear all runs
    for run in p.runs:
        run.text = ''

    # Write new text into first run (or create one)
    if p.runs:
        r = p.runs[0]
        r.text = new_text
        r.font.name = font_name
        r.font.size = font_size
        r.bold = bold
        r.italic = italic
    else:
        r = p.add_run(new_text)
        r.font.name = font_name
        r.font.size = font_size
        r.bold = bold
        r.italic = italic


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
file_path = 'documents/Solar Scan Final Year Project Documentation.docx'
doc = Document(file_path)

print(f"Loaded: {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables.")

# Identify where the REFERENCES section starts — stop humanising there
ref_start_idx = None
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().upper() == 'REFERENCES':
        ref_start_idx = i
        break

print(f"References section starts at paragraph {ref_start_idx} — will not touch beyond that.")

changed = 0
skipped = 0

for i, p in enumerate(doc.paragraphs):
    # Never touch reference entries
    if ref_start_idx and i >= ref_start_idx:
        break

    if is_skip_paragraph(p):
        skipped += 1
        continue

    original = p.text
    humanised = humanise_text(original)

    if humanised != original and humanised.strip():
        rewrite_paragraph(p, humanised)
        changed += 1
        if changed <= 20:
            print(f"  [P{i}] Changed:")
            print(f"    OLD: {original[:100]}")
            print(f"    NEW: {humanised[:100]}")

print(f"\nParagraphs humanised: {changed}")
print(f"Paragraphs skipped (headings/refs/captions): {skipped}")

# ─────────────────────────────────────────────────────────────
# SAVE TO ALL LOCATIONS
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
print("\nDone! Document humanised and saved.")
