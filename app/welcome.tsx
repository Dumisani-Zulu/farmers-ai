import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  image?: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'AI-Powered Farming',
    subtitle: 'Smart Agriculture Solutions',
    description: 'Harness the power of artificial intelligence to optimize your farming operations with real-time insights and recommendations.',
    icon: 'leaf',
    color: '#3a9b3a',
  },
  {
    id: '2',
    title: 'Crop Health Monitoring',
    subtitle: 'Disease & Pest Detection',
    description: 'Identify plant diseases and pests instantly using advanced computer vision. Get treatment recommendations to protect your crops.',
    icon: 'camera',
    color: '#5cb85c',
  },
  {
    id: '3',
    title: 'Weather Intelligence',
    subtitle: 'Precision Forecasting',
    description: 'Access hyperlocal weather data and forecasts tailored for agriculture. Plan your farming activities with confidence.',
    icon: 'partly-sunny',
    color: '#2e7d2e',
  },
  {
    id: '4',
    title: 'Soil Analysis',
    subtitle: 'Smart Soil Management',
    description: 'Analyze soil conditions and get personalized recommendations for fertilizers and amendments to maximize yield.',
    icon: 'analytics',
    color: '#266226',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Initialize translateX to 0 on mount
  useEffect(() => {
    translateX.value = 0;
  }, [translateX]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      translateX.value = withSpring(-nextIndex * width);
    } else {
      router.push('/auth');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      translateX.value = withSpring(-prevIndex * width);
    }
  };

  const handleSkip = () => {
    router.push('/auth');
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={[styles.slide, { width }]}>
      <LinearGradient
        colors={[`${slide.color}20`, `${slide.color}10`]}
        style={styles.slideGradient}
      >
        <View style={styles.slideContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[slide.color, `${slide.color}80`]}
              style={styles.iconGradient}
            >
              <Ionicons name={slide.icon} size={48} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f0f9f0', '#dcf2dc']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3a9b3a', '#5cb85c']}
              style={styles.logo}
            >
              <Ionicons name="leaf" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.logoText}>Farmers AI</Text>
          </View>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <View style={styles.slidesContainer}>
          <Animated.View style={[styles.slidesWrapper, animatedStyle, { width: width * slides.length }]}>
            {slides.map((slide, index) => renderSlide(slide, index))}
          </Animated.View>
        </View>

        {/* Footer */}
        <BlurView intensity={20} style={styles.footer}>
          {renderPagination()}
          
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentIndex === 0 ? '#ccc' : '#3a9b3a'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <LinearGradient
                colors={['#3a9b3a', '#5cb85c']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <Ionicons 
                  name={currentIndex === slides.length - 1 ? 'rocket' : 'chevron-forward'} 
                  size={20} 
                  color="white" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a421a',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#3a9b3a',
    fontWeight: '500',
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 10,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a421a',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a9b3a',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: '#266226',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#3a9b3a',
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});
