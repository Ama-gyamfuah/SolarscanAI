import React, { useState, useEffect } from "react";

export default function MobileDeployModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [selectedIp, setSelectedIp] = useState("10.134.87.38");
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/network-info")
        .then(res => res.json())
        .then(data => {
          if (data && data.status === "online") {
            setNetworkInfo(data);
            if (data.primary_ip) {
              setSelectedIp(data.primary_ip);
            }
            setServerStatus("online");
          } else {
            setServerStatus("offline");
          }
        })
        .catch(() => {
          setServerStatus("offline");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const phoneBrowserUrl = `http://${selectedIp}:5173/`;
  const laptopLocalUrl = "http://localhost:5173/";
  const apiDocsUrl = `http://${selectedIp}:8000/docs`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(phoneBrowserUrl)}&margin=4`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(phoneBrowserUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = phoneBrowserUrl;
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
          maxWidth: "720px",
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
              <span style={{ fontSize: "24px" }}>💻</span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Laptop Host & Phone Browser Access (iOS & Android)
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-mid)", margin: "4px 0 0 0" }}>
              The system runs on this laptop. Field technicians can connect any iPhone or Android phone via their web browser with zero app installation.
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

        {/* Server & Network Status Banner */}
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: serverStatus === "online" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            border: `1px solid ${serverStatus === "online" ? "var(--green)" : "var(--amber)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: serverStatus === "online" ? "var(--green)" : "var(--amber)",
                boxShadow: serverStatus === "online" ? "0 0 8px var(--green)" : "none"
              }}
            />
            <span style={{ color: serverStatus === "online" ? "var(--green)" : "var(--amber)" }}>
              {serverStatus === "online"
                ? "🟢 Laptop Server Active: FastAPI (Port 8000) • Vite (Port 5173) • SQLite Persistent DB"
                : "⚠️ Laptop Server Connecting..."}
            </span>
          </div>

          {networkInfo?.interfaces && networkInfo.interfaces.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Network IP:</span>
              <select
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: "11.5px",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {networkInfo.interfaces.map((iface, i) => (
                  <option key={i} value={iface.ip}>
                    {iface.interface} ({iface.ip}) {iface.is_wifi ? "★ Wi-Fi" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Core Architecture Callout */}
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "10px",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "var(--text)",
            marginBottom: "16px"
          }}
        >
          <strong style={{ color: "var(--cyan)", display: "block", marginBottom: "4px", fontSize: "13px" }}>
            ⚡ No Mobile App Required — Universal Responsive Web Architecture
          </strong>
          This laptop functions as the primary field workstation and local server. Technicians do not need to download an app from Google Play or Apple App Store. Simply connect the phone to the same Wi-Fi network (or the laptop's Mobile Hotspot) and open the URL in <strong>Safari (iOS)</strong> or <strong>Chrome (Android)</strong>.
        </div>

        {/* Links & QR Code Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "16px",
            alignItems: "center",
            padding: "16px",
            background: "var(--bg)",
            borderRadius: "12px",
            border: "1.5px solid var(--border)",
            marginBottom: "18px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", marginBottom: "4px" }}>
                📱 Universal Phone Browser URL (iOS & Android):
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  id="input-mobile-url"
                  readOnly
                  value={phoneBrowserUrl}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "var(--card)",
                    border: "1.5px solid var(--cyan)",
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
                  {copied ? "✓ Copied" : "Copy URL"}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10.5px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "4px" }}>
                💻 Laptop Desktop Browser (Local):
              </label>
              <input
                type="text"
                id="input-laptop-url"
                readOnly
                value={laptopLocalUrl}
                style={{
                  width: "100%",
                  padding: "7px 12px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11.5px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10.5px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "4px" }}>
                📡 Backend API & Documentation:
              </label>
              <input
                type="text"
                readOnly
                value={apiDocsUrl}
                style={{
                  width: "100%",
                  padding: "7px 12px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              💡 <em>Pro Tip: Turn on Windows Mobile Hotspot on this laptop. Connect your phone to the hotspot, and browse instantly with zero internet consumption!</em>
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <img
              id="img-mobile-qr"
              src={qrCodeUrl}
              alt="Scan with any smartphone camera"
              style={{ width: "160px", height: "160px", objectFit: "contain", borderRadius: "6px" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/solarscan_mobile_qr.png";
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: 900, color: "#0f172a", marginTop: "8px", textAlign: "center" }}>
              📷 SCAN WITH ANY PHONE CAMERA
            </span>
            <span style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>
              Compatible with iOS Safari & Android
            </span>
          </div>
        </div>

        {/* Step-by-Step Instructions: iOS vs Android */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* iOS Card */}
          <div
            style={{
              padding: "14px",
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🍎</span>
              <strong style={{ fontSize: "13px", color: "var(--cyan)" }}>Apple iOS (iPhone / iPad)</strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11.5px", color: "var(--text-mid)", lineHeight: 1.6 }}>
              <li>Connect iPhone to the <strong>same Wi-Fi or Laptop Hotspot</strong>.</li>
              <li>Open <strong>Safari</strong> or the built-in <strong>Camera app</strong>.</li>
              <li>Scan the QR code above or type: <code style={{ color: "var(--cyan)" }}>{phoneBrowserUrl}</code>.</li>
              <li>The SolarScan AI responsive web app opens instantly.</li>
              <li>Use the camera button in <strong>Scan Lab</strong> to take live photos of solar panels.</li>
              <li><em>Optional:</em> Tap <strong>Share (↑) &rarr; "Add to Home Screen"</strong> for a full-screen app experience.</li>
            </ol>
          </div>

          {/* Android Card */}
          <div
            style={{
              padding: "14px",
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <strong style={{ fontSize: "13px", color: "var(--green)" }}>Android (Samsung, Pixel, Tecno)</strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11.5px", color: "var(--text-mid)", lineHeight: 1.6 }}>
              <li>Connect your Android phone to the <strong>same Wi-Fi or Laptop Hotspot</strong>.</li>
              <li>Open <strong>Google Chrome</strong>, <strong>Firefox</strong>, or <strong>Samsung Internet</strong>.</li>
              <li>Scan the QR code above or type: <code style={{ color: "var(--green)" }}>{phoneBrowserUrl}</code>.</li>
              <li>The responsive interface opens directly in your browser.</li>
              <li>Capture panel defects directly with your device's camera.</li>
              <li><em>Optional:</em> Tap the 3 dots menu (⋮) &rarr; <strong>"Install / Add to Home screen"</strong>.</li>
            </ol>
          </div>
        </div>

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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
