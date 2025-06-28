import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MapPin, Search, X, Clock, Navigation, Trash2 } from 'lucide-react-native';
import { useLocation } from '../hooks/useLocation';
import { LocationData } from '../lib/location-service';

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  placeholder?: string;
  showCurrentLocation?: boolean;
  showRecentSearches?: boolean;
  maxResults?: number;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onClose,
  placeholder = "Search for a location...",
  showCurrentLocation = true,
  showRecentSearches = true,
  maxResults = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const {
    currentLocation,
    searchResults,
    cachedSearches,
    isLoading,
    error,
    getCurrentLocation,
    searchLocations,
    clearSearch,
  } = useLocation();

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) return;
    
    setShowResults(true);
    await searchLocations(searchQuery);
  }, [searchQuery, searchLocations]);

  // Auto-search when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setShowResults(false);
      }
    }, 500); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (location: LocationData) => {
    onLocationSelect(location);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation(true); // Force refresh
      if (location) {
        handleLocationSelect(location);
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check location permissions and try again.'
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleClearSearch = (query: string) => {
    clearSearch(query);
  };

  const formatLocationDisplay = (location: LocationData): string => {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.slice(0, 3).join(', ') || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View className="bg-white">
      {/* Search Input */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={placeholder}
            className="flex-1 ml-2 text-gray-900"
            onFocus={() => setShowResults(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowResults(false);
            }}>
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="absolute right-4 top-3"
          >
            <X size={24} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {showResults && (
        <ScrollView className="max-h-80">
          {/* Current Location */}
          {showCurrentLocation && (
            <TouchableOpacity 
              onPress={handleGetCurrentLocation}
              disabled={isLoading}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Navigation size={18} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-600 font-medium">Use Current Location</Text>
                {currentLocation && (
                  <Text className="text-gray-500 text-sm">
                    {formatLocationDisplay(currentLocation)} • {getTimeAgo(currentLocation.timestamp)}
                  </Text>
                )}
              </View>
              {isLoading && (
                <Text className="text-gray-400 text-sm">Loading...</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Search Results */}
          {searchResults.slice(0, maxResults).map((location, index) => (
            <TouchableOpacity
              key={`search-${index}`}
              onPress={() => handleLocationSelect(location)}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <MapPin size={18} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  {formatLocationDisplay(location)}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Recent Searches */}
          {showRecentSearches && searchQuery.length < 2 && cachedSearches.length > 0 && (
            <>
              <View className="px-4 py-2 bg-gray-50">
                <Text className="text-gray-600 text-sm font-medium">Recent Searches</Text>
              </View>
              {cachedSearches.slice(0, 5).map((cached, index) => (
                <View key={`cached-${index}`}>
                  <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50">
                    <View className="flex-row items-center flex-1">
                      <Clock size={16} color="#9ca3af" />
                      <Text className="text-gray-600 text-sm ml-2 font-medium">
                        {cached.query}
                      </Text>
                      <Text className="text-gray-400 text-xs ml-2">
                        {getTimeAgo(cached.timestamp)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleClearSearch(cached.query)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  {cached.results.slice(0, 2).map((location, locationIndex) => (
                    <TouchableOpacity
                      key={`cached-result-${index}-${locationIndex}`}
                      onPress={() => handleLocationSelect(location)}
                      className="flex-row items-center px-4 py-2 pl-8 border-b border-gray-100"
                    >
                      <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                        <MapPin size={14} color="#6b7280" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 text-sm">
                          {formatLocationDisplay(location)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* No Results */}
          {searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && (
            <View className="px-4 py-8 items-center">
              <MapPin size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-2">
                No locations found for &ldquo;{searchQuery}&rdquo;
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Try a different search term
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View className="px-4 py-4 bg-red-50">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Loading */}
          {isLoading && searchQuery.length >= 2 && (
            <View className="px-4 py-4 items-center">
              <Text className="text-gray-500">Searching...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default LocationSearch;
