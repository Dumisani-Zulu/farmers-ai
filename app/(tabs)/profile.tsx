import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { AuthDebugComponent } from '@/components/AuthDebugComponent';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit,
  Camera,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react-native';

const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100 flex-row items-center"
  >
    <View className="mr-4">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      {subtitle && <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>}
    </View>
    {showArrow && (
      <Text className="text-gray-400 text-xl">›</Text>
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    profile, 
    isLoading, 
    error, 
    isAuthenticated,
    updateProfile,
    refreshProfile,
    getProfileStats,
  } = useUserProfile();

  const [stats, setStats] = useState<{
    totalCrops: number;
    totalHarvests: number;
    totalAdviceCompleted: number;
    joinDate: string;
    lastActive: string;
  } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Profile Debug Info:');
    console.log('- user from auth:', user);
    console.log('- profile from hook:', profile);
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- isLoading:', isLoading);
    console.log('- error:', error);
  }, [user, profile, isAuthenticated, isLoading, error]);

  // Use profile data if available, otherwise fall back to auth user
  const displayData = profile || (user as any);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const profileStats = await getProfileStats();
        setStats(profileStats ?? null);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    if (displayData) {
      loadStats();
    }
  }, [displayData, getProfileStats]);

  const refreshStats = async () => {
    try {
      const profileStats = await getProfileStats();
      setStats(profileStats ?? null);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      await refreshStats();
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/welcome');
            } catch (err) {
              console.error('Sign out error:', err);
              Alert.alert('Sign Out Error', 'Unable to sign out. Please try again later.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = async (updates: any) => {
    try {
      const success = await updateProfile(updates);
      if (success) {
        await refreshStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExperienceLevel = (experience: string | undefined) => {
    if (!experience) return 'Not specified';
    const exp = experience.toLowerCase();
    if (exp.includes('beginner') || exp.includes('new')) return 'Beginner';
    if (exp.includes('intermediate') || exp.includes('moderate')) return 'Intermediate';
    if (exp.includes('expert') || exp.includes('advanced')) return 'Expert';
    return experience;
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <RefreshCw size={32} color="#16a34a" className="mb-4" />
          <Text className="text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-600 text-center text-lg font-semibold mb-4">
            {error || 'Not authenticated'}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/welcome')}
            className="bg-green-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go to Welcome</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!displayData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">No profile data available</Text>
          <TouchableOpacity
            onPress={() => router.replace('/auth')}
            className="bg-green-600 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Debug Component - Remove in production */}
        {/* {__DEV__ && <AuthDebugComponent />} */}

        {/* Profile Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View className="items-center">
            <View className="relative mb-4">
              <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center">
                <User size={48} color="#059669" />
              </View>
              <TouchableOpacity className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2">
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {displayData?.displayName || displayData?.fullName || displayData?.farmName || 'Unknown User'}
            </Text>
            
            <Text className="text-sm text-gray-600 mb-2">
              {displayData?.email || 'No email'}
            </Text>
            
            <Text className="text-sm text-gray-600 mb-2">
              {displayData?.farmName || 'No farm name'}
            </Text>
            
            {displayData?.bio && (
              <Text className="text-sm text-gray-600 text-center mb-4">
                {displayData.bio}
              </Text>
            )}
            
            <View className="flex-row items-center mb-4">
              <MapPin size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {displayData?.location || 'No location set'}
              </Text>
            </View>
            
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity 
                className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center flex-1"
                onPress={() => setShowEditModal(true)}
              >
                <Edit size={16} color="white" />
                <Text className="text-white font-medium ml-2">Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center flex-1"
                onPress={() => router.push('/user-info')}
              >
                <User size={16} color="white" />
                <Text className="text-white font-medium ml-2">View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        {stats && (
          <View className="flex-row mb-6">
            <View className="bg-white rounded-xl p-4 mr-2 flex-1 shadow-sm">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#059669" />
                <Text className="text-sm font-medium text-gray-600 ml-2">Crops</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.totalCrops}</Text>
              <Text className="text-xs text-gray-500">Total saved</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 ml-2 flex-1 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Award size={20} color="#f59e0b" />
                <Text className="text-sm font-medium text-gray-600 ml-2">Harvests</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.totalHarvests}</Text>
              <Text className="text-xs text-gray-500">Completed</Text>
            </View>
          </View>
        )}

        {/* Farm Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Farm Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Farm Size</Text>
              <Text className="text-gray-900">{displayData?.farmSize || 'Not specified'}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Farming Method</Text>
              <Text className="text-gray-900 capitalize">
                {displayData?.farmingMethod || 'Not specified'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Soil Type</Text>
              <Text className="text-gray-900">{displayData?.soilType || 'Not specified'}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Water Source</Text>
              <Text className="text-gray-900">{displayData?.waterSource || 'Not specified'}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Experience</Text>
              <Text className="text-gray-900">{getExperienceLevel(displayData?.experience)}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Mail size={20} color="#6b7280" />
              <Text className="text-gray-700 ml-3">{displayData?.email}</Text>
            </View>
            
            {displayData?.phone && (
              <View className="flex-row items-center">
                <Phone size={20} color="#6b7280" />
                <Text className="text-gray-700 ml-3">{displayData.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Account Information</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Member Since</Text>
              <Text className="text-gray-900">
                {displayData?.createdAt ? formatDate(displayData.createdAt) : 'N/A'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Last Login</Text>
              <Text className="text-gray-900">
                {displayData?.lastLogin ? formatDate(displayData.lastLogin) : 'N/A'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Language</Text>
              <Text className="text-gray-900">
                {displayData?.language === 'en' ? 'English' : 
                 displayData?.language === 'sw' ? 'Swahili' : 
                 displayData?.language === 'fr' ? 'French' : 
                 displayData?.language === 'es' ? 'Spanish' : 'English'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mb-6">
          <MenuItem
            icon={<Settings size={24} color="#6b7280" />}
            title="Settings"
            subtitle="App preferences and configurations"
            onPress={() => console.log('Settings pressed')}
          />
          
          <MenuItem
            icon={<Bell size={24} color="#6b7280" />}
            title="Notifications"
            subtitle="Manage alerts and reminders"
            onPress={() => console.log('Notifications pressed')}
          />
          
          <MenuItem
            icon={<Shield size={24} color="#6b7280" />}
            title="Privacy & Security"
            subtitle="Data protection and account security"
            onPress={() => console.log('Privacy pressed')}
          />
          
          <MenuItem
            icon={<HelpCircle size={24} color="#6b7280" />}
            title="Help & Support"
            subtitle="FAQs, tutorials, and contact support"
            onPress={() => console.log('Help pressed')}
          />
        </View>

        {/* App Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">App Information</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Version</Text>
              <Text className="text-gray-900">1.2.3</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="text-gray-900">July 3, 2025</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Storage Used</Text>
              <Text className="text-gray-900">245 MB</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex-row items-center justify-center"
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-600 font-semibold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      {profile && (
        <ProfileEditModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={handleEditProfile}
        />
      )}
    </SafeAreaView>
  );
}
