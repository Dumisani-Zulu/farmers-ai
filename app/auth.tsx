import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, AuthState } from '../lib/auth-service';

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
  const [authLoading, setAuthLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    location: '',
  });

  const handleAuthStateChange = useCallback((authState: AuthState) => {
    setAuthLoading(authState.loading);
    
    if (!authState.loading && authState.isAuthenticated) {
      if (authState.hasConsent) {
        router.replace('/(tabs)');
      } else {
        router.replace('/consent');
      }
    }
  }, [router]);

  useEffect(() => {
    authService.addAuthStateListener(handleAuthStateChange);
    
    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, [handleAuthStateChange]);

  const showErrorAlert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }],
      { 
        cancelable: true,
        userInterfaceStyle: 'light'
      }
    );
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: boolean} = {};
    let isValid = true;

    // Check for empty email
    if (!formData.email.trim()) {
      errors.email = true;
      isValid = false;
      showErrorAlert('❌ Missing Email', 'Please enter your email address to continue.');
      setFieldErrors(errors);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = true;
      isValid = false;
      showErrorAlert('❌ Invalid Email', 'Please enter a valid email address (e.g., user@example.com).');
      setFieldErrors(errors);
      return false;
    }

    // Check for empty password
    if (!formData.password.trim()) {
      errors.password = true;
      isValid = false;
      showErrorAlert('❌ Missing Password', 'Please enter your password to continue.');
      setFieldErrors(errors);
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      errors.password = true;
      isValid = false;
      showErrorAlert('❌ Weak Password', 'Password must be at least 6 characters long for security.');
      setFieldErrors(errors);
      return false;
    }

    // Additional validation for sign up
    if (!isLogin) {
      // Check password confirmation
      if (!formData.confirmPassword?.trim()) {
        errors.confirmPassword = true;
        isValid = false;
        showErrorAlert('❌ Missing Confirmation', 'Please confirm your password.');
        setFieldErrors(errors);
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        errors.password = true;
        errors.confirmPassword = true;
        isValid = false;
        showErrorAlert('❌ Password Mismatch', 'Passwords do not match. Please check and try again.');
        setFieldErrors(errors);
        return false;
      }

      // Check farm name
      if (!formData.farmName?.trim()) {
        errors.farmName = true;
        isValid = false;
        showErrorAlert('❌ Missing Farm Name', 'Please enter your farm name to create your account.');
        setFieldErrors(errors);
        return false;
      }

      // Validate farm name length
      if (formData.farmName.trim().length < 2) {
        errors.farmName = true;
        isValid = false;
        showErrorAlert('❌ Invalid Farm Name', 'Farm name must be at least 2 characters long.');
        setFieldErrors(errors);
        return false;
      }
    }

    // Clear any previous errors if validation passes
    setFieldErrors({});
    return isValid;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorTitle = '❌ Google Sign-In Failed';
      let errorMessage = 'Unable to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorTitle = '⚠️ Sign-In Cancelled';
        errorMessage = 'You cancelled the Google sign-in process. Please try again when ready.';
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = '🌐 Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorTitle = '❌ Account Conflict';
        errorMessage = 'An account with this email already exists. Please sign in with your original method.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorAlert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (isLogin) {
        await authService.signIn(formData.email, formData.password);
      } else {
        await authService.signUp(
          formData.email,
          formData.password,
          formData.farmName || '',
          formData.location
        );
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorTitle = '❌ Authentication Failed';
      let errorMessage = 'Unable to authenticate. Please try again.';
      
      // Sign in specific errors
      if (isLogin) {
        if (error.code === 'auth/user-not-found') {
          errorTitle = '❌ Account Not Found';
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.code === 'auth/wrong-password') {
          errorTitle = '❌ Incorrect Password';
          errorMessage = 'The password you entered is incorrect. Please try again or reset your password.';
        } else if (error.code === 'auth/invalid-credential') {
          errorTitle = '❌ Invalid Credentials';
          errorMessage = 'The email or password you entered is incorrect. Please check and try again.';
        } else if (error.code === 'auth/too-many-requests') {
          errorTitle = '⚠️ Too Many Attempts';
          errorMessage = 'Too many failed sign-in attempts. Please wait a few minutes before trying again.';
        } else if (error.code === 'auth/user-disabled') {
          errorTitle = '❌ Account Disabled';
          errorMessage = 'This account has been disabled. Please contact support for assistance.';
        }
      } 
      // Sign up specific errors
      else {
        if (error.code === 'auth/email-already-in-use') {
          errorTitle = '❌ Email Already Registered';
          errorMessage = 'An account with this email already exists. Please sign in instead or use a different email.';
        } else if (error.code === 'auth/weak-password') {
          errorTitle = '❌ Weak Password';
          errorMessage = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorTitle = '❌ Registration Disabled';
          errorMessage = 'Account registration is currently disabled. Please try again later.';
        }
      }
      
      // Common errors for both sign in and sign up
      if (error.code === 'auth/invalid-email') {
        errorTitle = '❌ Invalid Email';
        errorMessage = 'The email address format is invalid. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = '🌐 Network Error';
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.code === 'auth/timeout') {
        errorTitle = '⏱️ Request Timeout';
        errorMessage = 'The request timed out. Please check your connection and try again.';
      } else if (error.message && !errorTitle.includes('Authentication Failed')) {
        // Use custom error message if we haven't set a specific title
        errorMessage = error.message;
      }
      
      showErrorAlert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      showErrorAlert('❌ Email Required', 'Please enter your email address first to reset your password.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showErrorAlert('❌ Invalid Email', 'Please enter a valid email address to receive password reset instructions.');
      return;
    }

    try {
      await authService.resetPassword(formData.email);
      Alert.alert(
        '✅ Reset Email Sent', 
        'Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password.',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorTitle = '❌ Reset Failed';
      let errorMessage = 'Unable to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorTitle = '❌ Account Not Found';
        errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
      } else if (error.code === 'auth/invalid-email') {
        errorTitle = '❌ Invalid Email';
        errorMessage = 'The email address format is invalid. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = '⚠️ Too Many Requests';
        errorMessage = 'Too many password reset attempts. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = '🌐 Network Error';
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorAlert(errorTitle, errorMessage);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading screen while checking auth state
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient colors={['#ffffff', '#f8fffe']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Minimalistic Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  {/* <Ionicons name="leaf" size={28} color="#22c55e" /> */}
                  {/* icon logo */}
                  <Image source={require('../assets/images/icon.png')} style={styles.logoImage} />
                </View>
                {/* <Text style={styles.logoText}>Farmers AI</Text> */}
              </View>
              <Text style={styles.welcomeText}>
                {isLogin ? 'Welcome back' : 'Create account'}
              </Text>
            </View>

            {/* Auth Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                onPress={() => {
                  setIsLogin(true);
                  setFieldErrors({}); // Clear errors when switching modes
                }}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                onPress={() => {
                  setIsLogin(false);
                  setFieldErrors({}); // Clear errors when switching modes
                }}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Google Sign In Button */}
              {/* <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <View style={styles.googleButtonContent}>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              </TouchableOpacity> */}

              {/* Divider */}
              {/* <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View> */}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => {
                      updateFormData('email', text);
                      // Clear error when user starts typing
                      if (fieldErrors.email) {
                        setFieldErrors(prev => ({ ...prev, email: false }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => {
                      updateFormData('password', text);
                      // Clear error when user starts typing
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: false }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Additional Fields */}
              {!isLogin && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={[styles.inputContainer, fieldErrors.confirmPassword && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="#9ca3af"
                        value={formData.confirmPassword || ''}
                        onChangeText={(text) => {
                          updateFormData('confirmPassword', text);
                          // Clear error when user starts typing
                          if (fieldErrors.confirmPassword) {
                            setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
                          }
                        }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Farm Name</Text>
                    <View style={[styles.inputContainer, fieldErrors.farmName && styles.inputError]}>
                      <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your farm name"
                        placeholderTextColor="#9ca3af"
                        value={formData.farmName || ''}
                        onChangeText={(text) => {
                          updateFormData('farmName', text);
                          // Clear error when user starts typing
                          if (fieldErrors.farmName) {
                            setFieldErrors(prev => ({ ...prev, farmName: false }));
                          }
                        }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Location (Optional)</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your location"
                        placeholderTextColor="#9ca3af"
                        value={formData.location || ''}
                        onChangeText={(text) => updateFormData('location', text)}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Forgot Password */}
              {isLogin && (
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#d1d5db', '#9ca3af'] : ['#22c55e', '#16a34a']}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading
                      ? (isLogin ? 'Signing in...' : 'Creating account...')
                      : (isLogin ? 'Sign In' : 'Create Account')
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#22c55e',
    fontWeight: '500',
  },
});
