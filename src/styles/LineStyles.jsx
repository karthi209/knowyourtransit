import { Style, Stroke } from "ol/style";

export const lineColors = {
  BlueLine: "#2196F3",    // Material Blue
  GreenLine: "#4CAF50",   // Material Green
  RedLine: "#F44336",     // Material Red
  OrangeLine: "#FF9800",  // Material Orange
  PurpleLine: "#9C27B0",  // Material Purple
  MRTSLine: "#009688",    // Material Teal
  SouthLine: "#757575",   // Material Grey
  WestLine: "#00C853",    // Material Light Green
  NorthLine: "#795548",   // Material Brown
};

const createMaterialShadow = (baseColor) => {
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return {
    primaryShadow: `rgba(${r}, ${g}, ${b}, 0.12)`,
    secondaryShadow: `rgba(${r}, ${g}, ${b}, 0.24)`,
    glow: `rgba(${r}, ${g}, ${b}, 0.08)`
  };
};

export const getFeatureStyle = (feature, currentZoom) => {
  const lineName = feature.get("Name");
  if (!lineName) return new Style({});

  const cleanLineName = lineName.replace(/\s+/g, "");
  const lineColor = lineColors[cleanLineName] || "#9E9E9E";
  const shadows = createMaterialShadow(lineColor);

  // Adjusted base width for smoother appearance
  const baseWidth = 2.5;
  const zoomFactor = 0.35;
  const width = Math.max(baseWidth + (currentZoom - 10) * zoomFactor, 2);

  const styles = [
    // Outer glow with increased smoothing
    new Style({
      stroke: new Stroke({
        color: shadows.glow,
        width: width * 3,
        lineCap: "round",
        lineJoin: "round",
        miterLimit: 2,
        lineDashOffset: 0,
        lineDash: [],
      }),
    }),
    // Primary shadow with smoother edges
    new Style({
      stroke: new Stroke({
        color: shadows.primaryShadow,
        width: width * 2,
        lineCap: "round",
        lineJoin: "round",
        miterLimit: 2,
        lineDashOffset: 0,
        lineDash: [],
      }),
    }),
    // Secondary shadow with enhanced smoothing
    new Style({
      stroke: new Stroke({
        color: shadows.secondaryShadow,
        width: width * 1.5,
        lineCap: "round",
        lineJoin: "round",
        miterLimit: 2,
        lineDashOffset: 0,
        lineDash: [],
      }),
    }),
    // Main line with optimized smoothing
    new Style({
      stroke: new Stroke({
        color: lineColor,
        width: width,
        lineCap: "round",
        lineJoin: "round",
        miterLimit: 2,
        lineDashOffset: 0,
        lineDash: [],
      }),
    }),
  ];

  return styles;
};