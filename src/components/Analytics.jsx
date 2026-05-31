import React, { useState, useEffect } from "react";
import { DEFECTS, getDefectIconComponent } from "./ScanLab";
import {
  AnalyticsIcon,
  ScanIcon,
  ShieldAlertIcon,
  HeartIcon,
  TrendDownIcon,
  LayersIcon
} from "./Icons";

// Simple animated bar helper
function AnimBar({ value, color, max = 100, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 200 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);

  return (
    <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: color,
          borderRadius: "3px",
          transition: "width 1.2s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </div>
  );
}

export default function Analytics({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-mid)" }} className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><AnalyticsIcon size={64} color="var(--cyan)" /></div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          No Scan Analytics Available
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-mid)", maxWidth: "320px", margin: "0 auto", lineHeight: 1.6 }}>
          Run your first solar panel analysis in the <strong>Scan Lab</strong> tab to unlock real-time fleet health trends.
        </p>
      </div>
    );
  }

  // Calculate aggregated stats
  const totalScans = history.length;
  
  const allDetections = history.flatMap(h => h.result.detections);
  const totalDefects = allDetections.filter(d => d.type !== "healthy").length;
  
  const criticalDefects = allDetections.filter(
    d => DEFECTS[d.type]?.severity === "critical"
  ).length;

  const avgHealth = history.reduce((sum, h) => sum + h.result.health_score, 0) / totalScans;
  const avgLoss = history.reduce((sum, h) => sum + h.result.efficiency_loss, 0) / totalScans;

  // Defect distribution counts
  const defectCounts = allDetections
    .filter(d => d.type !== "healthy")
    .reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {});

  const totalDetectionsCount = Object.values(defectCounts).reduce((a, b) => a + b, 0) || 1;

  // Sparkline coordinates mapping
  // Take last 8 scans chronologically (reverse the history which is newest-first)
  const trendHistory = [...history].slice(0, 8).reverse();
  const trendData = trendHistory.map((h, idx) => ({
    x: idx,
    health: Math.round(h.result.health_score),
    label: new Date(h.result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const W = 360;
  const H = 100;
  const PAD = 10;
  
  const getX = (i) => PAD + (i / Math.max(trendData.length - 1, 1)) * (W - PAD * 2);
  const getY = (h) => H - PAD - (h / 100) * (H - PAD * 2);

  const points = trendData.map((d, i) => ({ x: getX(i), y: getY(d.health) }));
  
  const linePath = points.length > 1
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
    : "";

  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`
    : "";

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tab Title */}
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--cyan)" }}>Fleet Health Analytics</h2>
        <span style={{ fontSize: "11px", color: "var(--text-mid)" }}>Aggregate diagnostics and performance trends</span>
      </div>

      {/* Aggregate Stats Cards Grid */}
      <div className="responsive-grid-2">
        {[
          [<ScanIcon size={20} color="var(--cyan)" />, "Scans Completed", totalScans, "var(--cyan)"],
          [<ShieldAlertIcon size={20} color={criticalDefects > 0 ? "var(--red)" : "var(--green)"} />, "Critical Anomalies", criticalDefects, criticalDefects > 0 ? "var(--red)" : "var(--green)"],
          [<HeartIcon size={20} color={avgHealth > 70 ? "var(--green)" : avgHealth > 40 ? "var(--amber)" : "var(--red)"} />, "Mean Health Score", `${Math.round(avgHealth)}%`, avgHealth > 70 ? "var(--green)" : avgHealth > 40 ? "var(--amber)" : "var(--red)"],
          [<TrendDownIcon size={20} color="var(--pink)" />, "Mean Efficiency Loss", `${avgLoss.toFixed(1)}%`, "var(--pink)"]
        ].map(([ic, label, val, color]) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>{ic}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: "10px", color: "var(--text-mid)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Trend sparkline */}
      {trendData.length > 1 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><AnalyticsIcon size={16} color="var(--cyan)" /> Health Score History Trend</span>
            <span style={{ fontSize: "10px", color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>
              Last {trendData.length} evaluations
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {/* grid lines */}
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={PAD}
                  y1={PAD + ratio * (H - PAD * 2)}
                  x2={W - PAD}
                  y2={PAD + ratio * (H - PAD * 2)}
                  stroke="var(--border)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              ))}

              {/* trend fill area */}
              {areaPath && <path d={areaPath} fill="url(#trendGrad)" />}

              {/* trend line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* data point nodes */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="var(--bg)"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: "8px", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
              <span>{trendData[0].label}</span>
              <span>Timeline →</span>
              <span>{trendData[trendData.length - 1].label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Defect Breakdown List */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <LayersIcon size={16} color="var(--cyan)" /> Defect Distribution Breakdown
        </div>
        
        {totalDefects === 0 ? (
          <div style={{ textTransform: "uppercase", fontSize: "10px", color: "var(--text-dim)", textAlign: "center", padding: "10px 0", fontFamily: "var(--font-mono)" }}>
            No defect occurrences logged.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(defectCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count], i) => {
                const d = DEFECTS[type];
                const pct = Math.round((count / totalDetectionsCount) * 100);
                return (
                  <div key={type}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text)" }}>
                        {getDefectIconComponent(type, d?.color, 16)} {d?.label}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", color: d?.color || "var(--cyan)", fontWeight: 600 }}>
                        {count}× ({pct}%)
                      </span>
                    </div>
                    <AnimBar value={pct} color={d?.color || "var(--cyan)"} delay={i * 80} />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
