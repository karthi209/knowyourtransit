import { Style, Stroke } from "ol/style";

export const lineColors = {
  BlueLine: "#3280c3",
  GreenLine: "#52b747",
  RedLine: "#e50000",
  OrangeLine: "#f76300",
  PurpleLine: "#790079",
  MRTSLine: "#008080",
  SouthLine: "#a9a9a9",
  WestLine: "#0ddd22",
  NorthLine: "#a0522d",
};

// Function to create a lighter version of a color for background
const lightenColor = (hex, opacity = 0.3) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getFeatureStyle = (feature, currentZoom) => {
  const lineName = feature.get("Name");
  console.log("Feature line:", lineName); // Debug

  if (!lineName) return new Style({}); // Prevent errors if lineName is missing

  const cleanLineName = lineName.replace(/\s+/g, "");
  const lineColor = lineColors[cleanLineName] || "#808080";
  console.log("Mapped Color:", lineColor); // Debug

  const baseWidth = 2;
  const zoomFactor = 0.7;
  const width = Math.max(baseWidth + (currentZoom - 10) * zoomFactor, 1);
  const backgroundColor = lightenColor(lineColor, 0.3);

  const zoomThreshold = 0; // Force visibility

  const styles = [
    new Style({
      stroke: new Stroke({
        color: lineColor,
        width: width,
        lineCap: "round",
        lineJoin: "round",
      }),
    }),
  ];

  if (currentZoom >= zoomThreshold) {
    styles.unshift(
      new Style({
        stroke: new Stroke({
          color: backgroundColor,
          width: width * 3,
          lineCap: "round",
          lineJoin: "round",
        }),
      })
    );
  }

  return styles;
};


