import { Tabs } from 'expo-router';
import { Cloud, Sprout, Calendar, User, Tractor } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    // Set navigation bar to light background with dark buttons
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#f8fafc');
      // Try to set the navigation bar style using React Native StatusBar
      RNStatusBar.setBarStyle('dark-content', true);
      RNStatusBar.setBackgroundColor('#f8fafc', true);
    }
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#f8fafc" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3a9b3a',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#f8fafc',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 8,
            ...(Platform.OS === 'android' && {
              borderTopWidth: 1.5,
              borderTopColor: '#cbd5e1',
              marginBottom: 0,
            }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
            marginBottom: Platform.OS === 'ios' ? 2 : 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Current',
            tabBarIcon: ({ size, color }) => (
              <Cloud size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="crops"
          options={{
            title: 'Crops',
            tabBarIcon: ({ size, color }) => (
              <Sprout size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="season-advice"
          options={{
            title: 'Advisor',
            tabBarIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: 'Tools',
            tabBarIcon: ({ size, color }) => (
              <Tractor size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}