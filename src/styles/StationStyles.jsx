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

  // Show circles at appropriate zoom levels (e.g., 13+)
  if (zoomLevel >= 13) { // Show circles from zoom 13 onwards
    // Adjust size based on zoom for better visibility
    const circleRadius = Math.max(3, Math.min(8, (zoomLevel - 12) * 2)); // Example: radius 3 at zoom 13, 5 at zoom 14, 7 at zoom 15 etc., max 8

    styles.push(
      new Style({
        image: new CircleStyle({
          radius: circleRadius,
          fill: new Fill({
            color: 'rgba(168, 85, 247, 0.6)', // Use purple with some opacity for fill
          }),
          stroke: new Stroke({
            color: 'rgba(255, 255, 255, 0.8)', // Use white with some opacity for stroke
            width: 2,
          }),
        }),
      })
    );
  }

  return styles;
};

export default getStationStyle;
