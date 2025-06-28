# Crop Recommendations Feature

## Overview

The Crops page now includes an intelligent crop recommendation system that uses:
- **Real-time weather data** from OpenMeteo API
- **14-day weather forecast** for accurate planning
- **Gemini AI** for expert agricultural analysis
- **Location-based recommendations** using GPS or manual location input

## Features

### 🌱 Smart Crop Recommendations
- AI-powered analysis of current weather conditions and 14-day forecast
- Personalized recommendations based on your exact location
- Suitability scoring for each recommended crop
- Detailed planting windows and expected harvest times

### 📊 Weather-Based Analysis
- Current temperature, humidity, and precipitation analysis
- 14-day forecast integration for optimal planting timing
- Regional climate considerations
- Seasonal appropriateness assessments

### 💡 Expert Guidance
- Specific planting tips for each recommended crop
- Weather-related warnings and considerations
- Best practices for your local conditions
- Harvest timing optimization

### 🔄 Dual View System
- **Recommendations Tab**: AI-powered crop suggestions
- **My Crops Tab**: Your currently planted crops

## How It Works

1. **Location Detection**: The app automatically detects your location or allows manual search
2. **Weather Analysis**: Fetches current conditions and 14-day forecast
3. **AI Processing**: Gemini AI analyzes weather data to suggest optimal crops
4. **Recommendations**: Displays ranked crop suggestions with detailed explanations
5. **Action**: Tap any recommendation for detailed planting information

## Key Components

### `useCropRecommendations` Hook
- Manages weather data fetching
- Integrates with Gemini AI for recommendations
- Handles location services
- Provides error handling and loading states

### `CropRecommendationsList` Component
- Displays weather summary and crop recommendations
- Shows suitability scores and planting windows
- Handles refresh functionality

### `CropDetailModal` Component
- Detailed view for each crop recommendation
- Planting tips and expert advice
- Weather context and considerations
- Action buttons for adding crops

## Usage Instructions

1. **Navigate to Crops Tab**: Open the app and go to the Crops section
2. **Allow Location Access**: Grant permission for location services for accurate local recommendations
3. **View Recommendations**: The system automatically fetches and displays crop suggestions
4. **Explore Details**: Tap any crop card to see detailed planting information
5. **Add Crops**: Use the "Add to My Crops" button to track your planting decisions
6. **Refresh**: Pull down or tap refresh to get updated recommendations based on latest weather

## AI Analysis Factors

The Gemini AI considers:
- **Temperature ranges** for optimal germination and growth
- **Precipitation patterns** for water requirements
- **Humidity levels** affecting disease risk
- **Regional suitability** based on location
- **Seasonal timing** for planting and harvest
- **Market considerations** for crop viability
- **Pest and disease pressure** for the season

## API Dependencies

- **OpenMeteo API**: Weather data and forecasting
- **Google Gemini AI**: Intelligent crop analysis
- **Expo Location**: GPS and location services

## Error Handling

The system includes robust fallback mechanisms:
- Fallback crop recommendations if AI is unavailable
- Default location if GPS access is denied
- Retry mechanisms for network failures
- User-friendly error messages and recovery options

## Future Enhancements

- Soil data integration
- Crop rotation suggestions
- Market price integration
- Historical yield analysis
- Community sharing features
