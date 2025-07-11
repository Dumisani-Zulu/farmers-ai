import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Shield, 
  Activity,
  Settings,
  Copy,
  Edit
} from 'lucide-react-native';
import { FirestoreUserProfile } from '@/lib/firestore-service';
import { ExtendedUserProfile } from '@/hooks/useUserProfile';

interface UserInfoTableProps {
  userProfile: ExtendedUserProfile | FirestoreUserProfile;
  onEdit?: () => void;
  showEditButton?: boolean;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
  copyable?: boolean;
  onEdit?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, copyable = false, onEdit }) => {
  const handleCopy = () => {
    if (value && copyable) {
      // In a real app, you'd use Clipboard API
      Alert.alert('Copied', `${label} copied to clipboard`);
    }
  };

  const displayValue = value || 'Not provided';
  const isEmpty = !value;

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-8 mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-600 mb-1">{label}</Text>
        <Text className={`text-base ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
          {displayValue}
        </Text>
      </View>
      <View className="flex-row space-x-2">
        {copyable && value && (
          <TouchableOpacity onPress={handleCopy} className="p-2">
            <Copy size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity onPress={onEdit} className="p-2">
            <Edit size={16} color="#16a34a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <View className="flex-row items-center py-4 border-b-2 border-green-500 mb-2">
    <View className="mr-3">
      {icon}
    </View>
    <Text className="text-lg font-bold text-gray-900">{title}</Text>
  </View>
);

export const UserInfoTable: React.FC<UserInfoTableProps> = ({ 
  userProfile, 
  onEdit, 
  showEditButton = true 
}) => {
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return null;
    
    try {
      let date: Date;
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        return null;
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-yellow-600';
      case 'suspended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? '✅' : '❌';
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header with Edit Button */}
        {showEditButton && onEdit && (
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">User Information</Text>
            <TouchableOpacity 
              onPress={onEdit}
              className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Edit size={16} color="white" className="mr-2" />
              <Text className="text-white font-semibold">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Basic Information Section */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <SectionHeader 
            title="Basic Information" 
            icon={<User size={20} color="#16a34a" />} 
          />
          
          <InfoRow
            icon={<User size={16} color="#6b7280" />}
            label="User ID"
            value={(userProfile as any).uid || (userProfile as any).id}
            copyable
          />
          
          <InfoRow
            icon={<Mail size={16} color="#6b7280" />}
            label="Email"
            value={userProfile.email}
            copyable
          />
          
          <InfoRow
            icon={<User size={16} color="#6b7280" />}
            label="Display Name"
            value={(userProfile as any).displayName || (userProfile as any).name}
          />
          
          <InfoRow
            icon={<User size={16} color="#6b7280" />}
            label="Full Name"
            value={userProfile.fullName}
          />
          
          <InfoRow
            icon={<Phone size={16} color="#6b7280" />}
            label="Phone Number"
            value={(userProfile as any).phoneNumber || (userProfile as any).phone}
            copyable
          />
        </View>

        {/* Personal Information Section */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <SectionHeader 
            title="Personal Information" 
            icon={<Settings size={20} color="#16a34a" />} 
          />
          
          <InfoRow
            icon={<Calendar size={16} color="#6b7280" />}
            label="Date of Birth"
            value={(userProfile as any).dateOfBirth}
          />
          
          <InfoRow
            icon={<User size={16} color="#6b7280" />}
            label="Gender"
            value={(userProfile as any).gender}
          />
          
          <InfoRow
            icon={<Globe size={16} color="#6b7280" />}
            label="Language"
            value={userProfile.language}
          />
          
          <InfoRow
            icon={<Globe size={16} color="#6b7280" />}
            label="Timezone"
            value={userProfile.timezone}
          />
        </View>

        {/* Location Information Section */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <SectionHeader 
            title="Location Information" 
            icon={<MapPin size={20} color="#16a34a" />} 
          />
          
          <InfoRow
            icon={<MapPin size={16} color="#6b7280" />}
            label="Country"
            value={(userProfile as any).country}
          />
          
          <InfoRow
            icon={<MapPin size={16} color="#6b7280" />}
            label="State"
            value={(userProfile as any).state}
          />
          
          <InfoRow
            icon={<MapPin size={16} color="#6b7280" />}
            label="City"
            value={(userProfile as any).city}
          />
          
          <InfoRow
            icon={<MapPin size={16} color="#6b7280" />}
            label="Address"
            value={(userProfile as any).address}
          />
          
          {(userProfile as any).coordinates && (
            <>
              <InfoRow
                icon={<MapPin size={16} color="#6b7280" />}
                label="Latitude"
                value={(userProfile as any).coordinates.latitude?.toString()}
                copyable
              />
              
              <InfoRow
                icon={<MapPin size={16} color="#6b7280" />}
                label="Longitude"
                value={(userProfile as any).coordinates.longitude?.toString()}
                copyable
              />
            </>
          )}
        </View>

        {/* Account Status Section */}
        {'accountStatus' in userProfile && (
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <SectionHeader 
              title="Account Status" 
              icon={<Shield size={20} color="#16a34a" />} 
            />
            
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-8 mr-3">
                <Shield size={16} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Account Status</Text>
                <Text className={`text-base font-semibold ${getStatusColor((userProfile as any).accountStatus)}`}>
                  {(userProfile as any).accountStatus?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
            
            <InfoRow
              icon={<Mail size={16} color="#6b7280" />}
              label="Email Verified"
              value={`${getVerificationIcon((userProfile as any).emailVerified)} ${(userProfile as any).emailVerified ? 'Verified' : 'Not Verified'}`}
            />
            
            <InfoRow
              icon={<Phone size={16} color="#6b7280" />}
              label="Phone Verified"
              value={`${getVerificationIcon((userProfile as any).phoneVerified)} ${(userProfile as any).phoneVerified ? 'Verified' : 'Not Verified'}`}
            />
          </View>
        )}

        {/* Activity Information Section */}
        {('createdAt' in userProfile || 'updatedAt' in userProfile) && (
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <SectionHeader 
              title="Activity Information" 
              icon={<Activity size={20} color="#16a34a" />} 
            />
            
            <InfoRow
              icon={<Calendar size={16} color="#6b7280" />}
              label="Account Created"
              value={formatDateTime((userProfile as any).createdAt)}
            />
            
            <InfoRow
              icon={<Calendar size={16} color="#6b7280" />}
              label="Last Updated"
              value={formatDateTime((userProfile as any).updatedAt)}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Last Login"
              value={formatDateTime((userProfile as any).lastLoginAt)}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Last Active"
              value={formatDateTime((userProfile as any).lastActiveAt)}
            />
          </View>
        )}
        
        {/* Farming Information Section (for ExtendedUserProfile) */}
        {('farmSize' in userProfile || 'experience' in userProfile) && (
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <SectionHeader 
              title="Farming Information" 
              icon={<Activity size={20} color="#16a34a" />} 
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Farm Size"
              value={(userProfile as any).farmSize}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Experience Level"
              value={(userProfile as any).experience}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Farming Method"
              value={(userProfile as any).farmingMethod}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Soil Type"
              value={(userProfile as any).soilType}
            />
            
            <InfoRow
              icon={<Activity size={16} color="#6b7280" />}
              label="Water Source"
              value={(userProfile as any).waterSource}
            />
            
            {(userProfile as any).cropTypes && (
              <InfoRow
                icon={<Activity size={16} color="#6b7280" />}
                label="Crop Types"
                value={(userProfile as any).cropTypes?.join(', ')}
              />
            )}
          </View>
        )}
        
        {/* Debug Information (only show in development) */}
        {__DEV__ && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <Text className="text-yellow-800 font-semibold mb-2">Debug Information</Text>
            <Text className="text-xs text-yellow-700 font-mono">
              {JSON.stringify(userProfile, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default UserInfoTable;
