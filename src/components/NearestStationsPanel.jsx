import React from 'react';

const NearestStationsPanel = ({ nearestStations, onClose, onStationClick }) => {
  // nearestStations is now an object with categories: { '0-600m': [...], '600m-1km': [...], '1km-2km': [...], ... }

  const categories = ['0-600m', '600m-1km', '1km-2km']; // Updated categories

  return (
    <div className="flex flex-col h-full">
      {/* Header - Already added in MapComponent placeholder, but good to keep structure in mind */}
      {/* The close button will be handled in MapComponent for now */}

      {/* Nearest Stations List */}
      <div className="flex-1 overflow-y-auto p-4 text-white/80">
        {categories.map(category => {
          const stationsInCategory = nearestStations[category] || [];
          if (stationsInCategory.length === 0) return null; // Don't render category if empty

          return (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-white mb-3">{category}</h3>
              <ul className="space-y-3">
                {stationsInCategory.map((station, index) => (
                  <li
                    key={station.id || station.name || index} // Use station.id, fallback to name or index
                    className="cursor-pointer hover:bg-white/5 rounded-lg p-3 transition-colors"
                    onClick={() => onStationClick(station.feature)} // Pass the original feature on click
                  >
                    <div className="font-medium text-white">{station.name}</div>
                    <div className="text-sm text-white/60">{station.distance.toFixed(0)} meters away</div>
                    {/* Optionally display line/network here */}
                    {station.line && (
                       <div className="text-xs text-white/50 mt-1">Line: {station.line}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Message if no stations found in any category within the 5km range */}
        {!categories.some(category => (nearestStations[category] || []).length > 0) && (
             <p>No stations found within 2km.</p>
        )}

      </div>
    </div>
  );
};

export default NearestStationsPanel; 