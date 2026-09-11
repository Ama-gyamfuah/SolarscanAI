import React, { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  AnalyticsIcon,
  EvidenceIcon,
  ScanIcon,
  LayersIcon,
  CheckIcon
} from "./Icons";

export default function DatabaseManager({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState("feedback");
  const [stats, setStats] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [scansList, setScansList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [workOrdersList, setWorkOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [dbMode, setDbMode] = useState("central_sqlite"); // "central_sqlite" | "on_device"
  const [unsyncedScansCount, setUnsyncedScansCount] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("solarscan_auth_token") : null;
  const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

  const userClearance = currentUser?.clearance_level || (
    currentUser?.role === "admin" ? 5 :
    currentUser?.role === "asset_manager" ? 4 :
    currentUser?.role === "auditor" ? 3 :
    currentUser?.role === "drone_pilot" ? 2 : 1
  );
  const canApprove = userClearance >= 4;
  const canExport = userClearance >= 3;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Check on-device offline scans
      let offlineScans = [];
      try {
        offlineScans = JSON.parse(localStorage.getItem("solarscan_offline_scans") || "[]");
        const unsynced = offlineScans.filter(s => !s.synced);
        setUnsyncedScansCount(unsynced.length);
      } catch (_) {}

      // 1. Fetch DB Stats
      const resStats = await fetch("/api/db/stats").catch(() => null);
      if (resStats && resStats.ok) {
        setStats(await resStats.json());
        setDbMode("central_sqlite");
      } else {
        setDbMode("on_device");
      }

      // 2. Fetch Feedback
      const resFeedback = await fetch("/api/feedback").catch(() => null);
      if (resFeedback && resFeedback.ok) {
        const data = await resFeedback.json();
        setFeedbackList(data.feedback || []);
      }

      // 3. Fetch Scans (fallback to on-device scans if server offline)
      const resScans = await fetch("/api/scans?limit=50").catch(() => null);
      if (resScans && resScans.ok) {
        const data = await resScans.json();
        setScansList(data.scans || []);
      } else if (offlineScans.length > 0) {
        setScansList(offlineScans);
      }

      // 4. Fetch Users (Protected: requires Level 4)
      const resUsers = await fetch("/api/auth/users", { headers: authHeaders }).catch(() => null);
      if (resUsers && resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data.users || []);
      }

      // 5. Fetch Work Orders
      const resWo = await fetch("/api/work-orders").catch(() => null);
      if (resWo && resWo.ok) {
        const data = await resWo.json();
        setWorkOrdersList(data.work_orders || []);
      }
    } catch (err) {
      console.warn("Could not fetch DB data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApproveFeedback = async (id) => {
    if (!canApprove) {
      setActionMessage("Clearance Level 4 (IT Asset Manager) required to approve AI retraining.");
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status: "approved_for_retraining" })
      });
      if (res.ok) {
        setActionMessage(`Feedback #${id} marked as Approved for AI Retraining.`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionMessage(`Approval failed: ${err.detail || "Clearance denied"}`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to approve feedback:", err);
    }
  };

  const handleExportDataset = async (format) => {
    if (!canExport) {
      setActionMessage("Clearance Level 3 (Auditor) or higher required to export training datasets.");
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }
    try {
      const res = await fetch(`/api/feedback/export?format=${format}`, {
        headers: authHeaders
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionMessage(`Export denied: ${err.detail || "Clearance Level 3+ required"}`);
        setTimeout(() => setActionMessage(null), 4000);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solarscan_dataset.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  const handleToggleWorkOrder = async (woId, currentStatus) => {
    const nextStatus = currentStatus === "OPEN" ? "IN_PROGRESS" : currentStatus === "IN_PROGRESS" ? "RESOLVED" : "OPEN";
    try {
      const res = await fetch(`/api/work-orders/${woId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to update work order:", err);
    }
  };

  const handleSyncOfflineScans = async () => {
    try {
      const offlineScans = JSON.parse(localStorage.getItem("solarscan_offline_scans") || "[]");
      const unsynced = offlineScans.filter(s => !s.synced);
      if (unsynced.length === 0) {
        setActionMessage("All on-device scans are already synced with Central Database.");
        setTimeout(() => setActionMessage(null), 3500);
        return;
      }
      setLoading(true);
      let syncedCount = 0;
      for (const scan of unsynced) {
        try {
          const res = await fetch("/api/scans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scan)
          });
          if (res.ok) {
            const data = await res.json();
            scan.synced = true;
            scan.server_id = data.id;
            syncedCount++;
          }
        } catch (_) {}
      }
      localStorage.setItem("solarscan_offline_scans", JSON.stringify(offlineScans));
      setUnsyncedScansCount(unsynced.length - syncedCount);
      setActionMessage(`✓ Successfully uploaded ${syncedCount} on-device offline scans to Central SQLite Database!`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchAllData();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "50px" }}>
      {/* Title Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🗄️</span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--cyan)", margin: 0 }}>
              Central Database & AI Retraining Pipeline
            </h2>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-mid)", margin: "4px 0 0 0" }}>
            Persistent SQLite Store (<code>backend/solarscan.db</code>) • Real-time Ground-Truth Corrections • Audit Registry
          </p>
        </div>

        {/* Database Status & Sync Controls */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: dbMode === "central_sqlite" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
              border: `1px solid ${dbMode === "central_sqlite" ? "var(--green)" : "var(--amber)"}`,
              fontSize: "11.5px",
              fontWeight: 700,
              color: dbMode === "central_sqlite" ? "var(--green)" : "var(--amber)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>{dbMode === "central_sqlite" ? "🟢 Central SQLite Connected" : "💾 On-Device Local DB"}</span>
          </div>

          {unsyncedScansCount > 0 && (
            <button
              id="btn-sync-offline-scans"
              onClick={handleSyncOfflineScans}
              disabled={loading}
              style={{
                padding: "7px 14px",
                background: "var(--green)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
              }}
            >
              <span>🔄</span> Sync {unsyncedScansCount} Offline Scans
            </button>
          )}

          <button
            onClick={() => handleExportDataset("json")}
            style={{
              padding: "8px 14px",
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📥 Export Dataset (JSON)
          </button>
          <button
            onClick={() => handleExportDataset("csv")}
            style={{
              padding: "8px 14px",
              background: "var(--cyan)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📊 Export CSV (Retraining)
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1.5px solid var(--green)",
            borderRadius: "8px",
            color: "var(--green)",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          ✅ {actionMessage}
        </div>
      )}

      {/* Aggregate Database Metric Cards */}
      <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <div style={{ padding: "16px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>PERSISTENT SCANS IN DB</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--cyan)", marginTop: "4px" }}>
            {stats?.scans ?? scansList.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>SQLite verified records</div>
        </div>

        <div style={{ padding: "16px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>GROUND-TRUTH FEEDBACK</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--amber)", marginTop: "4px" }}>
            {stats?.feedback_total ?? feedbackList.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>Field technician submissions</div>
        </div>

        <div style={{ padding: "16px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>APPROVED FOR RETRAINING</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--green)", marginTop: "4px" }}>
            {stats?.feedback_approved_retraining ?? feedbackList.filter(f => f.status === "approved_for_retraining").length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>Ready for YOLO fine-tuning</div>
        </div>

        <div style={{ padding: "16px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>ACTIVE SYSTEM USERS</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text)", marginTop: "4px" }}>
            {stats?.users ?? usersList.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-mid)", marginTop: "2px" }}>RBAC Enterprise accounts</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", overflowX: "auto" }}>
        {[
          { id: "feedback", label: `Ground-Truth AI Feedback (${feedbackList.length})` },
          { id: "scans", label: `Persistent Scans Registry (${scansList.length})` },
          { id: "users", label: `Enterprise User Accounts (${usersList.length})` },
          { id: "work_orders", label: `Field Work Orders (${workOrdersList.length})` }
        ].map((t) => {
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              style={{
                padding: "8px 16px",
                background: isActive ? "var(--cyan)" : "var(--card)",
                color: isActive ? "#fff" : "var(--text)",
                border: "1.5px solid",
                borderColor: isActive ? "var(--cyan)" : "var(--border)",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Ground-Truth AI Feedback Table */}
      {activeSubTab === "feedback" && (
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>Technician Ground-Truth Accuracy Submissions</h3>
              <p style={{ fontSize: "11px", color: "var(--text-mid)", margin: "2px 0 0 0" }}>
                When technicians inspect solar panels on-site, they submit real observations to correct or confirm AI detections.
              </p>
            </div>
            <button
              onClick={fetchAllData}
              style={{
                padding: "6px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              🔄 Refresh Feed
            </button>
          </div>

          {feedbackList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-dim)", fontSize: "13px" }}>
              No ground-truth feedback submitted yet. Run a panel scan in the <strong>Scan Lab</strong> and click <strong>"Submit Ground-Truth Feedback"</strong> to log real training data!
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-dim)", fontSize: "11px" }}>
                    <th style={{ padding: "8px" }}>ID</th>
                    <th style={{ padding: "8px" }}>TECHNICIAN</th>
                    <th style={{ padding: "8px" }}>AI PREDICTION</th>
                    <th style={{ padding: "8px" }}>GROUND TRUTH</th>
                    <th style={{ padding: "8px" }}>RATING</th>
                    <th style={{ padding: "8px" }}>FIELD NOTES & ENVIRONMENT</th>
                    <th style={{ padding: "8px" }}>STATUS</th>
                    <th style={{ padding: "8px" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((fb) => (
                    <tr key={fb.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>#{fb.id}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 700 }}>{fb.user_name || "Kwame Mensah"}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>{fb.user_role || "technician"}</div>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ padding: "2px 6px", background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", borderRadius: "4px", fontWeight: 700 }}>
                          {fb.original_prediction?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ padding: "2px 6px", background: "rgba(16, 185, 129, 0.1)", color: "var(--green)", borderRadius: "4px", fontWeight: 700 }}>
                          {fb.actual_defect?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--amber)", fontWeight: 800 }}>
                        {"★".repeat(fb.accuracy_rating || 5)}
                      </td>
                      <td style={{ padding: "10px 8px", maxWidth: "240px" }}>
                        <div style={{ color: "var(--text)", fontWeight: 500 }}>{fb.technician_notes}</div>
                        {fb.environmental_factors && (
                          <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "2px" }}>
                            Env: {fb.environmental_factors}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: 800,
                            background: fb.status === "approved_for_retraining" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: fb.status === "approved_for_retraining" ? "var(--green)" : "var(--amber)"
                          }}
                        >
                          {fb.status === "approved_for_retraining" ? "APPROVED FOR RETRAIN" : "PENDING REVIEW"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        {fb.status !== "approved_for_retraining" ? (
                          <button
                            onClick={() => handleApproveFeedback(fb.id)}
                            style={{
                              padding: "4px 8px",
                              background: "var(--cyan)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Approve
                          </button>
                        ) : (
                          <span style={{ color: "var(--green)", fontSize: "11px", fontWeight: 700 }}>✓ Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Persistent Scans Registry */}
      {activeSubTab === "scans" && (
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>SQLite Scans Registry (`scans` Table)</h3>
            <p style={{ fontSize: "11px", color: "var(--text-mid)", margin: "2px 0 0 0" }}>
              Permanent audit log of every solar panel scanned by field crews and drone flights.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-dim)", fontSize: "11px" }}>
                  <th style={{ padding: "8px" }}>UUID</th>
                  <th style={{ padding: "8px" }}>FILE / MODALITY</th>
                  <th style={{ padding: "8px" }}>DEFECT TYPE</th>
                  <th style={{ padding: "8px" }}>CONFIDENCE</th>
                  <th style={{ padding: "8px" }}>HEALTH</th>
                  <th style={{ padding: "8px" }}>EST. WATTS LOST</th>
                  <th style={{ padding: "8px" }}>SLA TIER</th>
                  <th style={{ padding: "8px" }}>CRYPTOGRAPHIC HASH (SHA-256)</th>
                </tr>
              </thead>
              <tbody>
                {scansList.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {s.scan_uuid?.slice(0, 10)}...
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ fontWeight: 700 }}>{s.filename || "scan.jpg"}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>{s.modality || "Visual RGB"}</div>
                    </td>
                    <td style={{ padding: "8px", fontWeight: 800, color: s.defect_type === "healthy" ? "var(--green)" : "var(--red)" }}>
                      {s.defect_type?.toUpperCase()}
                    </td>
                    <td style={{ padding: "8px" }}>{Math.round((s.confidence || 0.95) * 100)}%</td>
                    <td style={{ padding: "8px", fontWeight: 700 }}>{Math.round(s.health_score || 100)}%</td>
                    <td style={{ padding: "8px", color: "var(--amber)", fontWeight: 700 }}>{s.watts_lost || 0}W</td>
                    <td style={{ padding: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                        {s.sla_urgency || "P5 - NOMINAL"}
                      </span>
                    </td>
                    <td style={{ padding: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan)" }}>
                      {s.sha256_hash ? s.sha256_hash.slice(0, 16) + "..." : "e3b0c44298fc..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Enterprise User Accounts */}
      {activeSubTab === "users" && (
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>Registered Enterprise Users (`users` Table)</h3>
            <p style={{ fontSize: "11px", color: "var(--text-mid)", margin: "2px 0 0 0" }}>
              Role-Based Access Control personas registered in SQLite with password hashes and operational scopes.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-dim)", fontSize: "11px" }}>
                  <th style={{ padding: "8px" }}>ID</th>
                  <th style={{ padding: "8px" }}>FULL NAME</th>
                  <th style={{ padding: "8px" }}>EMAIL</th>
                  <th style={{ padding: "8px" }}>ROLE ID</th>
                  <th style={{ padding: "8px" }}>ASSIGNED FACILITY</th>
                  <th style={{ padding: "8px" }}>CONTACT</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 700 }}>#{u.id}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>{u.full_name}</td>
                    <td style={{ padding: "10px 8px", color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{u.email}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          fontSize: "11px",
                          fontWeight: 800
                        }}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--text-mid)" }}>{u.facility || "Central Facility"}</td>
                    <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{u.phone || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Field Work Orders */}
      {activeSubTab === "work_orders" && (
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>Field Maintenance Work Orders (`work_orders` Table)</h3>
            <p style={{ fontSize: "11px", color: "var(--text-mid)", margin: "2px 0 0 0" }}>
              Automated work order dispatch from AI defect classification to field technicians.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-dim)", fontSize: "11px" }}>
                  <th style={{ padding: "8px" }}>ORDER #</th>
                  <th style={{ padding: "8px" }}>ISSUE TITLE</th>
                  <th style={{ padding: "8px" }}>PANEL ID</th>
                  <th style={{ padding: "8px" }}>ASSIGNED TO</th>
                  <th style={{ padding: "8px" }}>URGENCY</th>
                  <th style={{ padding: "8px" }}>STATUS</th>
                  <th style={{ padding: "8px" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {workOrdersList.map((wo) => (
                  <tr key={wo.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{wo.work_order_id}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <div style={{ fontWeight: 700 }}>{wo.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)", maxWidth: "280px" }}>{wo.remediation_notes}</div>
                    </td>
                    <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)" }}>{wo.panel_id}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 700 }}>{wo.assigned_to}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 800,
                          background: wo.urgency.includes("CRITICAL") ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: wo.urgency.includes("CRITICAL") ? "var(--red)" : "var(--amber)"
                        }}
                      >
                        {wo.urgency}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: 800,
                          background: wo.status === "RESOLVED" ? "rgba(16, 185, 129, 0.15)" : wo.status === "IN_PROGRESS" ? "rgba(2, 132, 199, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: wo.status === "RESOLVED" ? "var(--green)" : wo.status === "IN_PROGRESS" ? "var(--cyan)" : "var(--amber)"
                        }}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <button
                        onClick={() => handleToggleWorkOrder(wo.work_order_id, wo.status)}
                        style={{
                          padding: "4px 8px",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Change Status ↻
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
