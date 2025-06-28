import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../lib/auth-service';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    // Start loading animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    const checkAuthAndRedirect = async () => {
      try {
        const authState = await authService.initialize();
        
        // Add a minimum loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (authState.isAuthenticated && authState.hasConsent) {
          router.replace('/(tabs)');
        } else if (authState.isAuthenticated && !authState.hasConsent) {
          router.replace('/consent');
        } else {
          router.replace('/welcome');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        router.replace('/welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, rotation]);

  if (!isLoading) {
    return null; // Don't render anything after navigation
  }

  return (
    <LinearGradient
      colors={['#f0f9f0', '#dcf2dc']}
      style={styles.container}
    >
      <View style={styles.content}>
        <LinearGradient
          colors={['#3a9b3a', '#5cb85c']}
          style={styles.logo}
        >
          <Animated.View style={animatedStyle}>
            <Ionicons name="leaf" size={40} color="white" />
          </Animated.View>
        </LinearGradient>
        
        <Animated.Text style={styles.title}>
          Farmers AI
        </Animated.Text>
        
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
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
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a421a',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a9b3a',
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
});
