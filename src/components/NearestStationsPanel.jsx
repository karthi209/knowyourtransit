import React from 'react';

const NearestStationsPanel = ({ nearestStations, onClose, onStationClick }) => {
  // nearestStations is now an object with categories: { '0-600m': [...], '600m-1km': [...], '1km-2km': [...], ... }

  const categories = ['0-500m', '500m-1km', '1km-1.5km']; // Updated categories

  return (
    <div className="flex flex-col h-full">
      {/* Header - Already added in MapComponent placeholder, but good to keep structure in mind */}
      {/* The close button will be handled in MapComponent for now */}

      {/* Nearest Stations List */}
      <div className="flex-1 overflow-y-auto p-4 text-white/80">
        {categories.map(category => {
          const stationsInCategory = nearestStations[category] || [];
          if (stationsInCategory.length === 0) return null; // Don't render category if empty

          // Sort stations within the category by distance
          const sortedStations = [...stationsInCategory].sort((a, b) => a.distance - b.distance);

          return (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-white mb-3">{category}</h3>
              <ul className="space-y-3">
                {sortedStations.map((station, index) => (
                  <li
                    key={station.id || `${station.name}-${index}`}
                    className="cursor-pointer hover:bg-white/5 rounded-lg p-3 transition-colors"
                    onClick={() => onStationClick(station.feature)}
                  >
                    <div className="font-medium text-white">{station.name}</div>
                    <div className="text-sm text-white/60">
                      {station.distance > 1000 
                        ? `${(station.distance / 1000).toFixed(2)} km away`
                        : `${station.distance.toFixed(0)} meters away`}
                    </div>
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
             <p className="text-white/60">No stations found within 1.5km.</p>
        )}

      </div>

      <style jsx="true">{`
        .nearest-stations-panel {
          padding: 1.5rem;
          font-family: "Cabin", "Noto Sans Tamil", serif;
          color: rgba(255, 255, 255, 0.9);
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border-left: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: inherit;
          background: linear-gradient(to right, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .close-button {
          padding: 0.5rem;
          border-radius: 9999px;
          transition: all 0.2s ease;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .close-button:hover {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
          color: rgba(168, 85, 247, 1); /* purple-400 */
        }

        .distance-category {
          margin-bottom: 1.5rem;
        }

        .category-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .station-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .station-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          background-color: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .station-item:hover {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
          border-color: rgba(168, 85, 247, 1); /* purple-400 */
          transform: translateY(-2px);
        }

        .station-icon {
          width: 2rem;
          height: 2rem;
          margin-right: 0.75rem;
          opacity: 0.8;
        }

        .station-info {
          flex: 1;
        }

        .station-name {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .station-details {
          font-size: 0.875rem;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .distance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          color: rgba(168, 85, 247, 1); /* purple-400 */
        }

        .no-stations {
          text-align: center;
          padding: 2rem;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        @media (max-width: 768px) {
          .nearest-stations-panel {
            padding: 1rem;
          }

          .panel-title {
            font-size: 1.125rem;
          }

          .station-item {
            padding: 0.5rem;
          }

          .station-icon {
            width: 1.75rem;
            height: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NearestStationsPanel; 