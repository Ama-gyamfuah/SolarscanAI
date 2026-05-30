import React from "react";

const iconStyle = (color = "currentColor", size = 20) => ({
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
  width: `${size}px`,
  height: `${size}px`,
  display: "inline-block",
  verticalAlign: "middle"
});

export const ScanIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const AnalyticsIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const EvidenceIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const SUSIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const ProjectIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

// Defect outline icons
export const HotspotIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const CrackIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const SoilingIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM11 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
  </svg>
);

export const BypassIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <polygon points="12 9 15 12 12 15" />
  </svg>
);

export const DelaminationIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <line x1="4" y1="20" x2="20" y2="20" />
    <path d="M5 15c1-3 3-5 7-5s6 2 7 5" />
    <path d="M8 10c1-3 2-4 4-4s3 1 4 4" />
  </svg>
);

export const DiscolorationIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 18a6 6 0 1 0 0-12v12z" />
  </svg>
);

export const SnailTrailIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M21 12H3" />
    <path d="M18 8H6" />
    <path d="M15 16H9" />
  </svg>
);

export const PIDIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <polyline points="9 14 12 11 15 14" />
    <line x1="12" y1="17" x2="12" y2="8" />
  </svg>
);

export const HealthyIcon = ({ color, size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const KeyIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M18.8 6.8l2.2-2.2M15.5 10.1l1.5-1.5" />
  </svg>
);

export const CameraIcon = ({ color, size = 16 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const UploadIcon = ({ color, size = 48 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const ExportIcon = ({ color, size = 16 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const ROIIcon = ({ color, size = 16 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <path d="M10 10h3a1 1 0 0 1 0 2h-2a1 1 0 0 0 0 2h3" />
  </svg>
);

export const CheckIcon = ({ color, size = 16 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const SunIcon = ({ color = "currentColor", size = 20 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const DatabaseIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

export const TargetIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const LayersIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const BookOpenIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const GraduationCapIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export const AlertTriangleIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const TrendDownIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

export const ShieldAlertIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const HeartIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const LoaderIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" className="spin-slow" style={iconStyle(color, size)}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

export const CpuIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

export const RefreshIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const InfoIcon = ({ color, size = 18 }) => (
  <svg viewBox="0 0 24 24" style={iconStyle(color, size)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
