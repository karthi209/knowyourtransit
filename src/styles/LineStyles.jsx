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
    glow: `rgba(${r}, ${g}, ${b}, 0.08)`,
    highlight: `rgba(${r}, ${g}, ${b}, 0.4)`,
    pulse: `rgba(${r}, ${g}, ${b}, 0.2)`
  };
};

export const getFeatureStyle = (feature, currentZoom, selectedLine = null) => {
  const lineName = feature.get("Name");
  if (!lineName) return new Style({});

  const cleanLineName = lineName.replace(/\s+/g, "");
  const lineColor = lineColors[cleanLineName] || "#9E9E9E";
  const shadows = createMaterialShadow(lineColor);

  // Adjusted base width for smoother appearance
  const baseWidth = 2.5;
  const zoomFactor = 0.35;
  const width = Math.max(baseWidth + (currentZoom - 10) * zoomFactor, 2);

  // Create the base style
  const baseStyle = new Style({
    stroke: new Stroke({
      color: lineColor,
      width: width,
      lineDash: selectedLine === lineName ? [] : [10, 5], // Solid line for selected, dashed for others
    }),
  });

  // If this is the selected line, add multiple glow effects for a pop effect
  if (selectedLine === lineName) {
    return [
      // Outer pulse effect
      new Style({
        stroke: new Stroke({
          color: shadows.pulse,
          width: width + 8,
        }),
      }),
      // Middle glow
      new Style({
        stroke: new Stroke({
          color: shadows.highlight,
          width: width + 6,
        }),
      }),
      // Inner glow
      new Style({
        stroke: new Stroke({
          color: shadows.glow,
          width: width + 4,
        }),
      }),
      // Base line
      baseStyle,
    ];
  }

  return baseStyle;
};