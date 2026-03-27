import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import geocodingService from '../../services/geocodingService';
import toast from 'react-hot-toast';

const LocationSearch = ({ onLocationSelect, placeholder = "Search location..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await geocodingService.searchLocation(searchQuery);
      if (response.success && response.data) {
        setResults(response.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    const coordinates = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name
    };
    
    setQuery(location.display_name);
    setShowResults(false);
    
    if (onLocationSelect) {
      onLocationSelect(coordinates);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neuro-dark border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-neuro-light border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(result)}
              className="w-full flex items-start space-x-3 p-3 hover:bg-gray-700 transition-colors text-left"
            >
              <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white text-sm">{result.display_name}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;