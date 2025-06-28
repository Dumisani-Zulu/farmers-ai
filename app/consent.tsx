import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { authService } from '../lib/auth-service';

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const consentItems: ConsentItem[] = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'We need access to your location to provide accurate weather data, soil conditions, and crop recommendations specific to your farming area.',
    required: true,
    icon: 'location-outline',
  },
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'Camera access is required for plant disease identification, pest detection, and crop monitoring features.',
    required: true,
    icon: 'camera-outline',
  },
  {
    id: 'analytics',
    title: 'Usage Analytics',
    description: 'Help us improve our AI models by sharing anonymous usage data. This helps us make better crop recommendations.',
    required: false,
    icon: 'analytics-outline',
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    description: 'Receive important alerts about weather changes, optimal planting times, and crop care reminders.',
    required: false,
    icon: 'notifications-outline',
  },
];

export default function ConsentScreen() {
  const router = useRouter();
  const [acceptedConsents, setAcceptedConsents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleConsentToggle = (consentId: string) => {
    const newConsents = new Set(acceptedConsents);
    if (newConsents.has(consentId)) {
      newConsents.delete(consentId);
    } else {
      newConsents.add(consentId);
    }
    setAcceptedConsents(newConsents);
  };

  const handleContinue = async () => {
    const requiredConsents = consentItems.filter(item => item.required);
    const missingRequired = requiredConsents.filter(item => !acceptedConsents.has(item.id));

    if (missingRequired.length > 0) {
      Alert.alert(
        'Required Permissions',
        'Please accept all required permissions to continue using the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const consentsArray = Array.from(acceptedConsents);
      const success = await authService.giveConsent(consentsArray);
      
      if (success) {
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderConsentItem = (item: ConsentItem) => {
    const isAccepted = acceptedConsents.has(item.id);
    
    return (
      <View key={item.id} style={styles.consentItem}>
        <View style={styles.consentHeader}>
          <View style={styles.consentIcon}>
            <Ionicons name={item.icon} size={24} color="#3a9b3a" />
          </View>
          <View style={styles.consentContent}>
            <Text style={styles.consentTitle}>
              {item.title}
              {item.required && <Text style={styles.requiredText}> *</Text>}
            </Text>
            <Text style={styles.consentDescription}>{item.description}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkbox, isAccepted && styles.checkboxChecked]}
            onPress={() => handleConsentToggle(item.id)}
          >
            {isAccepted && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0f9f0', '#dcf2dc']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#3a9b3a', '#5cb85c']}
                style={styles.logo}
              >
                <Ionicons name="leaf" size={32} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Welcome to Farmers AI</Text>
            <Text style={styles.subtitle}>
              Your intelligent farming companion powered by AI
            </Text>
          </View>

          <BlurView intensity={20} style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Privacy & Permissions</Text>
            <Text style={styles.sectionDescription}>
              To provide you with the best farming experience, we need your permission for the following:
            </Text>

            <View style={styles.consentList}>
              {consentItems.map(renderConsentItem)}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                * Required permissions are necessary for core app functionality
              </Text>
              
              <TouchableOpacity
                style={[styles.continueButton, loading && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#ccc', '#999'] : ['#3a9b3a', '#5cb85c']}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    {loading ? 'Setting up...' : 'Continue to App'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={20} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a421a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#266226',
    textAlign: 'center',
    lineHeight: 22,
  },
  contentCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a421a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#266226',
    marginBottom: 24,
    lineHeight: 22,
  },
  consentList: {
    marginBottom: 24,
  },
  consentItem: {
    marginBottom: 20,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  consentContent: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a421a',
    marginBottom: 4,
  },
  requiredText: {
    color: '#e74c3c',
  },
  consentDescription: {
    fontSize: 14,
    color: '#266226',
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a9b3a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#3a9b3a',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e6d7c1',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});
