import React from "react";

const StationPopup = ({ selectedStation, setSelectedStation }) => {
  return (
    <div
      className="station-popup"
      style={{
        display: selectedStation ? "block" : "none",
        position: "absolute",
        background: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "200px",
        maxWidth: "300px",
        zIndex: 1000,
        pointerEvents: "auto",
        transform: "translate(-50%, -100%)", // Center above the click
      }}
    >
      {selectedStation && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h5 style={{ margin: 0 }}>{selectedStation.name}</h5>
            <button
              onClick={() => {
                setSelectedStation(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                padding: "0 5px",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: "14px" }}>
            {selectedStation.name_ta && (
              <p style={{ marginBottom: "8px" }}>
                <strong>Tamil Name:</strong> {selectedStation.name_ta}
              </p>
            )}
            {selectedStation.network && (
              <p style={{ marginBottom: "8px" }}>
                <strong>Network:</strong> {selectedStation.network}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StationPopup;