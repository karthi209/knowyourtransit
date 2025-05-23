import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onStationSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [stations, setStations] = useState([]);

  // Load stations data once when component mounts
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/data/stations.geojson');
        const data = await response.json();
        
        if (!data.features || !Array.isArray(data.features)) {
          console.error('Invalid GeoJSON data: features array is missing');
          return;
        }

        const stationsData = data.features
          .filter(feature => {
            // Check if feature has required properties and geometry
            const hasValidGeometry = feature.geometry && 
                                   feature.geometry.coordinates && 
                                   Array.isArray(feature.geometry.coordinates) &&
                                   feature.geometry.coordinates.length >= 2;
            
            const hasValidProperties = feature.properties && 
                                     feature.properties.name;
            
            if (!hasValidGeometry || !hasValidProperties) {
              console.warn('Skipping invalid feature:', feature);
              return false;
            }
            
            return true;
          })
          .map(feature => {
            try {
              const [longitude, latitude] = feature.geometry.coordinates;
              return {
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
              console.warn('Error processing feature:', feature, error);
              return null;
            }
          })
          .filter(station => station !== null); // Remove any null entries

        console.log('Loaded stations:', stationsData.length);
        if (stationsData.length > 0) {
          console.log('Sample stations:', stationsData.slice(0, 3));
        } else {
          console.warn('No valid stations were loaded');
        }
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log('Searching for:', searchTerm);
      console.log('Total stations:', stations.length);
      
      const filtered = stations.filter(station => {
        if (!station || !station.name) return false;
        
        const nameMatch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
        const tamilMatch = station.name_ta && 
          station.name_ta.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (nameMatch || tamilMatch) {
          console.log('Match found:', station.name);
        }
        
        return nameMatch || tamilMatch;
      });
      
      console.log('Found matches:', filtered.length);
      if (filtered.length > 0) {
        console.log('First match:', filtered[0]);
      }
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, stations]);

  const handleStationSelect = (station) => {
    console.log('Selecting station:', station.name);
    onStationSelect(station);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      console.log('Enter pressed, selecting first result');
      handleStationSelect(searchResults[0]);
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
            placeholder="Search stations..."
            className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {showResults && searchResults.length > 0 && (
          <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {searchResults.map((station, index) => (
              <button
                key={index}
                onClick={() => handleStationSelect(station)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="font-medium text-gray-900">{station.name}</div>
                {station.name_ta && (
                  <div className="text-sm text-gray-500">{station.name_ta}</div>
                )}
                <div className="text-xs text-gray-400">{station.line}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 