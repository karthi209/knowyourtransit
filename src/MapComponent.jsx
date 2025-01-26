import React, { useRef, useEffect } from "react";
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
import { Style, Fill, Stroke, Circle } from "ol/style";
import { Point } from "ol/geom";
import { getFeatureStyle, lineColors } from "./styles";

const MapComponent = ({ setSelectedStation, setSelectedLine, visibleLines }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationPopupRef = useRef(null);
  const overlayRef = useRef(null);

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
      style: (feature) => getFeatureStyle(feature, visibleLines),
    });

    const stationLayer = new VectorLayer({
      source: new VectorSource({
        url: "/stations.geojson",
        format: new GeoJSON({
          featureProjection: "EPSG:3857",
        }),
      }),
      style: (feature) => {
        const map = mapInstanceRef.current;
        if (!map) return null;

        const zoomLevel = map.getView().getZoom();
        const radius = 2 + (zoomLevel - 10) * 0.5;
        const associatedLines = feature.get("lines") || [];

        if (!associatedLines.length) {
          return new Style({
            image: new Circle({
              radius: radius,
              fill: new Fill({ color: "red" }),
              stroke: new Stroke({ color: "white", width: 1 }),
            }),
          });
        }

        const stationPosition = feature.getGeometry().getCoordinates();
        const styles = associatedLines.map((line, index) => {
          const angleStep = (2 * Math.PI) / associatedLines.length;
          const angle = index * angleStep;
          const offset = 5;

          return new Style({
            image: new Circle({
              radius: radius,
              fill: new Fill({ color: lineColors[line] || "red" }),
              stroke: new Stroke({ color: "white", width: 1 }),
            }),
            geometry: new Point([
              stationPosition[0] + Math.cos(angle) * offset,
              stationPosition[1] + Math.sin(angle) * offset,
            ]),
          });
        });

        return styles;
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
      layers: [baseLayer, vtLayer, stationLayer],
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

    // Add cursor change logic
    let isOnFeature = false;

    map.on("pointermove", (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
      isOnFeature = !!feature;
      map.getTargetElement().style.cursor = isOnFeature ? "pointer" : "grab";
    });

    map.on("pointerdown", () => {
      map.getTargetElement().style.cursor = isOnFeature ? "pointer" : "grabbing";
    });

    map.on("pointerdrag", () => {
      map.getTargetElement().style.cursor = "grabbing";
    });

    map.on("pointerup", () => {
      map.getTargetElement().style.cursor = isOnFeature ? "pointer" : "grab";
    });

    map.on("click", (e) => {
      const features = [];
      map.forEachFeatureAtPixel(e.pixel, (feature) => {
        if (feature.get("name")) {
          features.push(feature);
        }
      });

      if (!features.length) {
        setSelectedStation(null);
        setSelectedLine(null);
        return;
      }

      const feature = features[0];
      const stationName = feature.get("name");

      if (stationName) {
        handleStationClick(feature, stationName);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
      overlayRef.current = null;
    };
  }, [visibleLines]);

  const handleStationClick = (feature, stationName) => {
    const station = {
      name: stationName,
      network: feature.get("network"),
      name_ta: feature.get("name_ta"),
      lines: [],
    };

    setSelectedStation(station);

    const coordinates = feature.getGeometry().getCoordinates();

    if (overlayRef.current) {
      overlayRef.current.setPosition(coordinates);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().animate({
        center: coordinates,
        duration: 1000,
        zoom: Math.max(mapInstanceRef.current.getView().getZoom(), 15),
      });
    }
  };

  return <div ref={mapContainerRef} style={{ flex: 1, height: "100%" }} />;
};

export default MapComponent;
