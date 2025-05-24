import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const StationPanel = ({ selectedStation, onClose, onStationClick, stationSequences, isDarkTheme }) => {
  if (!selectedStation) return null;

  const [expandedLine, setExpandedLine] = useState(null);

  const lineColors = {
    "Blue Line": "#3280c3",
    "Green Line": "#52b747",
    "Red Line": "#e50000",
    "Orange Line": "#f76300",
    "Purple Line": "#790079",
    MRTS: "#008080",
    "South Line": "#a9a9a9",
    "West Line": "#0ddd22",
    "North Line": "#a0522d",
  };

  const getLineColor = (line) => lineColors[line] || "#9E9E9E";

  const getLogo = (network) => {
    switch (network) {
      case "Metro":
        return "/metro.svg";
      case "MRTS":
      case "Suburban":
        return "/railway.svg";
      default:
        return "/metro.svg";
    }
  };

  const getFeatureIcon = (type, available) => {
    if (available === "yes") {
      switch (type) {
        case "parking":
          return "/parking.svg";
        case "accessible":
          return "/accessible.svg";
        case "escalator":
          return "/escalator.svg";
        default:
          return null;
      }
    } else {
      switch (type) {
        case "parking":
          return "/noparking.svg";
        case "accessible":
          return "/noaccessibility.svg";
        case "escalator":
          return "/noescalator.svg";
        default:
          return null;
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "underground":
        return "/underground.svg";
      case "elevated":
        return "/elevated.svg";
      case "grade":
        return "/grade.svg";
      default:
        return null;
    }
  };

  const lines = selectedStation.line
    ? selectedStation.line.split(",").map((l) => l.trim())
    : [];

  const getConnectedStations = () => {
    if (!selectedStation.line || !stationSequences) return [];
    
    const lines = selectedStation.line.split(",").map((l) => l.trim());
    const connectedStations = new Set();
    
    lines.forEach(line => {
      const sequence = stationSequences[line] || [];
      const currentIndex = sequence.findIndex(station => station === selectedStation.name);
      
      if (currentIndex > 0) {
        connectedStations.add({
          name: sequence[currentIndex - 1],
          line: line
        });
      }
      if (currentIndex < sequence.length - 1) {
        connectedStations.add({
          name: sequence[currentIndex + 1],
          line: line
        });
      }
    });
    
    return Array.from(connectedStations);
  };

  const StationSequence = ({ line, currentStation, isDarkTheme }) => {
    const sequence = stationSequences?.[line] || [];
    const currentIndex = sequence.findIndex(
      (station) => station === currentStation
    );

    return (
      <div className={`mt-2 ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} p-3 rounded-lg border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="relative">
          {/* Vertical line - bottom layer */}
          <div className={`absolute left-[11px] top-0 bottom-0 w-0.5 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'} z-0`} />
          {/* Station sequence - top layer */}
          <div className="relative z-10">
            {sequence.map((station, index) => (
              <div
                key={station}
                className={`flex items-center mb-4 last:mb-0 ${
                  index === currentIndex
                    ? isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                    : isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    index === currentIndex
                      ? isDarkTheme ? 'bg-blue-400' : 'bg-blue-600'
                      : isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`text-xs ${isDarkTheme ? 'text-gray-900' : 'text-white'}`}>
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm">{station}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`station-panel ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="station-header">
        <div className="flex items-start gap-3">
          <img 
            src={getLogo(selectedStation.network)} 
            alt="Station Type" 
            className="h-10 w-auto opacity-80 mt-1"
          />
          <div>
            <h2 className="station-name">{selectedStation.name}</h2>
            {selectedStation.name_ta && (
              <h3 className="station-name-tamil">{selectedStation.name_ta}</h3>
            )}
          </div>
        </div>
      </div>

      <div className="station-details">
        <div className="detail-item">
          <span className="material-icons">train</span>
          <span className="detail-label">Line:</span>
          <div className="flex flex-wrap gap-2">
            {selectedStation.line.split(",").map((line, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${getLineColor(line.trim())}20`,
                  color: getLineColor(line.trim())
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLineColor(line.trim()) }}
                />
                {line.trim()}
              </div>
            ))}
          </div>
        </div>
        <div className="detail-item">
          <span className="material-icons">public</span>
          <span className="detail-label">Network:</span>
          <span className="detail-value">{selectedStation.network}</span>
        </div>
        <div className="detail-item">
          <span className="material-icons">confirmation_number</span>
          <span className="detail-label">Station ID:</span>
          <span className="detail-value">{selectedStation.id}</span>
        </div>
      </div>

      <div className="station-features">
        <div className="feature-item">
          <span className="material-icons">{selectedStation.parking === 'yes' ? 'local_parking' : 'no_parking'}</span>
          <span className="feature-label">Parking</span>
        </div>
        <div className="feature-item">
          <span className="material-icons">{selectedStation.accessible === 'yes' ? 'accessible' : 'not_accessible'}</span>
          <span className="feature-label">Accessible</span>
        </div>
        <div className="feature-item">
          <span className="material-icons">{selectedStation.escalator === 'yes' ? 'escalator' : 'stairs'}</span>
          <span className="feature-label">Escalator</span>
        </div>
      </div>

      <div className="station-connections">
        <h3 className="section-title">Connections</h3>
        <div className="connections-list">
          {getConnectedStations().map((station, index) => (
            <button
              key={index}
              className="connection-item"
              onClick={() => onStationClick(station)}
            >
              <div className="connection-dot" style={{ backgroundColor: getLineColor(station.line) }}></div>
              <span className="connection-name">{station.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="station-sequences">
        <h3 className="section-title">Line Sequences</h3>
        {selectedStation.line.split(",").map((line, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
              onClick={() => setExpandedLine(expandedLine === line ? null : line)}
              style={{
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLineColor(line.trim()) }}
                />
                <span className="font-medium">{line.trim()}</span>
              </div>
              {expandedLine === line ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedLine === line && (
              <StationSequence
                line={line.trim()}
                currentStation={selectedStation.name}
                isDarkTheme={isDarkTheme}
              />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .station-panel {
          padding: 1.5rem;
          font-family: "Cabin", "Noto Sans Tamil", serif;
        }

        .station-panel.dark-theme {
          color: rgba(255, 255, 255, 0.9);
        }

        .station-panel.light-theme {
          color: rgba(0, 0, 0, 0.9);
        }

        .station-header {
          margin-bottom: 1.5rem;
        }

        .station-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: inherit;
        }

        .station-name-tamil {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0.25rem 0 0;
          color: inherit;
          opacity: 0.8;
        }

        .station-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          color: inherit;
        }

        .detail-item .material-icons {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          opacity: 0.7;
          margin-top: 0.125rem;
        }

        .detail-label {
          font-weight: 500;
          margin-right: 0.5rem;
          opacity: 0.8;
          min-width: 80px;
        }

        .detail-value {
          opacity: 0.9;
        }

        .station-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .dark-theme .feature-item {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .light-theme .feature-item {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .feature-item .material-icons {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        .feature-label {
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0.8;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: inherit;
        }

        .connections-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .connection-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: inherit;
          text-align: left;
          width: 100%;
        }

        .dark-theme .connection-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .light-theme .connection-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .connection-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          margin-right: 0.75rem;
        }

        .connection-name {
          font-weight: 500;
          opacity: 0.9;
        }

        .station-sequences {
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .station-panel {
            padding: 1rem;
          }

          .station-name {
            font-size: 1.25rem;
          }

          .station-name-tamil {
            font-size: 1rem;
          }

          .feature-item {
            padding: 0.5rem;
          }

          .feature-item .material-icons {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StationPanel;