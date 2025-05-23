import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onStationSelect, onLineSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);

  // Load stations and lines data once when component mounts
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

  // Filter stations and lines based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log('Searching for:', searchTerm);
      
      const filteredStations = stations.filter(station => {
        if (!station || !station.name) return false;
        
        const nameMatch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
        const tamilMatch = station.name_ta && 
          station.name_ta.toLowerCase().includes(searchTerm.toLowerCase());
        
        return nameMatch || tamilMatch;
      });

      const filteredLines = lines.filter(line => {
        if (!line || !line.name) return false;
        
        const nameMatch = line.name.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = line.description && 
          line.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return nameMatch || descMatch;
      });
      
      const combinedResults = [
        ...filteredStations.map(s => ({ ...s, type: 'station' })),
        ...filteredLines.map(l => ({ ...l, type: 'line' }))
      ];
      
      setSearchResults(combinedResults);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, stations, lines]);

  const handleSelect = (item) => {
    if (item.type === 'station') {
      onStationSelect(item);
    } else if (item.type === 'line') {
      onLineSelect(item);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelect(searchResults[0]);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('Search term changed to:', newValue);
              setSearchTerm(newValue);
              setShowResults(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search stations or lines..."
            className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {showResults && searchResults.length > 0 && (
          <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {searchResults.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    item.type === 'station' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></span>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.type === 'station' && item.name_ta && (
                      <div className="text-sm text-gray-500">{item.name_ta}</div>
                    )}
                    {item.type === 'line' && item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {item.type === 'station' ? item.line : 'Metro Line'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 