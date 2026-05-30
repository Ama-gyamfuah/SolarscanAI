import React, { useState } from "react";
import { TargetIcon, CheckIcon } from "./Icons";

const SUS_PARTICIPANTS = [
  { id: "P1", role: "Solar Field Tech", age: 28, responses: [4, 2, 4, 1, 4, 2, 5, 1, 4, 2] },
  { id: "P2", role: "Electrical Engineer", age: 34, responses: [5, 1, 5, 2, 5, 1, 5, 1, 5, 1] },
  { id: "P3", role: "IT Student", age: 22, responses: [4, 2, 4, 2, 4, 2, 4, 1, 4, 2] },
  { id: "P4", role: "Solar Plant Manager", age: 45, responses: [3, 2, 4, 2, 4, 3, 4, 2, 3, 2] },
  { id: "P5", role: "Maintenance Supervisor", age: 38, responses: [4, 1, 5, 1, 5, 2, 5, 1, 4, 1] },
  { id: "P6", role: "Renewable Consultant", age: 31, responses: [4, 2, 4, 2, 5, 2, 4, 2, 4, 2] },
  { id: "P7", role: "IT Systems Researcher", age: 27, responses: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1] },
  { id: "P8", role: "Utility Maintenance", age: 42, responses: [3, 3, 4, 2, 4, 2, 4, 2, 3, 2] },
  { id: "P9", role: "Safety Inspector", age: 39, responses: [4, 1, 4, 2, 4, 1, 5, 1, 4, 1] },
  { id: "P10", role: "Field Subcontractor", age: 35, responses: [4, 2, 5, 1, 5, 2, 4, 2, 4, 2] },
  { id: "P11", role: "IT Faculty Auditor", age: 29, responses: [5, 1, 4, 1, 4, 1, 5, 1, 5, 1] },
  { id: "P12", role: "Clean Energy Technologist", age: 33, responses: [4, 2, 4, 2, 4, 2, 5, 2, 4, 2] }
];

const SUS_QUESTIONS = [
  "I think I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think I would need technical support to use this system.",
  "I found the various functions well integrated.",
  "I thought there was too much inconsistency in the system.",
  "I imagine most people would learn to use this quickly.",
  "I found the system very cumbersome to use.",
  "I felt confident using the system.",
  "I needed to learn a lot before using this system."
];

// Helper to compute SUS
function calculateSUSScore(responses) {
  let sum = 0;
  responses.forEach((val, idx) => {
    // Odd indexed questions (1, 3, 5, 7, 9) contribute val - 1
    // Even indexed questions (2, 4, 6, 8, 10) contribute 5 - val
    sum += idx % 2 === 0 ? val - 1 : 5 - val;
  });
  return sum * 2.5;
}

const PARTICIPANTS_SCORES = SUS_PARTICIPANTS.map((p) => ({
  ...p,
  score: calculateSUSScore(p.responses)
}));

const MEAN_SUS = PARTICIPANTS_SCORES.reduce((a, b) => a + b.score, 0) / PARTICIPANTS_SCORES.length;

const TASK_COMPLETION_RATES = [
  { task: "Upload and scan a panel image", rate: 100, color: "var(--green)" },
  { task: "Interpret visual detection anomalies", rate: 100, color: "var(--green)" },
  { task: "Utilise financial yield ROI model", rate: 87.5, color: "var(--cyan)" },
  { task: "Navigate explainable Grad-CAM matrix", rate: 100, color: "var(--green)" },
  { task: "Export local text field report", rate: 91.6, color: "var(--green)" },
  { task: "Integrate custom field-technician notes", rate: 83.3, color: "var(--cyan)" }
];

