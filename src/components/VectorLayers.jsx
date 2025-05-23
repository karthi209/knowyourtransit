import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Circle } from "ol/style";
import { GeoJSON } from "ol/format";
import { getFeatureStyle } from "../styles/LineStyles";
import { getStationStyle } from "../styles/StationStyles"; // Import station styles

// Lazy-loaded vector sources (loaded only when required)
const createVectorSource = (url) =>
  new VectorSource({
    url,
    format: new GeoJSON(),
  });

const stationLayoutStyle = new Style({
  fill: new Fill({ color: "rgba(128, 128, 128, 0.5)" }),
});

const walkStyle = new Style({
  stroke: new Stroke({
    color: "rgba(106, 105, 105, 0.5)",
    width: 2,
    lineDash: [10, 5], // Dashed line
  }),
});

export const createVectorLayerStations = (mapInstance) => {
  return new VectorLayer({
    source: new VectorSource({
      url: "/data/stations.geojson",
      format: new GeoJSON({ featureProjection: "EPSG:3857" }),
    }),
    style: (feature) => getStationStyle(feature, mapInstance),
  });
};

export const vectorLayerLines = new VectorLayer({
  source: createVectorSource("/data/lines.geojson"),
  style: (feature, resolution) => {
    const zoom = Math.log2(156543.03 / resolution); // Convert resolution to zoom
    return getFeatureStyle(feature, zoom);
  },
});

export const vectorLayerStationLayouts = new VectorLayer({
  source: createVectorSource("/data/stationLayouts.geojson"),
  style: stationLayoutStyle,
});

export const vectorLayerStationWalks = new VectorLayer({
  source: createVectorSource("/data/walks.geojson"),
  style: walkStyle,
});
