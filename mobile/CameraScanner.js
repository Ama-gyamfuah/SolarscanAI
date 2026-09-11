import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Defect definitions mapping class IDs to colors (matching your trained dataset)
const DEFECT_CLASSES = {
  0: { label: "Hotspot", color: "#ff3366" },
  1: { label: "Micro-crack", color: "#ff6d00" },
  2: { label: "Soiling", color: "#ffc107" },
  3: { label: "Bypass Fault", color: "#d500f9" },
  4: { label: "Delamination", color: "#2979ff" },
  5: { label: "Discoloration", color: "#76ff03" },
  6: { label: "Snail Trail", color: "#00e5ff" },
  7: { label: "PID Fault", color: "#ff6e40" }
};

export default function CameraScanner() {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const modelRef = useRef(null);

  // Shared value to transfer bounding boxes from the background thread to the UI thread
  const detections = useSharedValue([]);

  // 1. Request Camera Permissions & Load TFLite Model
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');

      try {
        console.log("Loading offline TFLite model weights...");
        // Loads model from android assets or ios app bundle
        modelRef.current = await loadTensorflowModel(
          require('./assets/best_int8.tflite')
        );
        setIsModelLoaded(true);
        console.log("TFLite Model loaded successfully!");
      } catch (error) {
        console.error("Failed to load TFLite model:", error);
      }
    })();
  }, []);

  // 2. High-Performance Frame Processor (runs on background thread)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!modelRef.current) return;

    // 2a. Preprocess frame buffer
    // Vision Camera automatically resizes the frame buffer to 640x640 (INT8 Tensor)
    const tensorInput = frame.toTensor({
      width: 640,
      height: 640,
      format: 'RGB',
      type: 'uint8' // uint8 for INT8 quantized models, float32 for FP32 models
    });

    // 2b. Run on-device inference
    const outputs = modelRef.current.run([tensorInput]);
    const outputTensor = outputs[0]; // Shape: [1, 12, 8400] (YOLOv8 layout: 4 bounding boxes + 8 classes)

    const parsedDetections = [];
    const numDetections = 8400; // YOLOv8 grid anchors
    const confidenceThreshold = 0.45;

    // 2c. Parse bounding box coordinates and classification indices
    for (let i = 0; i < numDetections; i++) {
      let maxConf = 0;
      let classId = -1;

      // Find the class index with the highest confidence score
      for (let c = 0; c < 8; c++) {
        const conf = outputTensor[4 + c][i];
        if (conf > maxConf) {
          maxConf = conf;
          classId = c;
        }
      }

      if (maxConf > confidenceThreshold) {
        // YOLOv8 bounding boxes output coordinates are normalized [cx, cy, w, h]
        const cx = outputTensor[0][i];
        const cy = outputTensor[1][i];
        const w = outputTensor[2][i];
        const h = outputTensor[3][i];

        // Convert normalized [cx, cy, w, h] to pixel [x, y, width, height] for the screen
        const x = (cx - w / 2) * SCREEN_WIDTH;
        const y = (cy - h / 2) * SCREEN_HEIGHT;
        const width = w * SCREEN_WIDTH;
        const height = h * SCREEN_HEIGHT;

        parsedDetections.push({
          id: `det_${i}`,
          x,
          y,
          width,
          height,
          classId,
          confidence: maxConf
        });
      }
    }

    // 2d. Update shared value to trigger re-render on UI thread
    detections.value = parsedDetections;
  }, [isModelLoaded]);

  // Loading Screens
  if (!hasPermission) return <View style={styles.center}><Text style={styles.text}>Camera permission denied</Text></View>;
  if (!device) return <View style={styles.center}><Text style={styles.text}>No back camera device found</Text></View>;
  if (!isModelLoaded) return <View style={styles.center}><ActivityIndicator size="large" color="#00e5ff" /><Text style={styles.text}>Loading YOLOv8 AI weights on-device...</Text></View>;

  return (
    <View style={styles.container}>
      {/* 3. Live Camera Preview Feed */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={15} // Limit FPS to save phone battery
      />

      {/* 4. Real-time Bounding Box Overlay SVG layer */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {detections.value.map((det) => {
          const info = DEFECT_CLASSES[det.classId] || { label: "Unknown", color: "#00e5ff" };
          return (
            <React.Fragment key={det.id}>
              {/* Bounding box outline */}
              <Rect
                x={det.x}
                y={det.y}
                width={det.width}
                height={det.height}
                stroke={info.color}
                strokeWidth="2.5"
                fill="rgba(0,0,0,0.03)"
                rx="4"
              />
              {/* Box label with confidence score */}
              <SvgText
                x={det.x}
                y={det.y - 6}
                fill={info.color}
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {`${info.label.toUpperCase()} (${Math.round(det.confidence * 100)}%)`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#94a3b8',
    marginTop: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    fontSize: 12,
  }
});
