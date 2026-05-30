import React from "react";

export default function BottomNav({ activeTab, setActiveTab, tabs }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            id={`mobile-nav-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isActive ? "var(--cyan)" : "var(--text-mid)",
              cursor: "pointer",
              transition: "all 0.2s",
              borderTop: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {tab.icon(isActive ? "var(--cyan)" : "var(--text-mid)", 20)}
            </div>
            <span
              style={{
                fontSize: "9px",
                fontFamily: "var(--font-mono)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
