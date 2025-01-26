import React, { useRef, useEffect } from "react";
import { Map, View } from "ol";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Overlay from "ol/Overlay";
import MVT from "ol/format/MVT";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke, Circle } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import Select from "ol/interaction/Select";
import { pointerMove } from "ol/events/condition";

const MapComponent = ({ setSelectedStation, setSelectedLine, stationDetails, lineDetails, visibleLines, lineColors }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);

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

    let isZooming = false; // Flag to track if the map is already zooming

    map.on('click', (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
    
      if (feature) {
        const stationName = feature.get('name');
        const lineName = feature.get('Name');
    
        if (stationName && stationDetails[stationName]) {
          // Handle station click
          setSelectedStation(stationDetails[stationName]);
          setSelectedLine(null);
          const coordinates = feature.getGeometry().getCoordinates();
          stationPopup.setPosition(coordinates);
        } else if (lineName && lineDetails[lineName]) {
          // Handle line click
          setSelectedLine(lineDetails[lineName]);
          setSelectedStation(null);
    
          // Check if the feature is a line (LineString or MultiLineString)
          const geometryType = feature.getGeometry().getType();
          console.log('Feature type:', geometryType);
    
          if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            // Calculate the extent of the entire line feature
            const extent = feature.getGeometry().getExtent();
            console.log('Extent:', extent);
    
            // Zoom to the extent of the entire line
            console.log('Zooming to extent...');
            map.getView().fit(extent, {
              padding: [50, 50, 50, 50], // Optional padding around the extent
              duration: 1000, // Optional animation duration in milliseconds
              maxZoom: 15, // Optional: Set a maximum zoom level
              minZoom: 10, // Optional: Set a minimum zoom level
            });
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
  }, [setSelectedStation, setSelectedLine, stationDetails, lineDetails, visibleLines, lineColors]);

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
  
    return new Style({
      stroke: new Stroke({
        color: lineColor,
        width: dynamicWidth,
        lineCap: "round",
        lineJoin: "round",
        offset: dynamicOffset,
      }),
    });
  };

  return (
    <div
      ref={mapContainerRef}
      style={{ flex: 1, height: "100%", position: "relative" }}
    />
  );
};

export default MapComponent;