import React, { useState, useEffect } from "react";

export default function MobileDeployModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("approach1"); // "approach1" | "approach2"
  const [serverStatus, setServerStatus] = useState("checking"); // "checking" | "online" | "offline"
  
  const mobileUrl = "http://10.72.50.38:5173/";
  const laptopUrl = "http://localhost:5173/";

  useEffect(() => {
    if (isOpen) {
      fetch("/api/health")
        .then(res => res.json())
        .then(data => {
          if (data && data.status === "online") {
            setServerStatus("online");
          } else {
            setServerStatus("offline");
          }
        })
        .catch(() => setServerStatus("offline"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = mobileUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
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
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92dvh",
          overflowY: "auto",
          background: "var(--card)",
          borderRadius: "16px",
          border: "1.5px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
          padding: "24px"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>📱</span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                SolarScan AI — Mobile & Multi-Device Deployment
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-mid)", margin: "4px 0 0 0" }}>
              Self-contained dual deployment for field laptops, tablets, and smartphones with AI model and database synchronization.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px 8px"
            }}
          >
            ✕
          </button>
        </div>

        {/* Server & Network Status Pill */}
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: serverStatus === "online" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            border: `1px solid ${serverStatus === "online" ? "var(--green)" : "var(--amber)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: serverStatus === "online" ? "var(--green)" : "var(--amber)"
              }}
            />
            <span style={{ color: serverStatus === "online" ? "var(--green)" : "var(--amber)" }}>
              {serverStatus === "online" 
                ? "Local Edge Backend Active (FastAPI port 8000 • Central SQLite connected)"
                : "Standalone On-Device Mode (Local Client Database Active)"}
            </span>
          </div>

          <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            IP: 10.72.50.38
          </span>
        </div>

        {/* Approach Selector Tabs */}
        <div
          style={{
            display: "flex",
            background: "var(--bg)",
            borderRadius: "10px",
            padding: "4px",
            gap: "4px",
            border: "1.5px solid var(--border)",
            marginBottom: "18px"
          }}
        >
          <button
            type="button"
            id="tab-approach1"
            onClick={() => setActiveTab("approach1")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "approach1" ? "var(--cyan)" : "transparent",
              color: activeTab === "approach1" ? "#fff" : "var(--text-dim)",
              fontWeight: 800,
              fontSize: "12.5px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>📡</span> Approach 1: Connected Edge Network
          </button>

          <button
            type="button"
            id="tab-approach2"
            onClick={() => setActiveTab("approach2")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "approach2" ? "var(--cyan)" : "transparent",
              color: activeTab === "approach2" ? "#fff" : "var(--text-dim)",
              fontWeight: 800,
              fontSize: "12.5px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>📱</span> Approach 2: Standalone On-Device App
          </button>
        </div>

        {/* ================= APPROACH 1 CONTENT ================= */}
        {activeTab === "approach1" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "14px",
                background: "rgba(2, 132, 199, 0.08)",
                border: "1px solid rgba(2, 132, 199, 0.25)",
                borderRadius: "10px",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "var(--text-mid)"
              }}
            >
              <strong style={{ color: "var(--cyan)", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                Field Mesh Mode: Laptop as Edge Hub + Mobile Phones as Field Scanners
              </strong>
              In this approach, the laptop acts as the central field server running the persistent SQLite database (<code>backend/solarscan.db</code>) and high-speed Python AI engine. Any smartphone or tablet connected to the same Wi-Fi, hotspot, or field router can open the link below. Scans taken on your phone immediately sync to the central database in real time!
            </div>

            {/* Links and QR Code Card */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: "16px",
                alignItems: "center",
                padding: "16px",
                background: "var(--bg)",
                borderRadius: "12px",
                border: "1.5px solid var(--border)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "4px" }}>
                    📱 Mobile Phone / Tablet Link (Same Wi-Fi):
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      id="input-mobile-url"
                      readOnly
                      value={mobileUrl}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        color: "var(--cyan)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        fontWeight: 700
                      }}
                    />
                    <button
                      id="btn-copy-mobile-link"
                      onClick={handleCopyLink}
                      style={{
                        padding: "8px 14px",
                        background: copied ? "var(--green)" : "var(--cyan)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "4px" }}>
                    💻 Laptop Browser Link:
                  </label>
                  <input
                    type="text"
                    id="input-laptop-url"
                    readOnly
                    value={laptopUrl}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                  💡 <em>Connect both devices to the same Wi-Fi, or turn on your phone mobile hotspot and connect your laptop to it. Zero internet required!</em>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <img
                  id="img-mobile-qr"
                  src="/solarscan_mobile_qr.png"
                  alt="Scan with phone camera"
                  style={{ width: "150px", height: "150px", objectFit: "contain" }}
                />
                <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                  📷 SCAN WITH PHONE CAMERA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= APPROACH 2 CONTENT ================= */}
        {activeTab === "approach2" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "14px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "10px",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "var(--text-mid)"
              }}
            >
              <strong style={{ color: "var(--green)", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                Autonomous Standalone Mode: 100% On-Device Mobile App + Local Database
              </strong>
              Take ONLY your mobile phone into remote solar fields without carrying a laptop. The mobile application operates completely self-contained with its own <strong>On-Device Local Database</strong> and <strong>In-Browser Multi-Spectral AI Model</strong>. All scans are preserved locally, and automatically sync to the central database when you return!
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div
                style={{
                  padding: "14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "18px" }}>💾</span>
                  <strong style={{ fontSize: "12.5px", color: "var(--text)" }}>On-Device Mobile Database</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "var(--text-mid)", lineHeight: 1.5 }}>
                  <li>Stores all scans, bounding boxes, and audit hashes in on-device storage.</li>
                  <li>No network connection needed to record scans or create work orders.</li>
                  <li>Includes <strong>"Sync Offline Scans"</strong> button in Database Manager to push local records to the central SQLite database upon reconnecting.</li>
                </ul>
              </div>

              <div
                style={{
                  padding: "14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🧠</span>
                  <strong style={{ fontSize: "12.5px", color: "var(--text)" }}>On-Device AI & CV Engine</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "var(--text-mid)", lineHeight: 1.5 }}>
                  <li>Executes directly on the phone CPU/GPU via JavaScript and HTML5 Canvas.</li>
                  <li>Detects thermal hotspots, silicon cracks, and soiling with sub-150ms latency.</li>
                  <li>Direct hardware camera integration with pinch-to-zoom and flash diagnostics.</li>
                </ul>
              </div>
            </div>

            {/* Installation Instructions */}
            <div
              style={{
                padding: "14px",
                background: "var(--bg)",
                border: "1.5px solid var(--border)",
                borderRadius: "10px"
              }}
            >
              <strong style={{ fontSize: "12px", color: "var(--text)", display: "block", marginBottom: "8px" }}>
                How to Install as a Native Mobile App on Your Phone:
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px", color: "var(--text-mid)" }}>
                <div style={{ padding: "10px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <strong style={{ color: "var(--cyan)", display: "block", marginBottom: "4px" }}>🤖 Android (Chrome):</strong>
                  1. Open <code>{mobileUrl}</code> on your phone.<br />
                  2. Tap the 3 dots menu (⋮) at top-right.<br />
                  3. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                  4. Launches full-screen like a native APK!
                </div>

                <div style={{ padding: "10px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <strong style={{ color: "var(--cyan)", display: "block", marginBottom: "4px" }}>🍎 iPhone / iPad (Safari):</strong>
                  1. Open <code>{mobileUrl}</code> in Safari.<br />
                  2. Tap the Share icon (square with arrow ↑).<br />
                  3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                  4. The SolarScan AI icon is added to your home screen!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              background: "var(--cyan)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
