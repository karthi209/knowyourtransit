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
    // Sample sequence data structure (you'll need to provide this via props)
    const sequence = stationSequences?.[line] || [];
    const currentIndex = sequence.findIndex(
      (station) => station === currentStation
    );

    return (
      <div className={`mt-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg`}>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300" />

          {/* Station sequence */}
          {sequence.map((station, index) => (
            <div
              key={index}
              className={`relative flex items-center py-2 ${
                station === currentStation ? "font-bold" : ""
              }`}
            >
              {/* Station dot */}
              <div
                className={`
                w-2.5 h-2.5 rounded-full z-10 mr-4
                ${
                  station === currentStation
                    ? "bg-blue-500 ring-4 ring-blue-100"
                    : "bg-gray-400"
                }
              `}
              />

              {/* Station name */}
              <span
                className={`text-sm ${
                  station === currentStation ? "text-blue-600" : isDarkTheme ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {station}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`station-panel ${isDarkTheme ? 'dark-theme' : ''} bg-white dark:bg-[#1a1a1a] p-6 overflow-y-auto h-full select-none`}>
      {/* Header with close button */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
          <img
            src={getLogo(selectedStation.network)}
            alt="Station Logo"
            className="w-12 h-12 flex-shrink-0"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white select-none">
              {selectedStation.name}
            </h2>
            <p className="text-gray-800 dark:text-gray-300 mt-1 select-none">{selectedStation.name_ta}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors ${isDarkTheme ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'}`}
        >
          <X className={`w-6 h-6 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Station Features */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
          <img
            src={getFeatureIcon('parking', selectedStation.parking)}
            alt={selectedStation.parking === "yes" ? "Parking Available" : "No Parking"}
            className="w-6 h-6"
            style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
          />
          <span className="text-sm text-gray-900 dark:text-gray-300 select-none">
            {selectedStation.parking === "yes" ? "Parking" : "No Parking"}
          </span>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
          <img
            src={getFeatureIcon('accessible', selectedStation.accessible)}
            alt={selectedStation.accessible === "yes" ? "Accessibility Available" : "No Accessibility"}
            className="w-6 h-6"
            style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
          />
          <span className="text-sm text-gray-900 dark:text-gray-300 select-none">
            {selectedStation.accessible === "yes" ? "Accessible" : "Not Accessible"}
          </span>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
          <img
            src={getFeatureIcon('escalator', selectedStation.escalator)}
            alt={selectedStation.escalator === "yes" ? "Escalator Available" : "No Escalator"}
            className="w-6 h-6"
            style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
          />
          <span className="text-sm text-gray-900 dark:text-gray-300 select-none">
            {selectedStation.escalator === "yes" ? "Escalator" : "No Escalator"}
          </span>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
          <img
            src={getTypeIcon(selectedStation.type)}
            alt={selectedStation.type}
            className="w-6 h-6"
            style={{ filter: isDarkTheme ? "invert(1) brightness(1.2)" : "brightness(0.2)" }}
          />
          <span className="text-sm text-gray-900 dark:text-gray-300 select-none capitalize">
            {selectedStation.type} Station
          </span>
        </div>
      </div>

      {/* Lines and Sequences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white select-none">Lines and Sequences</h3>
        {lines.map((line, index) => (
          <div key={index} className={`${isDarkTheme ? 'bg-[#2a2a2a]' : 'bg-gray-100'} rounded-lg p-4`}>
            <button
              onClick={() => setExpandedLine(expandedLine === line ? null : line)}
              className="w-full flex items-center justify-between"
            >
              <span className={`inline-block px-3 py-1 rounded-lg text-white ${getLineColor(line)} select-none`}>
                {line}
              </span>
              {expandedLine === line ? (
                <ChevronUp className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
            </button>
            {expandedLine === line && (
              <StationSequence line={line} currentStation={selectedStation.name} isDarkTheme={isDarkTheme} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StationPanel;
