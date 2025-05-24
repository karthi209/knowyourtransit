import React from "react";
import { X } from "lucide-react";

const LinePanel = ({ selectedLine, onClose, stationSequences, isDarkTheme, onStationClick }) => {
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
      <div className="p-4 border-b border-white/10">
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
                <div key={station.id || station.name} className="relative mb-6 last:mb-0">
                  {/* Station circle */}
                  <div className="absolute left-3 w-3 h-3 rounded-full bg-white/80 border-2 border-white/40 transform -translate-x-1/2"></div>
                  
                  {/* Station number */}
                  <div className="absolute left-3 w-6 h-6 rounded-full bg-white/20 border border-white/40 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-medium text-white">
                    {index + 1}
                  </div>
                  
                  {/* Station name with logo */}
                  <div 
                    className="ml-8 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
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