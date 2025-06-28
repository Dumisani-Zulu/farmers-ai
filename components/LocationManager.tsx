import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Settings, ArrowLeft } from 'lucide-react-native';
import LocationSearch from '../components/LocationSearch';
import { useLocation } from '../hooks/useLocation';
import { LocationData } from '../lib/location-service';

interface LocationManagerProps {
  onBack: () => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({ onBack }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
  const {
    currentLocation,
    cachedSearches,
    isLoading,
    error,
    getCurrentLocation,
    clearCache,
    getDistance,
  } = useLocation();

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setShowSearch(false);
    
    // Example: Show confirmation
    Alert.alert(
      'Location Selected',
      `Selected: ${formatLocationDisplay(location)}`,
      [{ text: 'OK' }]
    );
  };

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation(true);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Location Data',
      'This will clear all cached location data including search history and current location. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearCache();
            setSelectedLocation(null);
            Alert.alert('Success', 'All location data cleared');
          }
        }
      ]
    );
  };

  const formatLocationDisplay = (location: LocationData): string => {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    
    return parts.slice(0, 2).join(', ') || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  if (showSearch) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowSearch(false)}
          placeholder="Search for farm locations..."
          showCurrentLocation={true}
          showRecentSearches={true}
          maxResults={8}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">Location Manager</Text>
          <Text className="text-sm text-gray-600">Manage farm locations and search history</Text>
        </View>
        <TouchableOpacity onPress={handleClearAllData}>
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Current Location */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Current Location</Text>
          
          {currentLocation ? (
            <View className="space-y-2">
              <View className="flex-row items-start">
                <MapPin size={20} color="#10b981" className="mt-0.5 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {formatLocationDisplay(currentLocation)}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    Updated {getTimeAgo(currentLocation.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Navigation size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-2">No current location set</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            disabled={isLoading}
            className={`mt-4 rounded-lg p-3 flex-row items-center justify-center ${
              isLoading ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            <Navigation size={18} color="white" />
            <Text className="text-white font-medium ml-2">
              {isLoading ? 'Getting Location...' : 'Update Current Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Location */}
        {selectedLocation && selectedLocation !== currentLocation && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Selected Location</Text>
            
            <View className="flex-row items-start">
              <MapPin size={20} color="#8b5cf6" className="mt-0.5 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  {formatLocationDisplay(selectedLocation)}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Text>
                {currentLocation && (
                  <Text className="text-blue-600 text-sm mt-1">
                    {getDistance(currentLocation, selectedLocation).toFixed(1)} km from current location
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Search Button */}
        <TouchableOpacity
          onPress={() => setShowSearch(true)}
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex-row items-center justify-center"
        >
          <MapPin size={20} color="#3b82f6" />
          <Text className="text-blue-600 font-medium ml-2">Search for New Location</Text>
        </TouchableOpacity>

        {/* Recent Searches */}
        {cachedSearches.length > 0 && (
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Searches</Text>
            
            {cachedSearches.slice(0, 5).map((search, index) => (
              <View key={index} className="mb-3 last:mb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-700 font-medium">{search.query}</Text>
                  <Text className="text-gray-400 text-xs">{getTimeAgo(search.timestamp)}</Text>
                </View>
                
                {search.results.slice(0, 2).map((location, locationIndex) => (
                  <TouchableOpacity
                    key={locationIndex}
                    onPress={() => handleLocationSelect(location)}
                    className="ml-4 py-2 border-l-2 border-gray-200 pl-3"
                  >
                    <Text className="text-gray-600 text-sm">
                      {formatLocationDisplay(location)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <Text className="text-red-800 text-sm">{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationManager;
