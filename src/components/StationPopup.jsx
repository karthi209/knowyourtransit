import React from "react";

const StationPopup = ({ selectedStation, setSelectedStation, setSelectedLine, stationDetails }) => {
  if (!selectedStation) return null;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        maxWidth: '250px'
      }}
    >
      <h6>{selectedStation.name}</h6>
      <p>Lines: {selectedStation.lines.join(', ')}</p>
      <p>Address: {selectedStation.address}</p>
      <div>
        <strong>Facilities:</strong>
        <ul>
          {selectedStation.facilities.map((facility, index) => (
            <li key={index}>{facility}</li>
          ))}
        </ul>
      </div>
      <button 
        onClick={() => {
          const selectedLines = selectedStation.lines;
          if (selectedLines.length > 0) {
            setSelectedLine(stationDetails[selectedLines[0]]);
          }
        }}
      >
        Show Line Details
      </button>
    </div>
  );
};

export default StationPopup;