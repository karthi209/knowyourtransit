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
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Circle, Stroke } from "ol/style";
import { Feature } from "ol";
import { Point } from "ol/geom";
import LinePanel from "./LinePanel";

const MapComponent = () => {
  const { setSelectedStation, setSelectedLine } = useMapContext();
  const [selectedStation, setSelectedStationState] = useState(null);
  const [selectedLine, setSelectedLineState] = useState(null);
  const [coordinate, setCoordinate] = useState(null);
  const [showStationPanel, setShowStationPanel] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const overlayRef = useRef(null);
  const linesLayerRef = useRef(null);
  const lightBaseLayerRef = useRef(null);
  const darkBaseLayerRef = useRef(null);
  const satelliteBaseLayerRef = useRef(null);
  const panelRef = useRef(null);
  const selectedStationLayerRef = useRef(null);
  const pulseLayerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Ensure map is only initialized once

    const lightBaseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}@2x.png",
      }),
    });
    lightBaseLayerRef.current = lightBaseLayer;

    const darkBaseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}@2x.png",
      }),
      visible: false,
    });
    darkBaseLayerRef.current = darkBaseLayer;

    const satelliteBaseLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      visible: false,
    });
    satelliteBaseLayerRef.current = satelliteBaseLayer;

    // Create a vector layer for selected station highlighting
    const selectedStationLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: isDarkTheme ? '#90CAF9' : '#1565C0'
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3
          })
        })
      }),
      zIndex: 1000
    });

    // Add a pulsing effect for the selected station
    const pulseLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new Circle({
          radius: 15,
          fill: new Fill({
            color: isDarkTheme ? 'rgba(144, 202, 249, 0.2)' : 'rgba(21, 101, 192, 0.2)'
          }),
          stroke: new Stroke({
            color: isDarkTheme ? 'rgba(144, 202, 249, 0.4)' : 'rgba(21, 101, 192, 0.4)',
            width: 2
          })
        })
      }),
      zIndex: 999
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

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        lightBaseLayer,
        darkBaseLayer,
        satelliteBaseLayer,
        createVectorLayerLines(selectedLine),
        vectorLayerStationLayouts,
        vectorLayerStationWalks,
        pulseLayer,
        selectedStationLayer
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
      controls: [] // Remove default controls
    });

    // Create custom controls
    const fullScreenControl = new FullScreen({
      className: 'ol-full-screen',
      label: '⛶',
      labelActive: '⛶',
      tipLabel: 'Toggle fullscreen'
    });

    const rotateControl = new Rotate({
      className: 'ol-rotate',
      label: '⌖',
      tipLabel: 'Reset rotation'
    });

    // Add controls to map
    map.addControl(fullScreenControl);
    map.addControl(rotateControl);

    mapInstanceRef.current = map;

    const vectorLayerStations = createVectorLayerStations(map);
    map.addLayer(vectorLayerStations);

    linesLayerRef.current = map.getLayers().getArray().find(layer => 
      layer instanceof VectorLayer && layer.getSource().getUrl() === "/data/lines.geojson"
    );

    map.on("pointerdown", () => (map.getTargetElement().style.cursor = "grabbing"));
    map.on("pointerdrag", () => (map.getTargetElement().style.cursor = "grabbing"));
    map.on("pointerup", () => (map.getTargetElement().style.cursor = "grab"));

    map.on("click", handleMapClick);
    map.on("pointermove", handlePointerMove);

    // Store the selected station layer reference
    selectedStationLayerRef.current = selectedStationLayer;
    pulseLayerRef.current = pulseLayer;

    // Add pulse animation
    let pulseRadius = 15;
    let growing = true;
    const pulseInterval = setInterval(() => {
      if (pulseLayerRef.current) {
        const source = pulseLayerRef.current.getSource();
        const features = source.getFeatures();
        if (features.length > 0) {
          if (growing) {
            pulseRadius += 0.5;
            if (pulseRadius >= 25) growing = false;
          } else {
            pulseRadius -= 0.5;
            if (pulseRadius <= 15) growing = true;
          }
          pulseLayerRef.current.setStyle(new Style({
            image: new Circle({
              radius: pulseRadius,
              fill: new Fill({
                color: isDarkTheme ? 'rgba(144, 202, 249, 0.2)' : 'rgba(21, 101, 192, 0.2)'
              }),
              stroke: new Stroke({
                color: isDarkTheme ? 'rgba(144, 202, 249, 0.4)' : 'rgba(21, 101, 192, 0.4)',
                width: 2
              })
            })
          }));
        }
      }
    }, 50);

    return () => {
      clearInterval(pulseInterval);
      map.setTarget(null);
      mapInstanceRef.current = null;
      overlayRef.current = null;
      linesLayerRef.current = null;
      lightBaseLayerRef.current = null;
      darkBaseLayerRef.current = null;
      satelliteBaseLayerRef.current = null;
      selectedStationLayerRef.current = null;
      pulseLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !linesLayerRef.current) return;

    const map = mapInstanceRef.current;
    const oldLayer = linesLayerRef.current;
    const newLayer = createVectorLayerLines(selectedLine);

    const layers = map.getLayers();
    const index = layers.getArray().indexOf(oldLayer);
    if (index !== -1) {
      layers.setAt(index, newLayer);
      linesLayerRef.current = newLayer;
    }
  }, [selectedLine]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const newY = e.touches[0].clientY;
    setCurrentY(newY);
    
    const deltaY = newY - startY;
    // Allow dragging down to 40px height and up to 60% of screen height
    const newHeight = Math.max(40, Math.min(window.innerHeight * 0.6, window.innerHeight * 0.6 - deltaY));
    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged down more than 100px or more than 30% of the panel height, minimize it
    const dragDistance = currentY - startY;
    const threshold = Math.min(100, window.innerHeight * 0.6 * 0.3);
    
    if (dragDistance > threshold) {
      // Minimize to 40px height instead of hiding completely
      setPanelHeight(40);
    } else {
      // Snap back to full height
      setPanelHeight(window.innerHeight * 0.6);
    }
  };

  const handleStationClick = (feature) => {
    const properties = feature.getProperties();
    console.log("Clicked Station Properties:", properties);

    if (!properties || !properties.name) return;

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

    // Update the selected station highlight
    if (selectedStationLayerRef.current && pulseLayerRef.current) {
      const selectedSource = selectedStationLayerRef.current.getSource();
      const pulseSource = pulseLayerRef.current.getSource();
      selectedSource.clear();
      pulseSource.clear();
      const featureClone = feature.clone();
      selectedSource.addFeature(featureClone);
      pulseSource.addFeature(feature.clone());
    }

    // Center the map on the selected station
    const map = mapInstanceRef.current;
    if (map) {
      const view = map.getView();
      const coordinates = feature.getGeometry().getCoordinates();
      
      // Calculate the offset for mobile view to account for the slide-up panel
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Calculate new center point to position station at the very top of visible area
        const mapSize = map.getSize();
        const panelHeight = window.innerHeight * 0.6; // 60% of screen height
        const visibleHeight = window.innerHeight * 0.4; // 40% of screen height
        
        // Calculate the pixel offset in map coordinates
        const pixelRatio = mapSize[1] / window.innerHeight;
        // Use a slightly smaller offset to position station a bit lower from the top
        const offsetY = -(visibleHeight * 1.5) * pixelRatio;
        
        // Calculate new center coordinates
        const [x, y] = coordinates;
        const newCenter = [x, y + offsetY];
        
        // Center the map with the new center point and slightly higher zoom
        view.animate({
          center: newCenter,
          zoom: 16,
          duration: 1000
        });
      } else {
        // Desktop view - no offset needed
        view.animate({
          center: coordinates,
          zoom: 15,
          duration: 1000
        });
      }
    }

    // Show popup on desktop, slide-up panel on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
      if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
      }
    } else {
      setShowStationPanel(false);
    if (overlayRef.current) {
      overlayRef.current.setPosition(feature.getGeometry().getCoordinates());
      }
    }
  };

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
    setShowStationPanel(true);
  };

  const handleSearchStationSelect = (station) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const [lng, lat] = station.coordinates;
    const coordinates = fromLonLat([lng, lat]);
    
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

    setSelectedStationState(stationData);
    setCoordinate(coordinates);
    
    // Update the selected station highlight
    if (selectedStationLayerRef.current && pulseLayerRef.current) {
      const selectedSource = selectedStationLayerRef.current.getSource();
      const pulseSource = pulseLayerRef.current.getSource();
      selectedSource.clear();
      pulseSource.clear();
      
      // Create a new feature for the selected station
      const feature = new Feature({
        geometry: new Point(coordinates),
        ...stationData
      });
      
      selectedSource.addFeature(feature);
      pulseSource.addFeature(feature.clone());
    }
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Show slide-up panel on mobile
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
      if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
      }
    } else {
      // Show popup on desktop
      if (overlayRef.current) {
        overlayRef.current.setPosition(coordinates);
      }
    }

    // Center the map on the selected station
    const view = map.getView();
    if (isMobile) {
      // Calculate the offset for mobile view to account for the slide-up panel
      const mapSize = map.getSize();
      const panelHeight = window.innerHeight * 0.6;
      const visibleHeight = window.innerHeight * 0.4;
      
      const pixelRatio = mapSize[1] / window.innerHeight;
      const offsetY = -(visibleHeight * 1.5) * pixelRatio;
      
      const [x, y] = coordinates;
      const newCenter = [x, y + offsetY];
      
      view.animate({
        center: newCenter,
        zoom: 16,
        duration: 1000
      });
    } else {
      view.animate({
        center: coordinates,
        zoom: 15,
        duration: 1000
      });
    }
  };

  const handleSearchLineSelect = (line) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Find the line coordinates from the lines layer
    const linesLayer = linesLayerRef.current;
    if (linesLayer) {
      const source = linesLayer.getSource();
      const features = source.getFeatures();
      const lineFeature = features.find(f => f.get('name') === line.name);
      
      if (lineFeature) {
        const coordinates = lineFeature.getGeometry().getCoordinates();
        const extent = coordinates.reduce((extent, coord) => {
          return [
            Math.min(extent[0], coord[0]),
            Math.min(extent[1], coord[1]),
            Math.max(extent[2], coord[0]),
            Math.max(extent[3], coord[1])
          ];
        }, [Infinity, Infinity, -Infinity, -Infinity]);

        const padding = 0.1;
        const width = extent[2] - extent[0];
        const height = extent[3] - extent[1];
        const paddedExtent = [
          extent[0] - width * padding,
          extent[1] - height * padding,
          extent[2] + width * padding,
          extent[3] + height * padding
        ];

        map.getView().animate({
          center: map.getView().getCenter(),
          zoom: map.getView().getZoom() - 1,
          duration: 500
        }, () => {
          map.getView().fit(paddedExtent, {
            duration: 1000,
            padding: [50, 50, 50, 50],
            easing: (t) => {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }
          });
        });
      }
    }

    // Update UI state
    setSelectedLineState(line.name);
    // Show slide-up panel on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
    } else {
      setShowStationPanel(false);
    }
    setSelectedStationState(null);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const toggleSatelliteView = () => {
    if (!lightBaseLayerRef.current || !darkBaseLayerRef.current || !satelliteBaseLayerRef.current) return;
    const newIsSatellite = !isSatellite;
    lightBaseLayerRef.current.setVisible(!newIsSatellite && !isDarkTheme);
    darkBaseLayerRef.current.setVisible(!newIsSatellite && isDarkTheme);
    satelliteBaseLayerRef.current.setVisible(newIsSatellite);
    setIsSatellite(newIsSatellite);
  };

  const toggleDarkTheme = () => {
    if (!lightBaseLayerRef.current || !darkBaseLayerRef.current || !satelliteBaseLayerRef.current) return;
    const newIsDarkTheme = !isDarkTheme;
    lightBaseLayerRef.current.setVisible(!newIsDarkTheme && !isSatellite);
    darkBaseLayerRef.current.setVisible(newIsDarkTheme && !isSatellite);
    satelliteBaseLayerRef.current.setVisible(isSatellite);
    setIsDarkTheme(newIsDarkTheme);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`map-container ${isDarkTheme ? 'dark-theme' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
      <div id="map" className="map" ref={mapContainerRef}></div>
      <SearchBar 
        onStationSelect={handleSearchStationSelect} 
        onLineSelect={handleSearchLineSelect}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Station Panel (Desktop) */}
      {selectedStation && !showStationPanel && (
        <div
          ref={stationPopupRef}
          className={`fixed top-0 right-0 h-full z-50 hidden md:block`}
          style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div 
            className={`h-full flex flex-col ${isDarkTheme ? 'bg-[#1a1a1a]' : 'bg-white'} shadow-lg`}
          >
            {/* Header with close button */}
            <div className={`w-full h-12 flex items-center justify-between px-4 ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} flex-shrink-0 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Station Details</div>
              <button 
                onClick={() => {
                  setSelectedStationState(null);
                  if (overlayRef.current) {
                    overlayRef.current.setPosition(undefined);
                  }
                }}
                className={`p-2 rounded-full ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <span className={`material-icons ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>close</span>
              </button>
            </div>
            
            {/* Panel content - make it scrollable */}
            <div className={`flex-1 overflow-y-auto ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              <StationPanel
                selectedStation={selectedStation}
                onClose={() => {
                  setSelectedStationState(null);
                  if (overlayRef.current) {
                    overlayRef.current.setPosition(undefined);
                  }
                }}
                onStationClick={handleStationClick}
                stationSequences={stationSequences}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Line Panel (Desktop) */}
      {selectedLine && !showStationPanel && (
        <div
          className={`fixed top-0 right-0 h-full z-50 hidden md:block`}
          style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div 
            className={`h-full flex flex-col ${isDarkTheme ? 'bg-[#1a1a1a]' : 'bg-white'} shadow-lg`}
          >
            {/* Header with close button */}
            <div className={`w-full h-12 flex items-center justify-between px-4 ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} flex-shrink-0 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Line Details</div>
              <button 
                onClick={() => setSelectedLineState(null)}
                className={`p-2 rounded-full ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <span className={`material-icons ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>close</span>
              </button>
            </div>
            
            {/* Panel content - make it scrollable */}
            <div className={`flex-1 overflow-y-auto ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              <LinePanel
                selectedLine={selectedLine}
                onClose={() => setSelectedLineState(null)}
                stationSequences={stationSequences}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Station Panel (Mobile) */}
      {showStationPanel && (
        <div 
          ref={panelRef}
          className="fixed inset-x-0 bottom-0 z-50 md:hidden"
          style={{
            height: `${panelHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s ease-out',
            backgroundColor: 'transparent'
          }}
        >
          <div 
            className={`${isDarkTheme ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out`}
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Drag handle */}
            <div 
              className={`w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-t-2xl flex-shrink-0 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className={`w-12 h-1 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
            </div>
            
            {/* Panel content - only show when panel is not minimized */}
            {panelHeight > 40 && (
              <div className={`flex-1 overflow-y-auto ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                <StationPanel
                  selectedStation={selectedStation}
                  onClose={() => {
                    setShowStationPanel(false);
                    setPanelHeight(0);
                  }}
                  onStationClick={handleStationClick}
                  stationSequences={stationSequences}
                  isDarkTheme={isDarkTheme}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Line Panel (Mobile) */}
      {selectedLine && showStationPanel && (
        <div 
          ref={panelRef}
          className="fixed inset-x-0 bottom-0 z-50 md:hidden"
          style={{
            height: `${panelHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s ease-out',
            backgroundColor: 'transparent'
          }}
        >
          <div 
            className={`${isDarkTheme ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out`}
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Drag handle */}
            <div 
              className={`w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-t-2xl flex-shrink-0 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className={`w-12 h-1 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
            </div>
            
            {/* Panel content - only show when panel is not minimized */}
            {panelHeight > 40 && (
              <div className={`flex-1 overflow-y-auto ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                <LinePanel
                  selectedLine={selectedLine}
                  onClose={() => {
                    setShowStationPanel(false);
                    setPanelHeight(0);
                    setSelectedLineState(null);
                  }}
                  stationSequences={stationSequences}
                  isDarkTheme={isDarkTheme}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`map-controls ${selectedStation && !showStationPanel ? 'side-panel-open' : ''}`}>
        <button
          onClick={toggleDarkTheme}
          className={`map-control-button theme-toggle ${isDarkTheme ? 'dark-theme' : ''}`}
          title={isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          <span className="material-icons">{isDarkTheme ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button
          onClick={toggleSatelliteView}
          className={`map-control-button satellite-toggle ${isDarkTheme ? 'dark-theme' : ''}`}
          title={isSatellite ? "Switch to Map View" : "Switch to Satellite View"}
        >
          <span className="material-icons">{isSatellite ? 'map' : 'satellite'}</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className={`map-control-button fullscreen-toggle ${isDarkTheme ? 'dark-theme' : ''}`}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <span className="material-icons">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        </button>
        <button
          onClick={() => document.querySelector('.ol-rotate button').click()}
          className={`map-control-button rotate-toggle ${isDarkTheme ? 'dark-theme' : ''}`}
          title="Reset rotation"
        >
          <span className="material-icons">navigation</span>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        .map-container {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          touch-action: none;
        }

        .map-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 9999;
        }

        .map {
          width: 100%;
          height: 100%;
          touch-action: none;
        }

        /* Hide default OpenLayers controls */
        .ol-full-screen {
          display: none !important;
        }
        .ol-rotate {
          display: none !important;
        }

        /* Map Controls Styling */
        .map-controls {
          position: fixed;
          top: 5em;
          right: 1em;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          z-index: 1000; /* Lower than the side panel */
        }

        /* Adjust map controls position when side panel is open */
        .map-controls.side-panel-open {
          right: calc(400px + 1em); /* 400px is the width of the side panel */
        }

        .map-control-button {
          background-color: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
        }

        .map-control-button .material-icons {
          font-size: 20px;
          color: #1565C0;
        }

        .map-control-button:hover {
          transform: scale(1.1);
        }

        /* Dark theme styles */
        .dark-theme.map-control-button {
          background-color: rgba(33, 33, 33, 0.95);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .dark-theme.map-control-button .material-icons {
          color: #90CAF9;
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .map-controls {
            top: 5em;
            right: 1em;
            flex-direction: column;
            gap: 0.75em;
          }

          .map-controls.side-panel-open {
            right: 1em; /* Reset for mobile */
          }

          .map-control-button {
            width: 40px;
            height: 40px;
          }

          .map-control-button .material-icons {
            font-size: 22px;
          }
        }

        /* Remove old popup styles */
        .station-popup {
          display: none;
        }

        /* Station panel styling */
        :global(.station-panel) {
          position: fixed;
          z-index: 10000;
          color: #111827; /* text-gray-900 for light theme */
          background-color: white;
        }

        .dark-theme.station-panel {
          color: #f3f4f6; /* text-gray-100 for dark theme */
          background-color: #1a1a1a;
        }

        /* Mobile slide-up panel styles */
        @media (max-width: 768px) {
          .map-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: 100%;
            height: 100dvh;
            width: 100%;
            overflow: hidden;
            touch-action: none;
            margin: 0;
            padding: 0;
            background: transparent;
          }

          .map {
            touch-action: none;
            height: 100%;
            width: 100%;
          }

          /* Remove any background overlay */
          .station-panel::before,
          .station-panel::after {
            display: none;
          }

          /* Ensure text colors in mobile panel */
          .station-panel h2,
          .station-panel h3,
          .station-panel p,
          .station-panel span {
            color: inherit !important;
          }

          /* Remove the bluish gray background */
          .bg-gray-50 {
            background-color: transparent !important;
          }

          .dark-theme .bg-gray-50 {
            background-color: transparent !important;
          }
        }

        /* Dark theme styles for search and popups */
        :global(.dark-theme .search-bar-container) {
          background-color: rgba(33, 33, 33, 0.95);
        }

        :global(.dark-theme .search-bar-container input) {
          background-color: rgba(48, 48, 48, 0.95);
          color: #fff;
          border-color: #424242;
        }

        :global(.dark-theme .search-bar-container input:focus) {
          border-color: #90CAF9;
          box-shadow: 0 2px 8px rgba(144, 202, 249, 0.2);
        }

        :global(.dark-theme .search-results) {
          background-color: rgba(33, 33, 33, 0.95);
          border-color: #424242;
          color: #fff;
        }

        :global(.dark-theme .search-result-item) {
          border-bottom-color: #424242;
        }

        :global(.dark-theme .search-result-item:hover) {
          background-color: rgba(48, 48, 48, 0.95);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;

