import React from 'react';

const LinePanel = ({ selectedLine, onClose, onStationClick }) => {
  if (!selectedLine) return null;

  return (
    <div 
      style={{
        width: '300px',
        background: '#f8f9fa',
        padding: '15px',
        borderLeft: '1px solid #ccc',
        height: '100%',
        overflowY: 'auto',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ margin: 0 }}>{selectedLine.name} Details</h5>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
        >
          ×
        </button>
      </div>
      <div style={{ marginTop: '15px' }}>
        <p>
          <strong>Color:</strong> 
          <span style={{ 
            display: 'inline-block', 
            width: '20px', 
            height: '20px', 
            backgroundColor: selectedLine.color,
            marginLeft: '10px',
            verticalAlign: 'middle'
          }}></span>
        </p>
        <p><strong>Length:</strong> {selectedLine.length || 'N/A'}</p>
        <p><strong>Average Frequency:</strong> {selectedLine.avgFrequency || 'N/A'}</p>
        <div>
          <strong>Stations:</strong>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {selectedLine.stations?.map((station, index) => (
              <li 
                key={index}
                style={{ 
                  cursor: 'pointer',
                  color: 'blue',
                  textDecoration: 'underline',
                  marginTop: '5px'
                }}
                onClick={() => onStationClick && onStationClick(station)}
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

export default LinePanel;