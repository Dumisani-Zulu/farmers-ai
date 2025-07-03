import { useState, useEffect, useCallback } from 'react';
import { authService, UserProfile } from '@/lib/auth-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExtendedUserProfile extends UserProfile {
  fullName?: string;
  phone?: string;
  farmSize?: string;
  cropTypes?: string[];
  experience?: string;
  profileImage?: string;
  bio?: string;
  farmingMethod?: 'organic' | 'conventional' | 'mixed';
  soilType?: string;
  waterSource?: string;
  language?: string;
  timezone?: string;
  notifications?: {
    weather: boolean;
    seasonalAdvice: boolean;
    cropRecommendations: boolean;
    pestAlerts: boolean;
    marketPrices: boolean;
  };
  preferences?: {
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'auto';
    defaultCurrency: string;
  };
  stats?: {
    totalCrops: number;
    totalHarvests: number;
    totalAdviceCompleted: number;
    joinDate: string;
    lastActive: string;
  };
}

interface UseUserProfileReturn {
  profile: ExtendedUserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Methods
  updateProfile: (updates: Partial<ExtendedUserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  uploadProfileImage: (imageUri: string) => Promise<boolean>;
  updateNotificationSettings: (notifications: Partial<ExtendedUserProfile['notifications']>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<ExtendedUserProfile['preferences']>) => Promise<boolean>;
  getProfileStats: () => Promise<ExtendedUserProfile['stats']>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user profile from storage
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authState = await authService.initialize();
      setIsAuthenticated(authState.isAuthenticated);

      if (!authState.isAuthenticated || !authState.user) {
        setProfile(null);
        return;
      }

      // Load extended profile data
      const [
        extendedProfile,
        notifications,
        preferences,
        stats,
      ] = await Promise.all([
        AsyncStorage.getItem('extended_profile'),
        AsyncStorage.getItem('notification_settings'),
        AsyncStorage.getItem('user_preferences'),
        AsyncStorage.getItem('profile_stats'),
      ]);

      const baseProfile = authState.user;
      const extended = extendedProfile ? JSON.parse(extendedProfile) : {};
      const notificationSettings = notifications ? JSON.parse(notifications) : {
        weather: true,
        seasonalAdvice: true,
        cropRecommendations: true,
        pestAlerts: true,
        marketPrices: false,
      };
      const userPreferences = preferences ? JSON.parse(preferences) : {
        units: 'metric',
        theme: 'auto',
        defaultCurrency: 'KES',
      };
      const profileStats = stats ? JSON.parse(stats) : {
        totalCrops: 0,
        totalHarvests: 0,
        totalAdviceCompleted: 0,
        joinDate: baseProfile.createdAt,
        lastActive: new Date().toISOString(),
      };

      const fullProfile: ExtendedUserProfile = {
        ...baseProfile,
        ...extended,
        notifications: notificationSettings,
        preferences: userPreferences,
        stats: profileStats,
      };

      setProfile(fullProfile);
      
      // Update last active time
      await AsyncStorage.setItem('profile_stats', JSON.stringify({
        ...profileStats,
        lastActive: new Date().toISOString(),
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('❌ Failed to load user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<ExtendedUserProfile>): Promise<boolean> => {
    try {
      if (!profile) {
        throw new Error('No profile to update');
      }

      const updatedProfile = { ...profile, ...updates };
      
      // Update base profile in auth service
      const baseUpdates: Partial<UserProfile> = {
        email: updatedProfile.email,
        farmName: updatedProfile.farmName,
        location: updatedProfile.location,
        createdAt: updatedProfile.createdAt,
        lastLogin: updatedProfile.lastLogin,
      };
      
      await authService.updateProfile(baseUpdates);
      
      // Update extended profile
      const extendedData = {
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
        farmSize: updatedProfile.farmSize,
        cropTypes: updatedProfile.cropTypes,
        experience: updatedProfile.experience,
        profileImage: updatedProfile.profileImage,
        bio: updatedProfile.bio,
        farmingMethod: updatedProfile.farmingMethod,
        soilType: updatedProfile.soilType,
        waterSource: updatedProfile.waterSource,
        language: updatedProfile.language,
        timezone: updatedProfile.timezone,
      };
      
      await AsyncStorage.setItem('extended_profile', JSON.stringify(extendedData));
      
      setProfile(updatedProfile);
      return true;
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      return false;
    }
  }, [profile]);

  // Upload profile image
  const uploadProfileImage = useCallback(async (imageUri: string): Promise<boolean> => {
    try {
      // In a real app, you would upload to a file storage service
      // For now, we'll just store the local URI
      return await updateProfile({ profileImage: imageUri });
    } catch (err) {
      console.error('❌ Failed to upload profile image:', err);
      return false;
    }
  }, [updateProfile]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (
    notifications: Partial<ExtendedUserProfile['notifications']>
  ): Promise<boolean> => {
    try {
      if (!profile) return false;

      const updatedNotifications = { 
        weather: true,
        seasonalAdvice: true,
        cropRecommendations: true,
        pestAlerts: true,
        marketPrices: false,
        ...profile.notifications, 
        ...notifications 
      };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(updatedNotifications));
      
      setProfile(prev => prev ? { ...prev, notifications: updatedNotifications } : null);
      return true;
    } catch (err) {
      console.error('❌ Failed to update notification settings:', err);
      return false;
    }
  }, [profile]);

  // Update user preferences
  const updatePreferences = useCallback(async (
    preferences: Partial<ExtendedUserProfile['preferences']>
  ): Promise<boolean> => {
    try {
      if (!profile) return false;

      const updatedPreferences = { 
        units: 'metric' as const,
        theme: 'auto' as const,
        defaultCurrency: 'KES',
        ...profile.preferences, 
        ...preferences 
      };
      await AsyncStorage.setItem('user_preferences', JSON.stringify(updatedPreferences));
      
      setProfile(prev => prev ? { ...prev, preferences: updatedPreferences } : null);
      return true;
    } catch (err) {
      console.error('❌ Failed to update preferences:', err);
      return false;
    }
  }, [profile]);

  // Get profile stats
  const getProfileStats = useCallback(async (): Promise<ExtendedUserProfile['stats']> => {
    try {
      const [savedCrops, completedAdvice] = await Promise.all([
        AsyncStorage.getItem('saved_crops'),
        AsyncStorage.getItem('completed_advice'),
      ]);

      const crops = savedCrops ? JSON.parse(savedCrops) : [];
      const advice = completedAdvice ? JSON.parse(completedAdvice) : [];

      const stats: ExtendedUserProfile['stats'] = {
        totalCrops: crops.length,
        totalHarvests: crops.filter((crop: any) => crop.status === 'harvested').length,
        totalAdviceCompleted: advice.length,
        joinDate: profile?.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      // Update stored stats
      await AsyncStorage.setItem('profile_stats', JSON.stringify(stats));

      return stats;
    } catch (err) {
      console.error('❌ Failed to get profile stats:', err);
      return {
        totalCrops: 0,
        totalHarvests: 0,
        totalAdviceCompleted: 0,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
    }
  }, [profile]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    isAuthenticated,
    updateProfile,
    refreshProfile,
    uploadProfileImage,
    updateNotificationSettings,
    updatePreferences,
    getProfileStats,
  };
};
