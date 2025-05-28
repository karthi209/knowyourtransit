import React, { useEffect, useRef, useState } from "react";
import { Map, Overlay, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import { createStringXY } from 'ol/coordinate';
import { createVectorLayerStations, createVectorLayerLines, vectorLayerStationLayouts, vectorLayerStationWalks } from "./VectorLayers"; // Import vector layers
import { useMapContext } from "../context/MapContext"; // Assuming you have a context provider for map state
import StationPanel from "./StationPanel";
import StationPopup from "./StationPopup"; // Assuming this is your station popup component
import { stationSequences as initialStationSequences, getStationSequencesWithNetwork } from './stationSequences'; // Import both
import SearchBar from './SearchBar';
import { ZoomSlider, ZoomToExtent, FullScreen, MousePosition, Rotate } from "ol/control";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Circle, Stroke } from "ol/style";
import { Feature } from "ol";
import { Point } from "ol/geom";
import LinePanel from "./LinePanel";
import WelcomeAnimation from './WelcomeAnimation';
import { getFeatureStyle } from "../styles/LineStyles";
import OSM from "ol/source/OSM";
import NearestStationsPanel from './NearestStationsPanel'; // Import the new component

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
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark', 'light', 'satellite', 'osm'
  const [cameFromLine, setCameFromLine] = useState(false);
  const [cameFromStation, setCameFromStation] = useState(false);
  const previousStationRef = useRef(null); // Ref to store station data when navigating to line from station
  const [userLocation, setUserLocation] = useState(null); // New state for user's geolocation
  const [nearestStations, setNearestStations] = useState([]); // State for nearest stations (will become categorized)
  const [showNearestStationsPanel, setShowNearestStationsPanel] = useState(false); // State for panel visibility (Desktop)
  const [showMobileNearestStationsPanel, setShowMobileNearestStationsPanel] = useState(false); // State for panel visibility (Mobile)
  const [enrichedStationSequences, setEnrichedStationSequences] = useState([]); // State for enriched sequences

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
  const osmBaseLayerRef = useRef(null);
  const geolocationSourceRef = useRef(null); // Ref for geolocation vector source
  const geolocationLayerRef = useRef(null); // Ref for geolocation vector layer
  const radiusSourceRef = useRef(null); // Ref for radius circles vector source
  const radiusLayerRef = useRef(null); // Ref for radius circles vector layer

  // State to track if fullscreen has been requested
  const [fullscreenRequested, setFullscreenRequested] = useState(false);

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

    const osmBaseLayer = new TileLayer({
      source: new OSM(),
      visible: false,
    });
    osmBaseLayerRef.current = osmBaseLayer;

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

    // Create a vector source and layer for geolocation marker
    const geolocationSource = new VectorSource();
    geolocationSourceRef.current = geolocationSource;
    const geolocationLayer = new VectorLayer({
      source: geolocationSource,
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      }),
      zIndex: 1001 // Ensure it's on top
    });
    geolocationLayerRef.current = geolocationLayer;

    // Create source and layer for radius circles
    const radiusSource = new VectorSource();
    radiusSourceRef.current = radiusSource;
    const radiusLayer = new VectorLayer({
        source: radiusSource,
        style: (feature, resolution) => {
            // Styles for different radius circles
            const radius = feature.get('radius'); // Radius in meters
            // Calculate radius in screen pixels based on resolution
            const radiusInPixels = radius / resolution;
            // Ensure a minimum pixel radius for visibility at very high zoom
            const minPixelRadius = 5; // Adjust as needed
            const effectiveRadius = Math.max(radiusInPixels, minPixelRadius);

            let color = 'rgba(255, 255, 255, 0.1)';
            let strokeColor = 'rgba(255, 255, 255, 0.3)';
            let strokeWidth = 1;

            if (radius === 500) {
                color = 'rgba(255, 0, 0, 0.15)'; // More visible red fill
                strokeColor = 'rgba(255, 0, 0, 0.3)'; // More visible red stroke
                strokeWidth = 1.5;
            } else if (radius === 1000) {
                color = 'rgba(0, 255, 0, 0.08)'; // Medium green fill
                strokeColor = 'rgba(0, 255, 0, 0.15)'; // Medium green stroke
                strokeWidth = 1;
            } else if (radius === 1500) {
                color = 'rgba(0, 0, 255, 0.04)'; // Most transparent blue fill
                strokeColor = 'rgba(0, 0, 255, 0.08)'; // Most transparent blue stroke
                strokeWidth = 0.8;
            } else {
                 // Default style if radius doesn't match expected values (shouldn't happen for 600, 1000, 2000)
                 color = 'rgba(128, 128, 128, 0.5)';
                 strokeColor = 'rgba(128, 128, 128, 1)';
                 strokeWidth = 1;
            }

            return new Style({
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth,
                }),
                fill: new Fill({
                    color: color,
                }),
                image: new Circle({
                    radius: effectiveRadius, // Use calculated pixel radius
                    fill: new Fill({
                        color: color,
                    }),
                    stroke: new Stroke({ // Apply stroke to the image as well
                        color: strokeColor,
                        width: strokeWidth,
                    }),
                }),
            });
        },
        zIndex: 990 // Below geolocation marker but above lines
    });
    radiusLayerRef.current = radiusLayer;

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
        osmBaseLayer,
        createVectorLayerLines(selectedLine),
        vectorLayerStationLayouts,
        vectorLayerStationWalks,
        pulseLayer,
        selectedStationLayer,
        geolocationLayer, // Add geolocation layer
        radiusLayer // Add radius circles layer
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

    // Add console log to check radius layer visibility after map initialization (with a slight delay)
    setTimeout(() => {
        if (radiusLayerRef.current) {
            console.log("Radius layer visibility after map init (delayed check):");
            console.log(radiusLayerRef.current.getVisible());
        }
    }, 100); // Small delay

    // Add map resolution listener
    map.getView().on('change:resolution', (event) => {
        console.log("Map resolution changed:", event.target.getResolution());
    });

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
    geolocationLayerRef.current = geolocationLayer; // Store ref
    radiusSourceRef.current = radiusSource; // Store ref
    radiusLayerRef.current = radiusLayer; // Store ref

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
      osmBaseLayerRef.current = null;
      selectedStationLayerRef.current = null;
      pulseLayerRef.current = null;
      geolocationLayerRef.current = null;
      radiusSourceRef.current = null;
      radiusLayerRef.current = null;
    };
  }, []);

  // Load and enrich station sequences when the component mounts
  useEffect(() => {
    const loadSequences = async () => {
      const sequences = await getStationSequencesWithNetwork();
      setEnrichedStationSequences(sequences);
    };
    loadSequences();
  }, []); // Empty dependency array means this runs once on mount

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
    // Add haptic feedback if available
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newY = e.touches[0].clientY;
    setCurrentY(newY);
    
    const deltaY = newY - startY;
    // Add resistance when dragging past limits
    const resistance = 0.3;
    let newHeight;
    
    if (deltaY > 0) { // Dragging down
      const maxHeight = window.innerHeight * 0.6;
      const overflow = deltaY - maxHeight;
      newHeight = maxHeight + (overflow > 0 ? overflow * resistance : 0);
    } else { // Dragging up
      const minHeight = 40;
      const overflow = minHeight - (window.innerHeight * 0.6 - deltaY);
      newHeight = minHeight - (overflow > 0 ? overflow * resistance : 0);
    }
    
    setPanelHeight(Math.max(40, Math.min(window.innerHeight * 0.6, newHeight)));
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.renderSync();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const dragDistance = currentY - startY;
    const threshold = Math.min(100, window.innerHeight * 0.6 * 0.3);
    
    // Add haptic feedback for panel snap
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
    
    if (dragDistance > threshold) {
      setPanelHeight(40);
    } else {
      setPanelHeight(window.innerHeight * 0.6);
    }
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateSize();
      mapInstanceRef.current.renderSync();
    }
  };

  // Add smooth scroll behavior for mobile panels
  useEffect(() => {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.style.scrollBehavior = 'smooth';
    }
  }, []);

  const handleStationClick = (feature, fromLinePanel = false) => {
    const properties = feature.getProperties();
    console.log("Clicked Station Properties:", properties);
    console.log("handleStationClick called with fromLinePanel:", fromLinePanel);

    if (!properties || !properties.name) return;

    // Set cameFromLine state based on fromLinePanel parameter
    setCameFromLine(fromLinePanel);
    console.log("handleStationClick: Setting cameFromLine to:", fromLinePanel);

    // Clear any existing line selection ONLY if not coming from a line panel
    if (!fromLinePanel) {
      console.log("handleStationClick: Clearing selectedLineState");
      setSelectedLineState(null);
    }

    console.log("handleStationClick: After check - selectedLine:", selectedLine);

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

  const cycleMapStyle = () => {
    if (!lightBaseLayerRef.current || !darkBaseLayerRef.current || !satelliteBaseLayerRef.current) return;
    
    const styles = ['dark', 'light', 'satellite', 'osm'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const newStyle = styles[nextIndex];
    
    // Hide all base layers
    lightBaseLayerRef.current.setVisible(false);
    darkBaseLayerRef.current.setVisible(false);
    satelliteBaseLayerRef.current.setVisible(false);
    if (osmBaseLayerRef.current) {
      osmBaseLayerRef.current.setVisible(false);
    }
    
    // Show the selected base layer
    switch (newStyle) {
      case 'dark':
        darkBaseLayerRef.current.setVisible(true);
        setIsDarkTheme(true);
        setIsSatellite(false);
        break;
      case 'light':
        lightBaseLayerRef.current.setVisible(true);
        setIsDarkTheme(false);
        setIsSatellite(false);
        break;
      case 'satellite':
        satelliteBaseLayerRef.current.setVisible(true);
        setIsDarkTheme(false);
        setIsSatellite(true);
        break;
      case 'osm':
        if (!osmBaseLayerRef.current) {
          const osmLayer = new TileLayer({
            source: new OSM(),
            visible: true
          });
          mapInstanceRef.current.addLayer(osmLayer);
          osmBaseLayerRef.current = osmLayer;
        } else {
          osmBaseLayerRef.current.setVisible(true);
        }
        setIsDarkTheme(false);
        setIsSatellite(false);
        break;
    }
    
    setMapStyle(newStyle);
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

  const handleBackToLine = () => {
    console.log("handleBackToLine called");
    console.log("Initial state:", { selectedStation, selectedLine, cameFromLine, showStationPanel });

    setCameFromLine(false);
    setSelectedStationState(null);
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }

    // Restore the line panel
    const map = mapInstanceRef.current;
    if (map) {
      const linesLayer = linesLayerRef.current;
      if (linesLayer) {
        const source = linesLayer.getSource();
        const features = source.getFeatures();
        const lineFeature = features.find(f => f.get('Name') === selectedLine);

        if (lineFeature) {
          console.log("Line feature found:", lineFeature.getProperties());
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

          console.log("Padded extent:", paddedExtent);

          // Animate to the line extent
          map.getView().fit(paddedExtent, {
            duration: 1000,
            padding: [100, 100, 100, 100],
            maxZoom: 14,
            minZoom: 10,
            easing: (t) => {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }
          });
        } else {
          console.log("Line feature not found for selected line:", selectedLine);
        }
      } else {
        console.log("Lines layer not found");
      }
    } else {
      console.log("Map instance not found");
    }

    // On mobile, show the slide-up panel which will render the LinePanel
    // On desktop, we need to ensure the LinePanel is shown
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
      console.log("Mobile view: setShowStationPanel(true)");
    } else {
      console.log("Desktop view: Not setting showStationPanel");
      // On desktop, we don't use showStationPanel for panel type
      // We rely on selectedStation and selectedLine
      // No need to set showStationPanel true on desktop
    }

    // Ensure the line is still selected to render LinePanel
    if (selectedLine) {
      console.log("selectedLine is still set:", selectedLine);
        // No need to clear and set selectedLineState here,
        // as it should already be set. The re-rendering should happen
        // because selectedStationState changes to null.
    } else {
      console.log("selectedLine is NOT set after back button click");
    }
    console.log("Final panel state:", { showStationPanel, panelHeight });
  };

  const handleLinePanelStationClick = (station) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Find the station feature
    const vectorLayerStations = map.getLayers().getArray().find(layer =>
      layer instanceof VectorLayer && layer.getSource().getUrl() === "/data/stations.geojson"
    );

    if (vectorLayerStations) {
      const source = vectorLayerStations.getSource();
      const features = source.getFeatures();
      const stationFeature = features.find(f => f.get('name') === station.name);

      if (stationFeature) {
        // Pass true to indicate this click came from the line panel
        handleStationClick(stationFeature, true);
      }
    }
  };

  // New function to handle line clicks from StationPanel
  const handleLineClickFromStation = (lineName) => {
    // Store the current station data before clearing it
    previousStationRef.current = selectedStation;
    console.log("handleLineClickFromStation: Stored previous station:", previousStationRef.current);

    // Clear station selection to close StationPanel
    setSelectedStationState(null);
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }

    // Set selected line to open LinePanel
    setSelectedLineState(lineName);

    // Set cameFromStation to true since we came from the station panel
    setCameFromStation(true);

    // Manage panel visibility (especially for mobile)
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true);
      setPanelHeight(window.innerHeight * 0.6);
    } else {
      // On desktop, selectedLine change will handle panel visibility
      // No need to set showStationPanel
    }

    // Optionally, zoom/pan to the line extent here if desired, similar to handleSearchLineSelect
    // Or rely on the effect that watches selectedLine to do the zooming
  };

  // New function to handle going back to the station panel from the line panel
  const handleBackToStation = () => {
    setCameFromStation(false); // Reset cameFromStation state
    setSelectedLineState(null); // Clear line selection to close LinePanel

    // Restore the previous station data and show StationPanel
    setSelectedStationState(previousStationRef.current);
    previousStationRef.current = null; // Clear the ref

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowStationPanel(true); // Show the mobile panel
      setPanelHeight(window.innerHeight * 0.6); // Ensure panel is open
    } else {
      // On desktop, changing selectedLineState to null and setting selectedStationState
      // should correctly show the StationPanel.
    }
  };

  // Haversine formula to calculate distance between two lat/lon points in kilometers
  const haversineDistance = (coords1, coords2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const lat1 = toRadians(coords1[1]);
    const lon1 = toRadians(coords1[0]);
    const lat2 = toRadians(coords2[1]);
    const lon2 = toRadians(coords2[0]);

    const R = 6371; // Radius of Earth in kilometers
    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  };

  // Function to find nearest stations within a radius
  const findNearestStations = (locationCoords) => {
    const map = mapInstanceRef.current;
    if (!map || !locationCoords) {
        console.log("findNearestStations called without map or locationCoords.", { map, locationCoords });
        return;
    }

    console.log("findNearestStations called with locationCoords (EPSG:3857):", locationCoords);

    const stationsLayer = map.getLayers().getArray().find(layer =>
      layer instanceof VectorLayer && layer.getSource().getUrl() === "/data/stations.geojson"
    );

    if (!stationsLayer) {
      console.warn("Stations layer not found to find nearest stations.");
      setNearestStations([]);
      return;
    }

    const stationFeatures = stationsLayer.getSource().getFeatures();
    console.log("Total station features found:", stationFeatures.length);
    const userLonLat = toLonLat(locationCoords); // Convert user location to lat/lon
    console.log("User location (LonLat):", userLonLat);

    const stationsWithDistance = stationFeatures
      .filter(feature => feature.getGeometry() && feature.getGeometry().getCoordinates())
      .map(feature => {
        const stationLonLat = toLonLat(feature.getGeometry().getCoordinates()); // Convert station coords to lat/lon
        const distance = haversineDistance(userLonLat, stationLonLat);
        return {
          feature: feature, // Keep reference to the feature
          name: feature.get('name'),
          line: feature.get('line'),
          network: feature.get('network'),
          distance: distance * 1000, // Store distance in meters for easier comparison with radii
        };
      });

    // Categorize stations by distance
    const categorizedStations = {
        '0-500m': [],
        '500m-1km': [],
        '1km-1.5km': [],
        // Removed 'Beyond 3km' category
    };

    stationsWithDistance.forEach(station => {
        if (station.distance <= 500) {
            categorizedStations['0-500m'].push(station);
        } else if (station.distance > 500 && station.distance <= 1000) {
            categorizedStations['500m-1km'].push(station);
        } else if (station.distance > 1000 && station.distance <= 1500) {
            categorizedStations['1km-1.5km'].push(station);
        } /* Removed else if for Beyond 3km */
    });

    // Sort stations within each category by distance
    Object.keys(categorizedStations).forEach(categoryKey => {
        categorizedStations[categoryKey].sort((a, b) => a.distance - b.distance);
    });

    console.log("Categorized stations:", categorizedStations);

    setNearestStations(categorizedStations);
    // Check if there are any stations before showing the panel
    const hasStationsToShow = Object.values(categorizedStations).some(category => category.length > 0);
    if (hasStationsToShow) {
       const isMobile = window.innerWidth <= 768;
       if (isMobile) {
         setShowMobileNearestStationsPanel(true); // Show mobile nearest stations panel
         // We don't set showStationPanel here, it's set in locateUser
       } else {
          setShowNearestStationsPanel(true); // Show desktop panel
       }
    } else {
       setShowNearestStationsPanel(false); // Hide panel if no stations are found
       setShowMobileNearestStationsPanel(false); // Also hide mobile panel if no stations
    }

    // Draw radius circles
    const radiusSource = radiusSourceRef.current;
    if (radiusSource) {
        radiusSource.clear(); // Clear previous circles
        const center = locationCoords; // Use locationCoords (EPSG:3857)
        const radii = [500, 1000, 1500]; // Radii in meters

        radii.forEach(r => {
            // Create a Point feature at the center
            const point = new Point(center);
            const feature = new Feature(point);
            feature.set('radius', r); // Store radius as a property for styling
            radiusSource.addFeature(feature);
            console.log(`Added circle feature with radius ${r} to source. Feature:`, feature);
        });

        // Explicitly ensure layer is visible and trigger re-render
        radiusLayerRef.current.setVisible(true);
        radiusLayerRef.current.changed();
        console.log("Explicitly set radius layer visible and called changed().");

    }
  };

  // Function to get user's geolocation
  const locateUser = () => {
    console.log("locateUser called.");
    // Check for mock location in development
    if (import.meta.env.DEV && process.env.VITE_MOCK_LOCATION) {
      console.log("Using mock location from VITE_MOCK_LOCATION.");
      try {
        const [lon, lat] = process.env.VITE_MOCK_LOCATION.split(',').map(Number);
        if (!isNaN(lon) && !isNaN(lat)) {
          const olCoords = fromLonLat([lon, lat]);
          setUserLocation(olCoords);

          // Add or update geolocation feature on the map
          const source = geolocationSourceRef.current;
          if (source) {
            source.clear(); // Clear previous marker
            const feature = new Feature({
              geometry: new Point(olCoords)
            });
            source.addFeature(feature);

            // Center map on user's location
            console.log("Animating map to mock location.");
            mapInstanceRef.current.getView().animate({
              center: olCoords,
              zoom: 15,
              duration: 1000
            }, () => {
                 // Callback after animation completes
                 console.log("Animation to mock location complete.");
                 // Find and show nearest stations AFTER zoom animation
                 console.log("Calling findNearestStations after mock location animation.");
                 const isMobile = window.innerWidth <= 768;
                 if (isMobile) {
                   // Set states to show nearest stations panel on mobile
                   setSelectedStationState(null); // Clear any selected station
                   setSelectedLineState(null); // Clear any selected line
                   setShowStationPanel(true); // Show the mobile wrapper panel
                   setShowMobileNearestStationsPanel(true); // Explicitly show nearest stations panel
                   setPanelHeight(window.innerHeight * 0.6); // Set initial height
                 }
                 findNearestStations(olCoords);
            });

          } else {
            console.error("Geolocation source not found.");
          }
          // The findNearestStations call is now in the animation callback,
          // so we can return immediately here if needed, but removing the
          // explicit return might help if there's an async issue.
          // return; // Removed explicit return here for testing

        } else {
          console.error("Invalid MOCK_LOCATION format. Please use 'longitude,latitude'");
        }
      } catch (error) {
        console.error("Error parsing MOCK_LOCATION:", error);
      }
      // Added return here to ensure exit after mock location attempt
      return;
    }

    // Fallback to browser geolocation if no mock location or in production
    console.log("Falling back to native geolocation.");
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      console.log("Native geolocation success.");
      const coords = [position.coords.longitude, position.coords.latitude];
      const olCoords = fromLonLat(coords);
      setUserLocation(olCoords);

      // Add or update geolocation feature on the map
      const source = geolocationSourceRef.current;
      if (source) {
        source.clear(); // Clear previous marker
        const feature = new Feature({
          geometry: new Point(olCoords)
        });
        source.addFeature(feature);

        // Center map on user's location
        console.log("Animating map to native location.");
        mapInstanceRef.current.getView().animate({
          center: olCoords,
          zoom: 15,
          duration: 1000
        }, () => {
             // Callback after animation completes
             console.log("Animation to native location complete.");
             // Find and show nearest stations AFTER zoom animation
             console.log("Calling findNearestStations after native location animation.");
             const isMobile = window.innerWidth <= 768;
             if (isMobile) {
               // Set states to show nearest stations panel on mobile
               setSelectedStationState(null); // Clear any selected station
               setSelectedLineState(null); // Clear any selected line
               setShowStationPanel(true); // Show the mobile wrapper panel
               setShowMobileNearestStationsPanel(true); // Explicitly show nearest stations panel
               setPanelHeight(window.innerHeight * 0.6); // Set initial height
             }
             findNearestStations(olCoords);
        });
      }
    }, (error) => {
      console.error('Error getting geolocation:', error);
      alert('Unable to retrieve your location');
    });
  };

  // Function to close the nearest stations panel
  const closeNearestStationsPanel = () => {
    setNearestStations([]); // Clear the list
    setShowNearestStationsPanel(false); // Hide the desktop panel
    setShowMobileNearestStationsPanel(false); // Hide mobile panel
    // When closing nearest stations, also hide the mobile wrapper panel if it's showing nearest stations
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Check if the mobile wrapper is showing the nearest stations panel before hiding it
      // This is to avoid closing other panels if they were open
      // A more robust solution might involve tracking the active mobile panel type directly
      setShowStationPanel(false);
      setPanelHeight(0);
    }
     // Clear radius circles when closing panel
     if (radiusSourceRef.current) {
         radiusSourceRef.current.clear();
     }
  };

  // Clear radius circles when user location is cleared
  useEffect(() => {
    if (!userLocation && radiusSourceRef.current) {
        radiusSourceRef.current.clear();
    }
  }, [userLocation]);

  // Handle first interaction to request fullscreen - Removed direct listeners
  // Function will be called after welcome animation
  const handleFirstInteraction = () => {
    if (!fullscreenRequested && mapContainerRef.current) {
      console.log("Attempting to request fullscreen.");
      mapContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreenRequested(true);
    }
  };

  return (
    <div className={`map-container ${isDarkTheme ? 'dark-theme' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
         onClick={handleFirstInteraction}
         onTouchStart={handleFirstInteraction}
    >
      {showWelcome && (
        <WelcomeAnimation onAnimationComplete={() => {
          setShowWelcome(false);
        }} />
      )}
      <div id="map" className="map" ref={mapContainerRef}></div>
      <SearchBar 
        onStationSelect={handleSearchStationSelect} 
        onLineSelect={handleSearchLineSelect}
        isDarkTheme={true}
      />
      
      {/* Station Panel (Desktop) */}
      {selectedStation && (
      <div
        ref={stationPopupRef}
          className="fixed top-0 right-0 h-full z-50 hidden md:block"
        style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="h-full flex flex-col bg-black/95 backdrop-blur-sm border-l border-white/10 select-none">
            {/* Header with logo and close button */}
            <div className="w-full h-12 flex items-center justify-between px-4 bg-black/50 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium text-white">Station Details</div>
              </div>
              <button 
                onClick={() => {
                  setSelectedStationState(null);
                  if (overlayRef.current) {
                    overlayRef.current.setPosition(undefined);
                  }
                }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors select-none"
              >
                <span className="material-icons text-white/60">close</span>
              </button>
      </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto text-white/80 hide-scrollbar">
              <StationPanel
                selectedStation={selectedStation}
                onClose={() => {
                  setSelectedStationState(null);
                  if (overlayRef.current) {
                    overlayRef.current.setPosition(undefined);
                  }
                }}
                onStationClick={handleStationClick}
                stationSequences={enrichedStationSequences}
                isDarkTheme={true}
                onBackToLine={handleBackToLine}
                showBackButton={cameFromLine}
                onLineClick={handleLineClickFromStation}
              />
            </div>
          </div>
        </div>
      )}

      {/* Line Panel (Desktop) */}
      {selectedLine && !selectedStation && !showStationPanel && (
        <div
          className="fixed top-0 right-0 h-full z-50 hidden md:block"
          style={{
            width: '400px',
            maxWidth: '40vw',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="h-full flex flex-col bg-black/95 backdrop-blur-sm border-l border-white/10">
            {/* Header with logo and close button */}
            <div className="w-full h-12 flex items-center justify-between px-4 bg-black/50 border-b border-white/10 select-none">
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium text-white">Line Details</div>
              </div>
              <button 
                onClick={() => setSelectedLineState(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors select-none"
              >
                <span className="material-icons text-white/60">close</span>
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto text-white/80 hide-scrollbar">
              <LinePanel
                selectedLine={selectedLine}
                onClose={() => setSelectedLineState(null)}
                stationSequences={enrichedStationSequences}
                isDarkTheme={true}
                onStationClick={handleLinePanelStationClick}
                cameFromStation={cameFromStation}
                onBackToStation={handleBackToStation}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Panels */}
      {showStationPanel && (
        <div
          ref={panelRef}
          className="fixed inset-x-0 bottom-0 z-50 md:hidden touch-action-none"
          style={{
            height: `${panelHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            {/* Drag handle with improved touch target */}
            <div
              className="w-full h-16 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing touch-none bg-gray-900/95 border-b border-gray-700/50 rounded-t-2xl select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium text-white">
                  {showMobileNearestStationsPanel ? 'Nearest Stations' : selectedStation ? 'Station Details' : selectedLine ? 'Line Details' : ''}
                </div>
              </div>
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Panel content with improved touch handling */}
            {panelHeight > 40 && (
              <div className="flex-1 overflow-y-auto text-white/80 touch-action-none hide-scrollbar overscroll-contain">
                {showMobileNearestStationsPanel ? ( // Only check showMobileNearestStationsPanel
                    <NearestStationsPanel
                     nearestStations={nearestStations}
                     onClose={() => { // Use existing closeNearestStationsPanel for logic
                       closeNearestStationsPanel();
                       // closeNearestStationsPanel now handles hiding the mobile wrapper
                     }}
                     onStationClick={handleStationClick}
                    />
                ) : selectedStation ? (
        <StationPanel
          selectedStation={selectedStation}
                      onClose={() => {
                        setShowStationPanel(false);
                        setPanelHeight(0);
                      }}
          onStationClick={handleStationClick}
          stationSequences={enrichedStationSequences}
                      isDarkTheme={true}
                      onBackToLine={handleBackToLine}
                      showBackButton={cameFromLine}
                      onLineClick={handleLineClickFromStation}
                    />
                ) : selectedLine ? (
                    <LinePanel
                      selectedLine={selectedLine}
                      onClose={() => {
                        setShowStationPanel(false);
                        setPanelHeight(0);
                      }}
                      stationSequences={enrichedStationSequences}
                      isDarkTheme={true}
                      onStationClick={handleLinePanelStationClick}
                      cameFromStation={cameFromStation}
                      onBackToStation={handleBackToStation}
                    />
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearest Stations Panel (Mobile and Desktop) */}
      {showNearestStationsPanel && ( // This block is ONLY for Desktop
          <div className={`fixed inset-x-0 bottom-0 z-50 md:inset-y-0 md:left-auto md:right-0 md:w-96 md:max-w-sm bg-black/95 backdrop-blur-sm border-t border-white/10 md:border-t-0 md:border-l`}>
             <div className="w-full h-12 flex items-center justify-between px-4 bg-black/50 border-b border-white/10 select-none">
              <div className="text-lg font-medium text-white">Nearest Stations</div>
              <button
                onClick={closeNearestStationsPanel}
                className="p-2 rounded-full hover:bg-white/10 transition-colors select-none"
              >
                <span className="material-icons text-white/60">close</span>
              </button>
            </div>
            {/* Pass nearestStations to the actual panel component later */}
            <NearestStationsPanel
              nearestStations={nearestStations}
              onClose={closeNearestStationsPanel}
              onStationClick={handleStationClick}
            />
        </div>
      )}

      {/* Map Controls */}
      <div className={`map-controls ${selectedStation && !showStationPanel ? 'side-panel-open' : ''}`}>
        {/* Geolocation Button */}
        <button
          onClick={locateUser}
          className="map-control-button select-none"
          title="Locate me"
        >
          <span className="material-icons">my_location</span>
        </button>
        <button
          onClick={cycleMapStyle}
          className="map-control-button select-none"
          title={`Current: ${mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)} Map`}
        >
          <span className="material-icons">
            {mapStyle === 'dark' ? 'dark_mode' :
             mapStyle === 'light' ? 'light_mode' :
             mapStyle === 'satellite' ? 'satellite' :
             'map'}
          </span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="map-control-button select-none"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <span className="material-icons">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        </button>
        <button
          onClick={() => document.querySelector('.ol-rotate button').click()}
          className="map-control-button select-none"
          title="Reset rotation"
        >
          <span className="material-icons">navigation</span>
        </button>
      </div>

      <style>{`
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
          background-color: transparent;
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
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
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
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
          border-color: rgba(168, 85, 247, 1); /* purple-400 */
          transform: translateY(-1px);
        }

        .map-control-button:active {
          transform: translateY(0);
        }

        /* Hide scrollbar for specific elements */
        .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }

        .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .map-controls {
            top: 6em;
            bottom: auto;
            right: 1em;
            flex-direction: column;
            gap: 0.75em;
          }

          .map-controls.side-panel-open {
            bottom: calc(40px + 1em);
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

        /* Panel styles */
        .panel-header {
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
        }

        .panel-content {
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;

