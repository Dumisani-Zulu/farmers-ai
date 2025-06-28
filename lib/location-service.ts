import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  timestamp: number;
  accuracy?: number;
}

export interface CachedLocationSearch {
  query: string;
  results: LocationData[];
  timestamp: number;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private locationCache: Map<string, CachedLocationSearch> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly STORAGE_KEY_CURRENT = 'current_location';
  private readonly STORAGE_KEY_CACHE = 'location_search_cache';

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Initialize the location service and load cached data
   */
  async initialize(): Promise<void> {
    try {
      await this.loadCachedData();
      console.log('LocationService initialized');
    } catch (error) {
      console.error('Failed to initialize LocationService:', error);
    }
  }

  /**
   * Get current location with caching
   */
  async getCurrentLocation(forceRefresh: boolean = false): Promise<LocationData | null> {
    try {
      // Return cached location if available and not expired (unless force refresh)
      if (!forceRefresh && this.currentLocation && this.isLocationFresh(this.currentLocation)) {
        console.log('Using cached current location');
        return this.currentLocation;
      }

      // Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      console.log('Fetching current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get address details
      const addressDetails = await this.reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: Date.now(),
        ...addressDetails,
      };

      // Cache the location
      this.currentLocation = locationData;
      await this.saveCachedData();

      console.log('Current location updated:', locationData);
      return locationData;

    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Search for locations by query with caching
   */
  async searchLocations(query: string, forceRefresh: boolean = false): Promise<LocationData[]> {
    try {
      const cacheKey = query.toLowerCase().trim();
      
      // Return cached results if available and not expired (unless force refresh)
      if (!forceRefresh && this.locationCache.has(cacheKey)) {
        const cached = this.locationCache.get(cacheKey)!;
        if (this.isCacheFresh(cached.timestamp)) {
          console.log('Using cached search results for:', query);
          return cached.results;
        }
      }

      console.log('Searching for locations:', query);
      
      // Perform geocoding search
      const results = await Location.geocodeAsync(query);
      
      const locationResults: LocationData[] = [];
      
      for (const result of results.slice(0, 5)) { // Limit to 5 results
        const addressDetails = await this.reverseGeocode(result.latitude, result.longitude);
        
        locationResults.push({
          latitude: result.latitude,
          longitude: result.longitude,
          timestamp: Date.now(),
          ...addressDetails,
        });
      }

      // Cache the search results
      const cacheEntry: CachedLocationSearch = {
        query: cacheKey,
        results: locationResults,
        timestamp: Date.now(),
      };

      this.locationCache.set(cacheKey, cacheEntry);
      await this.saveCachedData();

      console.log(`Found ${locationResults.length} locations for "${query}"`);
      return locationResults;

    } catch (error) {
      console.error('Failed to search locations:', error);
      return [];
    }
  }

  /**
   * Get reverse geocoding details for coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationData>> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (results.length > 0) {
        const result = results[0];
        return {
          address: `${result.street || ''} ${result.streetNumber || ''}`.trim(),
          city: result.city || result.subregion || undefined,
          region: result.region || undefined,
          country: result.country || undefined,
          postalCode: result.postalCode || undefined,
        };
      }
      
      return {};
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  }

  /**
   * Get cached current location (without fetching new)
   */
  getCachedCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Get all cached search results
   */
  getCachedSearches(): CachedLocationSearch[] {
    return Array.from(this.locationCache.values())
      .filter(cache => this.isCacheFresh(cache.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear specific cached search
   */
  clearCachedSearch(query: string): void {
    const cacheKey = query.toLowerCase().trim();
    this.locationCache.delete(cacheKey);
    this.saveCachedData();
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    this.currentLocation = null;
    this.locationCache.clear();
    
    await AsyncStorage.removeItem(this.STORAGE_KEY_CURRENT);
    await AsyncStorage.removeItem(this.STORAGE_KEY_CACHE);
    
    console.log('All location cache cleared');
  }

  /**
   * Get distance between two locations in kilometers
   */
  getDistance(location1: LocationData, location2: LocationData): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(location1.latitude)) * Math.cos(this.toRadians(location2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if location data is fresh (within cache duration)
   */
  private isLocationFresh(location: LocationData): boolean {
    return Date.now() - location.timestamp < this.CACHE_DURATION;
  }

  /**
   * Check if cache entry is fresh
   */
  private isCacheFresh(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      // Load current location
      const currentLocationData = await AsyncStorage.getItem(this.STORAGE_KEY_CURRENT);
      if (currentLocationData) {
        const parsed = JSON.parse(currentLocationData);
        if (this.isLocationFresh(parsed)) {
          this.currentLocation = parsed;
        }
      }

      // Load search cache
      const cacheData = await AsyncStorage.getItem(this.STORAGE_KEY_CACHE);
      if (cacheData) {
        const parsed: CachedLocationSearch[] = JSON.parse(cacheData);
        for (const cache of parsed) {
          if (this.isCacheFresh(cache.timestamp)) {
            this.locationCache.set(cache.query, cache);
          }
        }
      }

      console.log(`Loaded ${this.locationCache.size} cached location searches`);
    } catch (error) {
      console.error('Failed to load cached location data:', error);
    }
  }

  /**
   * Save cached data to storage
   */
  private async saveCachedData(): Promise<void> {
    try {
      // Save current location
      if (this.currentLocation) {
        await AsyncStorage.setItem(
          this.STORAGE_KEY_CURRENT, 
          JSON.stringify(this.currentLocation)
        );
      }

      // Save search cache
      const cacheArray = Array.from(this.locationCache.values());
      await AsyncStorage.setItem(
        this.STORAGE_KEY_CACHE, 
        JSON.stringify(cacheArray)
      );

    } catch (error) {
      console.error('Failed to save cached location data:', error);
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
export default locationService;
