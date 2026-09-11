import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Global Error Boundary — catches any unexpected React runtime crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("SolarScan AI — Unhandled Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#fcfbfa", color: "#1c1917", fontFamily: "sans-serif",
          padding: "24px", textAlign: "center"
        }}>
          <div style={{
            fontSize: "48px", marginBottom: "16px"
          }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#b91c1c" }}>
            SolarScan AI — Unexpected Error
          </h2>
          <p style={{ fontSize: "13px", color: "#57534e", maxWidth: "400px", lineHeight: 1.6, marginBottom: "24px" }}>
            An unexpected error occurred. Please refresh the page to restart the application.
            Your scan history saved in local storage is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 28px", background: "#d97706", border: "none",
              borderRadius: "8px", color: "#fff", fontWeight: 700,
              fontSize: "14px", cursor: "pointer"
            }}
          >
            Reload Application
          </button>
          <details style={{ marginTop: "20px", fontSize: "10px", color: "#a8a29e", maxWidth: "500px" }}>
            <summary style={{ cursor: "pointer" }}>Technical Details</summary>
            <pre style={{ textAlign: "left", marginTop: "8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
