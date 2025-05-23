import React, { useEffect, useRef, useState } from "react";
import { Map, Overlay, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import { createStringXY } from 'ol/coordinate';
import { createVectorLayerStations, createVectorLayerLines, vectorLayerStationLayouts, vectorLayerStationWalks } from "./VectorLayers"; // Import vector layers
import { useMapContext } from "../context/MapContext"; // Assuming you have a context provider for map state
import StationPanel from "./StationPanel";
import StationPopup from "./StationPopup"; // Assuming this is your station popup component
import stationSequences from './stationSequences';
import SearchBar from './SearchBar';
import { ZoomSlider, ZoomToExtent, FullScreen, MousePosition, Rotate } from "ol/control";

const MapComponent = () => {
  const { setSelectedStation, setSelectedLine } = useMapContext();
  const [selectedStation, setSelectedStationState] = useState(null);
  const [selectedLine, setSelectedLineState] = useState(null);
  const [coordinate, setCoordinate] = useState(null);
  const [showStationPanel, setShowStationPanel] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const overlayRef = useRef(null);
  const linesLayerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Ensure map is only initialized once

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}@2x.png",
      }),
    });
    

    if (stationPopupRef.current) {
      overlayRef.current = new Overlay({
        element: stationPopupRef.current,
        positioning: "bottom-center",
        offset: [0, -10],
        autoPan: true,
        autoPanAnimation: { duration: 250 },
      });
    }

    // Create the map instance and layers
    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        baseLayer,
        createVectorLayerLines(selectedLine),
        vectorLayerStationLayouts,
        vectorLayerStationWalks,
      ],
      view: new View({
        center: fromLonLat([80.237617, 13.067439]),
        zoom: 11,
        minZoom: 10,
        maxZoom: 19,
      }),
      overlays: overlayRef.current ? [overlayRef.current] : [],
      pixelRatio: 2,
      renderer: "canvas",
      controls: [
        new FullScreen({
          className: 'ol-full-screen',
          label: '⛶',
          labelActive: '⛶',
          tipLabel: 'Toggle fullscreen'
        }),
        new Rotate({
          className: 'ol-rotate',
          label: '⌖',
          tipLabel: 'Reset rotation'
        })
      ]
    });

    // Store the map instance in the ref
    mapInstanceRef.current = map;

    // Initialize the vector layer for stations after map initialization
    const vectorLayerStations = createVectorLayerStations(map);
    map.addLayer(vectorLayerStations);

    // Store the lines layer reference
    linesLayerRef.current = map.getLayers().getArray().find(layer => 
      layer instanceof VectorLayer && layer.getSource().getUrl() === "/data/lines.geojson"
    );

    // Handle interactions
    map.on("pointerdown", () => (map.getTargetElement().style.cursor = "grabbing"));
    map.on("pointerdrag", () => (map.getTargetElement().style.cursor = "grabbing"));
    map.on("pointerup", () => (map.getTargetElement().style.cursor = "grab"));

    map.on("click", handleMapClick);
    map.on("pointermove", handlePointerMove);

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
      overlayRef.current = null;
      linesLayerRef.current = null;
    };
  }, []); // Empty dependency array to ensure effect only runs once

  // Update lines layer when selected line changes
  useEffect(() => {
    if (!mapInstanceRef.current || !linesLayerRef.current) return;

    const map = mapInstanceRef.current;
    const oldLayer = linesLayerRef.current;
    const newLayer = createVectorLayerLines(selectedLine);

    // Replace the old layer with the new one
    const layers = map.getLayers();
    const index = layers.getArray().indexOf(oldLayer);
    if (index !== -1) {
      layers.setAt(index, newLayer);
      linesLayerRef.current = newLayer;
    }
  }, [selectedLine]);

  // Handle the station click event to set selected station and show the popup
  const handleStationClick = (feature) => {
    const properties = feature.getProperties();
    console.log("Clicked Station Properties:", properties);

    if (!properties || !properties.name) return; // Ensure feature has name

    const station = {
      name: properties.name,
      name_ta: properties.name_ta || "N/A",
      line: properties.line || "Unknown Line",
      network: properties.network || "N/A",
      id: properties.id || "N/A",
      parking: properties.parking || "no",
      accessible: properties.accessible || "no",
      escalator: properties.escalator || "no",
      type: properties.type || "no",
      frequency: properties.frequency || "N/A"
    };

    setSelectedStationState(station);
    setCoordinate(feature.getGeometry().getCoordinates());

    if (overlayRef.current) {
      overlayRef.current.setPosition(feature.getGeometry().getCoordinates());
    }
  };

  // Handle map click event
  const handleMapClick = (e) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let clickedFeature = null;
    map.forEachFeatureAtPixel(e.pixel, (feature) => {
      if (feature.getGeometry().getType() === "Point") {
        clickedFeature = feature;
        return true;
      }
    });

    if (!clickedFeature) {
      setSelectedStationState(null);
      if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
      }
      return;
    }

    handleStationClick(clickedFeature);
  };

  const handlePointerMove = (e) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const hit = map.hasFeatureAtPixel(map.getEventPixel(e.originalEvent));
    map.getTargetElement().style.cursor = hit ? "pointer" : "";
  };

  const handleMoreDetailsClick = () => {
    setShowStationPanel(true); // Open the side panel when the "More Details" button is clicked
  };

  const handleSearchStationSelect = (station) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Convert coordinates to map projection
    const [lng, lat] = station.coordinates;
    const coordinates = fromLonLat([lng, lat]);
    
    // Create station data object
    const stationData = {
      name: station.name,
      name_ta: station.name_ta,
      line: station.line,
      network: station.network,
      id: station.id,
      parking: station.parking,
      accessible: station.accessible,
      escalator: station.escalator,
      type: station.type
    };

    // Update selected station and coordinates
    setSelectedStationState(stationData);
    setCoordinate(coordinates);
    
    // Update popup position
    if (overlayRef.current) {
      overlayRef.current.setPosition(coordinates);
    }

    // Animate map to center on selected station
    map.getView().animate({
      center: coordinates,
      zoom: 15,
      duration: 1000
    });
  };

  const handleSearchLineSelect = (line) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Calculate the extent of the line's coordinates
    const coordinates = line.coordinates.map(coord => fromLonLat(coord));
    const extent = coordinates.reduce((extent, coord) => {
      return [
        Math.min(extent[0], coord[0]),
        Math.min(extent[1], coord[1]),
        Math.max(extent[2], coord[0]),
        Math.max(extent[3], coord[1])
      ];
    }, [Infinity, Infinity, -Infinity, -Infinity]);

    // Add some padding to the extent
    const padding = 0.1; // 10% padding
    const width = extent[2] - extent[0];
    const height = extent[3] - extent[1];
    const paddedExtent = [
      extent[0] - width * padding,
      extent[1] - height * padding,
      extent[2] + width * padding,
      extent[3] + height * padding
    ];

    // First, zoom out slightly to show the full line
    map.getView().animate({
      center: map.getView().getCenter(),
      zoom: map.getView().getZoom() - 1,
      duration: 500
    }, () => {
      // Then, fit to the line's extent with a smooth animation
      map.getView().fit(paddedExtent, {
        duration: 1000,
        padding: [50, 50, 50, 50],
        easing: (t) => {
          // Custom easing function for smoother animation
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
      });
    });

    // Update selected line state with a slight delay to match the animation
    setTimeout(() => {
      setSelectedLineState(line.name);
      setSelectedLine(line.name);
    }, 300);
  };

  return (
    <div className="map-container">
      <div id="map" className="map" ref={mapContainerRef}></div>
      <SearchBar 
        onStationSelect={handleSearchStationSelect} 
        onLineSelect={handleSearchLineSelect}
      />
      
      {/* Station Popup Overlay */}
      <div
        ref={stationPopupRef}
        className="station-popup rounded-lg p-5 inline-block w-auto"
        style={{
          pointerEvents: "auto",
          fontSize: "13px",
          display: selectedStation ? "block" : "none",
          whiteSpace: "nowrap"
        }}
      >
        <StationPopup selectedStation={selectedStation} onMoreDetailsClick={handleMoreDetailsClick} />
      </div>

      {/* Station Panel for Station Details */}
      {showStationPanel && (
        <StationPanel
          selectedStation={selectedStation}
          onClose={() => setShowStationPanel(false)}
          onStationClick={handleStationClick}
          stationSequences={stationSequences}
        />
      )}

      <style>{`
        .map-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          touch-action: none;
        }
        .map {
          width: 100%;
          height: 100%;
          touch-action: none;
        }
        .ol-full-screen {
          position: absolute;
          top: 1em;
          right: 1em;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          padding: 8px;
          z-index: 1000;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ol-rotate {
          position: absolute;
          top: 1em;
          right: 3.5em;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          padding: 8px;
          z-index: 1000;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ol-control button {
          background-color: transparent;
          border: none;
          color: #1565C0;
          font-size: 18px;
          width: 28px;
          height: 28px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
          touch-action: manipulation;
        }
        .ol-control button:hover {
          color: #1976D2;
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .map-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            touch-action: none;
          }
          .map {
            touch-action: none;
          }
          .ol-full-screen {
            top: auto;
            bottom: 5em;
            right: 1em;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 8px;
          }
          .ol-rotate {
            top: auto;
            bottom: 9em;
            right: 1em;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 8px;
          }
          .ol-control button {
            font-size: 20px;
            width: 32px;
            height: 32px;
            touch-action: manipulation;
          }
        }
        :global(.search-bar-container) {
          position: fixed;
          top: 1em;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: 300px;
          max-width: 90%;
        }
        :global(.search-bar-container input) {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          background-color: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        :global(.search-bar-container input:focus) {
          outline: none;
          border-color: #1565C0;
          box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
        }
        :global(.search-results) {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-top: 4px;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1001;
        }
        :global(.search-result-item) {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        :global(.search-result-item:hover) {
          background-color: #f5f5f5;
        }
        :global(.search-result-item:last-child) {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
