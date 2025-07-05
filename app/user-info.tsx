import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserInfoTable } from '@/components/UserInfoTable';
import { ProfileEditModal } from '@/components/ProfileEditModal';

export default function UserInfoScreen() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    profile, 
    isLoading, 
    error, 
    isAuthenticated,
    updateProfile,
    refreshProfile,
  } = useUserProfile();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      Alert.alert('Refresh Error', 'Unable to refresh profile data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = async (updates: any) => {
    try {
      const success = await updateProfile(updates);
      if (success) {
        setShowEditModal(false);
        return true;
      }
      Alert.alert('Update Error', 'Unable to update profile. Please try again.');
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      Alert.alert('Update Error', 'Unable to update profile. Please try again.');
      return false;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">User Information</Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <RefreshCw size={32} color="#16a34a" />
          <View className="h-4" />
          <Text className="text-gray-600">Loading user information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !isAuthenticated || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">User Information</Text>
        </View>
        
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#ef4444" className="mb-4" />
          <Text className="text-red-600 text-center text-lg font-semibold mb-4">
            {error || 'Unable to load user information'}
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {!isAuthenticated 
              ? 'Please sign in to view your profile information.'
              : 'There was an error loading your profile data.'
            }
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            className="bg-green-500 px-6 py-3 rounded-lg flex-row items-center"
          >
            <RefreshCw size={16} color="white" />
            <View className="w-2" />
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4"
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">User Information</Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleRefresh}
          disabled={isRefreshing}
          className="p-2"
        >
          <RefreshCw 
            size={20} 
            color={isRefreshing ? "#9ca3af" : "#374151"}
          />
        </TouchableOpacity>
      </View>

      {/* User Info Table */}
      <UserInfoTable
        userProfile={profile}
        onEdit={() => setShowEditModal(true)}
        showEditButton={true}
      />

      {/* Edit Profile Modal */}
      {showEditModal && (
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
