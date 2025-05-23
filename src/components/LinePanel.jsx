import React from "react";
import { X } from "lucide-react";

const LinePanel = ({ selectedLine, onClose, stationSequences, isDarkTheme }) => {
  if (!selectedLine) return null;

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

  const sequence = stationSequences?.[selectedLine] || [];

  return (
    <div className={`line-panel ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getLineColor(selectedLine)}`}>
              <span className="text-white text-xl font-bold">
                {selectedLine.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {selectedLine}
              </h2>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                {sequence.length} Stations
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
              Station Sequence
            </h3>
            <div className="relative">
              {/* Vertical line - bottom layer */}
              <div className={`absolute left-[11px] top-0 bottom-0 w-0.5 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'} z-0`} />
              {/* Station sequence - top layer */}
              <div className="relative z-10">
                {sequence.map((station, index) => (
                  <div
                    key={station}
                    className={`flex items-center mb-4 last:mb-0 ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
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
        </div>
      </div>
    </div>
  );
};

export default LinePanel; 