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
      <div className="p-4 border-b border-gray-700/50 flex items-center gap-3 bg-gray-900/95 backdrop-filter backdrop-blur-sm">
        {cameFromStation && (
          <button
            onClick={onBackToStation}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Back to Station"
          >
            <span className="material-icons text-gray-400">arrow_back</span>
          </button>
        )}
        <div
          className="w-4 h-4 rounded-full line-dot"
          style={{ backgroundColor: getLineColor(selectedLine) }}
        ></div>
        <h2 className="line-name text-xl font-semibold">{selectedLine}</h2>
      </div>

      {/* Line Sequence */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="station-sequence bg-gray-800/60 rounded-lg p-4 border border-gray-700/50 backdrop-filter backdrop-blur-sm">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11.5px] top-0 bottom-0 w-0.5 bg-gray-600"></div>
            
            {/* Stations */}
            {sequence.stations.map((station, index) => (
              // Ensure station object and name property exist
              station && station.name ? (
                <div key={station.id || station.name} className="relative mb-4 last:mb-0 flex items-center station-item rounded-lg p-2 cursor-pointer hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-200 border border-transparent">
                  {/* Vertical line segment - relative to this flex item */}
                  {index > 0 && (
                    <div className="absolute top-0 left-[11.5px] w-0.5 h-3 -translate-x-1/2 bg-gray-600"></div>
                  )}
                  {/* Station Indicator Column */}
                  <div className="flex flex-row items-center justify-center z-10" style={{ width: '32px', flexShrink: 0 }}>
                    {/* Single solid circle with number */}
                    <div className="w-6 h-6 rounded-full border border-gray-700/50 flex items-center justify-center text-xs font-medium text-white bg-gray-600">
                      {index + 1}
                    </div>
                  </div>

                  {/* Station Name and Details Column */}
                  <div
                    className="flex-1"
                    onClick={() => onStationClick(station)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Use station.network to get the correct logo */}
                      <img
                        src={getLogo(station.network)}
                        alt="Station Type"
                        className="h-5 w-auto opacity-80"
                      />
                      <div className="text-white/90 font-medium">{station.name}</div>
                    </div>
                    {station.name_ta && (
                      <div className="text-gray-400 text-sm font-noto-tamil ml-7">{station.name_ta}</div>
                    )}
                  </div>
                   {/* Vertical line segment - relative to this flex item */}
                   {index < sequence.stations.length - 1 && (
                    <div className="absolute bottom-0 left-[11.5px] w-0.5 h-[12px] -translate-x-1/2 bg-gray-600"></div>
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
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border-left: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          height: 100%;
          overflow-y: auto; /* Ensure panel is scrollable if content overflows */
        }

        .line-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
        }

        .line-name {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(to right, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .line-dot {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .line-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: inherit;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .detail-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .detail-item .material-icons {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          opacity: 0.7;
          color: #a855f7; /* purple-400 */
        }

        .detail-label {
          font-weight: 500;
          margin-right: 0.5rem;
          opacity: 0.8;
          color: rgba(255, 255, 255, 0.9);
        }

        .detail-value {
          opacity: 0.9;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: inherit;
          background: linear-gradient(to right, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .station-sequence {
          background-color: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .station-sequence:hover {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
          border-color: rgba(168, 85, 247, 1); /* purple-400 */
          transform: translateY(-2px);
        }

        .station-item {
          background-color: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 0.5rem;
          padding: 0.75rem;
          transition: all 0.2s ease;
        }

        .station-item:hover {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
          border-color: rgba(168, 85, 247, 1); /* purple-400 */
          transform: translateY(-2px);
        }

        /* Vertical line within sequence */
        .station-sequence .relative > .absolute.bg-gray-600 {
           /* styles already set in JSX for segments */
        }

        /* Station number circle */
        .station-sequence .z-10 > div.flex-row > div.rounded-full {
           /* styles already set in JSX */
        }

        /* Scrollbar styling */
        .line-panel::-webkit-scrollbar {
          width: 8px;
        }

        .line-panel::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          border-radius: 4px;
        }

        .line-panel::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 4px;
        }

        .line-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5); /* purple-400 with opacity */
        }

        @media (max-width: 768px) {
          .line-panel {
            padding: 1rem;
          }

          .line-name {
            font-size: 1.125rem;
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