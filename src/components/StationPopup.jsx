import React from "react";

const StationPopup = ({ selectedStation }) => {
  return (
    <div
      className="station-popup"
      style={{
        display: selectedStation ? "block" : "none",
        fontSize: "13px",
        background: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "200px",
        maxWidth: "300px",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      {/* Display station information */}
      {selectedStation && (
        <div>
          <h5>{selectedStation.name}</h5>
          <h6>{selectedStation.name_ta}</h6>
          <p >Station Code: {selectedStation.id}</p>
          <p
            style={{
              display: "inline-block",
              backgroundColor: "blue",
              marginTop: "10px",
              borderRadius: "8px",
              padding: "5px",
              paddingLeft:"8px",
              paddingRight:"8px",
              color: "white",
            }}
          >
            {selectedStation.line}
          </p>
        </div>
      )}
    </div>
  );
};

export default StationPopup;
