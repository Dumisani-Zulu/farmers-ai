import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, User, Camera } from 'lucide-react-native';
import { ExtendedUserProfile } from '@/hooks/useUserProfile';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  profile: ExtendedUserProfile;
  onSave: (updates: Partial<ExtendedUserProfile>) => Promise<boolean>;
}

export const ProfileEditModal = ({
  visible,
  onClose,
  profile,
  onSave,
}: ProfileEditModalProps) => {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    email: profile.email || '',
    farmName: profile.farmName || '',
    location: profile.location || '',
    farmSize: profile.farmSize || '',
    experience: profile.experience || '',
    bio: profile.bio || '',
    farmingMethod: profile.farmingMethod || 'mixed',
    soilType: profile.soilType || '',
    waterSource: profile.waterSource || '',
    language: profile.language || 'en',
    cropTypes: profile.cropTypes || [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.fullName.trim()) {
        Alert.alert('Validation Error', 'Full name is required');
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert('Validation Error', 'Email is required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      const updates: Partial<ExtendedUserProfile> = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        farmName: formData.farmName.trim(),
        location: formData.location.trim(),
        farmSize: formData.farmSize.trim(),
        experience: formData.experience.trim(),
        bio: formData.bio.trim(),
        farmingMethod: formData.farmingMethod as 'organic' | 'conventional' | 'mixed',
        soilType: formData.soilType.trim(),
        waterSource: formData.waterSource.trim(),
        language: formData.language,
        cropTypes: formData.cropTypes,
      };

      const success = await onSave(updates);
      
      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg ${
                isLoading ? 'bg-gray-300' : 'bg-green-600'
              }`}
            >
              <View className="flex-row items-center">
                <Save size={16} color="white" />
                <Text className="text-white font-medium ml-2">
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Profile Picture */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</Text>
            <View className="items-center">
              <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center">
                <User size={48} color="#059669" />
              </View>
              <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg mt-4 flex-row items-center">
                <Camera size={16} color="white" />
                <Text className="text-white font-medium ml-2">Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Personal Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
              <TextInput
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email *</Text>
              <TextInput
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
              <TextInput
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Bio</Text>
              <TextInput
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>
          </View>

          {/* Farm Information */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Farm Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Farm Name</Text>
              <TextInput
                value={formData.farmName}
                onChangeText={(value) => handleInputChange('farmName', value)}
                placeholder="Enter your farm name"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Farm Location</Text>
              <TextInput
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Enter your farm location"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Farm Size</Text>
              <TextInput
                value={formData.farmSize}
                onChangeText={(value) => handleInputChange('farmSize', value)}
                placeholder="e.g., 2 hectares, 5 acres"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Farming Method</Text>
              <View className="flex-row">
                {['organic', 'conventional', 'mixed'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => handleInputChange('farmingMethod', method)}
                    className={`px-4 py-2 rounded-lg mr-2 ${
                      formData.farmingMethod === method
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        formData.farmingMethod === method
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Soil Type</Text>
              <TextInput
                value={formData.soilType}
                onChangeText={(value) => handleInputChange('soilType', value)}
                placeholder="e.g., Clay, Sandy, Loamy"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Water Source</Text>
              <TextInput
                value={formData.waterSource}
                onChangeText={(value) => handleInputChange('waterSource', value)}
                placeholder="e.g., Borehole, River, Rainwater"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Experience</Text>
              <TextInput
                value={formData.experience}
                onChangeText={(value) => handleInputChange('experience', value)}
                placeholder="e.g., 5 years, Beginner, Expert"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>
          </View>

          {/* Language */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Language</Text>
            <View className="flex-row flex-wrap">
              {['en', 'sw', 'fr', 'es'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => handleInputChange('language', lang)}
                  className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                    formData.language === lang
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      formData.language === lang
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {lang === 'en' ? 'English' : 
                     lang === 'sw' ? 'Swahili' : 
                     lang === 'fr' ? 'French' : 'Spanish'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
