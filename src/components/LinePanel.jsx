import React from "react";
import { X } from "lucide-react";

const LinePanel = ({ selectedLine, onClose, stationSequences, isDarkTheme }) => {
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

  const sequence = stationSequences?.[selectedLine] || [];

  const getStationCount = () => sequence.length;

  const getStations = () => sequence;

  return (
    <div className="line-panel dark-theme">
      <div className="line-header">
        <h2 className="line-name">{selectedLine}</h2>
        <div className="line-dot" style={{ backgroundColor: getLineColor(selectedLine) }}></div>
      </div>

      <div className="line-details">
        <div className="detail-item">
          <span className="material-icons">route</span>
          <span className="detail-label">Type:</span>
          <span className="detail-value">Metro Line</span>
        </div>
        <div className="detail-item">
          <span className="material-icons">train</span>
          <span className="detail-label">Stations:</span>
          <span className="detail-value">{getStationCount()} stations</span>
        </div>
      </div>

      <div className="line-stations">
        <h3 className="section-title">Station Sequence</h3>
        <div className="station-sequence">
          <div className="relative">
            {/* Vertical line - bottom layer */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-600 z-0" />
            {/* Station sequence - top layer */}
            <div className="relative z-10">
              {sequence.map((station, index) => (
                <div
                  key={station}
                  className="flex items-center mb-4 last:mb-0 text-gray-300"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-3 bg-gray-600"
                  >
                    <span className="text-xs text-gray-900">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm">{station}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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