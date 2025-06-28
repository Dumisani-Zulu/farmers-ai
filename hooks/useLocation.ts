import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationData, CachedLocationSearch } from '../lib/location-service';

export interface UseLocationReturn {
  currentLocation: LocationData | null;
  searchResults: LocationData[];
  cachedSearches: CachedLocationSearch[];
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: (forceRefresh?: boolean) => Promise<LocationData | null>;
  searchLocations: (query: string, forceRefresh?: boolean) => Promise<LocationData[]>;
  clearCache: () => Promise<void>;
  clearSearch: (query: string) => void;
  getDistance: (location1: LocationData, location2: LocationData) => number;
}

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [cachedSearches, setCachedSearches] = useState<CachedLocationSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize location service on mount
  useEffect(() => {
    const initializeLocationService = async () => {
      try {
        await locationService.initialize();
        
        // Load cached current location
        const cached = locationService.getCachedCurrentLocation();
        if (cached) {
          setCurrentLocation(cached);
        }
        
        // Load cached searches
        setCachedSearches(locationService.getCachedSearches());
      } catch (err) {
        console.error('Failed to initialize location service:', err);
        setError('Failed to initialize location service');
      }
    };

    initializeLocationService();
  }, []);

  /**
   * Get current location
   */
  const getCurrentLocation = useCallback(async (forceRefresh: boolean = false): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await locationService.getCurrentLocation(forceRefresh);
      setCurrentLocation(location);
      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      setError(errorMessage);
      console.error('getCurrentLocation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search for locations
   */
  const searchLocations = useCallback(async (query: string, forceRefresh: boolean = false): Promise<LocationData[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await locationService.searchLocations(query, forceRefresh);
      setSearchResults(results);
      
      // Update cached searches
      setCachedSearches(locationService.getCachedSearches());
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search locations';
      setError(errorMessage);
      console.error('searchLocations error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await locationService.clearAllCache();
      setCurrentLocation(null);
      setSearchResults([]);
      setCachedSearches([]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      console.error('clearCache error:', err);
    }
  }, []);

  /**
   * Clear specific search from cache
   */
  const clearSearch = useCallback((query: string): void => {
    try {
      locationService.clearCachedSearch(query);
      setCachedSearches(locationService.getCachedSearches());
    } catch (err) {
      console.error('clearSearch error:', err);
    }
  }, []);

  /**
   * Get distance between two locations
   */
  const getDistance = useCallback((location1: LocationData, location2: LocationData): number => {
    return locationService.getDistance(location1, location2);
  }, []);

  return {
    currentLocation,
    searchResults,
    cachedSearches,
    isLoading,
    error,
    getCurrentLocation,
    searchLocations,
    clearCache,
    clearSearch,
    getDistance,
  };
};

export default useLocation;
