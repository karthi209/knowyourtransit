import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const StationPanel = ({ selectedStation, onClose, onStationClick, stationSequences, isDarkTheme, onBackToLine, showBackButton, onLineClick }) => {
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
    console.log("StationSequence component rendering for line:", line);
    console.log("StationSequences prop structure:", stationSequences);
    const sequence = stationSequences?.[line] || [];
    console.log("Derived sequence for line:", line, ":", sequence);
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
          {showBackButton && (
            <button
              onClick={onBackToLine}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Back to Line"
            >
              <span className="material-icons text-white/60">arrow_back</span>
            </button>
          )}
          <img 
            src={getLogo(selectedStation.network)} 
            alt="Station Type" 
            className="h-10 w-auto opacity-80 mt-1"
          />
          <div>
            <h2 className="station-name">{selectedStation.name}</h2>
            {selectedStation.name_ta && (
              <h3 className="text-gray-300 text-base">{selectedStation.name_ta}</h3>
            )}
          </div>
        </div>
      </div>

      <div className="station-details">
        <div className="detail-item">
          <span className="material-icons text-purple-400">train</span>
          <span className="detail-label">Line:</span>
          <div className="flex flex-wrap gap-2">
            {selectedStation.line.split(",").map((line, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm text-white whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: `${getLineColor(line.trim())}${selectedStation.line.split(",").length > 1 ? '40' : ''}`,
                  border: 'none',
                  padding: '4px 8px',
                }}
                onClick={() => onLineClick(line.trim())}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLineColor(line.trim()) }}
                />
                {line.trim()}
              </button>
            ))}
          </div>
        </div>
        <div className="detail-item">
          <span className="material-icons text-purple-400">public</span>
          <span className="detail-label">Network:</span>
          <span className="text-white/90">{selectedStation.network}</span>
        </div>
        <div className="detail-item">
          <span className="material-icons text-purple-400">vpn_key</span>
          <span className="detail-label">Station ID:</span>
          <span className="text-white/90">{selectedStation.id}</span>
        </div>
      </div>

      <div className="features-grid grid grid-cols-3 gap-4 mt-6">
        <div className="feature-item flex flex-col items-center p-4 rounded-lg border border-gray-700/50 bg-gray-800/60 backdrop-filter backdrop-blur-sm hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-200">
          <img
            src={getFeatureIcon('parking', selectedStation.parking)}
            alt={selectedStation.parking === "yes" ? "Parking Available" : "No Parking"}
            className="w-6 h-6 mb-2 feature-icon"
          />
          <span className="text-white/90 text-xs">Parking</span>
        </div>
        <div className="feature-item flex flex-col items-center p-4 rounded-lg border border-gray-700/50 bg-gray-800/60 backdrop-filter backdrop-blur-sm hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-200">
          <img
            src={getFeatureIcon('accessible', selectedStation.accessible)}
            alt={selectedStation.accessible === "yes" ? "Accessibility Available" : "No Accessibility"}
            className="w-6 h-6 mb-2 feature-icon"
          />
          <span className="text-white/90 text-xs">Accessible</span>
        </div>
        <div className="feature-item flex flex-col items-center p-4 rounded-lg border border-gray-700/50 bg-gray-800/60 backdrop-filter backdrop-blur-sm hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-200">
          <img
            src={getFeatureIcon('escalator', selectedStation.escalator)}
            alt={selectedStation.escalator === "yes" ? "Escalator Available" : "No Escalator"}
            className="w-6 h-6 mb-2 feature-icon"
          />
          <span className="text-white/90 text-xs">Escalator</span>
        </div>
      </div>

      <div className="connections mt-6">
        <h4 className="text-white/90 text-lg font-semibold mb-4">Connections</h4>
        {getConnectedStations().length > 0 ? (
          <ul className="space-y-3">
            {getConnectedStations().map((station, index) => (
              <li key={index} className="connection-item flex items-center gap-3 p-3 rounded-lg border border-gray-700/50 bg-gray-800/60 backdrop-filter backdrop-blur-sm hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-200 cursor-pointer">
                 <div
                   className="w-2 h-2 rounded-full"
                   style={{ backgroundColor: getLineColor(station.line) }}
                 />
                 <span className="text-white/90 text-sm">{station.name}</span>
                 <span className="text-gray-400 text-xs">({station.line})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No direct connections found.</p>
        )}
      </div>

      {lines.length > 0 && ( selectedStation.network === "Metro" || selectedStation.network === "Suburban" ) && (
        <div className="line-sequences mt-6">
          <h4 className="text-white/90 text-lg font-semibold mb-4">Station Sequence</h4>
          {lines.map(line => (
            <div key={line} className="mb-4 last:mb-0 rounded-lg border border-gray-700/50 bg-gray-800/60 backdrop-filter backdrop-blur-sm overflow-hidden">
              <button 
                className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-purple-400/10 transition-colors"
                onClick={() => setExpandedLine(expandedLine === line ? null : line)}
              >
                <span className="text-white/90 font-medium">{line}</span>
                {expandedLine === line ? (
                  <ChevronUp className="text-gray-400 w-5 h-5" />
                ) : (
                  <ChevronDown className="text-gray-400 w-5 h-5" />
                )}
              </button>
              {expandedLine === line && stationSequences?.[line] && (
                <div className="p-4 pt-0">
                   <StationSequence line={line} currentStation={selectedStation.name} isDarkTheme={isDarkTheme} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .station-panel {
          padding: 1.5rem;
          font-family: "Cabin", "Noto Sans Tamil", serif;
          color: rgba(255, 255, 255, 0.9);
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border-left: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          height: 100%;
          overflow-y: auto; /* Ensure panel is scrollable if content overflows */
        }

        .station-panel.dark-theme {
          color: rgba(255, 255, 255, 0.9);
        }

        .station-panel.light-theme {
          color: rgba(0, 0, 0, 0.9);
        }

        .station-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
        }

        .station-name {
          font-size: 1.125rem; /* Slightly smaller than panel title */
          font-weight: 600;
          background: linear-gradient(to right, #a855f7, #ec4899); /* Keep gradient for station name */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .station-name-tamil {
           font-size: 1rem; /* Adjusted size */
           color: rgba(156, 163, 175, 1); /* text-gray-400 */
           margin-top: 0.25rem; /* Added some space */
        }

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .detail-item span.material-icons {
            margin-right: 0.5rem;
            font-size: 1.1rem;
        }

        .detail-label {
            font-weight: 500;
            margin-right: 0.5rem;
            color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .features-grid {
          /* Grid styles defined in the JSX */
        }

        .feature-item {
          /* Styles defined in the JSX */
        }

        .feature-icon {
          filter: invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%); /* Blue tint filter */
        }

        .connections {
          /* Styles defined in the JSX */
        }

        .connection-item {
          /* Styles defined in the JSX */
        }

        .line-sequences {
          /* Styles defined in the JSX */
        }

        /* Scrollbar styling */
        .station-panel::-webkit-scrollbar {
          width: 8px;
        }

        .station-panel::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          border-radius: 4px;
        }

        .station-panel::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 4px;
        }

        .station-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5); /* purple-400 with opacity */
        }

        /* Add media queries if needed for responsiveness */
      `}</style>
    </div>
  );
};

export default StationPanel;