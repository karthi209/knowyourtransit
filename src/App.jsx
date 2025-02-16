import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "ol/ol.css";
import MapComponent from "./components/MapComponent";
import StationPopup from "./components/StationPopup";
import LayerControl from "./components/LayerControl";
import LineDetails from "./components/LineDetails";

const App = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    BlueLine: true,
    GreenLine: true,
    RedLine: true,
    OrangeLine: true,
    PurpleLine: true,
    NorthLine: true,
    SouthLine: true,
    WestLine: true,
    MRTSLine: true,
  });

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <MapComponent
        setSelectedStation={setSelectedStation}
        setSelectedLine={setSelectedLine}
        visibleLines={visibleLines}
      />
      <StationPopup
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
      />
      <LineDetails selectedLine={selectedLine} />
      <LayerControl
        visibleLines={visibleLines}
        setVisibleLines={setVisibleLines}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "200px",
          padding: "10px",
          background: "#f0f0f0",
          zIndex: 1000,
        }}
      />
    </div>
  );
};

export default App;