import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import ScanLab from "./components/ScanLab";
import DroneMap from "./components/DroneMap";
import Analytics from "./components/Analytics";
import EvidenceHub from "./components/EvidenceHub";
import DatabaseManager from "./components/DatabaseManager";
import LoginModal, { PERSONAS } from "./components/LoginModal";
import {
  ScanIcon,
  LayersIcon,
  AnalyticsIcon,
  EvidenceIcon,
  DatabaseIcon,
  SunIcon,
  MoonIcon,
  SolarScanLogo
} from "./components/Icons";
import Chatbot from "./components/Chatbot";

const ALL_TABS = [
  { id: "scan", label: "Scan Lab", icon: (color, size) => <ScanIcon color={color} size={size} /> },
  { id: "farms", label: "Solar Farms", icon: (color, size) => <LayersIcon color={color} size={size} /> },
  { id: "alerts", label: "SMS & Alerts", icon: (color, size) => <EvidenceIcon color={color} size={size} /> },
  { id: "work_orders", label: "Work Orders", icon: (color, size) => <DatabaseIcon color={color} size={size} /> },
  { id: "drone", label: "Drone GIS", icon: (color, size) => <LayersIcon color={color} size={size} /> },
  { id: "analytics", label: "Analytics", icon: (color, size) => <AnalyticsIcon color={color} size={size} /> },
  { id: "database", label: "Central DB", icon: (color, size) => <DatabaseIcon color={color} size={size} /> },
  { id: "evidence", label: "Evidence Hub", icon: (color, size) => <EvidenceIcon color={color} size={size} /> }
];

