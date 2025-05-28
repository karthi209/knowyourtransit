import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { lineColors } from '../styles/LineStyles';

const SearchBar = ({ onStationSelect, onLineSelect, isDarkTheme }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stations data
        const stationsResponse = await fetch('/data/stations.geojson');
        const stationsData = await stationsResponse.json();
        
        if (!stationsData.features || !Array.isArray(stationsData.features)) {
          console.error('Invalid stations GeoJSON data: features array is missing');
          return;
        }

        const processedStations = stationsData.features
          .filter(feature => {
            const hasValidGeometry = feature.geometry && 
                                   feature.geometry.coordinates && 
                                   Array.isArray(feature.geometry.coordinates) &&
                                   feature.geometry.coordinates.length >= 2;
            
            const hasValidProperties = feature.properties && 
                                     feature.properties.name;
            
            if (!hasValidGeometry || !hasValidProperties) {
              console.warn('Skipping invalid station feature:', feature);
              return false;
            }
            
            return true;
          })
          .map(feature => {
            try {
              const [longitude, latitude] = feature.geometry.coordinates;
              return {
                type: 'station',
                name: feature.properties.name,
                name_ta: feature.properties.name_ta || '',
                coordinates: [longitude, latitude],
                line: feature.properties.line || '',
                network: feature.properties.network || '',
                id: feature.properties.id || '',
                parking: feature.properties.parking || 'no',
                accessible: feature.properties.accessible || 'no',
                escalator: feature.properties.escalator || 'no',
                type: feature.properties.type || ''
              };
            } catch (error) {
              console.warn('Error processing station feature:', feature, error);
              return null;
            }
          })
          .filter(station => station !== null);

        // Fetch lines data
        const linesResponse = await fetch('/data/lines.geojson');
        const linesData = await linesResponse.json();
        
        if (!linesData.features || !Array.isArray(linesData.features)) {
          console.error('Invalid lines GeoJSON data: features array is missing');
          return;
        }

        const processedLines = linesData.features
          .filter(feature => {
            const hasValidGeometry = feature.geometry && 
                                   feature.geometry.coordinates && 
                                   Array.isArray(feature.geometry.coordinates);
            
            const hasValidProperties = feature.properties && 
                                     feature.properties.Name;
            
            if (!hasValidGeometry || !hasValidProperties) {
              console.warn('Skipping invalid line feature:', feature);
              return false;
            }
            
            return true;
          })
          .map(feature => {
            try {
              return {
                type: 'line',
                name: feature.properties.Name,
                description: feature.properties.description || '',
                coordinates: feature.geometry.coordinates
              };
            } catch (error) {
              console.warn('Error processing line feature:', feature, error);
              return null;
            }
          })
          .filter(line => line !== null);

        console.log('Loaded stations:', processedStations.length);
        console.log('Loaded lines:', processedLines.length);
        
        setStations(processedStations);
        setLines(processedLines);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      console.log('Searching for:', query);
      
      const filteredStations = stations.filter(station => {
        if (!station || !station.name) return false;
        
        const nameMatch = station.name.toLowerCase().includes(query.toLowerCase());
        const tamilMatch = station.name_ta && 
          station.name_ta.toLowerCase().includes(query.toLowerCase());
        
        return nameMatch || tamilMatch;
      });

      const filteredLines = lines.filter(line => {
        if (!line || !line.name) return false;
        
        const nameMatch = line.name.toLowerCase().includes(query.toLowerCase());
        const descMatch = line.description && 
          line.description.toLowerCase().includes(query.toLowerCase());
        
        return nameMatch || descMatch;
      });
      
      const combinedResults = [
        ...filteredStations.map(s => ({ ...s, type: 'station' })),
        ...filteredLines.map(l => ({ ...l, type: 'line' }))
      ];
      
      setResults(combinedResults);
    } else {
      setResults([]);
    }
  }, [query, stations, lines]);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const getLineColor = (lineName) => {
    // Map the line names to match the format in LineStyles
    const lineNameMap = {
      'Blue Line': 'BlueLine',
      'Green Line': 'GreenLine',
      'Red Line': 'RedLine',
      'Orange Line': 'OrangeLine',
      'Purple Line': 'PurpleLine',
      'MRTS': 'MRTSLine',
      'South Line': 'SouthLine',
      'West Line': 'WestLine',
      'North Line': 'NorthLine'
    };

    const mappedName = lineNameMap[lineName] || lineName.replace(/\s+/g, "");
    return lineColors[mappedName] || "#9E9E9E";
  };

  const getStationLineColors = (station) => {
    if (!station.line) return ['#9E9E9E']; // Default gray if no line specified
    
    // Split the line string by comma and trim whitespace
    const lines = station.line.split(',').map(line => line.trim());
    
    // Get colors for each line
    return lines.map(line => getLineColor(line));
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4" ref={searchRef}>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search stations or lines..."
            className="w-full h-12 pl-12 pr-4 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute w-full mt-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 shadow-lg overflow-hidden">
            {results.map((result, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-purple-400/10 cursor-pointer transition-colors border-b border-gray-700/50 last:border-b-0"
                onClick={() => {
                  if (result.type === 'station') {
                    onStationSelect(result);
                  } else {
                    onLineSelect(result);
                  }
                  setShowResults(false);
                  setQuery('');
                }}
              >
                <div className="flex items-center space-x-3">
                  {result.type === 'station' ? (
                    <div className="flex gap-1">
                      {getStationLineColors(result).map((color, colorIndex) => (
                        <span
                          key={colorIndex}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getLineColor(result.name) }}
                    />
                  )}
                  <div>
                    <div className="text-white/90 font-medium">{result.name}</div>
                    <div className="text-gray-400 text-sm">
                      {result.type === 'station' ? 'Station' : 'Line'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx="true">{`
        .search-container {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          z-index: 1000;
        }

        .search-input-container {
          position: relative;
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 0.75rem;
          transition: all 0.2s ease;
        }

        .search-input-container:focus-within {
          border-color: rgba(168, 85, 247, 1); /* purple-400 */
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .search-results {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background-color: rgba(17, 24, 39, 0.95); /* bg-gray-900 */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .result-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item:hover {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
        }

        .result-item.active {
          background-color: rgba(168, 85, 247, 0.1); /* purple-400 with opacity */
        }

        .result-name {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .result-details {
          font-size: 0.875rem;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        .result-type {
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

        .no-results {
          padding: 1rem;
          text-align: center;
          color: rgba(156, 163, 175, 1); /* text-gray-400 */
        }

        /* Scrollbar styling */
        .search-results::-webkit-scrollbar {
          width: 8px;
        }

        .search-results::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
          border-radius: 4px;
        }

        .search-results::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
          border-radius: 4px;
        }

        .search-results::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5); /* purple-400 with opacity */
        }
      `}</style>
    </div>
  );
};

export default SearchBar; 