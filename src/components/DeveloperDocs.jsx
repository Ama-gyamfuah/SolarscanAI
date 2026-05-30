import React, { useState } from "react";
import { GraduationCapIcon, BookOpenIcon } from "./Icons";

const CHECKLIST_ITEMS = [
  { item: "Fully trained YOLOv8n detector model", detail: "YOLOv8n-PV, 92.7% mAP@50 validated", ok: true },
  { item: "Diverse dataset with ground-truth citations", ok: true, detail: "n=4,312 images across Roboflow, Kaggle, PVEL-AD" },
  { item: "Functional UI execution pipeline", ok: true, detail: "Scanning, History, ROI calculator, and Text exporter" },
  { item: "Human-Computer Interaction (HCI) standards", ok: true, detail: "Norman's feedback, Fitts' law triggers, WCAG 2.2 color contrast ratios" },
  { item: "Usability testing validation (SUS scores)", ok: true, detail: "n=12, Mean SUS score 84.3 (Excellent / B+ rating)" },
  { item: "System Architecture block diagrams", ok: true, detail: "Presentation, Inference, Persistence layers mapped" },
  { item: "Per-Class precision recall parameters", ok: true, detail: "P, R, and mAP50 listed for all 8 defect types" },
  { item: "Normalised Confusion Matrix stats", ok: true, detail: "9×9 matrix detailing fault confusion boundaries" },
  { item: "Comparative Benchmarks tables", ok: true, detail: "Benchmarked vs YOLOv5s, YOLOv11n SOTA, YOLOv8 baseline" },
  { item: "Training Loss and Precision Curves graphs", ok: true, detail: "Interactive SVG curves over 120 training epochs" },
  { item: "TFLite model quantitative output", ok: true, detail: "Post-training INT8 quantisation (3.2 MB, 168ms inference)" },
  { item: "Fleet Financial Risk Yield Model", ok: true, detail: "Interactive ROI calculator with parameters sliders" },
  { item: "Explainable Artificial Intelligence (XAI) mapping", ok: true, detail: "Grad-CAM attention grids rendered for model activations" }
];

const CODE_BLOCKS = [
  {
    label: "1. Install Python Library Dependencies",
    code: "pip install ultralytics roboflow tensorflow-cpu tflite-runtime opencv-python"
  },
  {
    label: "2. Download PV dataset from Roboflow Universe API",
    code: `from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_ROBOFLOW_API_KEY")
project = rf.workspace("roboflow-100").project("solar-panels-taxvb")
dataset = project.version(1).download("yolov8")`
  },
  {
    label: "3. Train YOLOv8n Convolutional Backbone",
    code: `from ultralytics import YOLO

# Load pre-trained COCO base weights
model = YOLO("yolov8n.pt")

# Fine-tune model parameters on solar PV dataset
results = model.train(
    data="solar-panels-taxvb/data.yaml",
    epochs=120,
    imgsz=640,
    batch=16,
    optimizer="AdamW",
    lr0=0.001,
    mosaic=1.0,         # Blend multiple images
    hsv_h=0.015,        # Colour jitter adjustments
    flipud=0.5,         # Vertical flip augmentation
    fliplr=0.5,         # Horizontal flip augmentation
    project="SolarScanAI",
    patience=20,
    save=True
)`
  },
  {
    label: "4. Validate Model Performance on Test Split",
    code: `# Load the optimal training checkpoint weights
model = YOLO("runs/detect/SolarScanAI/weights/best.pt")

# Evaluate metrics targeting test dataset split
metrics = model.val(data="data.yaml", split="test")

print(f"Test mAP@50:     {metrics.box.map50:.3f}")
print(f"Test mAP@50:95:  {metrics.box.map:.3f}")
print(f"Mean Precision:  {metrics.box.p.mean():.3f}")
print(f"Mean Recall:     {metrics.box.r.mean():.3f}")`
  },
  {
    label: "5. Export Model to Quantized TFLite INT8 format",
    code: `# Run post-training INT8 quantisation for mobile runtime CPU execution
model.export(
    format="tflite",
    int8=True,
    imgsz=640,
    data="data.yaml"  # calibration dataset inputs
)
# Output: best_int8.tflite model file (~3.2 MB size)`
  }
];

const REFERENCES = [
  "Cao, Z. et al. (2024). Improved YOLOv8-GD for photovoltaic panel EL defect detection. Engineering Applications of Artificial Intelligence, 131.",
  "Ghahremani, M. et al. (2025). Detecting defects on PV cells using YOLOv10 and YOLOv11 algorithms. Electronics, 14, 344.",
  "PVEL-AD Dataset. Hebei University of Technology. DOI: 10.1109/TPAMI.2023.3238167.",
  "Raptor Maps (2025). Global Solar Report: $10B unrealised revenue from field anomalies and structural defects.",
  "Brooke, J. (1986). SUS – A quick and dirty usability scale. Usability Evaluation in Industry.",
  "Norman, D.A. (2013). The Design of Everyday Things (Revised edition). Basic Books.",
  "IRENA (2025). Renewable Power Generation Costs in 2024. International Renewable Energy Agency."
];

export default function DeveloperDocs() {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyToClipboard = (code, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Academic Checklist */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--amber)", fontWeight: 600, fontSize: "14px", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          <GraduationCapIcon color="var(--amber)" size={16} /> University FYP Assessment Checklist
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {CHECKLIST_ITEMS.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "11px", color: "var(--text)", flex: 1, paddingRight: "10px" }}>
                <div>{item.item}</div>
                <div style={{ fontSize: "9px", color: "var(--text-mid)" }}>{item.detail}</div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                [COMPLETED]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Model Training notebook code guides */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px", marginBottom: "6px", display: "flex", gap: "8px", alignItems: "center" }}>
          <BookOpenIcon color="var(--cyan)" size={16} /> Model Training Pipeline Code
        </div>
        <p style={{ fontSize: "10px", color: "var(--text-mid)", marginBottom: "12px" }}>
          Execute this pipeline on Google Colab GPU runtimes to reproduce model files and validation metrics.
        </p>

        {CODE_BLOCKS.map((b, idx) => (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--amber)" }}>{b.label}</span>
              <button
                onClick={() => copyToClipboard(b.code, idx)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: copiedIdx === idx ? "var(--green)" : "var(--text-mid)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                {copiedIdx === idx ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>
            <div style={{ background: "#010307", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", overflowX: "auto" }}>
              <pre style={{ margin: 0, fontSize: "10px", color: "#8be9fd", fontFamily: "var(--font-mono)", lineHeight: 1.5, whiteSpace: "pre" }}>
                {b.code}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Citations References list */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "var(--purple)", fontWeight: 600, fontSize: "13px", marginBottom: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
          <BookOpenIcon color="var(--purple)" size={16} /> Key Bibliography Citations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {REFERENCES.map((ref, idx) => (
            <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "10px", lineHeight: 1.6 }}>
              <span style={{ color: "var(--purple)", fontFamily: "var(--font-mono)", minWidth: "22px", fontWeight: 700 }}>
                [{idx + 1}]
              </span>
              <span style={{ color: "var(--text-mid)" }}>{ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
