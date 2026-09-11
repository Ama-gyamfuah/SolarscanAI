import React from "react";

export default function BottomNav({ activeTab, setActiveTab, tabs, currentUser, userLevel, onLogout, onOpenLoginModal }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "var(--hardware)", // #0F172A Hardware Slate Bar
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
        boxShadow: "0 -4px 20px rgba(15, 23, 42, 0.25)"
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
              color: isActive ? "#38bdf8" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.2s",
              borderTop: isActive ? "2px solid #38bdf8" : "2px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {tab.icon(isActive ? "#38bdf8" : "#94a3b8", 22)}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: isActive ? 800 : 600,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}

      {currentUser ? (
        <button
          id="mobile-nav-logout"
          onClick={onLogout}
          style={{
            flex: 0.8,
            height: "100%",
            border: "none",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            color: "#fca5a5",
            cursor: "pointer"
          }}
          title="Sign Out"
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "10px"
            }}
          >
            🚪
          </div>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fca5a5" }}>
            Sign Out
          </span>
        </button>
      ) : (
        <button
          id="mobile-nav-login"
          onClick={() => onOpenLoginModal("signin")}
          style={{
            flex: 0.8,
            height: "100%",
            border: "none",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            color: "var(--cyan)",
            cursor: "pointer"
          }}
          title="Sign In or Join"
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.2)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "var(--cyan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "11px"
            }}
          >
            🔑
          </div>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--cyan)" }}>
            Sign In
          </span>
        </button>
      )}
    </div>
  );
}
