import React, { useState, useEffect, useRef } from "react";
import { LoaderIcon, CpuIcon, AlertTriangleIcon, CheckIcon } from "./Icons";

// UENR Field Coordinates
const BASE_LAT = 7.3392;
const BASE_LNG = -2.3164;

// 6x4 Grid of Solar Panel Arrays representing UENR solar field
const FIELD_ARRAYS = [
  { id: "A1", x: 40, y: 30, defect: "healthy", name: "Array Alpha 1" },
  { id: "A2", x: 95, y: 30, defect: "healthy", name: "Array Alpha 2" },
  { id: "A3", x: 150, y: 30, defect: "hotspot", name: "Array Alpha 3", temp: 58.4, delta: 24.2, note: "Severe overheating cell detected near center junction." },
  { id: "A4", x: 205, y: 30, defect: "healthy", name: "Array Alpha 4" },
  { id: "A5", x: 260, y: 30, defect: "healthy", name: "Array Alpha 5" },
  { id: "A6", x: 315, y: 30, defect: "soiling", name: "Array Alpha 6", note: "Thick dust accumulation due to road proximity." },

  { id: "B1", x: 40, y: 80, defect: "healthy", name: "Array Beta 1" },
  { id: "B2", x: 95, y: 80, defect: "crack", name: "Array Beta 2", note: "EL scan identifies multiple cell micro-cracks from wind strain." },
  { id: "B3", x: 150, y: 80, defect: "healthy", name: "Array Beta 2" },
  { id: "B4", x: 205, y: 80, defect: "healthy", name: "Array Beta 4" },
  { id: "B5", x: 260, y: 80, defect: "pid", name: "Array Beta 5", temp: 42.1, delta: 12.5, note: "Potential Induced Degradation. High electrical leakage to frame." },
  { id: "B6", x: 315, y: 80, defect: "healthy", name: "Array Beta 6" },

  { id: "C1", x: 40, y: 130, defect: "healthy", name: "Array Gamma 1" },
  { id: "C2", x: 95, y: 130, defect: "healthy", name: "Array Gamma 2" },
  { id: "C3", x: 150, y: 130, defect: "healthy", name: "Array Gamma 3" },
  { id: "C4", x: 205, y: 130, defect: "delamination", name: "Array Gamma 4", note: "EVA moisture ingress. Delamination peeling covering 12%." },
  { id: "C5", x: 260, y: 130, defect: "healthy", name: "Array Gamma 5" },
  { id: "C6", x: 315, y: 130, defect: "snow_cover", name: "Array Gamma 6", note: "Simulated weather/snow obstruction blocking irradiance." },

  { id: "D1", x: 40, y: 180, defect: "healthy", name: "Array Delta 1" },
  { id: "D2", x: 95, y: 180, defect: "bypass_failure", name: "Array Delta 2", temp: 64.8, delta: 30.5, note: "Bypass diode failure inside string junction box." },
  { id: "D3", x: 150, y: 180, defect: "healthy", name: "Array Delta 3" },
  { id: "D4", x: 205, y: 180, defect: "healthy", name: "Array Delta 4" },
  { id: "D5", x: 260, y: 180, defect: "healthy", name: "Array Delta 5" },
  { id: "D6", x: 315, y: 180, defect: "healthy", name: "Array Delta 6" }
];

// Flashing drone path coordinates
const FLIGHT_PATH = [
  { id: "A1", x: 40, y: 30 },
  { id: "A2", x: 95, y: 30 },
  { id: "A3", x: 150, y: 30 },
  { id: "A4", x: 205, y: 30 },
  { id: "A5", x: 260, y: 30 },
  { id: "A6", x: 315, y: 30 },
  { id: "B6", x: 315, y: 80 },
  { id: "B5", x: 260, y: 80 },
  { id: "B4", x: 205, y: 80 },
  { id: "B3", x: 150, y: 80 },
  { id: "B2", x: 95, y: 80 },
  { id: "B1", x: 40, y: 80 },
  { id: "C1", x: 40, y: 130 },
  { id: "C2", x: 95, y: 130 },
  { id: "C3", x: 150, y: 130 },
  { id: "C4", x: 205, y: 130 },
  { id: "C5", x: 260, y: 130 },
  { id: "C6", x: 315, y: 130 },
  { id: "D6", x: 315, y: 180 },
  { id: "D5", x: 260, y: 180 },
  { id: "D4", x: 205, y: 180 },
  { id: "D3", x: 150, y: 180 },
  { id: "D2", x: 95, y: 180 },
  { id: "D1", x: 40, y: 180 }
];

