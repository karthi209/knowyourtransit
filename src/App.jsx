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
import { Point, LineString } from "ol/geom";
import Select from "ol/interaction/Select";
import { pointerMove } from "ol/events/condition";

const App = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedLineName, setSelectedLineName] = useState(null); // Track the selected line name

  // Mock station data (replace with your actual data source)
  const stationDetails = {
    "Central Station": {
      name: "Central",
      lines: ["BlueLine", "RedLine"],
      address: "123 Main St",
      facilities: ["Parking", "Disabled Access", "Restrooms"],
      coordinates: [80.237617, 13.067439]
    },
    "Tech Park": {
      name: "Tech Park",
      lines: ["BlueLine", "GreenLine"],
      address: "456 Tech Ave",
      facilities: ["Parking", "Wi-Fi", "Restrooms"],
      coordinates: [80.240000, 13.070000]
    },
    "University": {
      name: "University",
      lines: ["BlueLine", "PurpleLine"],
      address: "789 College Rd",
      facilities: ["Parking", "Library", "Restrooms"],
      coordinates: [80.245000, 13.075000]
    },
    // Add more station details...
  };

  // Mock line details with random data
  const lineDetails = {
    "BlueLine": {
      name: "Blue Line",
      color: "#3280c3",
      stations: ["Wimco Nagar Depot", "Wimco Nagar", "Tiruvottriyur", "Tiruvottriyur Theradi", "Kaladipet"],
      length: "22 km",
      avgFrequency: "10 minutes"
    },
    "GreenLine": {
      name: "Green Line",
      color: "#52b747",
      stations: ["Tech Park", "East End", "North Side"],
      length: "18 km",
      avgFrequency: "12 minutes"
    },
    "RedLine": {
      name: "Red Line",
      color: "#e50000",
      stations: ["Central Station", "Downtown", "West Side"],
      length: "25 km",
      avgFrequency: "8 minutes"
    },
    "OrangeLine": {
      name: "Orange Line",
      color: "#f76300",
      stations: ["Downtown", "South End", "East Side"],
      length: "20 km",
      avgFrequency: "15 minutes"
    },
    "PurpleLine": {
      name: "Purple Line",
      color: "#790079",
      stations: ["University", "West Side", "North End"],
      length: "30 km",
      avgFrequency: "20 minutes"
    },
    "NorthLine": {
      name: "North Line",
      color: "#a0522d",
      stations: ["North Side", "North End", "Central Station"],
      length: "15 km",
      avgFrequency: "10 minutes"
    },
    "SouthLine": {
      name: "South Line",
      color: "#a9a9a9",
      stations: ["South End", "Downtown", "East End"],
      length: "12 km",
      avgFrequency: "7 minutes"
    },
    "WestLine": {
      name: "West Line",
      color: "#0ddd22",
      stations: ["West Side", "Central Station", "Tech Park"],
      length: "17 km",
      avgFrequency: "9 minutes"
    },
    "MRTSLine": {
      name: "MRTS Line",
      color: "#008080",
      stations: ["East End", "Downtown", "North Side"],
      length: "14 km",
      avgFrequency: "11 minutes"
    },
  };

  // State to manage the visibility of lines
  const [visibleLines, setVisibleLines] = useState({
    "BlueLine": true, "GreenLine": true, "RedLine": true, "OrangeLine": true, "PurpleLine": true, "NorthLine": true, "SouthLine": true, "WestLine": true, "MRTSLine": true,
  });

  const lineColors = {
    "BlueLine": "#3280c3", "GreenLine": "#52b747", "RedLine": "#e50000", "OrangeLine": "#f76300", "PurpleLine": "#790079", "MRTSLine": "#008080", "SouthLine": "#a9a9a9", "WestLine": "#0ddd22", "NorthLine": "#a0522d",
  };

  // State to manage dropdown visibility
  const [dropdowns, setDropdowns] = useState({
    Metro: true, Suburban: true, MRTS: true, MTC: true,
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
        tilePixelRatio: 2,
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

        const associatedLines = feature.get("lines");
        const baseColor = "red";
        const stationPosition = feature.getGeometry().getCoordinates();

        if (associatedLines && associatedLines.length > 1) {
          const angleStep = (2 * Math.PI) / associatedLines.length;
          return associatedLines.map((line, index) => {
            const angle = index * angleStep;
            const offsetX = Math.cos(angle) * 5;
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
              geometry: new Point(offsetPosition),
            });
          });
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
      pixelRatio: 2,
      renderer: 'canvas',
    });

    map.getTargetElement().style.cursor = 'grab';

    const select = new Select({
      condition: pointerMove,
    });

    select.on("select", (e) => {
      map.getTargetElement().style.cursor = e.selected.length > 0 ? 'pointer' : 'grab';
    });

    let isOnFeature = false;

    map.on('pointermove', (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
      isOnFeature = !!feature;
      map.getTargetElement().style.cursor = feature ? 'pointer' : 'grab';
    });

    let lastExtent = null;  // Store the last zoomed extent to prevent multiple zooms

    map.on('click', (e) => {
      const features = [];
      map.forEachFeatureAtPixel(e.pixel, (feature) => {
        if (feature.get('Name')) {
          features.push(feature);
        }
      });

      if (features.length > 0) {
        const feature = features[0]; // Assuming the first feature is the one to handle
        const stationName = feature.get('name');
        const lineName = feature.get('Name');

        if (stationName && stationDetails[stationName]) {
          // Handle station click
          setSelectedStation(stationDetails[stationName]);
          setSelectedLine(null);
          setSelectedLineName(null); // Reset selected line name
          const coordinates = feature.getGeometry().getCoordinates();
          stationPopup.setPosition(coordinates);
        } else if (lineName && lineDetails[lineName]) {
          // Handle line click
          setSelectedLine(lineDetails[lineName]);
          setSelectedLineName(lineName); // Set selected line name
          setSelectedStation(null);

          // Check if the feature is a line (LineString or MultiLineString)
          const geometryType = feature.getGeometry().getType();
          if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            let combinedExtent = feature.getGeometry().getExtent();  // Start with the extent of the first segment

            // If it's a MultiLineString, calculate combined extent for all segments
            if (geometryType === 'MultiLineString') {
              feature.getGeometry().getCoordinates().forEach((coords) => {
                const segment = new LineString(coords);
                const segmentExtent = segment.getExtent();
                combinedExtent = [
                  Math.min(combinedExtent[0], segmentExtent[0]),
                  Math.min(combinedExtent[1], segmentExtent[1]),
                  Math.max(combinedExtent[2], segmentExtent[2]),
                  Math.max(combinedExtent[3], segmentExtent[3]),
                ];
              });
            }

            // Check if we already zoomed to this extent (if the combined extent is the same as the last one)
            const isSameExtent = lastExtent &&
              lastExtent[0] === combinedExtent[0] &&
              lastExtent[1] === combinedExtent[1] &&
              lastExtent[2] === combinedExtent[2] &&
              lastExtent[3] === combinedExtent[3];

            if (isSameExtent) {
              console.log('Already zoomed to this extent.');
              return; // Prevent zooming again if the extent is the same
            }

            // Zoom to the combined extent of the entire line
            map.getView().fit(combinedExtent, {
              padding: [50, 50, 50, 50], // Optional padding around the extent
              duration: 1000, // Animation duration in milliseconds
              maxZoom: 12, // Adjusted maximum zoom level
              minZoom: 10, // Minimum zoom level
            });

            // Store the extent to prevent multiple zooms to the same extent
            lastExtent = combinedExtent;
          } else {
            console.warn('Clicked feature is not a line:', geometryType);
          }
        }
      }
    });

    
    map.on('pointerdown', () => {
      map.getTargetElement().style.cursor = isOnFeature ? 'pointer' : 'grabbing';
    });

    map.on('pointerdrag', () => {
      map.getTargetElement().style.cursor = 'grabbing';
    });

    map.on('pointerup', () => {
      map.getTargetElement().style.cursor = isOnFeature ? 'pointer' : 'grab';
    });

    map.addInteraction(select);
    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
    };
  }, []);

  const handleLineSelect = (lineName) => {
    setSelectedLine(lineDetails[lineName]);
    setSelectedLineName(lineName); // Set selected line name
  };

  const getFeatureStyle = (feature) => {
    const lineName = feature.get("Name");
    const lineColor = lineColors[lineName] || "gray";
  
    if (!visibleLines[lineName]) return null;
  
    const map = mapInstanceRef.current;
    const zoomLevel = map.getView().getZoom();
    const baseWidth = 1.5;
    const zoomFactor = 0.6;
    const dynamicWidth = Math.max(baseWidth + (zoomLevel - 10) * zoomFactor, 1);
  
    const lineOrder = feature.get("Order") || 0;
    const offsetFactor = 2;
    const dynamicOffset = offsetFactor * lineOrder;
  
    // Highlight the selected line
    const isSelected = lineName === selectedLineName;
    const strokeColor = isSelected ? "#FFD700" : lineColor; // Use gold color for selected line
    const strokeWidth = isSelected ? dynamicWidth + 2 : dynamicWidth; // Increase width for selected line
  
    return new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
        lineCap: "round",
        lineJoin: "round",
        offset: dynamicOffset,
      }),
    });
  };

  const toggleDropdown = (groupName) => {
    setDropdowns(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleLineVisibility = (lineName) => {
    setVisibleLines(prev => ({ ...prev, [lineName]: !prev[lineName] }));
  };

  const toggleGroupVisibility = (groupName) => {
    const isGroupVisible = layerGroups[groupName].every(lineName => visibleLines[lineName]);
    setVisibleLines(prev => {
      const updatedVisibility = { ...prev };
      layerGroups[groupName].forEach(lineName => {
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

      {/* Station Popup */}
      <div 
        ref={stationPopupRef} 
        style={{
          display: selectedStation ? 'block' : 'none',
          background: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          maxWidth: '250px'
        }}
      >
        {selectedStation && (
          <div>
            <h6>{selectedStation.name}</h6>
            <p>Lines: {selectedStation.lines.join(', ')}</p>
            <p>Address: {selectedStation.address}</p>
            <div>
              <strong>Facilities:</strong>
              <ul>
                {selectedStation.facilities.map((facility, index) => (
                  <li key={index}>{facility}</li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => {
                const selectedLines = selectedStation.lines;
                if (selectedLines.length > 0) {
                  handleLineSelect(selectedLines[0]);
                }
              }}
            >
              Show Line Details
            </button>
          </div>
        )}
      </div>

      {/* Line Details Sidebar */}
      {selectedLine && (
        <div 
          style={{
            width: '300px',
            background: '#f8f9fa',
            padding: '15px',
            borderLeft: '1px solid #ccc',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>{selectedLine.name} Details</h5>
            <button 
              onClick={() => setSelectedLine(null)} 
              style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
            >
              ×
            </button>
          </div>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Color:</strong> <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              backgroundColor: selectedLine.color 
            }}></span></p>
            <p><strong>Length:</strong> {selectedLine.length}</p>
            <p><strong>Average Frequency:</strong> {selectedLine.avgFrequency}</p>
            <div>
              <strong>Stations:</strong>
              <ul>
                {selectedLine.stations.map((station, index) => (
                  <li 
                    key={index}
                    style={{ 
                      cursor: 'pointer',
                      color: 'blue',
                      textDecoration: 'underline'
                    }}
                    onClick={() => {
                      setSelectedStation(stationDetails[station]);
                    }}
                  >
                    {station}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Layer Control Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#f8f9fa",
          padding: "10px",
          borderLeft: "1px solid #ccc",
        }}
      >
        <h5>Layer Control</h5>

        {Object.keys(layerGroups).map((groupName) => (
          <div key={groupName}>
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
              <div style={{ marginLeft: "20px" }}>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={layerGroups[groupName].every(
                      (lineName) => visibleLines[lineName]
                    )}
                    onChange={() => toggleGroupVisibility(groupName)}
                  />
                  {groupName}
                </label>

                {layerGroups[groupName].map((lineName) => (
                  <label key={lineName} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={visibleLines[lineName]}
                      onChange={() => {
                        toggleLineVisibility(lineName);
                        handleLineSelect(lineName);
                      }}
                    />
                    {lineName}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;