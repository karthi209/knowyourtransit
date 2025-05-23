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
            className="w-full h-12 pl-12 pr-4 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
          />
          <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
            search
          </span>
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute w-full mt-2 rounded-lg bg-black/90 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden">
            {results.map((result, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
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
                    <div className="text-white/40 text-sm">
                      {result.type === 'station' ? 'Station' : 'Line'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');

        input {
          font-family: "Cabin", "Noto Sans Tamil", serif;
        }

        input::placeholder {
          font-family: "Cabin", "Noto Sans Tamil", serif;
        }
      `}</style>
    </div>
  );
};

export default SearchBar; 