import React from "react";
import { X } from "lucide-react";

const LinePanel = ({ selectedLine, onClose, stationSequences, isDarkTheme, onStationClick, cameFromStation, onBackToStation }) => {
  if (!selectedLine) return null;

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
        return "/metro.svg"; // Default to metro logo
    }
  };

  // stationSequences is now expected to be an array of line objects
  const sequence = Array.isArray(stationSequences) 
    ? stationSequences.find(seq => seq.line === selectedLine)
    : null;

  if (!sequence || !Array.isArray(sequence.stations) || sequence.stations.length === 0) {
    return (
      <div className="p-4 text-white/80">
        <p>No sequence information available for this line.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        {cameFromStation && (
          <button
            onClick={onBackToStation}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Back to Station"
          >
            <span className="material-icons text-white/60">arrow_back</span>
          </button>
        )}
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: getLineColor(selectedLine) }}
        ></div>
        <h2 className="text-xl font-semibold text-white">{selectedLine}</h2>
      </div>

      {/* Line Sequence */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-black/50 rounded-lg p-4 border border-white/10">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20"></div>
            
            {/* Stations */}
            {sequence.stations.map((station, index) => (
              // Ensure station object and name property exist
              station && station.name ? (
                <div key={station.id || station.name} className="relative mb-4 last:mb-0 flex items-center">
                  {/* Vertical line segment - relative to this flex item */}
                  {index > 0 && (
                    <div className="absolute top-0 left-[11.5px] w-0.5 h-3 -translate-x-1/2 bg-white/20"></div>
                  )}
                  {/* Station Indicator Column */}
                  <div className="flex flex-row items-center justify-center z-10" style={{ width: '32px', flexShrink: 0 }}>
                    {/* Single solid circle with number */}
                    <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center text-xs font-medium text-black bg-white">
                      {index + 1}
                    </div>
                  </div>

                  {/* Station Name and Details Column */}
                  <div
                    className="flex-1 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                    onClick={() => onStationClick(station)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Use station.network to get the correct logo */}
                      <img
                        src={getLogo(station.network)}
                        alt="Station Type"
                        className="h-5 w-auto opacity-80"
                      />
                      <div className="text-white font-medium">{station.name}</div>
                    </div>
                    {station.name_ta && (
                      <div className="text-white/60 text-sm font-noto-tamil ml-7">{station.name_ta}</div>
                    )}
                  </div>
                   {/* Vertical line segment - relative to this flex item */}
                   {index < sequence.stations.length - 1 && (
                    <div className="absolute bottom-0 left-[11.5px] w-0.5 h-[12px] -translate-x-1/2 bg-white/20"></div>
                  )}
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .line-panel {
          padding: 1.5rem;
          font-family: "Cabin", "Noto Sans Tamil", serif;
          color: rgba(255, 255, 255, 0.9);
        }

        .line-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .line-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: inherit;
        }

        .line-dot {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
        }

        .line-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: inherit;
        }

        .detail-item .material-icons {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          opacity: 0.7;
        }

        .detail-label {
          font-weight: 500;
          margin-right: 0.5rem;
          opacity: 0.8;
        }

        .detail-value {
          opacity: 0.9;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: inherit;
        }

        .station-sequence {
          background-color: rgba(42, 42, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .line-panel {
            padding: 1rem;
          }

          .line-name {
            font-size: 1.25rem;
          }

          .line-dot {
            width: 0.875rem;
            height: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LinePanel; 