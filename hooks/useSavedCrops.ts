import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CropRecommendation } from './useCropRecommendations';

export interface SavedCrop extends CropRecommendation {
  dateAdded: string;
  status: 'planning' | 'planted' | 'growing' | 'harvested';
  plantedDate?: string;
  harvestDate?: string;
  notes?: string;
  lastUpdated: string;
}

interface UseSavedCropsReturn {
  savedCrops: SavedCrop[];
  isLoading: boolean;
  error: string | null;
  
  // Methods
  saveCrop: (crop: CropRecommendation) => Promise<void>;
  removeCrop: (cropId: string) => Promise<void>;
  updateCropStatus: (cropId: string, status: SavedCrop['status'], additionalData?: Partial<SavedCrop>) => Promise<void>;
  getCropById: (cropId: string) => SavedCrop | null;
  clearAllCrops: () => Promise<void>;
}

const SAVED_CROPS_KEY = 'saved_crops';

export const useSavedCrops = (): UseSavedCropsReturn => {
  const [savedCrops, setSavedCrops] = useState<SavedCrop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved crops from AsyncStorage
  const loadSavedCrops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stored = await AsyncStorage.getItem(SAVED_CROPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedCrops(parsed);
        console.log('📱 Loaded', parsed.length, 'saved crops from storage');
      }
    } catch (err) {
      console.error('Failed to load saved crops:', err);
      setError('Failed to load saved crops');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save crops to AsyncStorage
  const saveCropsToStorage = useCallback(async (crops: SavedCrop[]) => {
    try {
      await AsyncStorage.setItem(SAVED_CROPS_KEY, JSON.stringify(crops));
      console.log('💾 Saved', crops.length, 'crops to storage');
    } catch (err) {
      console.error('Failed to save crops:', err);
      throw new Error('Failed to save crops to storage');
    }
  }, []);

  // Load saved crops on mount
  useEffect(() => {
    loadSavedCrops();
  }, [loadSavedCrops]);

  // Save a new crop
  const saveCrop = useCallback(async (crop: CropRecommendation) => {
    try {
      setError(null);
      
      // Check if crop is already saved
      const existingIndex = savedCrops.findIndex(saved => saved.id === crop.id);
      if (existingIndex >= 0) {
        throw new Error('Crop is already saved');
      }

      const newSavedCrop: SavedCrop = {
        ...crop,
        dateAdded: new Date().toISOString(),
        status: 'planning',
        lastUpdated: new Date().toISOString(),
      };

      const updatedCrops = [...savedCrops, newSavedCrop];
      setSavedCrops(updatedCrops);
      await saveCropsToStorage(updatedCrops);

      console.log('✅ Saved crop:', crop.name);
    } catch (err) {
      console.error('Failed to save crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to save crop');
      throw err;
    }
  }, [savedCrops, saveCropsToStorage]);

  // Remove a crop
  const removeCrop = useCallback(async (cropId: string) => {
    try {
      setError(null);
      
      const updatedCrops = savedCrops.filter(crop => crop.id !== cropId);
      setSavedCrops(updatedCrops);
      await saveCropsToStorage(updatedCrops);

      console.log('🗑️ Removed crop:', cropId);
    } catch (err) {
      console.error('Failed to remove crop:', err);
      setError('Failed to remove crop');
      throw err;
    }
  }, [savedCrops, saveCropsToStorage]);

  // Update crop status
  const updateCropStatus = useCallback(async (
    cropId: string, 
    status: SavedCrop['status'], 
    additionalData?: Partial<SavedCrop>
  ) => {
    try {
      setError(null);
      
      const updatedCrops = savedCrops.map(crop => 
        crop.id === cropId 
          ? { 
              ...crop, 
              status, 
              lastUpdated: new Date().toISOString(),
              ...additionalData 
            }
          : crop
      );
      
      setSavedCrops(updatedCrops);
      await saveCropsToStorage(updatedCrops);

      console.log('📝 Updated crop status:', cropId, 'to', status);
    } catch (err) {
      console.error('Failed to update crop status:', err);
      setError('Failed to update crop status');
      throw err;
    }
  }, [savedCrops, saveCropsToStorage]);

  // Get crop by ID
  const getCropById = useCallback((cropId: string): SavedCrop | null => {
    return savedCrops.find(crop => crop.id === cropId) || null;
  }, [savedCrops]);

  // Clear all crops
  const clearAllCrops = useCallback(async () => {
    try {
      setError(null);
      setSavedCrops([]);
      await AsyncStorage.removeItem(SAVED_CROPS_KEY);
      console.log('🧹 Cleared all saved crops');
    } catch (err) {
      console.error('Failed to clear crops:', err);
      setError('Failed to clear crops');
      throw err;
    }
  }, []);

  return {
    savedCrops,
    isLoading,
    error,
    saveCrop,
    removeCrop,
    updateCropStatus,
    getCropById,
    clearAllCrops,
  };
};
