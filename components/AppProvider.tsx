import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService, type AuthState } from '../lib/auth-service';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing 
} from 'react-native-reanimated';

// Hook to protect routes
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const state = await authService.initialize();
        setAuthState(state);
        
        const inAuthGroup = segments[0] === '(tabs)';
        
        if (!state.isAuthenticated && inAuthGroup) {
          // User is not authenticated but trying to access protected routes
          router.replace('/welcome');
        } else if (state.isAuthenticated && !state.hasConsent && segments[0] !== 'consent') {
          // User is authenticated but hasn't given consent
          router.replace('/consent');
        } else if (state.isAuthenticated && state.hasConsent && !inAuthGroup) {
          // User is authenticated and has consent, redirect to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        Alert.alert('Error', 'Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [segments, router]);

  return { authState, isLoading };
}

// Loading component
export function AppLoadingScreen() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1
    );

    // Scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [rotation, scale]);

  return (
    <LinearGradient
      colors={['#f0f9f0', '#dcf2dc', '#bce5bc']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, scaleStyle]}>
          <LinearGradient
            colors={['#3a9b3a', '#5cb85c']}
            style={styles.logo}
          >
            <Animated.View style={rotationStyle}>
              <Ionicons name="leaf" size={48} color="white" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.title}>Farmers AI</Text>
        <Text style={styles.subtitle}>Powering Smart Agriculture</Text>
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Revolutionizing farming with artificial intelligence
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a421a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#266226',
    marginBottom: 60,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3a9b3a',
    marginHorizontal: 6,
    shadowColor: '#3a9b3a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.3s',
  },
  dot3: {
    animationDelay: '0.6s',
  },
  loadingText: {
    fontSize: 16,
    color: '#266226',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#266226',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
