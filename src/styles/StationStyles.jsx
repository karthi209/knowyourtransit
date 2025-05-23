import { Style, Stroke, Fill, Icon, Circle as CircleStyle } from "ol/style";
import { Point } from "ol/geom";
import { lineColors } from "./LineStyles";

// Ease-out function for smoother scaling transitions
const easeOutScale = (zoom, minZoom, maxZoom, minScale, maxScale) => {
  const t = Math.min(Math.max((zoom - minZoom) / (maxZoom - minZoom), 0), 1);
  return minScale + (maxScale - minScale) * (1 - Math.pow(1 - t, 3)); // Ease-out curve
};

// Define station styles
export const getStationStyle = (feature, mapInstance) => {
  if (!mapInstance) return [];

  const zoomLevel = mapInstance.getView().getZoom() || 10;
  const styles = [];

  // Zoom levels:
  // < 13: Only lines visible
  // 13-14: Circles visible
  // > 14: Metro icons visible

  // Show circles between zoom 13-14
  if (zoomLevel >= 13 && zoomLevel < 14) {
    const circleSize = easeOutScale(zoomLevel, 13, 14, 1.5, 2.5);
    styles.push(
      new Style({
        image: new CircleStyle({
          radius: circleSize,
          fill: new Fill({ color: "#ffffff" }),
          stroke: new Stroke({ color: "#1565C0", width: 2 }), // Deep blue for contrast
        }),
      })
    );
  }

  // Show metro icons at zoom 14+
  if (zoomLevel >= 14) {
    const iconScale = easeOutScale(zoomLevel, 14, 16, 0.05, 0.3);
    const opacity = easeOutScale(zoomLevel, 14, 14.5, 0, 1);

    styles.push(
      new Style({
        image: new Icon({
          src: "st_icon.png",
          scale: iconScale,
          opacity: opacity,
          anchor: [0.5, 0.5],
        }),
      })
    );
  }

  return styles;
};

export default getStationStyle;
