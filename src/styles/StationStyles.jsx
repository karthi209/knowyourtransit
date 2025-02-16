import { Style, Stroke, Fill, Icon, Circle as CircleStyle } from "ol/style";
import { Point } from "ol/geom";
import { lineColors } from "./LineStyles"; // Import line color mapping

export const getStationStyle = (feature, mapInstance) => {
  if (!mapInstance) return [];

  const zoomLevel = mapInstance.getView().getZoom() || 10;
  const minZoom = 11; // Below this, station markers will be tiny circles
  const maxZoom = 22; // Beyond this, icons reach max size
  const transitionZoom = 13; // Zoom level where the icon replaces the circle

  const associatedLines = feature.get("lines") || [];
  const stationPosition = feature.getGeometry().getCoordinates();

  const styles = [];

  // 1km radius in meters (assuming Web Mercator projection)
  const radiusMeters = 800;
  // Convert meters to pixels based on zoom level
  const resolution = mapInstance.getView().getResolution();
  const radiusPixels = radiusMeters / resolution;

  // Gradient Circle for 1km radius
  // styles.push(
  //   new Style({
  //     image: new Icon({
  //       img: createGradientCircle(radiusPixels),
  //       imgSize: [radiusPixels * 2, radiusPixels * 2],
  //       anchor: [0.5, 0.5],
  //     }),
  //     geometry: new Point(stationPosition),
  //   })
  // );

  // If no associated lines, show a simple marker or circle
  if (!associatedLines.length) {
    if (zoomLevel < transitionZoom) {
      const circleRadius = Math.max(2, (zoomLevel - minZoom) * 2);
      styles.push(
        new Style({
          image: new CircleStyle({
            radius: circleRadius,
            fill: new Fill({ color: "rgba(0, 0, 0, 0.5)" }), // Semi-transparent black
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
        })
      );
    } else {
      const scale = Math.min(Math.max(0.2, (zoomLevel - transitionZoom) / 14), 2);
      styles.push(
        new Style({
          image: new Icon({
            src: "/st_icon.png",
            scale: scale,
            anchor: [0.5, 0.5],
          }),
        })
      );
    }
    return styles;
  }

  // Multi-line stations - Draw colored circles around the station
  const radius = Math.max(2, 2 + (zoomLevel - 10) * 0.5); // Adjust size based on zoom level
  const angleStep = (2 * Math.PI) / associatedLines.length;
  const offset = Math.max(5, radius * 2);

  associatedLines.forEach((line, index) => {
    const angle = index * angleStep;
    styles.push(
      new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({ color: lineColors[line] || "red" }),
          stroke: new Stroke({ color: "white", width: 1 }),
        }),
        geometry: new Point([
          stationPosition[0] + Math.cos(angle) * offset,
          stationPosition[1] + Math.sin(angle) * offset,
        ]),
      })
    );
  });

  return styles;
};

// Function to create a radial gradient canvas for the 1km radius
function createGradientCircle(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size * 2;
  canvas.height = size * 2;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size, size, 0, size, size, size);

  gradient.addColorStop(0, "rgba(0, 0, 255, 0.3)"); // Inner light blue
  gradient.addColorStop(1, "rgba(0, 0, 255, 0)"); // Outer transparent

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size, size, size, 0, 2 * Math.PI);
  ctx.fill();

  return canvas;
}
