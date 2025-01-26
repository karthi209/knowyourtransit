import React from "react";

const LineDetailsSidebar = ({ selectedLine, setSelectedLine, stationDetails, setSelectedStation }) => {
  if (!selectedLine) return null;

  return (
    <div 
      style={{
        width: '300px',
        background: '#f8f9fa',
        padding: '15px',
        borderLeft: '1px solid #ccc',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ margin: 0 }}>{selectedLine.name} Details</h5>
        <button 
          onClick={() => setSelectedLine(null)} 
          style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
        >
          ×
        </button>
      </div>
      <div style={{ marginTop: '15px' }}>
        <p><strong>Color:</strong> <span style={{ 
          display: 'inline-block', 
          width: '20px', 
          height: '20px', 
          backgroundColor: selectedLine.color 
        }}></span></p>
        <p><strong>Length:</strong> {selectedLine.length}</p>
        <p><strong>Average Frequency:</strong> {selectedLine.avgFrequency}</p>
        <div>
          <strong>Stations:</strong>
          <ul>
            {selectedLine.stations.map((station, index) => (
              <li 
                key={index}
                style={{ 
                  cursor: 'pointer',
                  color: 'blue',
                  textDecoration: 'underline'
                }}
                onClick={() => {
                  setSelectedStation(stationDetails[station]);
                }}
              >
                {station}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LineDetailsSidebar;