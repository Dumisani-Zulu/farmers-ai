import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { authService } from '../lib/auth-service';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  farmName?: string;
  location?: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    location: '',
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const isAuthenticated = await AsyncStorage.getItem('is_authenticated');
      const hasConsent = await AsyncStorage.getItem('consent_given');
      
      if (isAuthenticated === 'true') {
        if (hasConsent === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/consent');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (!formData.farmName?.trim()) {
        Alert.alert('Error', 'Farm name is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let success = false;
      
      if (isLogin) {
        success = await authService.signIn(formData.email, formData.password);
      } else {
        success = await authService.signUp(
          formData.email,
          formData.password,
          formData.farmName || '',
          formData.location
        );
      }

      if (success) {
        // Check if consent is already given
        const hasConsent = await AsyncStorage.getItem('consent_given');
        
        if (hasConsent === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/consent');
        }
      } else {
        Alert.alert('Error', 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address';
      icon: keyof typeof Ionicons.glyphMap;
      showToggle?: boolean;
      showValue?: boolean;
      onToggle?: () => void;
    }
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIcon}>
        <Ionicons name={options.icon} size={20} color="#3a9b3a" />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={options.secureTextEntry && !options.showValue}
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {options.showToggle && (
        <TouchableOpacity style={styles.eyeIcon} onPress={options.onToggle}>
          <Ionicons
            name={options.showValue ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f0f9f0', '#dcf2dc']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#3a9b3a', '#5cb85c']}
                  style={styles.logo}
                >
                  <Ionicons name="leaf" size={32} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>
                {isLogin ? 'Welcome Back' : 'Join Farmers AI'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Sign in to access your farming dashboard'
                  : 'Create your account to get started'
                }
              </Text>
            </View>

            {/* Form Card */}
            <BlurView intensity={20} style={styles.formCard}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLogin && styles.activeTab]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.activeTab]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                {renderInput(
                  'Email Address',
                  formData.email,
                  (text) => updateFormData('email', text),
                  {
                    icon: 'mail-outline',
                    keyboardType: 'email-address',
                  }
                )}

                {renderInput(
                  'Password',
                  formData.password,
                  (text) => updateFormData('password', text),
                  {
                    icon: 'lock-closed-outline',
                    secureTextEntry: true,
                    showToggle: true,
                    showValue: showPassword,
                    onToggle: () => setShowPassword(!showPassword),
                  }
                )}

                {!isLogin && (
                  <>
                    {renderInput(
                      'Confirm Password',
                      formData.confirmPassword || '',
                      (text) => updateFormData('confirmPassword', text),
                      {
                        icon: 'lock-closed-outline',
                        secureTextEntry: true,
                        showToggle: true,
                        showValue: showConfirmPassword,
                        onToggle: () => setShowConfirmPassword(!showConfirmPassword),
                      }
                    )}

                    {renderInput(
                      'Farm Name',
                      formData.farmName || '',
                      (text) => updateFormData('farmName', text),
                      {
                        icon: 'business-outline',
                      }
                    )}

                    {renderInput(
                      'Location (Optional)',
                      formData.location || '',
                      (text) => updateFormData('location', text),
                      {
                        icon: 'location-outline',
                      }
                    )}
                  </>
                )}

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#ccc', '#999'] : ['#3a9b3a', '#5cb85c']}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading
                        ? (isLogin ? 'Signing In...' : 'Creating Account...')
                        : (isLogin ? 'Sign In' : 'Create Account')
                      }
                    </Text>
                    {!loading && (
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  formCard: {
    margin: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f9f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#3a9b3a',
    fontWeight: '600',
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3a9b3a',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
