import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const StationPanel = ({ selectedStation, onClose, stationSequences }) => {
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

  const StationSequence = ({ line, currentStation }) => {
    // Sample sequence data structure (you'll need to provide this via props)
    const sequence = stationSequences?.[line] || [];
    const currentIndex = sequence.findIndex(
      (station) => station === currentStation
    );

    return (
      <div className="mt-2 bg-gray-50 p-3 rounded-lg">
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
                  station === currentStation ? "text-blue-600" : "text-gray-600"
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
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg p-6 overflow-y-auto">
      {/* Keep existing header section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
          <img
            src={getLogo(selectedStation.network)}
            alt="Station Logo"
            className="w-12 h-12 flex-shrink-0"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedStation.name}
            </h2>
            <p className="text-gray-600 mt-1">{selectedStation.name_ta}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Keep existing features sections */}
      <div className="mt-6">
        {/* Station Features */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Station Features</h3>
          <div className="flex gap-4 mb-4">
            <div className="flex flex-col items-center">
              <img
                src={getFeatureIcon("parking", selectedStation.parking)}
                alt="Parking"
                className="w-8 h-8 mb-1"
                style={{
                  filter:
                    "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)",
                }}
              />
              <span className="text-sm text-gray-600">
                {selectedStation.parking === "yes" ? "Parking" : "No Parking"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getFeatureIcon("accessible", selectedStation.accessible)}
                alt="Accessibility"
                className="w-8 h-8 mb-1"
                style={{
                  filter:
                    "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)",
                }}
              />
              <span className="text-sm text-gray-600">
                {selectedStation.accessible === "yes"
                  ? "Accessible"
                  : "Not Accessible"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getFeatureIcon("escalator", selectedStation.escalator)}
                alt="Escalator"
                className="w-8 h-8 mb-1"
                style={{
                  filter:
                    "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)",
                }}
              />
              <span className="text-sm text-gray-600">
                {selectedStation.escalator === "yes"
                  ? "Escalator"
                  : "No Escalator"}
              </span>
            </div>
          </div>
        </div>

        {/* Station Type */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Station Type</h3>
          <div className="flex items-center gap-2">
            <img
              src={getTypeIcon(selectedStation.type)}
              alt={selectedStation.type}
              className="w-6 h-6"
              style={{
                filter:
                  "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)",
              }}
            />
            <span className="text-gray-600 capitalize">
              {selectedStation.type} Station
            </span>
          </div>
        </div>
      </div>
      {/* Lines with Sequence */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Lines and Sequences</h3>
        <div className="space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedLine(expandedLine === line ? null : line)
                }
                className={`w-full flex items-center justify-between p-3 ${getLineColor(
                  line
                )} text-white`}
              >
                <span>{line}</span>
                {expandedLine === line ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedLine === line && (
                <StationSequence
                  line={line}
                  currentStation={selectedStation.name}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StationPanel;
