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
import WelcomeAnimation from './WelcomeAnimation';
import { getFeatureStyle } from "../styles/LineStyles";

const MapComponent = () => {
  const { setSelectedStation, setSelectedLine } = useMapContext();
  const [selectedStation, setSelectedStationState] = useState(null);
  const [selectedLine, setSelectedLineState] = useState(null);
  const [coordinate, setCoordinate] = useState(null);
  const [showStationPanel, setShowStationPanel] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

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
      visible: false,
    });
    lightBaseLayerRef.current = lightBaseLayer;

    const darkBaseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}@2x.png",
      }),
      visible: true,
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
    
    // Instead of replacing the layer, update its style
    oldLayer.setStyle((feature, resolution) => {
      const zoom = Math.log2(156543.03 / resolution);
      return getFeatureStyle(feature, zoom, selectedLine);
    });
    
    // Force a refresh of the layer
    oldLayer.changed();
    
    // Update the reference
    linesLayerRef.current = oldLayer;
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

    // Clear any existing line selection
    setSelectedLineState(null);

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

    // Clear any existing station selection first
    setSelectedStationState(null);
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }

    // Find the line coordinates from the lines layer
    const linesLayer = linesLayerRef.current;
    if (linesLayer) {
      const source = linesLayer.getSource();
      const features = source.getFeatures();
      const lineFeature = features.find(f => f.get('Name') === line.name);
      
      if (lineFeature) {
        // Get the line geometry
        const geometry = lineFeature.getGeometry();
        
        // Get the extent of the line
        const extent = geometry.getExtent();
        
        // Add padding to the extent
        const padding = 0.2; // 20% padding
        const width = extent[2] - extent[0];
        const height = extent[3] - extent[1];
        const paddedExtent = [
          extent[0] - width * padding,
          extent[1] - height * padding,
          extent[2] + width * padding,
          extent[3] + height * padding
        ];

        // First update the selected line state
        setSelectedLineState(line.name);

        // Then animate to the line extent
        map.getView().fit(paddedExtent, {
          duration: 1000,
          padding: [100, 100, 100, 100],
          maxZoom: 14,
          minZoom: 10,
          easing: (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          }
        });
      }
    }

    // Show slide-up panel on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
    } else {
      setShowStationPanel(false);
    }
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
      {showWelcome && (
        <WelcomeAnimation onAnimationComplete={() => setShowWelcome(false)} />
      )}
      <div id="map" className="map" ref={mapContainerRef}></div>
      <SearchBar 
        onStationSelect={handleSearchStationSelect} 
        onLineSelect={handleSearchLineSelect}
        isDarkTheme={true}
      />
      
      {/* Station Panel (Desktop) */}
      {selectedStation && !showStationPanel && (
        <div
          ref={stationPopupRef}
          className="fixed top-0 right-0 h-full z-50 hidden md:block"
          style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="h-full flex flex-col bg-black/95 backdrop-blur-sm border-l border-white/10">
            {/* Header with close button */}
            <div className="w-full h-12 flex items-center justify-between px-4 bg-black/50 border-b border-white/10">
              <div className="text-lg font-medium text-white">Station Details</div>
              <button 
                onClick={() => {
                  setSelectedStationState(null);
                  if (overlayRef.current) {
                    overlayRef.current.setPosition(undefined);
                  }
                }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="material-icons text-white/60">close</span>
              </button>
            </div>
            
            {/* Panel content */}
            <div className="flex-1 overflow-y-auto text-white/80">
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
                isDarkTheme={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Line Panel (Desktop) */}
      {selectedLine && !showStationPanel && (
        <div
          className="fixed top-0 right-0 h-full z-50 hidden md:block"
          style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="h-full flex flex-col bg-black/95 backdrop-blur-sm border-l border-white/10">
            {/* Header with close button */}
            <div className="w-full h-12 flex items-center justify-between px-4 bg-black/50 border-b border-white/10">
              <div className="text-lg font-medium text-white">Line Details</div>
              <button 
                onClick={() => setSelectedLineState(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="material-icons text-white/60">close</span>
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto text-white/80">
              <LinePanel
                selectedLine={selectedLine}
                onClose={() => setSelectedLineState(null)}
                stationSequences={stationSequences}
                isDarkTheme={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Panels */}
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
            className="bg-black/95 backdrop-blur-sm rounded-t-2xl border-t border-white/10"
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Drag handle */}
            <div 
              className="w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none bg-black/50 border-b border-white/10 rounded-t-2xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            </div>
            
            {/* Panel content */}
            {panelHeight > 40 && (
              <div className="flex-1 overflow-y-auto text-white/80">
                {selectedStation ? (
                  <StationPanel
                    selectedStation={selectedStation}
                    onClose={() => {
                      setShowStationPanel(false);
                      setPanelHeight(0);
                    }}
                    onStationClick={handleStationClick}
                    stationSequences={stationSequences}
                    isDarkTheme={true}
                  />
                ) : selectedLine ? (
                  <LinePanel
                    selectedLine={selectedLine}
                    onClose={() => {
                      setShowStationPanel(false);
                      setPanelHeight(0);
                    }}
                    stationSequences={stationSequences}
                    isDarkTheme={true}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className={`map-controls ${selectedStation && !showStationPanel ? 'side-panel-open' : ''}`}>
        <button
          onClick={toggleDarkTheme}
          className="map-control-button"
          title={isDarkTheme ? "Switch to Light Map" : "Switch to Dark Map"}
        >
          <span className="material-icons">{isDarkTheme ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button
          onClick={toggleSatelliteView}
          className="map-control-button"
          title={isSatellite ? "Switch to Map View" : "Switch to Satellite View"}
        >
          <span className="material-icons">{isSatellite ? 'map' : 'satellite'}</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="map-control-button"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <span className="material-icons">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        </button>
        <button
          onClick={() => document.querySelector('.ol-rotate button').click()}
          className="map-control-button"
          title="Reset rotation"
        >
          <span className="material-icons">navigation</span>
        </button>
      </div>

      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');

        .map-container {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          touch-action: none;
          font-family: "Cabin", "Noto Sans Tamil", serif;
          background-color: #000;
          color: rgba(255, 255, 255, 0.9);
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
        .ol-full-screen, .ol-rotate {
          display: none !important;
        }

        /* Map Controls Styling */
        .map-controls {
          position: fixed;
          top: 5em;
          right: 1em;
          display: flex;
          flex-direction: column;
          gap: 0.75em;
          z-index: 1000;
        }

        .map-controls.side-panel-open {
          right: calc(400px + 1em);
        }

        .map-control-button {
          background-color: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
        }

        .map-control-button .material-icons {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);
        }

        .map-control-button:hover {
          background-color: rgba(0, 0, 0, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .map-control-button:active {
          transform: translateY(0);
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
            right: 1em;
          }

          .map-control-button {
            width: 44px;
            height: 44px;
          }

          .map-control-button .material-icons {
            font-size: 22px;
          }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;

