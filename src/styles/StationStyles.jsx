import { Style, Stroke, Fill, Icon, Circle as CircleStyle } from "ol/style";
import { Point } from "ol/geom";
import { lineColors } from "./LineStyles";

// Material Design shadow colors
const createMaterialShadow = (baseColor) => {
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return {
    inner: `rgba(${r}, ${g}, ${b}, 0.2)`,
    outer: `rgba(${r}, ${g}, ${b}, 0.14)`,
    ambient: `rgba(${r}, ${g}, ${b}, 0.12)`
  };
};

export const getStationStyle = (feature, mapInstance) => {
  if (!mapInstance) return [];

  const zoomLevel = mapInstance.getView().getZoom() || 10;
  const minZoom = 11;
  const maxZoom = 22;
  const transitionZoom = 13;

  const associatedLines = feature.get("lines") || [];
  const stationPosition = feature.getGeometry().getCoordinates();
  const styles = [];

  // Base station style for single-line stations
  if (!associatedLines.length) {
    if (zoomLevel < transitionZoom) {
      // Material circle style for lower zoom levels
      const circleRadius = Math.max(3, (zoomLevel - minZoom) * 1.5);
      
      // Shadow layers
      styles.push(
        new Style({
          image: new CircleStyle({
            radius: circleRadius * 1.4,
            fill: new Fill({ color: 'rgba(0, 0, 0, 0.08)' }), // Ambient shadow
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: circleRadius * 1.2,
            fill: new Fill({ color: 'rgba(0, 0, 0, 0.14)' }), // Outer shadow
          }),
        }),
        // Main circle
        new Style({
          image: new CircleStyle({
            radius: circleRadius,
            fill: new Fill({ color: '#ffffff' }),
            stroke: new Stroke({ 
              color: 'rgba(0, 0, 0, 0.12)',
              width: 1.5 
            }),
          }),
        })
      );
    } else {
      // Icon with material shadow for higher zoom levels
      const scale = Math.min(Math.max(0.2, (zoomLevel - transitionZoom) / 14), 1.5);
      
      styles.push(
        // Shadow layers
        // Main icon
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

  // Multi-line stations with material design
  const baseRadius = Math.max(3, 2 + (zoomLevel - 10) * 0.5);
  const angleStep = (2 * Math.PI) / associatedLines.length;
  const offset = Math.max(6, baseRadius * 2);

  associatedLines.forEach((line, index) => {
    const angle = index * angleStep;
    const lineColor = lineColors[line] || "#757575";
    const shadows = createMaterialShadow(lineColor);
    
    // Calculate position for this line's marker
    const markerPosition = new Point([
      stationPosition[0] + Math.cos(angle) * offset,
      stationPosition[1] + Math.sin(angle) * offset,
    ]);

    // Add shadow layers
    styles.push(
      // Outer shadow
      new Style({
        image: new CircleStyle({
          radius: baseRadius * 1.2,
          fill: new Fill({ color: shadows.outer }),
        }),
        geometry: markerPosition,
      }),
      // Main circle
      new Style({
        image: new CircleStyle({
          radius: baseRadius,
          fill: new Fill({ color: lineColor }),
          stroke: new Stroke({ 
            color: 'rgba(255, 255, 255, 0.8)',
            width: 1.5
          }),
        }),
        geometry: markerPosition,
      })
    );
  });

  // Center marker for multi-line stations
  if (associatedLines.length > 1) {
    styles.push(
      new Style({
        image: new CircleStyle({
          radius: baseRadius * 0.8,
          fill: new Fill({ color: '#ffffff' }),
          stroke: new Stroke({ 
            color: 'rgba(0, 0, 0, 0.12)',
            width: 1 
          }),
        }),
        geometry: new Point(stationPosition),
      })
    );
  }

  return styles;
};