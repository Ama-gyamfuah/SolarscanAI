import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import math

# We import YOLO from ultralytics to execute the trained model
try:
    from ultralytics import YOLO
except ImportError:
    # Fallback dummy for initialization before ultralytics is installed
    YOLO = None

app = FastAPI(
    title="SolarScan AI — YOLOv8 Detection API",
    description="Python API Backend that loads your custom trained YOLOv8 model to scan solar panel images for defects.",
    version="1.0.0"
)

# Enable CORS so the React frontend (running on http://localhost:5173 or Vercel) can query the server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your React app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
MODEL_PATH = "best.pt"  # Place your trained best.pt (or best.tflite) weights in this folder

# Mapping class IDs from YOLO to our frontend defect keys
# This should match your dataset classes in dataset.yaml
CLASS_MAPPING = {
    0: "hotspot",
    1: "crack",
    2: "soiling",
    3: "bypass_failure",
    4: "delamination",
    5: "discoloration",
    6: "snail_trail",
    7: "pid",
    8: "snow_cover"
}

DEFECT_LOSSES = {
    "healthy": 0,
    "hotspot": 35,
    "crack": 15,
    "soiling": 12,
    "bypass_failure": 33,
    "delamination": 8,
    "discoloration": 5,
    "snail_trail": 10,
    "pid": 20,
    "snow_cover": 50
}

@app.on_event("startup")
def load_model():
    global model
    if YOLO is None:
        print("WARNING: 'ultralytics' library not found. Run 'pip install ultralytics' to enable model scans.")
        return
    
    if os.path.exists(MODEL_PATH):
        print(f"Loading custom trained YOLO weights from '{MODEL_PATH}'...")
        try:
            model = YOLO(MODEL_PATH)
            print("YOLOv8 Model loaded successfully!")
        except Exception as e:
            print(f"ERROR: Failed to load model weights: {e}")
    else:
        print(f"INFO: '{MODEL_PATH}' weights not found yet. The API will run in Simulation Mode.")

@app.post("/api/scan")
async def scan_panel(file: UploadFile = File(...)):
    """
    Endpoint receives a solar panel image file (visual, thermal, or EL),
    runs it through the custom YOLOv8 model, and returns formatted coordinates
    and classifications matching the React console layout.
    """
    global model
    
    # Read uploaded file
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Fallback to Simulation Mode if model weights are not trained yet
    if model is None:
        return run_simulation_fallback(file.filename)

    try:
        # Run YOLO inference
        # imgsz=640 is standard training size
        results = model(image, imgsz=640)[0]
        
        detections = []
        highest_loss = 0
        worst_type = "healthy"
        
        # Parse bounding boxes
        # normalized coordinates xyxyn gives values from 0.0 to 1.0 (x1, y1, x2, y2)
        boxes = results.boxes
        if boxes is not None and len(boxes) > 0:
            for i, box in enumerate(boxes):
                class_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                
                # Get coordinates
                xyxyn = box.xyxyn[0].tolist()  # [x1, y1, x2, y2] normalized
                x1, y1, x2, y2 = xyxyn
                
                # Convert to percentages (0 to 100) for the React frontend canvas overlay
                pct_x = round(x1 * 100, 2)
                pct_y = round(y1 * 100, 2)
                pct_w = round((x2 - x1) * 100, 2)
                pct_h = round((y2 - y1) * 100, 2)
                
                defect_key = CLASS_MAPPING.get(class_id, "healthy")
                
                if defect_key != "healthy":
                    loss = DEFECT_LOSSES.get(defect_key, 0)
                    if loss > highest_loss:
                        highest_loss = loss
                        worst_type = defect_key
                
                detections.append({
                  "id": f"det_{i}",
                  "type": defect_key,
                  "bbox": {
                    "x": pct_x,
                    "y": pct_y,
                    "w": pct_w,
                    "h": pct_h
                  },
                  "conf": round(conf, 2)
                })
        
        # Calculate health score based on maximum loss
        health_score = max(0, 100 - highest_loss)
        
        # Determine if image is possibly not solar
        # (YOLO classification could output high BG confidence or no panel anchors)
        is_possibly_not_solar = False
        
        # Compile response structure
        return JSONResponse(content={
            "model": "YOLOv8 Custom Trained",
            "method": "FastAPI Mobile Edge Server",
            "health_score": health_score,
            "efficiency_loss": highest_loss,
            "isPossiblyNotSolar": is_possibly_not_solar,
            "detections": detections
        })
        
    except Exception as e:
        # Graceful error reporting if inference crashes
        return JSONResponse(status_code=500, content={
            "error": f"Model inference crashed: {e}"
        })

def run_simulation_fallback(filename: str):
    """
    Simulation mode returns realistic defect coordinates and values if 
    the model weights file best.pt is not present in the backend directory yet.
    """
    filename_lower = filename.lower()
    
    # Classify simulated defects based on filename keywords
    if "hotspot" in filename_lower or "thermal" in filename_lower:
        defect_type = "hotspot"
        detections = [{
            "id": "sim_det_1",
            "type": "hotspot",
            "bbox": {"x": 35.0, "y": 20.0, "w": 8.5, "h": 12.0},
            "conf": 0.94
        }]
    elif "crack" in filename_lower or "el" in filename_lower:
        defect_type = "crack"
        detections = [{
            "id": "sim_det_1",
            "type": "crack",
            "bbox": {"x": 12.0, "y": 45.0, "w": 40.0, "h": 2.5},
            "conf": 0.88
        }]
    elif "dust" in filename_lower or "sand" in filename_lower or "soil" in filename_lower:
        defect_type = "soiling"
        detections = [{
            "id": "sim_det_1",
            "type": "soiling",
            "bbox": {"x": 5.0, "y": 5.0, "w": 90.0, "h": 90.0},
            "conf": 0.96
        }]
    elif "snow" in filename_lower:
        defect_type = "snow_cover"
        detections = [{
            "id": "sim_det_1",
            "type": "snow_cover",
            "bbox": {"x": 0.0, "y": 0.0, "w": 100.0, "h": 100.0},
            "conf": 0.98
        }]
    else:
        # Healthy panel default fallback
        return JSONResponse(content={
            "model": "YOLOv8 Edge (Simulation Mode)",
            "method": "FastAPI Fallback Engine",
            "health_score": 100,
            "efficiency_loss": 0,
            "isPossiblyNotSolar": False,
            "detections": []
        })
        
    loss = DEFECT_LOSSES.get(defect_type, 0)
    
    return JSONResponse(content={
        "model": "YOLOv8 Edge (Simulation Mode)",
        "method": "FastAPI Fallback Engine",
        "health_score": 100 - loss,
        "efficiency_loss": loss,
        "isPossiblyNotSolar": False,
        "detections": detections
    })

if __name__ == "__main__":
    import uvicorn
    # Start the local server on http://localhost:8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
