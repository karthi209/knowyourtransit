import React from "react";

const StationPopup = ({ selectedStation }) => {
  return (
    <div
      className="station-popup"
      style={{
        display: selectedStation ? "block" : "none",
        background: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "150px",
        maxWidth: "200px",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      {/* Display station information */}
      {selectedStation && (
        <div>
          <h3>{selectedStation.name}</h3>
          <p>{selectedStation.name_ta}</p>
          <p>{selectedStation.network}</p>
        </div>
      )}
    </div>
  );
};

export default StationPopup;
