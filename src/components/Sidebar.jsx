import React, { useState } from "react";
import { SunIcon } from "./Icons";

export default function Sidebar({ activeTab, setActiveTab, tabs, apiKey }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "240px",
        height: "100vh",
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--cyan), var(--blue))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(217, 119, 6, 0.2)",
            flexShrink: 0,
          }}
        >
          <SunIcon color="#ffffff" size={22} />
        </div>
        {!collapsed && (
          <div style={{ minWidth: "140px" }} className="animate-fade-in">
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "16px",
                color: "var(--cyan)",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              SolarScan AI
            </h1>
            <span
              style={{
                fontSize: "9px",
                color: "var(--text-mid)",
                fontFamily: "var(--font-mono)",
              }}
            >
              FYP Core Console
            </span>
          </div>
        )}
      </div>

      {/* API Key Status Indicator */}
      {!collapsed && (
        <div
          style={{
            margin: "16px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: apiKey ? "rgba(21, 128, 61, 0.06)" : "rgba(180, 83, 9, 0.06)",
            border: `1px solid ${apiKey ? "rgba(21, 128, 61, 0.15)" : "rgba(180, 83, 9, 0.15)"}`,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: apiKey ? "var(--green)" : "var(--amber)",
              boxShadow: `0 0 8px ${apiKey ? "var(--green)" : "var(--amber)"}`,
            }}
          />
          <div style={{ flex: 1, color: "var(--text)" }}>
            <strong>Vision API:</strong> {apiKey ? "Connected" : "Set API Key"}
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`nav-link-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 14px",
                border: "none",
                borderRadius: "10px",
                background: isActive ? "rgba(var(--cyan-rgb), 0.08)" : "transparent",
                color: isActive ? "var(--cyan)" : "var(--text-mid)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid var(--cyan)" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {tab.icon(isActive ? "var(--cyan)" : "var(--text-mid)", 18)}
              </div>
              {!collapsed && (
                <span className="animate-fade-in" style={{ flex: 1 }}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
        }}
      >
        {!collapsed && (
          <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", paddingLeft: "8px" }}>
            UENR IT FYP © 2025
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text-mid)",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
    </aside>
  );
}
