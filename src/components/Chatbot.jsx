import React, { useState, useRef, useEffect } from "react";

// Standard Chat Icon (SVG)
const ChatIcon = ({ size = 22, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Close Icon (SVG)
const CloseIcon = ({ size = 18, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Trash Can Icon for Clear Chat (SVG)
const TrashIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Key / Settings Icon
const SettingsIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Globe Icon for Internet
const GlobeIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Send Icon (SVG)
const SendIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// 1. LIVE INTERNET WEB RETRIEVAL ENGINE (Real Web via Wikipedia API)
// ─────────────────────────────────────────────────────────────
function cleanSearchQuery(q) {
  return q
    .replace(/^(what is|what are|how to|how do i|can i|explain|tell me about|how does|why is|why does|is it possible to)\s+/i, "")
    .replace(/[?!.]+$/, "")
    .trim();
}

async function searchLiveInternet(queryText) {
  try {
    const cleaned = cleanSearchQuery(queryText);
    const searchTarget = cleaned.length >= 3 ? cleaned : queryText;

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTarget)}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits = searchData.query?.search || [];
    if (hits.length === 0) return null;

    const topHits = hits.slice(0, 2);
    const titles = topHits.map(h => h.title).join("|");

    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(titles)}&format=json&origin=*`;
    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) return null;
    const extractData = await extractRes.json();
    const pages = Object.values(extractData.query?.pages || {});

    const validArticles = pages
      .map(p => ({
        title: p.title,
        text: (p.extract || "").trim(),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/\s+/g, "_"))}`
      }))
      .filter(a => a.text.length > 40);

    if (validArticles.length === 0) return null;

    return {
      source: "Live Web & Technical Encyclopedia",
      articles: validArticles
    };
  } catch (err) {
    console.warn("Live internet web retrieval failed:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. GOOGLE GEMINI GENERATIVE AI MULTI-MODEL CLIENT
// ─────────────────────────────────────────────────────────────
async function queryGeminiWithFallbacks(prompt, apiKey) {
  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are SolarScan AI Assistant, an expert solar photovoltaic systems engineer and field diagnostic specialist.
Answer the user's technical questions thoroughly, helpfully, and practically.
Focus on: solar panels, inverters, batteries, electrical wiring, defect diagnostics, troubleshooting error codes, sizing, safety, and clean energy technology.
Use clean markdown with bullet points and bold key terms. Keep explanations clear and actionable.

User Question: "${prompt}"`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text, model };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errJson?.error?.message || `Status ${status}`;
        lastError = { status, message: msg };
        if (status === 403 || msg.toLowerCase().includes("permission_denied") || msg.toLowerCase().includes("has not been used")) {
          break;
        }
      }
    } catch (netErr) {
      lastError = { status: 0, message: netErr.message };
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

// ─────────────────────────────────────────────────────────────
// 3. EXPANDED SOLAR DIAGNOSTIC & TROUBLESHOOTING KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────
const SOLAR_EXPERT_KB = [
  {
    keys: ["error", "fault", "code", "inverter error", "iso", "isolation", "riso", "ground fault"],
    topic: "Inverter Faults & Ground Isolation (Riso Low)",
    response: `### Inverter Fault & Ground Isolation Troubleshooting

**Common Causes & Remediation:**
1. **Isolation Fault / Ground Fault (Riso Low):**
   - **Cause:** Moisture entry into DC connectors (MC4), damaged cable insulation touching metal roof/racking, or cracked panel glass.
   - **Fix:** Measure DC resistance to ground on both (+) and (-) strings with a digital megohmmeter (insulation tester). If below 1 MΩ, isolate strings one by one to pinpoint the damaged cable or panel.
2. **Grid Overvoltage / High AC Voltage (Vac High):**
   - **Cause:** Local utility grid impedance too high during peak noon solar export.
   - **Fix:** Verify AC wire gauge sizing from inverter to main panel to reduce voltage drop. Consult utility to tap change the distribution transformer.
3. **PV Overvoltage (Vpv High):**
   - **Cause:** Too many panels wired in series, exceeding inverter Maximum DC Input Voltage in cold weather.
   - **Fix:** Calculate Voc with temperature coefficient. Split string into parallel branches.`
  },
  {
    keys: ["mc4", "connector", "burn", "melt", "crimp", "spark", "arc"],
    topic: "MC4 Connectors & DC Arcing Prevention",
    response: `### MC4 Connector Issues & DC Fire Prevention

**Critical Safety Points:**
• **Cross-Mating Hazard:** Never mate MC4 connectors from different manufacturers (e.g. Staubli with generic clones). Subtle dimensional differences cause high contact resistance, leading to thermal runaway and melted connectors.
• **Crimping:** Always use a calibrated hex/ratchet MC4 crimping tool, never pliers. Loose crimps generate micro-arcs under 10–15 Amperes DC.
• **Waterproofing:** Ensure cable gland collars are tightened to 2.5–3.0 N·m. Orient connectors horizontally or looping downwards so rainwater drips off rather than entering the seal.
• **Disconnect Under Load:** NEVER disconnect MC4 plugs while current is flowing — DC does not cross zero like AC and will draw a dangerous 600V–1000V electric arc.`
  },
  {
    keys: ["multimeter", "measure", "test", "voc", "isc", "open circuit", "short circuit", "voltage check"],
    topic: "Testing Solar Panels with a Multimeter",
    response: `### Step-by-Step Solar Panel Multimeter Testing

1. **Open-Circuit Voltage (Voc) Test:**
   - Set multimeter to DC Volts (range 0–100V or 0–600V DC).
   - Place red probe on positive MC4, black probe on negative MC4 in full sunlight.
   - **Healthy Value:** Should match rated nameplate Voc ±5% (typically 36V–50V per residential panel).
   - **Fault:** If reading 2/3 of rated Voc, one of the 3 bypass diodes in the junction box is shorted.
2. **Short-Circuit Current (Isc) Test:**
   - Set multimeter to DC 10A/20A mode.
   - Briefly touch probes across (+) and (-) leads in direct sunlight.
   - **Healthy Value:** Should read close to rated Isc (typically 9A–14A depending on module wattage).`
  },
  {
    keys: ["battery", "lifepo4", "lfp", "lithium", "agm", "gel", "charge voltage", "bms", "cut off"],
    topic: "Battery Storage & Charging Protocols",
    response: `### Solar Battery Chemistry & Optimal Charging Profiles

• **Lithium Iron Phosphate (LiFePO4 / LFP):**
  - **Bulk / Absorption Voltage:** 14.4V–14.6V (12V) or 57.6V–58.4V (48V system).
  - **Float Voltage:** 13.6V–13.8V (54.4V for 48V).
  - **Max Recommended Depth of Discharge (DoD):** 80%–90%.
  - **Cycle Life:** 4,000–6,000 cycles.
  - **BMS Protection:** Shuts down charging below 0°C to prevent lithium plating and fire hazard.
• **Lead-Acid / AGM / Gel:**
  - **Bulk:** 14.4V–14.7V. **Float:** 13.5V–13.8V. **Equalization:** 15.0V (flooded only).
  - **Max DoD:** 50% max to prevent premature sulfation.
  - **Cycle Life:** 500–1,200 cycles.`
  },
  {
    keys: ["size", "sizing", "calculator", "how many", "calculate", "pump", "ac", "air condition", "fridge"],
    topic: "Solar Sizing & Load Calculations",
    response: `### Practical System Sizing Equation

**Formula:**
Required Solar kW = (Daily Load in kWh / Peak Sun Hours) × 1.25 (system losses)

**Examples:**
• **1.5 HP Air Conditioner (1,200 Watts) running 6 hrs/day:**
  - Daily energy: 1.2 kW × 6 hrs = 7.2 kWh/day.
  - In Sunyani / Ghana (avg 5.0 Peak Sun Hours):
    (7.2 / 5.0) × 1.25 = 1.8 kW of solar panels ≈ 5 × 400W modules.
• **1 HP Submersible Water Pump (750 Watts):**
  - Surge factor: Requires an inverter rated for 3× startup surge (min 2.5 kW / 3 kVA).
  - Panels: Min 4 × 400W panels with an MPPT charge controller or solar VFD pump inverter.`
  },
  {
    keys: ["hotspot", "hot spot", "overheat", "thermal", "ir camera"],
    topic: "Hotspot Detection & Thermodynamics",
    response: `### Thermal Hotspots in Photovoltaic Cells

• **Root Cause:** A shaded, cracked, or internally mismatched cell produces less photocurrent than other cells in the string. Because all cells are wired in series, the string forces current through the damaged cell, turning it into a reverse-biased resistive heater.
• **Diagnostic Threshold:** Under infrared thermography (or SolarScan AI thermal mode):
  - **ΔT < 10°C:** Normal operating variance.
  - **ΔT 10°C–20°C:** Moderate hotspot; monitor bypass diode function.
  - **ΔT > 25°C:** Critical fault; risk of EVA encapsulant browning, backsheet burn-through, and permanent wafer delamination. Module replacement required.`
  },
  {
    keys: ["crack", "microcrack", "micro-crack", "el", "electroluminescence", "fracture"],
    topic: "Cell Micro-cracks & Structural Integrity",
    response: `### Silicon Micro-cracks & EL Diagnostics

• **Origin:** High mechanical wind loads, hail impact, thermal expansion cycles, or technicians walking on panels during installation.
• **Diagnostic:** Silicon micro-cracks are typically invisible to human eyes under standard RGB light. They require **Electroluminescence (EL) imaging** or high-resolution machine vision (as demonstrated in SolarScan AI).
• **Impact:** Inactive cell areas reduce current flow, drop output capacity by 10%–25%, and often evolve into severe localized hotspots over 12–24 months.`
  },
  {
    keys: ["soiling", "dust", "cleaning", "wash", "sand", "dirt"],
    topic: "Soiling Yield Loss & Maintenance Protocol",
    response: `### Soiling Degradation & Washing Standards

• **Yield Loss:** Dust and sand accumulation reduce panel transmission efficiency by 5% to over 30% in arid / Harmattan conditions across West Africa.
• **Best Practices:**
  1. **Timing:** Clean panels strictly in early morning or late evening when glass is cool. Spraying cold water on hot panels in direct sunlight causes thermal shock glass shattering.
  2. **Water Quality:** Use deionised / filtered water (< 100 ppm TDS). High mineral/borehole water leaves white calcium scale that permanently bakes onto glass.
  3. **Equipment:** Soft microfiber brushes or squeegees. Never use wire brushes or high-pressure washers (> 30 bar).`
  },
  {
    keys: ["pid", "potential induced degradation", "leakage", "grounding"],
    topic: "Potential Induced Degradation (PID) Mitigation",
    response: `### Potential Induced Degradation (PID)

• **Mechanism:** In high-voltage DC strings (600V–1500V), a high potential difference between active silicon cells and the grounded metal frame drives sodium (Na+) ion migration from glass into the silicon p-n junction, causing severe shunting and string power drops up to 50%.
• **Remediation:**
  1. **Anti-PID Inverters / Boxes:** Apply an opposite high-voltage offset overnight (reversing the electric field to pull sodium ions back out).
  2. **Frame Grounding:** Ensure module frame earthing impedance is < 5 Ω.
  3. **Module Selection:** Use PID-resistant certified modules (IEC 62804 standard).`
  }
];

function matchLocalExpertKnowledge(queryText) {
  const query = queryText.toLowerCase();
  let best = null;
  let maxScore = 0;

  for (const item of SOLAR_EXPERT_KB) {
    let score = 0;
    for (const k of item.keys) {
      if (query.includes(k)) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      best = item;
    }
  }

  return maxScore >= 2 ? best : null;
}

export default function Chatbot({ apiKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [aiStatus, setAiStatus] = useState("web");

  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem("solarscan_gemini_key");
      if (storedCustom) setCustomKey(storedCustom);
    } catch (_) {}
  }, []);

  const activeKey = customKey.trim() || apiKey;

  const [messages, setMessages] = useState([
    {
      id: "m0",
      text: "👋 Hello! I am your SOLAR SCAN Technical Assistant.\n\nI am connected to the **live internet** and clean energy technical database. Ask me anything about:\n• Diagnosing panel defects (hotspots, micro-cracks, PID, soiling)\n• Troubleshooting inverter error codes & ground isolation faults\n• Battery storage (LiFePO4, BMS cutoff, voltage profiles)\n• Sizing solar arrays, cables, and multimeters testing steps.",
      sender: "bot",
      source: "System",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });
  const hasMovedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const diffX = clientX - dragStartRef.current.mouseX;
      const diffY = clientY - dragStartRef.current.mouseY;

      if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
        hasMovedRef.current = true;
      }

      const newOffsetX = dragStartRef.current.offsetX - diffX;
      const newOffsetY = dragStartRef.current.offsetY - diffY;

      const buttonSize = 56;
      const margin = 24;
      const maxOffsetX = window.innerWidth - buttonSize - margin;
      const minOffsetX = -margin;
      const maxOffsetY = window.innerHeight - buttonSize - margin;
      const minOffsetY = -margin;

      setPosition({
        x: Math.max(minOffsetX, Math.min(maxOffsetX, newOffsetX)),
        y: Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY))
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      offsetX: position.x,
      offsetY: position.y
    };
  };

  const handleTriggerClick = (e) => {
    e.preventDefault();
    if (!hasMovedRef.current) setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const SUGGESTED_PROMPTS = [
    "How to fix inverter isolation fault (Riso low)?",
    "How do I test a panel Voc with multimeter?",
    "Calculate solar panels needed for 1.5HP AC",
    "What causes thermal hotspots on solar cells?"
  ];

  const handleClearHistory = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        text: "🧹 Chat history cleared. How can I assist you with solar panels, clean energy, or defect diagnostics today?",
        sender: "bot",
        source: "System",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const saveCustomGeminiKey = (keyVal) => {
    setCustomKey(keyVal);
    try {
      localStorage.setItem("solarscan_gemini_key", keyVal);
    } catch (_) {}
  };

  const handleSend = async (textToSend) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      let botResponse = "";
      let sourceTag = "Live Web & Technical Database";

      // CONVERSATIONAL INTENTS (Greetings, identity, gratitude, help)
      const tLower = text.trim().toLowerCase();
      if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)\b/i.test(tLower) || tLower === "hi" || tLower === "hello") {
        botResponse = "👋 Hello! I am your SolarScan AI Technical Assistant.\n\nI can help you with anything related to solar panels, inverters, battery storage, system sizing, electrical troubleshooting, or clean energy technology. What would you like to explore or troubleshoot today?";
        sourceTag = "SolarScan Assistant";
      } else if (/^(who\s*(are\s*you|made\s*you|created\s*you)|what\s*is\s*(solarscan|this\s*system|this\s*app))\b/i.test(tLower)) {
        botResponse = "### About SolarScan AI\n\nI am the intelligent diagnostic companion for **SolarScan AI**, developed as a Final Year Project at the **University of Energy and Natural Resources (UENR)**, Department of Information Technology & Decision Sciences.\n\n• **Core Technology:** On-device YOLOv8 TFLite INT8 edge inference + Google Cloud Vision API.\n• **Purpose:** Empower field technicians in Ghana and developing regions with offline-first, low-cost diagnostic intelligence for solar panel defect detection (hotspots, micro-cracks, soiling, PID, etc.).\n• **Capabilities:** Technical troubleshooting, sizing calculations, diagnostic guides, and live internet search.";
        sourceTag = "Project Identity";
      } else if (/^(thank(s|\s*you)|appreciate\s*it|great\s*job|awesome)\b/i.test(tLower)) {
        botResponse = "You are very welcome! If you have any other questions about solar arrays, inverter error codes, battery calculations, or panel maintenance, feel free to ask anytime.";
        sourceTag = "SolarScan Assistant";
      }

      // TIER 1: Try Gemini Generative AI if key is linked (for all other questions)
      const isDemo = activeKey === "demo" || activeKey === "simulate";
      if (!botResponse && activeKey && !isDemo) {
        try {
          const geminiResult = await queryGeminiWithFallbacks(text, activeKey);
          if (geminiResult && geminiResult.text) {
            botResponse = geminiResult.text;
            sourceTag = `⚡ Gemini AI (${geminiResult.model})`;
            setAiStatus("gemini");
          }
        } catch (geminiErr) {
          console.warn("Gemini query failed, seamlessly falling back to Live Internet & Expert Engine:", geminiErr);
        }
      }

      // TIER 2: Live Internet Web Search + Solar Expert KB
      if (!botResponse) {
        const localExpert = matchLocalExpertKnowledge(text);
        const webKnowledge = await searchLiveInternet(text);

        if (webKnowledge && webKnowledge.articles.length > 0) {
          const topArticle = webKnowledge.articles[0];
          const secondArticle = webKnowledge.articles[1];

          let synthesized = `### 🌐 Live Technical Finding: ${topArticle.title}\n\n`;
          synthesized += `${topArticle.text}\n\n`;

          if (localExpert) {
            synthesized += `---\n#### 🛠️ SolarScan Field Diagnostic Procedure:\n${localExpert.response}\n\n`;
          } else if (secondArticle) {
            synthesized += `---\n**Related System Technology (${secondArticle.title}):**\n${secondArticle.text.slice(0, 320)}...\n\n`;
          }

          synthesized += `🔗 *Source Reference: [Wikipedia / Technical Web Article](${topArticle.url})*`;

          botResponse = synthesized;
          sourceTag = "🌐 Live Web Search";
          setAiStatus("web");
        } else if (localExpert) {
          botResponse = localExpert.response;
          sourceTag = "🛠️ SolarScan Expert Database";
          setAiStatus("local");
        } else {
          botResponse = `### SolarScan Technical Diagnostic Engine\n\nRegarding your question on **"${text}"**:\n\n1. **System Health Check:**\n   - Verify that your array's DC string voltage (Voc) and operating current (Imp) align with system design parameters.\n   - Inspect physical module surfaces for micro-cracks, thermal hotspots, or localized soiling using the **Scan Lab** tab.\n2. **Inverter & Electrical Inspection:**\n   - Check the inverter LCD display for specific fault event codes (e.g. Ground Fault, Isolation Error, Grid Overvoltage).\n   - Ensure all DC disconnect isolator switches and MC4 connectors are securely locked without signs of thermal browning.\n3. **Batteries & Storage (if applicable):**\n   - Confirm your Battery Management System (BMS) communication protocol is active and cell voltages are balanced.\n\n💡 *Tip: For full conversational AI reasoning, you can add a free Google Gemini key in Chatbot Settings (gear icon).*`;
          sourceTag = "SolarScan Advisory";
        }
      }

      const botMsg = {
        id: `b-${Date.now()}`,
        text: botResponse,
        sender: "bot",
        source: sourceTag,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot response error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          text: "⚠️ A temporary network error occurred. Please check your internet connection and try asking again.",
          sender: "bot",
          source: "System",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: isOpen
          ? isMobile
            ? "calc(64px + env(safe-area-inset-bottom, 0px) + 12px)"
            : "24px"
          : isMobile
            ? `calc(78px + env(safe-area-inset-bottom, 0px) + ${position.y}px)`
            : `${24 + position.y}px`,
        right: isOpen
          ? isMobile
            ? "16px"
            : "24px"
          : `${24 + position.x}px`,
        left: isOpen && isMobile ? "16px" : "auto",
        zIndex: 9999,
        fontFamily: "var(--font-sans)",
        userSelect: isDraggingRef.current ? "none" : "auto"
      }}
    >
      {!isOpen && (
        <button
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onClick={handleTriggerClick}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--hardware)",
            color: "#ffffff",
            border: "1.5px solid rgba(255, 255, 255, 0.2)",
            cursor: isDraggingRef.current ? "grabbing" : "grab",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: isDraggingRef.current ? "none" : "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            animation: isDraggingRef.current ? "none" : "pulse 2s infinite",
            touchAction: "none"
          }}
          title="SolarScan AI Technical Assistant"
        >
          <ChatIcon size={24} color="#ffffff" />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: isMobile ? "auto" : "410px",
            height: isMobile ? "calc(100dvh - 160px)" : "560px",
            maxHeight: "560px",
            background: "var(--card)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 40px rgba(15, 23, 42, 0.18)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <header
            style={{
              padding: "12px 16px",
              background: "var(--hardware)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: aiStatus === "gemini" ? "var(--green)" : "var(--cyan)",
                  boxShadow: `0 0 8px ${aiStatus === "gemini" ? "var(--green)" : "var(--cyan)"}`
                }}
              />
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1.2, letterSpacing: "0.5px" }}>
                  SOLAR SCAN AI
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                  <GlobeIcon size={10} color="var(--green)" />
                  <span style={{ fontSize: "9px", color: "var(--green)", fontWeight: 600 }}>
                    Live Web & AI Connected
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: showSettings ? "rgba(217, 119, 6, 0.15)" : "transparent",
                  border: "none",
                  color: showSettings ? "var(--cyan)" : "var(--text-mid)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center"
                }}
                title="AI Key & Internet Settings"
              >
                <SettingsIcon size={16} />
              </button>

              <button
                onClick={handleClearHistory}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-mid)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Clear Chat History"
              >
                <TrashIcon size={16} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-mid)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Close panel"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </header>

          {showSettings && (
            <div
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
                padding: "12px 16px",
                fontSize: "11px",
                lineHeight: 1.5
              }}
              className="animate-fade-in"
            >
              <div style={{ fontWeight: 700, color: "var(--cyan)", marginBottom: "4px" }}>
                AI Engine & Connectivity Settings
              </div>
              <p style={{ color: "var(--text-mid)", marginBottom: "8px" }}>
                The assistant automatically connects to the <strong>live internet</strong> (Wikipedia & technical web data) for every query.
                To unlock full Google Gemini generative AI reasoning, you can add a free key:
              </p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => saveCustomGeminiKey(e.target.value)}
                  placeholder="Paste Google Gemini API Key (AIzaSy...)"
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    fontSize: "11px"
                  }}
                />
                {customKey && (
                  <button
                    onClick={() => saveCustomGeminiKey("")}
                    style={{
                      padding: "4px 8px",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      color: "var(--text-mid)",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-dim)" }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--cyan)", textDecoration: "underline" }}
                >
                  Get 100% Free Gemini Key ↗
                </a>
                <a
                  href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--cyan)", textDecoration: "underline" }}
                >
                  Enable on Google Cloud ↗
                </a>
              </div>
            </div>
          )}

          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(0,0,0,0.02)"
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px"
                }}
              >
                <div
                  style={{
                    background: m.sender === "user"
                      ? "var(--hardware)"
                      : "var(--surface)",
                    color: m.sender === "user" ? "#ffffff" : "var(--text)",
                    border: m.sender === "user" ? "none" : "1px solid var(--border)",
                    padding: "10px 14px",
                    borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: m.sender === "user" ? "0 2px 8px rgba(15, 23, 42, 0.2)" : "0 1px 4px rgba(0,0,0,0.04)"
                  }}
                >
                  {m.text}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: m.sender === "user" ? "flex-end" : "space-between",
                    alignItems: "center",
                    padding: "0 4px"
                  }}
                >
                  {m.sender === "bot" && m.source && (
                    <span
                      style={{
                        fontSize: "8.5px",
                        color: "var(--cyan)",
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      {m.source}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "8.5px",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "10px 16px",
                    borderRadius: "14px 14px 14px 2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    color: "var(--cyan)"
                  }}
                >
                  <GlobeIcon size={13} color="var(--cyan)" />
                  <span>Searching live internet & synthesizing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div
              style={{
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                borderTop: "1px solid var(--border)",
                background: "var(--surface)"
              }}
            >
              <span style={{ fontSize: "9px", color: "var(--text-mid)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                Technical Diagnostic Prompts:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--cyan)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            style={{
              padding: "10px 14px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask any solar or electrical issue..."
              style={{
                flex: 1,
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "12px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                background: inputText.trim()
                  ? "var(--hardware)"
                  : "var(--border)",
                border: "none",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputText.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
              title="Send Query"
            >
              <SendIcon size={14} color={inputText.trim() ? "#ffffff" : "var(--text-dim)"} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
