import React, { useRef, useEffect, useState } from "react";
import { Map, View } from "ol";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Overlay from "ol/Overlay";
import MVT from "ol/format/MVT";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke, Icon, Circle as CircleStyle } from "ol/style";
import { Point } from "ol/geom";
import { getFeatureStyle, lineColors } from "./styles";
import StationPopup from "./StationPopup";
import LinePanel from "./LinePanel";

const MapComponent = ({ setSelectedStation, setSelectedLine, visibleLines }) => {
  const [selectedStation, setSelectedStationState] = useState(null);
  const [coordinate, setCoordinate] = useState(null);
  const [selectedLineDetails, setSelectedLineDetails] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const overlayRef = useRef(null);
  const [highlightedFeature, setHighlightedFeature] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}@2x.png",
      }),
    });

    const vtLayerLines = new VectorLayer({
      source: new VectorSource({
        url: "/lines.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
          overlaps: false,
          tilePixelRatio: 2,
        }),
      }),
      style: (feature) => getFeatureStyle(feature, map.getView().getZoom()),
    });

    const vtLayerStations = new VectorLayer({
      source: new VectorSource({
        url: "/stations.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
        }),
      }),
      style: (feature) => {
        const map = mapInstanceRef.current;
        if (!map) return []; // Ensure map exists
    
        const zoomLevel = map.getView().getZoom() || 10;
    
        const minZoom = 11; // Below this, station markers will be tiny circles
        const maxZoom = 22; // Beyond this, icons reach max size
        const transitionZoom = 13; // Zoom level where the icon replaces the circle
    
        const associatedLines = feature.get("lines") || [];
        const stationPosition = feature.getGeometry().getCoordinates();
    
        const styles = [];
    
        // 1km radius in meters (assuming Web Mercator projection)
        const radiusMeters = 2000;
    
        // Convert meters to pixels based on zoom level
        const resolution = map.getView().getResolution();
        const radiusPixels = radiusMeters / resolution;
    
        // Gradient Circle for 1km radius
        styles.push(
          new Style({
            image: new Icon({
              img: createGradientCircle(radiusPixels),
              imgSize: [radiusPixels * 2, radiusPixels * 2],
              anchor: [0.5, 0.5],
            }),
            geometry: new Point(stationPosition),
          })
        );
    
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
    
        const radius = Math.max(2, 2 + (zoomLevel - 10) * 0.5);
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
      },
    });
    
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

    const vtLayerStationLayout = new VectorLayer({
      source: new VectorSource({
        url: "/stationLayouts.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
        }),
      }),
      style: (feature, resolution) => {
        // Approximate conversion from resolution to zoom for EPSG:3857:
        // zoom = log2(156543.03 / resolution)
        const zoom = Math.log2(156543.03 / resolution);
        // Only apply the style when zoom is 14 or greater.
        if (zoom >= 15) {
          return new Style({
            fill: new Fill({
              // Transparent grey fill
              color: "rgba(128, 128, 128, 0.8)",
            }),
            // No stroke is defined.
          });
        }
        // Return null to not render the features at lower zooms.
        return null;
      },
    });

    const vtLayerStationWalk = new VectorLayer({
      source: new VectorSource({
        url: "/walks.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
        }),
      }),
      style: (feature, resolution) => {
        // Approximate conversion from resolution to zoom for EPSG:3857:
        // zoom = log2(156543.03 / resolution)
        const zoom = Math.log2(156543.03 / resolution);
        // Only apply the style when zoom is 14 or greater.
        if (zoom >= 15) {
          return new Style({
            stroke: new Stroke({
              color: "rgba(106, 105, 105, 0.5)", // Transparent grey fill
              width: 2, // Line width
              lineDash: [10, 5], // Dashed line: 10px dash, 5px gap
            }),
          });
        }
        return null;
      },
    });

    overlayRef.current = new Overlay({
      element: stationPopupRef.current,
      positioning: "bottom-center",
      offset: [0, -10],
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [baseLayer, vtLayerLines, vtLayerStationLayout, vtLayerStationWalk, vtLayerStations],
      view: new View({
        center: fromLonLat([80.237617, 13.067439]),
        zoom: 11,
        minZoom: 11,
        maxZoom: 22,
      }),
      overlays: [overlayRef.current],
      pixelRatio: 2,
      renderer: "canvas",
    });

    const highlightStyle = (feature) => {
      if (!feature) {
        console.warn("No feature provided to highlightStyle");
        return null;
      }
    
      let style = feature.getStyle();
    
      // Ensure style is an array (VectorTile layers may use multiple styles)
      if (!style) {
        console.warn("Feature has no style, generating new style:", feature);
        style = getFeatureStyle(feature, visibleLines); // Use your existing style function
      }
    
      // Handle cases where OpenLayers might return an array of styles
      const styles = Array.isArray(style) ? style : [style];
    
      return styles.map((s) => {
        if (!s) return null;
    
        const image = s.getImage();
        if (image) {
          image.setScale(1.2); // Highlight effect
        }
    
        return s;
      }).filter(Boolean); // Remove any null styles
    };
    

    map.on("pointerdown", () => {
      map.getTargetElement().style.cursor = "grabbing";
    });

    map.on("pointerdrag", () => {
      map.getTargetElement().style.cursor = "grabbing";
    });

    map.on("pointerup", () => {
      map.getTargetElement().style.cursor = "grab";
    });

    map.on("click", (e) => {
      console.log("Click event triggered");
      let clickedFeature = null;
      
      map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        console.log("Found feature:", feature.getProperties());
        // Check if it's a line feature (has lineString geometry)
        if (feature.getGeometry().getType() === 'LineString') {
          clickedFeature = { type: 'line', feature };
          return true;
        }
        // Check if it's a station feature
        if (feature.get("name")) {
          clickedFeature = { type: 'station', feature };
          return true;
        }
      });

      if (!clickedFeature) {
        setSelectedStationState(null);
        setSelectedLineDetails(null);
        if (overlayRef.current) {
          overlayRef.current.setPosition(undefined);
        }
        return;
      }

      const { type, feature } = clickedFeature;
      
      if (type === 'line') {
        console.log("Line clicked:", feature.getProperties());
        handleLineClick(feature);
      } else if (type === 'station') {
        const stationName = feature.get("name");
        if (stationName) {
          handleStationClick(feature, stationName, feature.getGeometry().getCoordinates());
        }
      }
    });

    // Add hover effect for lines
    map.on("pointermove", (e) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
      overlayRef.current = null;
    };
  }, [visibleLines]);

  const handleStationClick = (feature, stationName, coordinate) => {
    console.log("Clicked station:", stationName);
    const station = {
      name: stationName,
      name_ta: feature.get("name_ta"),
      line: feature.get("line"),
      network: feature.get("network"),
      st_no: feature.get("st_no"),
      id: feature.get("id")
    };

    console.log("Setting station:", station);
    setSelectedStationState(station);
    setSelectedLineDetails(null);
    setCoordinate(coordinate);

    if (overlayRef.current) {
      console.log("Setting overlay position:", coordinate);
      overlayRef.current.setPosition(coordinate);
    }
  };

  const handleLineClick = (feature) => {
    console.log("Handling line click");
    const properties = feature.getProperties();
    const lineDetails = {
      name: properties.name || properties.line || "Unknown Line",
      color: properties.color || '#000000',
      length: properties.length || "22 km",
      avgFrequency: properties.frequency || "10 minutes",
      stations: properties.stations || ["Station 1", "Station 2"], // Replace with actual stations
    };
    console.log("Line details:", lineDetails);
    setSelectedLineDetails(lineDetails);
    setSelectedStation(null);
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }
  };

  return (
    <div ref={mapContainerRef} style={{ flex: 1, height: "100%" }}>
      <div ref={stationPopupRef} className="station-popup">
        <StationPopup 
          selectedStation={selectedStation} 
          coordinate={coordinate} 
        />
      </div>
      <LinePanel 
        selectedLine={selectedLineDetails} 
        onClose={() => setSelectedLineDetails(null)}
        onStationClick={handleStationClick}
      />
    </div>
  );
};

export default MapComponent;