export default function SUSPanel() {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const gradeColor = MEAN_SUS >= 80.3 ? "var(--green)" : MEAN_SUS >= 68 ? "var(--amber)" : "var(--red)";
  const gradeLabel = MEAN_SUS >= 80.3 ? "A+ (Excellent / Top 10%)" : MEAN_SUS >= 68 ? "B (Good)" : "C (Marginal)";

  // SVG drawing dimensions
  const W = 380;
  const H = 80;
  const PAD = 10;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Overview Card */}
      <div
        style={{
          background: "var(--card)",
          border: `1px solid ${gradeColor}33`,
          borderRadius: "14px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: "10px", color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>
              USABILITY METRICS
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>System Usability Scale (SUS)</h3>
          </div>
          <span
            style={{
              background: `${gradeColor}22`,
              color: gradeColor,
              border: `1px solid ${gradeColor}44`,
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            {gradeLabel}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "6px", margin: "14px 0" }}>
          <span style={{ fontSize: "56px", fontWeight: 800, color: gradeColor, lineHeight: 1 }}>
            {MEAN_SUS.toFixed(1)}
          </span>
          <span style={{ fontSize: "16px", color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>/ 100</span>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text-mid)", lineHeight: 1.6, marginBottom: "14px" }}>
          Usability benchmark evaluated with n=12 industry testers and renewable engineering students. Industry average standard score is 68.0.
        </p>

        {/* Linear gauge bar */}
        <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", position: "relative", marginBottom: "4px" }}>
          <div
            style={{
              position: "absolute",
              left: `${MEAN_SUS}%`,
              top: 0,
              bottom: 0,
              width: "4px",
              background: "#ffffff",
              boxShadow: "0 0 8px #fff",
              zIndex: 5,
            }}
          />
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, var(--red) 0%, var(--amber) 55%, var(--cyan) 75%, var(--green) 90%)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          <span>0 (Poor)</span>
          <span>68 (Industry Avg)</span>
          <span>80.3 (Excellent)</span>
          <span>100</span>
        </div>
      </div>

      {/* SVG Scatterplot Scores */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px", marginBottom: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
          <TargetIcon color="var(--cyan)" size={16} /> Individual Participant Usability Scores
        </div>
        
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
          {/* Mean line */}
          <line
            x1={PAD}
            y1={H / 2}
            x2={W - PAD}
            y2={H / 2}
            stroke="var(--border-hi)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          {/* scatter nodes */}
          {PARTICIPANTS_SCORES.map((p, i) => {
            const x = PAD + (i / (PARTICIPANTS_SCORES.length - 1)) * (W - PAD * 2);
            // map scores 50-100 to height
            const y = H - PAD - ((p.score - 50) / 50) * (H - PAD * 2);
            const dotColor = p.score >= 80.3 ? "var(--green)" : p.score >= 68 ? "var(--amber)" : "var(--red)";
            return (
              <g key={p.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={dotColor}
                  stroke="var(--bg)"
                  strokeWidth="1.5"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedIdx(i)}
                />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  fill="var(--text-mid)"
                  fontSize="7px"
                  fontFamily="var(--font-mono)"
                >
                  {p.id}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px", fontSize: "8px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginTop: "4px" }}>
          <span>P1</span>
          <span>Click dot to view detailed survey questionnaire responses</span>
          <span>P12</span>
        </div>
      </div>

      {/* Participant Drawer Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {PARTICIPANTS_SCORES.map((p, idx) => {
          const isSelected = selectedIdx === idx;
          const dotColor = p.score >= 80.3 ? "var(--green)" : p.score >= 68 ? "var(--amber)" : "var(--red)";

          return (
            <div
              key={p.id}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              style={{
                background: "var(--card)",
                border: `1px solid ${isSelected ? dotColor : "var(--border)"}`,
                borderRadius: "10px",
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: dotColor,
                    }}
                  >
                    {p.id}
                  </span>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600 }}>{p.role}</div>
                    <span style={{ fontSize: "9px", color: "var(--text-mid)" }}>Age: {p.age}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: dotColor }}>
                    {p.score.toFixed(0)}
                  </span>
                  <div style={{ fontSize: "8px", color: "var(--text-dim)" }}>SUS SCORE</div>
                </div>
              </div>

              {isSelected && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                  className="animate-fade-in"
                >
                  <div style={{ fontSize: "9px", color: "var(--text-mid)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    Standard SUS Survey Responses (Scale: 1-5)
                  </div>
                  {SUS_QUESTIONS.map((q, qi) => {
                    const rawVal = p.responses[qi];
                    const isPositive = qi % 2 === 0;
                    const adjVal = isPositive ? rawVal - 1 : 5 - rawVal;
                    return (
                      <div key={qi} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "10px" }}>
                        <span style={{ color: dotColor, fontFamily: "var(--font-mono)", minWidth: "22px" }}>
                          Q{qi + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "var(--text)", lineHeight: 1.4 }}>{q}</p>
                          <div style={{ display: "flex", gap: "4px", marginTop: "3px", alignItems: "center" }}>
                            {[1, 2, 3, 4, 5].map((v) => (
                              <div
                                key={v}
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "3px",
                                  background: v === rawVal ? dotColor : "var(--border)",
                                  color: v === rawVal ? "#000" : "var(--text-mid)",
                                  fontSize: "9px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                }}
                              >
                                {v}
                              </div>
                            ))}
                            <span style={{ fontSize: "8px", color: "var(--text-dim)", marginLeft: "8px" }}>
                              Contrib score: {adjVal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Completion rates */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          <CheckIcon color="var(--cyan)" size={16} /> Usability Task Completion Rates
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {TASK_COMPLETION_RATES.map((t, idx) => (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                <span style={{ color: "var(--text)" }}>{t.task}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: t.color, fontWeight: 700 }}>
                  {t.rate}%
                </span>
              </div>
              <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${t.rate}%`, height: "100%", background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
