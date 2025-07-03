import * as React from 'react';
import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, X, Navigation, Clock } from 'lucide-react-native';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { LocationData } from '@/lib/location-service';

interface LocationSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationSelect?: (location: LocationData) => void;
  title?: string;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isVisible,
  onClose,
  onLocationSelect,
  title = "Select Location"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    currentLocation,
    updateLocation,
    searchLocations,
    getCurrentLocation,
    isLoading: contextLoading
  } = useLocationWeather();

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchLocations]);

  const handleLocationSelect = async (location: LocationData) => {
    try {
      await updateLocation(location);
      onLocationSelect?.(location);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Location select error:', error);
      Alert.alert('Error', 'Failed to update location');
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        onLocationSelect?.(location);
        onClose();
      } else {
        Alert.alert(
          'Location Access',
          'Unable to get your current location. Please check location permissions and try again.'
        );
      }
    } catch (error) {
      console.error('Current location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const formatLocationDisplay = (location: LocationData): string => {
    const parts = [];
    if (location.address && location.address.trim()) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.slice(0, 3).join(', ') || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const isLoading = contextLoading || isSearching;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100"
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
            <MapPin size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search for a city or region..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#10b981" />
            )}
          </View>
        </View>

        {/* Current Location */}
        <View className="px-4 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            disabled={isLoading}
            className="flex-row items-center p-4 bg-green-50 rounded-xl"
          >
            <View className="p-2 bg-green-100 rounded-full mr-3">
              <Navigation size={18} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Use Current Location
              </Text>
              <Text className="text-sm text-gray-600">
                {currentLocation 
                  ? `Currently: ${formatLocationDisplay(currentLocation)}`
                  : 'Get your current location automatically'
                }
              </Text>
            </View>
            {isLoading && (
              <ActivityIndicator size="small" color="#10b981" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {searchResults.length > 0 && (
            <View className="py-4">
              <Text className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                Search Results
              </Text>
              {searchResults.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLocationSelect(location)}
                  className="flex-row items-center p-4 bg-white border border-gray-100 rounded-xl mb-2 shadow-sm"
                >
                  <View className="p-2 bg-blue-50 rounded-full mr-3">
                    <MapPin size={18} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {location.city || 'Unknown City'}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {formatLocationDisplay(location)}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <View className="py-8 items-center">
              <MapPin size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-2">
                No locations found for &quot;{searchQuery}&quot;
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Try searching for a city, region, or country name
              </Text>
            </View>
          )}

          {searchQuery.length === 0 && (
            <View className="py-8 items-center">
              <MapPin size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-2">
                Search for a location
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Type at least 2 characters to start searching
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Current Location Display */}
        {currentLocation && (
          <View className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <View className="flex-row items-center">
              <Clock size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Current: {formatLocationDisplay(currentLocation)}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};
