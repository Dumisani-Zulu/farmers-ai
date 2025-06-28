import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '../../lib/auth-service';
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
  Star,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react-native';

interface UserStats {
  totalCrops: number;
  farmSize: string;
  yearsExperience: number;
  successfulHarvests: number;
}

const userStats: UserStats = {
  totalCrops: 8,
  farmSize: '25 hectares',
  yearsExperience: 12,
  successfulHarvests: 156,
};

const achievements = [
  { id: '1', name: 'First Harvest', description: 'Completed your first successful harvest', earned: true },
  { id: '2', name: 'Eco Farmer', description: 'Used sustainable farming practices', earned: true },
  { id: '3', name: 'High Yield', description: 'Achieved above-average crop yield', earned: false },
  { id: '4', name: 'Tech Savvy', description: 'Used 10+ farming tools', earned: true },
];

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
              await authService.signOut();
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-4">
        {/* Profile Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm items-center">
          <View className="relative mb-4">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center">
              <User size={48} color="#059669" />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2">
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">John Farmer</Text>
          <Text className="text-sm text-gray-600 mb-4">Organic Vegetable Farmer</Text>
          <View className="flex-row items-center">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">Nakuru County, Kenya</Text>
          </View>
          <TouchableOpacity className="bg-green-600 px-6 py-2 rounded-lg mt-4 flex-row items-center">
            <Edit size={16} color="white" />
            <Text className="text-white font-medium ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Farm Stats */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Farm Statistics</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <TrendingUp size={24} color="#10b981" />
              <Text className="text-xl font-bold text-gray-900 mt-2">{userStats.totalCrops}</Text>
              <Text className="text-xs text-gray-600">Active Crops</Text>
            </View>
            <View className="items-center flex-1">
              <MapPin size={24} color="#3b82f6" />
              <Text className="text-xl font-bold text-gray-900 mt-2">{userStats.farmSize}</Text>
              <Text className="text-xs text-gray-600">Farm Size</Text>
            </View>
            <View className="items-center flex-1">
              <Calendar size={24} color="#f59e0b" />
              <Text className="text-xl font-bold text-gray-900 mt-2">{userStats.yearsExperience}</Text>
              <Text className="text-xs text-gray-600">Years Exp.</Text>
            </View>
            <View className="items-center flex-1">
              <Award size={24} color="#ec4899" />
              <Text className="text-xl font-bold text-gray-900 mt-2">{userStats.successfulHarvests}</Text>
              <Text className="text-xs text-gray-600">Harvests</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Achievements</Text>
          <View className="flex-row flex-wrap">
            {achievements.map((achievement) => (
              <View key={achievement.id} className="w-1/2 p-1">
                <View className={`p-3 rounded-lg ${achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <View className="flex-row items-center mb-2">
                    <Star size={16} color={achievement.earned ? "#10b981" : "#9ca3af"} />
                    <Text className={`text-sm font-medium ml-2 ${achievement.earned ? 'text-green-700' : 'text-gray-500'}`}>
                      {achievement.name}
                    </Text>
                  </View>
                  <Text className={`text-xs ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Phone size={20} color="#6b7280" />
              <Text className="text-gray-700 ml-3">+254 712 345 678</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={20} color="#6b7280" />
              <Text className="text-gray-700 ml-3">john.farmer@email.com</Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={20} color="#6b7280" />
              <Text className="text-gray-700 ml-3">Farm Location: GPS Coordinates</Text>
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
              <Text className="text-gray-900">June 28, 2025</Text>
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
    </SafeAreaView>
  );
}
