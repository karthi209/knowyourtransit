import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const StationPanel = ({ selectedStation, onClose, stationSequences, isDarkTheme }) => {
  if (!selectedStation) return null;

  const [expandedLine, setExpandedLine] = useState(null);

  const lineColors = {
    "Blue Line": "bg-[#3280c3]",
    "Green Line": "bg-[#52b747]",
    "Red Line": "bg-[#e50000]",
    "Orange Line": "bg-[#f76300]",
    "Purple Line": "bg-[#790079]",
    MRTS: "bg-[#008080]",
    "South Line": "bg-[#a9a9a9]",
    "West Line": "bg-[#0ddd22]",
    "North Line": "bg-[#a0522d]",
  };

  const getLineColor = (line) => lineColors[line] || "bg-gray-500";

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
    <div className={`station-panel ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <img
              src={getLogo(selectedStation.network)}
              alt="Station Logo"
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {selectedStation.name}
              </h2>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedStation.name_ta}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className={`space-y-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Station Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Line</span>
                <div className="flex items-center gap-2">
                  {lines.map((line) => (
                    <div key={line} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getLineColor(line)}`}></div>
                      <span className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Network</span>
                <span className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {selectedStation.network}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Station ID</span>
                <span className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {selectedStation.id}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Facilities
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center space-x-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <img
                  src={getFeatureIcon('parking', selectedStation.parking)}
                  alt={selectedStation.parking === "yes" ? "Parking Available" : "No Parking"}
                  className="w-6 h-6"
                  style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
                />
                <span className="text-sm">{selectedStation.parking === "yes" ? "Parking" : "No Parking"}</span>
              </div>
              <div className={`flex items-center space-x-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <img
                  src={getFeatureIcon('accessible', selectedStation.accessible)}
                  alt={selectedStation.accessible === "yes" ? "Accessibility Available" : "No Accessibility"}
                  className="w-6 h-6"
                  style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
                />
                <span className="text-sm">{selectedStation.accessible === "yes" ? "Accessible" : "Not Accessible"}</span>
              </div>
              <div className={`flex items-center space-x-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <img
                  src={getFeatureIcon('escalator', selectedStation.escalator)}
                  alt={selectedStation.escalator === "yes" ? "Escalator Available" : "No Escalator"}
                  className="w-6 h-6"
                  style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
                />
                <span className="text-sm">{selectedStation.escalator === "yes" ? "Escalator" : "No Escalator"}</span>
              </div>
              <div className={`flex items-center space-x-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <img
                  src={getTypeIcon(selectedStation.type)}
                  alt={selectedStation.type}
                  className="w-6 h-6"
                  style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
                />
                <span className="text-sm capitalize">{selectedStation.type} Station</span>
              </div>
            </div>
          </div>

          {selectedStation.line && (
            <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  Line Sequences
                </h3>
                <button
                  onClick={() => setExpandedLine(expandedLine === 'all' ? null : 'all')}
                  className={`p-1 rounded-full ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {expandedLine === 'all' ? (
                    <ChevronUp className={`w-5 h-5 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`} />
                  )}
                </button>
              </div>
              {expandedLine === 'all' && (
                <div className="space-y-4">
                  {lines.map((line) => (
                    <div key={line} className="mt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${getLineColor(line)}`}></div>
                        <span className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                          {line}
                        </span>
                      </div>
                      <StationSequence
                        line={line}
                        currentStation={selectedStation.name}
                        isDarkTheme={isDarkTheme}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationPanel;