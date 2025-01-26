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

export const getFeatureStyle = (feature) => {
  const lineName = feature.get("Name");
  const lineColor = lineColors[lineName] || "gray";

  const baseWidth = 1.5;
  const zoomFactor = 0.6;
  const width = Math.max(baseWidth + (11 - 10) * zoomFactor, 1);

  return new Style({
    stroke: new Stroke({
      color: lineColor,
      width: width,
      lineCap: "round",
      lineJoin: "round",
    }),
  });
};