export const TAB_CLEARANCE = {
  scan: { level: 1, title: "Field Solar Technician", desc: "Single panel inspection, mobile camera diagnostics & triage" },
  drone: { level: 2, title: "Drone Inspection Pilot", desc: "Autonomous flight path GIS, waypoint telemetry & batch ingestion" },
  evidence: { level: 3, title: "QA & Warranty Auditor", desc: "Cryptographic SHA-256 evidence logs, confusion matrix & compliance certification" },
  analytics: { level: 4, title: "Solar Plant IT Asset Manager", desc: "Fleet-wide yield, financial loss analytics & degradation models" },
  database: { level: 4, title: "Solar Plant IT Asset Manager", desc: "Central SQLite database management, retraining review & YOLOv8 dataset export" }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionActive = sessionStorage.getItem("solarscan_session_active");
      if (!sessionActive) return null; // App ALWAYS starts with Sign In & Join page for fresh sessions!
      const stored = localStorage.getItem("solarscan_auth_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.email) return u;
      }
      return null;
    } catch (_) {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(() => {
    try {
      const sessionActive = sessionStorage.getItem("solarscan_session_active");
      return !sessionActive; // Must display Sign In / Join modal on app startup
    } catch (_) {
      return true;
    }
  });
  const [loginModalTab, setLoginModalTab] = useState("signin");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "scan";
    } catch (_) {
      return "scan";
    }
  });

  const userLevel = currentUser ? (
    currentUser.clearance_level || (
      currentUser.role === "admin" ? 5 :
      currentUser.role === "asset_manager" ? 4 :
      currentUser.role === "auditor" ? 4 :
      currentUser.role === "drone_pilot" ? 2 : 1
    )
  ) : 0;

  // Strict Role-Based Access Control (RBAC) filtering
  const visibleTabs = ALL_TABS.filter((t) => {
    if (!currentUser) return false;
    if (currentUser.allowedTabs && Array.isArray(currentUser.allowedTabs)) {
      return currentUser.allowedTabs.includes(t.id);
    }
    if (currentUser.role === "technician") return ["scan", "work_orders"].includes(t.id);
    if (currentUser.role === "asset_manager") return ["analytics", "database"].includes(t.id);
    if (currentUser.role === "drone_pilot") return ["scan", "drone"].includes(t.id);
    if (currentUser.role === "auditor" || currentUser.role === "admin") return true;
    return false;
  });

  // Automatically reset active tab if current role does not have permission for it
  useEffect(() => {
    if (currentUser && visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [currentUser, visibleTabs, activeTab]);

  // Verify session on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const sessionActive = sessionStorage.getItem("solarscan_session_active");
        if (!sessionActive) return; // Do not auto-authenticate if session not yet initiated
        const token = localStorage.getItem("solarscan_auth_token");
        if (!token) return;
        const res = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const matchedPersona = PERSONAS.find(p => p.role === data.user.role) || PERSONAS[0];
            setCurrentUser({
              ...data.user,
              defaultTab: matchedPersona.defaultTab,
              allowedTabs: matchedPersona.allowedTabs
            });
          }
        } else if (res.status === 401) {
          localStorage.removeItem("solarscan_auth_user");
          localStorage.removeItem("solarscan_auth_token");
          setCurrentUser(null);
        }
      } catch (_) {}
    };
    verifyToken();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem("solarscan_session_active", "true");
      localStorage.setItem("solarscan_auth_user", JSON.stringify(user));
    } catch (_) {}
    setShowLoginModal(false);
    if (user.defaultTab) {
      setActiveTab(user.defaultTab);
    }
  };

  const promptLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      const token = localStorage.getItem("solarscan_auth_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        });
      }
    } catch (_) {}
    try {
      sessionStorage.removeItem("solarscan_session_active");
      localStorage.removeItem("solarscan_auth_user");
      localStorage.removeItem("solarscan_auth_token");
    } catch (_) {}
    setCurrentUser(null);
    setShowLoginModal(true);
  };
  const [apiKey, setApiKey] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get("key");
      if (urlKey) {
        localStorage.setItem("solarscan_api_key", urlKey);
        return urlKey;
      }
      return localStorage.getItem("solarscan_api_key") || "";
    } catch (_) {
      return "";
    }
  });
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [history, setHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [theme, setTheme] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get("theme");
      if (urlTheme === "dark" || urlTheme === "light") return urlTheme;
      return localStorage.getItem("solarscan_theme") || "light";
    } catch (_) {
      return "light";
    }
  });

  // Sync theme to DOM data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("solarscan_theme", theme);
    } catch (_) {}
  }, [theme]);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);
    }
  }, []);

  // Catch PWA installation prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Sync window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hydrate local data on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get("key");
      if (urlKey) {
        setApiKey(urlKey);
        localStorage.setItem("solarscan_api_key", urlKey);
      } else {
        const storedKey = localStorage.getItem("solarscan_api_key");
        if (storedKey) setApiKey(storedKey);
      }

      const storedHistory = localStorage.getItem("solarscan_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Local storage hydration failed:", e);
    }
  }, []);

  // Save API Key helper
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    try {
      localStorage.setItem("solarscan_api_key", key);
    } catch (e) {
      console.error("Failed to write API key to localStorage:", e);
    }
  };

  // Add scan to history
  const handleSaveScan = (newScan) => {
    setHistory((prev) => {
      const updated = [newScan, ...prev].slice(0, 50); // cap history at 50 records
      try {
        localStorage.setItem("solarscan_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to write scan history to localStorage:", e);
      }
      return updated;
    });
  };

  // Clear history function (optional helper)
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("solarscan_history");
    } catch (e) {
      console.error("Failed to clear localStorage history:", e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Viewport specific navigation elements */}
      {isMobile ? (
        <>
          <header
            style={{
              background: "var(--hardware)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "calc(12px + env(safe-area-inset-top, 0px)) 16px 12px 16px",
              position: "sticky",
              top: 0,
              zIndex: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 12px rgba(15, 23, 42, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <SolarScanLogo size={28} />
              <div>
                <h1
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#ffffff",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  SOLARSCAN AI
                </h1>
                <span style={{ fontSize: "8px", color: "#38bdf8", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800 }}>
                  ITDS Console • UENR
                </span>
              </div>
            </div>

            {/* Right Controls: Theme Toggle, REST API Sandbox & API Connection Indicator */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {/* Central SQLite vs On-Device Local DB Status Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  color: "#86efac"
                }}
                title="Central SQLite Persistent Store (backend/solarscan.db) with Offline On-Device Cache Active"
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                <span>CENTRAL SQLITE DB</span>
              </div>

              <button
                onClick={toggleTheme}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: theme === "light" ? "#fde047" : "#38bdf8",
                  transition: "all 0.2s",
                }}
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <MoonIcon size={15} color="#ffffff" /> : <SunIcon size={15} color="#fde047" />}
              </button>

              <button
                onClick={() => {
                  setTempApiKey(apiKey);
                  setShowApiModal(true);
                }}
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  background: apiKey ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)",
                  border: `1px solid ${apiKey ? "rgba(34, 197, 94, 0.4)" : "rgba(234, 179, 8, 0.4)"}`,
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title="Tap to view or link Google Cloud Vision API key"
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
                <span
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-mono)",
                    color: apiKey ? "#86efac" : "#fde047",
                    fontWeight: 700,
                  }}
                >
                  {apiKey ? "VISION ACTIVE" : "LOCAL SIM"}
                </span>
              </button>
            </div>
          </header>
          {!isStandalone && !bannerDismissed && (
            <div
              style={{
                background: "linear-gradient(90deg, #0369a1, #0f172a)",
                color: "#ffffff",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                borderBottom: "1px solid rgba(56, 189, 248, 0.4)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                zIndex: 98,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "15px" }}>📲</span>
                <span style={{ fontWeight: 600 }}>Install App on Samsung / Android</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={handleInstallClick}
                  style={{
                    background: "#38bdf8",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 12px",
                    fontWeight: 800,
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  INSTALL / GUIDE
                </button>
                <button
                  onClick={() => setBannerDismissed(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "0 4px",
                  }}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={visibleTabs}
          apiKey={apiKey}
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          userLevel={userLevel}
          onLogout={promptLogout}
          onOpenLoginModal={(mode = "signin") => {
            setLoginModalTab(mode);
            setShowLoginModal(true);
          }}
          onOpenApiModal={() => {
            setTempApiKey(apiKey);
            setShowApiModal(true);
          }}
        />
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 16px calc(90px + env(safe-area-inset-bottom, 16px))" : "24px 40px",
          maxWidth: isMobile ? "100%" : "1200px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box"
        }}
      >
        {/* Active Role Workplace Status Banner OR Guest Banner */}
        {currentUser ? (
          <div
            id="banner-user-workspace"
            style={{
              padding: "12px 18px",
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: currentUser.role === "technician" ? "#10b981" : currentUser.role === "drone_pilot" ? "#0284c7" : currentUser.role === "asset_manager" ? "#f59e0b" : "#8b5cf6",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "13px",
                  flexShrink: 0
                }}
              >
                {((currentUser.full_name || currentUser.name || "KM")).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>
                    {currentUser.full_name || currentUser.name || "Kwame Mensah"}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      fontSize: "10px",
                      fontWeight: 800,
                      color: currentUser.role === "technician" ? "#10b981" : currentUser.role === "drone_pilot" ? "#0284c7" : currentUser.role === "asset_manager" ? "#f59e0b" : "#8b5cf6"
                    }}
                  >
                    LEVEL {userLevel} • {currentUser.role?.replace("_", " ").toUpperCase()} WORKSPACE
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>
                  Facility: <strong>{currentUser.facility || "Accra Solar Station #2"}</strong> • Persistent SQLite Backend Active
                </div>
              </div>
            </div>

            <button
              id="btn-sign-out"
              onClick={promptLogout}
              style={{
                padding: "8px 16px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1.5px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "8px",
                color: "var(--red)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        ) : (
          <div
            id="banner-guest-mode"
            style={{
              padding: "14px 20px",
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--hardware)",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  border: "1px solid var(--border)"
                }}
              >
                🔒
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>
                    Guest Session (Not Signed In)
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(148, 163, 184, 0.15)",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#94a3b8"
                    }}
                  >
                    SECURITY CLEARANCE REQUIRED
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>
                  Sign in with verified enterprise credentials or create a new user account to access scanning and diagnostic features.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                id="btn-guest-signin"
                onClick={() => {
                  setLoginModalTab("signin");
                  setShowLoginModal(true);
                }}
                style={{
                  padding: "8px 16px",
                  background: "var(--cyan)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>🔑</span> Sign In
              </button>

              <button
                id="btn-guest-join"
                onClick={() => {
                  setLoginModalTab("register");
                  setShowLoginModal(true);
                }}
                style={{
                  padding: "8px 16px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>➕</span> Join / Register
              </button>
            </div>
          </div>
        )}

        <section className="animate-fade-up">
          {!currentUser ? (
            <div
              id="unauthenticated-guard-card"
              style={{
                padding: "40px 24px",
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "16px",
                textAlign: "center",
                maxWidth: "560px",
                margin: "40px auto",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
              }}
            >
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>🔒</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
                Enterprise Authentication Required
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.5, marginBottom: "22px" }}>
                SolarScan AI enforces role-based access control, cryptographic SHA-256 evidence logging, and persistent SQLite database verification. Sign in or register to launch inspection tools.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => { setLoginModalTab("signin"); setShowLoginModal(true); }}
                  style={{
                    padding: "11px 24px",
                    background: "var(--cyan)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  🔑 Sign In to Console
                </button>
                <button
                  onClick={() => { setLoginModalTab("register"); setShowLoginModal(true); }}
                  style={{
                    padding: "11px 24px",
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  ➕ Join / Create Account
                </button>
              </div>
            </div>
          ) : userLevel < (TAB_CLEARANCE[activeTab]?.level || 1) ? (
            <div
              id="clearance-guard-card"
              style={{
                padding: "40px 24px",
                background: "var(--card)",
                border: "1.5px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "16px",
                textAlign: "center",
                maxWidth: "580px",
                margin: "40px auto",
                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.08)"
              }}
            >
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>🛡️</div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--red)", marginBottom: "8px" }}>
                Access Denied: Clearance Level Insufficient
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.5, marginBottom: "14px" }}>
                The <strong>{ALL_TABS.find(t => t.id === activeTab)?.label}</strong> module requires <strong>Level {TAB_CLEARANCE[activeTab]?.level} ({TAB_CLEARANCE[activeTab]?.title})</strong> clearance.
              </p>
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  display: "inline-block",
                  fontSize: "12px",
                  marginBottom: "20px"
                }}
              >
                Your Current Clearance: <strong style={{ color: "var(--cyan)" }}>Level {userLevel} ({currentUser.role?.replace("_", " ").toUpperCase()})</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "22px", maxWidth: "440px", margin: "0 auto 20px" }}>
                {TAB_CLEARANCE[activeTab]?.desc}. In order of importance to this project, this console is reserved for senior personnel.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => { setLoginModalTab("signin"); setShowLoginModal(true); }}
                  style={{
                    padding: "10px 20px",
                    background: "var(--cyan)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  🔑 Sign In with Higher Clearance Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "scan" && (
                <ScanLab onSaveScan={handleSaveScan} apiKey={apiKey} setApiKey={handleSaveApiKey} currentUser={currentUser} />
              )}
              {activeTab === "farms" && (
                <DatabaseManager currentUser={currentUser} initialSubTab="farms" />
              )}
              {activeTab === "alerts" && (
                <DatabaseManager currentUser={currentUser} initialSubTab="notifications" />
              )}
              {activeTab === "work_orders" && (
                <DatabaseManager currentUser={currentUser} initialSubTab="work_orders" />
              )}
              {activeTab === "drone" && (
                <DroneMap />
              )}
              {activeTab === "analytics" && (
                <Analytics history={history} />
              )}
              {activeTab === "database" && (
                <DatabaseManager currentUser={currentUser} initialSubTab="feedback" />
              )}
              {activeTab === "evidence" && (
                <EvidenceHub />
              )}
            </>
          )}
        </section>
      </main>

      {/* Mobile Sticky Footer */}
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={visibleTabs}
          currentUser={currentUser}
          userLevel={userLevel}
          onLogout={promptLogout}
          onOpenLoginModal={(mode = "signin") => {
            setLoginModalTab(mode);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Floating AI Solar Expert Chatbot */}
      {["scan", "drone", "analytics", "database", "evidence"].includes(activeTab) && (
        <Chatbot apiKey={apiKey} />
      )}

      {/* Mobile PWA Install Guide Modal */}
      {showInstallGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => setShowInstallGuide(false)}
        >
          <div
            style={{
              background: "var(--card-bg, #1e293b)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "var(--text, #f8fafc)",
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                  }}
                >
                  📲
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#38bdf8" }}>
                    Install SOLAR SCAN
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-dim, #94a3b8)" }}>
                    Add as standalone app on your phone
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim, #94a3b8)",
                  fontSize: "22px",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              {/* Chrome Method */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🌐</span>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#f8fafc" }}>
                    In Google Chrome (Samsung / Android):
                  </span>
                </div>
                <ol style={{ margin: "0 0 0 18px", padding: 0, fontSize: "12px", lineHeight: "1.6", color: "#cbd5e1" }}>
                  <li>Tap the <strong>three vertical dots (⋮)</strong> in the top right corner of Chrome.</li>
                  <li>Select <strong>"Add to Home screen"</strong> (or <em>"Install app"</em>).</li>
                  <li>Tap <strong>"Add"</strong> or <strong>"Install"</strong>.</li>
                </ol>
                <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#38bdf8" }}>
                  ✨ That's it! An icon named <strong>SOLAR SCAN</strong> will appear on your phone screen and app drawer, opening in full-screen mode like a downloaded app!
                </p>
              </div>

              {/* Samsung Internet Method */}
              <div
                style={{
                  background: "rgba(56, 189, 248, 0.06)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🪐</span>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#f8fafc" }}>
                    In Samsung Internet Browser:
                  </span>
                </div>
                <ol style={{ margin: "0 0 0 18px", padding: 0, fontSize: "12px", lineHeight: "1.6", color: "#cbd5e1" }}>
                  <li>Look at the top URL bar: tap the <strong>Download arrow (⬇)</strong> icon.</li>
                  <li>Or tap the bottom menu <strong>(☰)</strong> → <strong>"Add page to"</strong> → <strong>"Home screen"</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0284c7, #0284c7)",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
              }}
            >
              GOT IT, LET'S DO IT!
            </button>
          </div>
        </div>
      )}

      {/* Google Cloud Vision API Modal */}
      {showApiModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => setShowApiModal(false)}
        >
          <div
            style={{
              background: "var(--card-bg, #1e293b)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "var(--text, #f8fafc)",
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: apiKey ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                  }}
                >
                  {apiKey ? "✅" : "🔑"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: apiKey ? "#86efac" : "#fde047" }}>
                    {apiKey ? "Vision API Connected" : "Local Simulation Mode"}
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-dim, #94a3b8)" }}>
                    Google Cloud Vision & Gemini API
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim, #94a3b8)",
                  fontSize: "22px",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "18px" }}>
              {apiKey ? (
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#86efac", fontWeight: 700, marginBottom: "4px" }}>
                    🟢 Cloud Vision Is Active
                  </div>
                  <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: 1.5, wordBreak: "break-all" }}>
                    Linked Key: <code style={{ color: "#38bdf8" }}>{apiKey.slice(0, 10)}...{apiKey.slice(-4)}</code>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        handleSaveApiKey("");
                        setTempApiKey("");
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        color: "#fca5a5",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Disconnect Key
                    </button>
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}${window.location.pathname}?key=${encodeURIComponent(apiKey)}`;
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }}
                      style={{
                        background: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        color: "#38bdf8",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {copiedLink ? "✓ Link Copied!" : "📋 Copy Link for Group"}
                    </button>
                  </div>
                  {copiedLink && (
                    <div style={{ fontSize: "10px", color: "#38bdf8", marginTop: "6px" }}>
                      ✨ Link copied! Send it to your group members so their phones auto-connect with this key.
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#fde047", fontWeight: 700, marginBottom: "4px" }}>
                    🟡 Why is this device in Local Mode?
                  </div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", lineHeight: 1.5 }}>
                    Browser memory is saved separately on each device. To use live Google Cloud Vision detection on this computer or phone, paste your key or activate the presentation demo key below!
                  </p>
                </div>
              )}

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                  GOOGLE CLOUD API KEY (AIzaSy...)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{
                      flex: 1,
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontFamily: "var(--font-mono)",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={() => {
                      if (tempApiKey.trim()) {
                        handleSaveApiKey(tempApiKey.trim());
                        setShowApiModal(false);
                      }
                    }}
                    style={{
                      background: "#38bdf8",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 16px",
                      color: "#0f172a",
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    CONNECT
                  </button>
                </div>

                <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
                  <button
                    onClick={() => {
                      handleSaveApiKey("demo");
                      setShowApiModal(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid rgba(34, 197, 94, 0.5)",
                      borderRadius: "8px",
                      color: "#86efac",
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                  >
                    ⚡ Instant Connect: Presentation Demo Key
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowApiModal(false)}
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                padding: "10px",
                color: "#cbd5e1",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Role-Based Access Control Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={loginModalTab}
      />

      {/* Sign Out Confirmation Prompt Modal */}
      {showLogoutModal && (
        <div
          id="modal-logout-confirm"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "var(--card)",
              borderRadius: "16px",
              border: "1.5px solid var(--border)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              padding: "24px",
              boxSizing: "border-box"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "var(--red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0
                }}
              >
                🚪
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  Confirm Session Sign Out
                </h3>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", margin: "2px 0 0 0" }}>
                  Security Clearance Registry • Session Termination
                </p>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              Are you sure you want to sign out, <strong style={{ color: "var(--text)" }}>{currentUser?.full_name || "Operator"}</strong>?
              Your active session token will be revoked and you will need to re-enter your enterprise credentials to access the console.
            </p>

            {/* User Info Badge */}
            {currentUser && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: currentUser.role === "technician" ? "#10b981" : currentUser.role === "drone_pilot" ? "#0284c7" : currentUser.role === "asset_manager" ? "#f59e0b" : "#8b5cf6",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "12px"
                  }}
                >
                  {(currentUser.full_name || "OP").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text)" }}>
                    {currentUser.full_name}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>
                    LEVEL {userLevel} • {currentUser.role?.replace("_", " ")} • {currentUser.email}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                id="btn-cancel-signout"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer"
                }}
              >
                Cancel & Stay In
              </button>

              <button
                type="button"
                id="btn-confirm-signout"
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <span>🚪</span> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
