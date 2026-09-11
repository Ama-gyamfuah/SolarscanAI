import React, { useState } from "react";
import { SunIcon, MoonIcon, SolarScanLogo } from "./Icons";

export default function Sidebar({
  activeTab,
  setActiveTab,
  tabs,
  apiKey,
  theme = "light",
  toggleTheme,
  onOpenApiModal,
  currentUser,
  userLevel = 0,
  onLogout,
  onOpenLoginModal,
  onOpenMobileModal
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "240px",
        height: "100vh",
        background: "var(--hardware)", // #0F172A Hardware Slate
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
        boxShadow: "4px 0 24px rgba(15, 23, 42, 0.08)"
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
        }}
      >
        <SolarScanLogo size={36} />
        {!collapsed && (
          <div style={{ minWidth: "140px" }} className="animate-fade-in">
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                fontSize: "16px",
                color: "#ffffff",
                letterSpacing: "0.5px",
                lineHeight: 1.2,
              }}
            >
              SOLAR SCAN
            </h1>
            <span
              style={{
                fontSize: "12px",
                color: "#38bdf8",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 800
              }}
            >
              AI Inspection System
            </span>
          </div>
        )}
      </div>

      {/* API Key Status Indicator */}
      {!collapsed && (
        <div
          onClick={onOpenApiModal}
          style={{
            padding: "10px 14px",
            margin: "12px 14px 6px 14px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title="Click to configure Google Cloud Vision API Key"
          className="animate-fade-in"
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: apiKey ? "var(--green)" : "var(--amber)",
              boxShadow: `0 0 8px ${apiKey ? "var(--green)" : "var(--amber)"}`,
            }}
          />
          <div style={{ flex: 1, color: "#cbd5e1", fontSize: "12.5px" }}>
            <strong style={{ color: "#ffffff" }}>Vision API:</strong> {apiKey ? "Connected" : "Local Mode"}
          </div>
          <span style={{ fontSize: "12px", color: "#38bdf8" }}>⚙️</span>
        </div>
      )}

      {/* Mobile App & QR Access Button */}
      {!collapsed && (
        <div
          id="btn-sidebar-mobile-deploy"
          onClick={onOpenMobileModal}
          style={{
            padding: "9px 14px",
            margin: "0 14px 6px 14px",
            borderRadius: "10px",
            background: "rgba(2, 132, 199, 0.12)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)",
            fontSize: "12.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title="Connect mobile phone or view deployment links"
          className="animate-fade-in"
        >
          <span style={{ fontSize: "14px" }}>📱</span>
          <div style={{ flex: 1, color: "#38bdf8", fontWeight: 700, fontSize: "12px" }}>
            Mobile App & QR
          </div>
          <span style={{ fontSize: "10px", background: "rgba(56, 189, 248, 0.2)", padding: "2px 6px", borderRadius: "4px", color: "#38bdf8", fontWeight: 800 }}>
            Wi-Fi / PWA
          </span>
        </div>
      )}

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          overflowY: "auto"
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
                background: isActive ? "rgba(2, 132, 199, 0.2)" : "transparent",
                color: isActive ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: isActive ? 800 : 600,
                borderLeft: isActive ? "3px solid #38bdf8" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {tab.icon(isActive ? "#38bdf8" : "#94a3b8", 20)}
              </div>
              {!collapsed && (
                <span className="animate-fade-in" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#38bdf8" : "#64748b",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700
                    }}
                  >
                    {tab.id === "scan" ? "L1" : tab.id === "drone" ? "L2" : tab.id === "evidence" ? "L3" : "L4"}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle Section */}
      {!collapsed ? (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </span>
          <button
            onClick={toggleTheme}
            style={{
              background: theme === "dark" ? "rgba(56, 189, 248, 0.15)" : "rgba(245, 158, 11, 0.15)",
              border: `1px solid ${theme === "dark" ? "#38bdf8" : "#f59e0b"}`,
              color: theme === "dark" ? "#38bdf8" : "#fde047",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              transition: "all 0.2s"
            }}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <MoonIcon size={12} color="#ffffff" /> : <SunIcon size={12} color="#fde047" />}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: "8px" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: theme === "light" ? "#ffffff" : "#fde047",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <MoonIcon size={14} color="#ffffff" /> : <SunIcon size={14} color="#fde047" />}
          </button>
        </div>
      )}

      {/* Active User Persona & Role Badge OR Guest Card */}
      {currentUser ? (
        <div
          id="sidebar-user-card"
          style={{
            margin: "0 10px 10px 10px",
            padding: collapsed ? "8px 4px" : "10px 12px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: collapsed ? "center" : "stretch"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: currentUser.role === "technician" ? "#10b981" : currentUser.role === "drone_pilot" ? "#0284c7" : currentUser.role === "asset_manager" ? "#f59e0b" : "#8b5cf6",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px",
                flexShrink: 0
              }}
            >
              {(currentUser.full_name || "KM").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {currentUser.full_name}
                </div>
                <div style={{ fontSize: "9px", color: "#38bdf8", fontWeight: 800, textTransform: "uppercase" }}>
                  LEVEL {userLevel} • {currentUser.role?.replace("_", " ")}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              <button
                id="btn-sidebar-change-pwd"
                onClick={() => onOpenLoginModal("forgot")}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  background: "rgba(56, 189, 248, 0.12)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  borderRadius: "6px",
                  color: "#38bdf8",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  transition: "all 0.2s"
                }}
                title="Change or reset password via email"
              >
                <span>🔒</span> Password
              </button>

              <button
                id="btn-sidebar-sign-out"
                onClick={onLogout}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "6px",
                  color: "#fca5a5",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  transition: "all 0.2s"
                }}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          id="sidebar-guest-card"
          style={{
            margin: "0 10px 10px 10px",
            padding: collapsed ? "8px 4px" : "10px 12px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: collapsed ? "center" : "stretch"
          }}
        >
          {!collapsed && (
            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", fontWeight: 600 }}>
              Not Signed In
            </div>
          )}
          <button
            onClick={() => onOpenLoginModal("signin")}
            style={{
              padding: "6px 10px",
              background: "var(--cyan)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px"
            }}
          >
            <span>🔑</span> {!collapsed ? "Sign In / Join" : ""}
          </button>
        </div>
      )}

      {/* Footer / Collapse Toggle */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
        }}
      >
        {!collapsed && (
          <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", paddingLeft: "8px" }}>
            UENR IT FYP © 2026
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "var(--hardware-surface)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#f8fafc",
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
