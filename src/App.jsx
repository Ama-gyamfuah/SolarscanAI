import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import ScanLab from "./components/ScanLab";
import DroneMap from "./components/DroneMap";
import Analytics from "./components/Analytics";
import EvidenceHub from "./components/EvidenceHub";
import { ScanIcon, LayersIcon, AnalyticsIcon, EvidenceIcon, SunIcon } from "./components/Icons";
import Chatbot from "./components/Chatbot";

const TABS = [
  { id: "scan", label: "Scan Lab", icon: (color, size) => <ScanIcon color={color} size={size} /> },
  { id: "drone", label: "Drone GIS", icon: (color, size) => <LayersIcon color={color} size={size} /> },
  { id: "analytics", label: "Analytics", icon: (color, size) => <AnalyticsIcon color={color} size={size} /> },
  { id: "evidence", label: "Evidence Hub", icon: (color, size) => <EvidenceIcon color={color} size={size} /> }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("scan");
  const [apiKey, setApiKey] = useState("");
  const [history, setHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

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
      const storedKey = localStorage.getItem("solarscan_api_key");
      if (storedKey) setApiKey(storedKey);

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
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Viewport specific navigation elements */}
      {isMobile ? (
        <>
          {/* Mobile Top Header Banner */}
          <header
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border)",
              padding: "12px 16px",
              position: "sticky",
              top: 0,
              zIndex: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, var(--cyan), var(--blue))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(217, 119, 6, 0.2)",
                }}
              >
                <SunIcon color="#ffffff" size={18} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--cyan)",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.2,
                  }}
                >
                  SolarScan AI
                </h1>
                <span style={{ fontSize: "8px", color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>
                  UENR Final Year Project
                </span>
              </div>
            </div>

            {/* API Connection Indicator */}
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
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
                  color: apiKey ? "var(--green)" : "var(--amber)",
                  fontWeight: 600,
                }}
              >
                {apiKey ? "VISION ACTIVE" : "LOCAL SIM"}
              </span>
            </div>
          </header>
        </>
      ) : (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} apiKey={apiKey} />
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 16px 80px" : "24px 40px",
          maxWidth: isMobile ? "100%" : "1200px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <section className="animate-fade-up">
          {activeTab === "scan" && (
            <ScanLab onSaveScan={handleSaveScan} apiKey={apiKey} setApiKey={handleSaveApiKey} />
          )}
          {activeTab === "drone" && (
            <DroneMap />
          )}
          {activeTab === "analytics" && (
            <Analytics history={history} />
          )}
          {activeTab === "evidence" && (
            <EvidenceHub />
          )}
        </section>
      </main>

      {/* Mobile Sticky Footer */}
      {isMobile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />}

      {/* Floating AI Solar Expert Chatbot */}
      {["scan", "analytics", "evidence"].includes(activeTab) && (
        <Chatbot apiKey={apiKey} />
      )}
    </div>
  );
}