const DEFECT_INFO = {
  healthy: { label: "Operational", color: "var(--green)", loss: 0 },
  hotspot: { label: "Thermal Hotspot", color: "var(--red)", loss: 35 },
  crack: { label: "Micro-crack", color: "var(--orange)", loss: 15 },
  soiling: { label: "Soiling Defect", color: "var(--amber)", loss: 12 },
  bypass_failure: { label: "Diode Bypass Failure", color: "var(--red)", loss: 33 },
  delamination: { label: "Delamination Peel", color: "var(--orange)", loss: 8 },
  pid: { label: "Power Leakage (PID)", color: "var(--orange)", loss: 20 },
  snow_cover: { label: "Snow Obscuration", color: "var(--cyan)", loss: 50 }
};

export default function DroneMap() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pathIdx, setPathIdx] = useState(0);
  const [spectrum, setSpectrum] = useState("thermal"); // 'rgb' or 'thermal'
  const [selectedArray, setSelectedArray] = useState(null);
  const [telemetryLog, setTelemetryLog] = useState([
    "Drone system initialized. Telemetry link established.",
    "GPS coordinates locked at UENR Solar Grid [7.3392° N, 2.3164° W].",
    "Awaiting manual simulation ignition... Click 'START SCAN' to begin flight path."
  ]);
  const [gpsCoord, setGpsCoord] = useState({ lat: BASE_LAT, lng: BASE_LNG });
  const [telemetryMetrics, setTelemetryMetrics] = useState({
    altitude: 12.0,
    speed: 4.2,
    temp: 28.5,
    rotors: 7200
  });

  const logEndRef = useRef(null);

  // Auto-scroll the terminal log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [telemetryLog]);

  // Main Drone Movement Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPathIdx((prev) => {
        const next = (prev + 1) % FLIGHT_PATH.length;
        const currentTarget = FLIGHT_PATH[next];
        const arrayInfo = FIELD_ARRAYS.find(a => a.id === currentTarget.id);

        // Update GPS slightly based on target index
        const randomJitterLat = (Math.random() - 0.5) * 0.0001;
        const randomJitterLng = (Math.random() - 0.5) * 0.0001;
        const newLat = BASE_LAT + (currentTarget.y * 0.00001) + randomJitterLat;
        const newLng = BASE_LNG + (currentTarget.x * 0.00001) + randomJitterLng;
        setGpsCoord({ lat: newLat, lng: newLng });

        // Update other metrics
        const baseTemp = 28.0;
        const scanTemp = arrayInfo?.temp ? arrayInfo.temp : baseTemp + (Math.random() * 4);
        setTelemetryMetrics({
          altitude: parseFloat((11.8 + Math.random() * 0.5).toFixed(1)),
          speed: parseFloat((3.8 + Math.random() * 0.8).toFixed(1)),
          temp: parseFloat(scanTemp.toFixed(1)),
          rotors: 7200 + Math.floor(Math.random() * 400)
        });

        // Add log entry
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        let statusText = `Scanning ${arrayInfo?.name || currentTarget.id}... `;
        if (arrayInfo?.defect === "healthy") {
          statusText += "Status: Healthy (OK)";
        } else {
          statusText += `ANOMALY: ${DEFECT_INFO[arrayInfo?.defect]?.label || "Anomaly"} detected!`;
        }

        setTelemetryLog(prevLog => {
          const updated = [...prevLog, `[${timestamp}] ${statusText}`];
          return updated.slice(-30); // Cap at 30 entries
        });

        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const dronePos = FLIGHT_PATH[pathIdx];
  const activeArray = FIELD_ARRAYS.find(a => a.id === dronePos.id);

  // Inline array selector handler
  const handleArrayClick = (arr) => {
    setIsPlaying(false);
    setSelectedArray(arr);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTelemetryLog(prevLog => [
      ...prevLog,
      `[${timestamp}] Flight paused. Inspected ${arr.name} (Array ${arr.id}) manually.`
    ]);
  };

  const handleResume = () => {
    setIsPlaying(true);
    setSelectedArray(null);
  };

  const handleReset = () => {
    setPathIdx(0);
    setSelectedArray(null);
    setTelemetryLog([
      "Drone flight coordinates reset.",
      "Stabilizers aligned. Simulation stopped. Click 'START SCAN' to resume."
    ]);
  };

  const inspectorTarget = selectedArray || activeArray;
  const inspectorDefect = DEFECT_INFO[inspectorTarget?.defect || "healthy"];

  return (
    <div className="animate-fade-in drone-grid-container">
      {/* 1. Main Telemetry GIS Grid View */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Header telemetry status */}
        <div className="drone-header-card">
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--cyan)", margin: 0 }}>Drone Autonomous Inspection GIS</h2>
            <p style={{ fontSize: "11px", color: "var(--text-mid)", margin: 0 }}>On-field real-time flight path scan simulator (UENR Field, Sunyani)</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? "rgba(217, 119, 6, 0.08)" : "linear-gradient(135deg, var(--cyan), var(--blue))",
                border: isPlaying ? "1px solid var(--border)" : "none",
                color: isPlaying ? "var(--cyan)" : "#000",
                padding: "6px 12px",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isPlaying ? "⏹ STOP SCAN" : "▶ START SCAN"}
            </button>
            <button
              onClick={handleReset}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-mid)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              RESET PATH
            </button>
          </div>
        </div>

        {/* Dynamic Map Viewer */}
        <div style={{
          background: "black",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          overflow: "hidden",
          position: "relative",
          width: "100%",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)"
        }}>
          {/* SVG Map Grid overlay */}
          <svg
            viewBox="0 0 380 220"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              background: spectrum === "thermal" 
                ? "radial-gradient(circle at center, #0a031e 0%, #03010b 100%)" 
                : "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
              transition: "background 0.5s ease"
            }}
          >
            {/* Draw flight path trail */}
            <path
              d="M 40,30 L 95,30 L 150,30 L 205,30 L 260,30 L 315,30 L 315,80 L 260,80 L 205,80 L 150,80 L 95,80 L 40,80 L 40,130 L 95,130 L 150,130 L 205,130 L 260,130 L 315,130 L 315,180 L 260,180 L 205,180 L 150,180 L 95,180 L 40,180"
              fill="none"
              stroke="rgba(0, 229, 255, 0.15)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Grid Solar Arrays */}
            {FIELD_ARRAYS.map((arr) => {
              const isActive = arr.id === dronePos.id;
              const isSelected = selectedArray?.id === arr.id;
              const hasDefect = arr.defect !== "healthy";
              
              // Define color themes
              let fillColor = "rgba(30, 60, 100, 0.4)";
              let strokeColor = "rgba(255,255,255,0.1)";
              let glowColor = "transparent";

              if (spectrum === "thermal") {
                if (isActive || isSelected) {
                  fillColor = hasDefect ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)";
                  strokeColor = hasDefect ? "var(--red)" : "var(--green)";
                  glowColor = hasDefect ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)";
                } else if (hasDefect) {
                  // Thermal view shows defects glowing hot
                  fillColor = arr.defect === "hotspot" || arr.defect === "bypass_failure" 
                    ? "rgba(217, 119, 6, 0.65)" 
                    : "rgba(180, 83, 9, 0.5)";
                  strokeColor = "var(--amber)";
                  glowColor = "rgba(217, 119, 6, 0.1)";
                } else {
                  fillColor = "rgba(49, 46, 129, 0.35)"; // cool dark blue
                  strokeColor = "rgba(99, 102, 241, 0.2)";
                }
              } else {
                // Visual RGB spectrum view
                if (isActive || isSelected) {
                  fillColor = hasDefect ? "rgba(180, 83, 9, 0.7)" : "rgba(21, 128, 61, 0.7)";
                  strokeColor = hasDefect ? "var(--amber)" : "var(--green)";
                } else if (hasDefect) {
                  fillColor = "rgba(87, 83, 78, 0.5)"; // dirt/gray
                  strokeColor = "rgba(120, 113, 108, 0.3)";
                } else {
                  fillColor = "rgba(14, 116, 144, 0.35)"; // healthy blue panel
                  strokeColor = "rgba(0, 229, 255, 0.25)";
                }
              }

              return (
                <g 
                  key={arr.id} 
                  style={{ cursor: "pointer" }}
                  onClick={() => handleArrayClick(arr)}
                >
                  {glowColor !== "transparent" && (
                    <rect
                      x={arr.x - 17}
                      y={arr.y - 12}
                      width="34"
                      height="24"
                      rx="3"
                      fill={glowColor}
                      filter="blur(4px)"
                    />
                  )}
                  <rect
                    x={arr.x - 15}
                    y={arr.y - 10}
                    width="30"
                    height="20"
                    rx="2"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isActive || isSelected ? "2" : "1"}
                    style={{ transition: "all 0.4s ease" }}
                  />
                  {/* Grid Label */}
                  <text
                    x={arr.x}
                    y={arr.y + 4}
                    textAnchor="middle"
                    fill={isActive || isSelected ? "#000" : "#ffffff"}
                    fontSize="7"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: "none" }}
                  >
                    {arr.id}
                  </text>
                </g>
              );
            })}

            {/* Active scan radar beams */}
            {isPlaying && (
              <g style={{ pointerEvents: "none" }}>
                <line 
                  x1={dronePos.x} 
                  y1={dronePos.y} 
                  x2={dronePos.x - 20} 
                  y2={dronePos.y + 35} 
                  stroke="rgba(0, 229, 255, 0.25)" 
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <line 
                  x1={dronePos.x} 
                  y1={dronePos.y} 
                  x2={dronePos.x + 20} 
                  y2={dronePos.y + 35} 
                  stroke="rgba(0, 229, 255, 0.25)" 
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <ellipse 
                  cx={dronePos.x} 
                  cy={dronePos.y + 30} 
                  rx="15" 
                  ry="4" 
                  fill="rgba(0, 229, 255, 0.08)"
                  stroke="rgba(0, 229, 255, 0.4)"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Drone Icon Indicator */}
            <g transform={`translate(${dronePos.x}, ${dronePos.y})`} style={{ transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", pointerEvents: "none" }}>
              {/* Rotor paths */}
              <circle cx="-12" cy="-6" r="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <circle cx="12" cy="-6" r="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <circle cx="-12" cy="6" r="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <circle cx="12" cy="6" r="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              {/* Drone Body struts */}
              <line x1="-12" y1="-6" x2="12" y2="6" stroke="gray" strokeWidth="2" />
              <line x1="12" y1="-6" x2="-12" y2="6" stroke="gray" strokeWidth="2" />

              {/* Main battery capsule */}
              <rect x="-6" y="-6" width="12" height="12" rx="3" fill="#ffffff" stroke="var(--cyan)" strokeWidth="1.5" />
              {/* Power LED Indicator */}
              <circle cx="0" cy="0" r="2.2" fill={isPlaying ? "var(--green)" : "var(--amber)"} />
            </g>
          </svg>

          {/* Camera View Mode Spectrum overlay button */}
          <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", background: "rgba(0,0,0,0.6)", borderRadius: "6px", padding: "2px", border: "1px solid rgba(255,255,255,0.15)" }}>
            {[
              { id: "rgb", label: "Visual RGB View" },
              { id: "thermal", label: "Thermal IR View" }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSpectrum(opt.id)}
                style={{
                  background: spectrum === opt.id ? "var(--cyan)" : "transparent",
                  color: spectrum === opt.id ? "#000" : "#fff",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  transition: "all 0.2s"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Telemetry Logs & HUD Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Real-time Telemetry Metrics HUD Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--cyan)", fontWeight: 700, fontSize: "12px", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "12px" }}>
            <CpuIcon size={16} /> Telemetry HUD Data
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
            {[
              ["Drone ID", "UENR-InspDrone-01", "var(--text)"],
              ["GPS Coordinates", `${gpsCoord.lat.toFixed(6)}° N, ${gpsCoord.lng.toFixed(6)}° W`, "var(--cyan)"],
              ["Flight Altitude", `${telemetryMetrics.altitude} m`, "var(--text)"],
              ["Inspection Speed", `${telemetryMetrics.speed} m/s`, "var(--text)"],
              ["Rotor Speed", `${telemetryMetrics.rotors} RPM`, "var(--text)"],
              ["Temperature Probe", `${telemetryMetrics.temp}°C`, inspectorTarget?.defect !== "healthy" ? "var(--red)" : "var(--green)"]
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-mid)", whiteSpace: "nowrap" }}>{l}:</span>
                <span style={{ fontWeight: 700, color: c, fontFamily: "var(--font-mono)", fontSize: l === "GPS Coordinates" ? "10px" : "11px", textAlign: "right", wordBreak: "break-all" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Telemetry Log Console Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", height: "180px" }}>
          <div style={{ color: "var(--text-mid)", fontWeight: 700, fontSize: "10px", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
            Telemetry Event Log Stream
          </div>
          <div style={{
            flex: 1,
            background: "rgba(0,0,0,0.05)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "8px",
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            {telemetryLog.map((log, i) => (
              <div key={i} style={{
                color: log.includes("ANOMALY") ? "var(--red)" : log.includes("GPS") ? "var(--cyan)" : "var(--text)",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap"
              }}>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Selected / Active Array Inspector Panel */}
        <div style={{
          background: "var(--card)",
          border: `1px solid ${inspectorDefect.color}33`,
          borderLeft: `4px solid ${inspectorDefect.color}`,
          borderRadius: "12px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
              {inspectorTarget?.name} ({inspectorTarget?.id})
            </span>
            <span style={{
              background: `${inspectorDefect.color}15`,
              color: inspectorDefect.color,
              border: `1px solid ${inspectorDefect.color}33`,
              padding: "1px 6px",
              borderRadius: "10px",
              fontSize: "8px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)"
            }}>
              {inspectorDefect.label.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
            {inspectorTarget?.defect !== "healthy" && (
              <>
                <div style={{ color: "var(--text)", lineHeight: 1.4, marginBottom: "4px" }}>
                  <strong>Description: </strong>{inspectorTarget.note}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
                  <span style={{ color: "var(--text-mid)" }}>Est. Revenue Risk:</span>
                  <span style={{ color: "var(--red)", fontWeight: 700 }}>~{inspectorDefect.loss}% Output Loss</span>
                </div>
                {inspectorTarget.delta && (
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>
                    <span style={{ color: "var(--text-mid)" }}>Thermal Delta (ΔT):</span>
                    <span style={{ color: "var(--red)", fontWeight: 700 }}>+{inspectorTarget.delta}°C Overheat</span>
                  </div>
                )}
              </>
            )}
            {inspectorTarget?.defect === "healthy" && (
              <p style={{ color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>
                Array is operating within nominal parameters. Irradiance is fully optimized (100% active yield). No physical cleaning or maintenance checks required.
              </p>
            )}
            {selectedArray && (
              <button
                onClick={handleResume}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  background: "linear-gradient(135deg, var(--cyan), var(--blue))",
                  border: "none",
                  color: "#000",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)"
                }}
              >
                ▶ START AUTO-FLIGHT
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
