import React, { useRef, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "ol/ol.css";
import { Map, View } from "ol";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Overlay from "ol/Overlay";
import MVT from "ol/format/MVT";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke, Text, Circle } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import { getCenter } from "ol/extent";

const App = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [lineStations, setLineStations] = useState([]);

  // State to manage the visibility of lines
  const [visibleLines, setVisibleLines] = useState({
    "BlueLine": true,
    "GreenLine": true,
    "RedLine": true,
    "OrangeLine": true,
    "PurpleLine": true,
    "NorthLine": true,
    "SouthLine": true,
    "WestLine": true,
    "MRTSLine": true,
  });

  const lineColors = {
    "BlueLine": "#3280c3",
    "GreenLine": "#52b747",
    "RedLine": "#e50000",
    "OrangeLine": "#f76300",
    "PurpleLine": "#790079",
    "MRTSLine": "#008080",
    "SouthLine": "#a9a9a9",
    "WestLine": "#0ddd22",
    "NorthLine": "#a0522d",
  };

  // State to manage dropdown visibility
  const [dropdowns, setDropdowns] = useState({
    Metro: true,
    Suburban: true,
    MRTS: true,
    MTC: true,
  });

  // Define group-to-line mapping
  const layerGroups = {
    Metro: ["BlueLine", "GreenLine", "RedLine", "OrangeLine", "PurpleLine"],
    Suburban: ["NorthLine", "SouthLine", "WestLine"],
    MRTS: ["MRTSLine"],
    MTC: [], // No lines for MTC yet
  };

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}@2x.png",
      }),
    });

    const vtLayer = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: "http://localhost:8000/tiles/lines/{z}/{x}/{y}.mvt",
        overlaps: false,
      }),
      transition: 0,
      renderBuffer: 200,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: (feature) => getFeatureStyle(feature),
    });

    const geojsonLayer = new VectorLayer({
      source: new VectorSource({
        url: "/stations.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
        }),
      }),
      style: (feature) => {
        const map = mapInstanceRef.current;
        const zoomLevel = map.getView().getZoom();
        const radius = 2 + (zoomLevel - 10) * 0.5;

        const associatedLines = feature.get("lines"); // Array of line names associated with the station
        const baseColor = "red"; // Default station color
        const stationPosition = feature.getGeometry().getCoordinates();

        if (associatedLines && associatedLines.length > 1) {
          // Offset logic for overlapping stations
          const angleStep = (2 * Math.PI) / associatedLines.length;
          const styles = associatedLines.map((line, index) => {
            const angle = index * angleStep;
            const offsetX = Math.cos(angle) * 5; // Adjust offset size
            const offsetY = Math.sin(angle) * 5;

            const offsetPosition = [
              stationPosition[0] + offsetX,
              stationPosition[1] + offsetY,
            ];

            return new Style({
              image: new Circle({
                radius: radius,
                fill: new Fill({ color: lineColors[line] || baseColor }),
                stroke: new Stroke({ color: "white", width: 1 }),
              }),
              geometry: new Point(offsetPosition), // Apply offset
            });
          });

          return styles;
        }

        return new Style({
          image: new Circle({
            radius: radius,
            fill: new Fill({ color: baseColor }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
        });
      },
    });

    const stationPopup = new Overlay({
      element: stationPopupRef.current,
      positioning: "bottom-center",
      offset: [0, -10],
      autoPan: true,
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [baseLayer, vtLayer, geojsonLayer],
      view: new View({
        center: fromLonLat([80.237617, 13.067439]),
        zoom: 11,
        minZoom: 11,
        maxZoom: 22,
      }),
      overlays: [stationPopup],
      pixelRatio: 2, // Increase pixel ratio for crisper rendering
      renderer: 'canvas', // Ensure anti-aliasing is enabled
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const vtLayer = map.getLayers().getArray().find((layer) => layer instanceof VectorTileLayer);
    if (vtLayer) {
      vtLayer.setStyle((feature) => getFeatureStyle(feature));
    }
  }, [visibleLines]);

  // Function to generate styles dynamically
  const getFeatureStyle = (feature) => {
    const lineName = feature.get("Name"); // Ensure this matches the property in your data
    const lineColor = lineColors[lineName] || "gray"; // Fallback to gray if lineName is not found
  
    // Hide the line if it's not visible
    if (!visibleLines[lineName]) {
      return null; // Return null to hide the feature
    }
  
    const map = mapInstanceRef.current;
    const zoomLevel = map.getView().getZoom();
    const baseWidth = 1.5;
    const zoomFactor = 0.6;
    const dynamicWidth = Math.max(baseWidth + (zoomLevel - 10) * zoomFactor, 1);
  
    // Add offset based on line order (use feature attributes or a custom order)
    const lineOrder = feature.get("Order") || 0; // Example attribute to determine order
    const offsetFactor = 2; // Adjust for space between lines
    const dynamicOffset = offsetFactor * lineOrder;
  
    return new Style({
      stroke: new Stroke({
        color: lineColor, // Apply the resolved color
        width: dynamicWidth,
        lineCap: "round",
        lineJoin: "round",
        offset: dynamicOffset, // Apply the calculated offset
      }),
    });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (groupName) => {
    setDropdowns((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Toggle visibility for individual lines
  const toggleLineVisibility = (lineName) => {
    setVisibleLines((prev) => ({
      ...prev,
      [lineName]: !prev[lineName],
    }));
  };

  // Toggle visibility for entire groups
  const toggleGroupVisibility = (groupName) => {
    const isGroupVisible = layerGroups[groupName].every((lineName) => visibleLines[lineName]);
    setVisibleLines((prev) => {
      const updatedVisibility = { ...prev };
      layerGroups[groupName].forEach((lineName) => {
        updatedVisibility[lineName] = !isGroupVisible;
      });
      return updatedVisibility;
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ flex: 1, height: "100%", position: "relative" }}
      />

      {/* Right Sidebar for Layer Control */}
      <div
        style={{
          width: "250px",
          background: "#f8f9fa",
          padding: "10px",
          borderLeft: "1px solid #ccc",
        }}
      >
        <h5>Layer Control</h5>

        {/* Generate Dropdowns Dynamically */}
        {Object.keys(layerGroups).map((groupName) => (
          <div key={groupName}>
            {/* Group Toggle */}
            <h6
              style={{
                cursor: "pointer",
                color: "#007bff",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
              onClick={() => toggleDropdown(groupName)}
            >
              {groupName} {dropdowns[groupName] ? "▼" : "▶"}
            </h6>
            {dropdowns[groupName] && (
              <div style={{ paddingLeft: "15px" }}>
                {/* Group Checkbox */}
                <label style={{ display: "block", marginBottom: "10px" }}>
                  <input
                    type="checkbox"
                    checked={layerGroups[groupName].every(
                      (lineName) => visibleLines[lineName]
                    )}
                    onChange={() => toggleGroupVisibility(groupName)}
                    style={{ marginRight: "8px" }}
                  />
                  <strong>Toggle All {groupName}</strong>
                </label>

                {/* Individual Line Checkboxes */}
                <ul style={{ listStyle: "none", padding: "0" }}>
                  {layerGroups[groupName].map((lineName) => (
                    <li key={lineName} style={{ marginBottom: "8px" }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={visibleLines[lineName]}
                          onChange={() => toggleLineVisibility(lineName)}
                          style={{ marginRight: "8px" }}
                        />
                        <span
                          style={{
                            color: lineColors[lineName],
                            fontWeight: "bold",
                          }}
                        >
                          {lineName}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popup container */}
      <div
        ref={stationPopupRef}
        className="station-popup"
        style={{
          position: "absolute",
          background: "white",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

export default App;