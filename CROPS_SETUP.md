# Crops Recommendation Feature Setup

## Overview
The crops recommendation feature analyzes current weather conditions and 14-day forecasts to suggest the best crops to plant based on your location. It uses Google's Gemini AI for intelligent recommendations and falls back to weather-based algorithms when AI is unavailable.

## Setup Instructions

### 1. Environment Configuration
The app requires a Google AI API key to provide AI-powered recommendations. A pre-configured key is already included in the `.env` file, but you can get your own if needed.

#### Getting Your Own API Key (Optional)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key
5. Update the `GOOGLE_AI_API_KEY` in your `.env` file

### 2. Features

#### AI-Powered Recommendations
When the API key is configured, the system:
- Analyzes 14-day weather forecasts
- Considers temperature, humidity, precipitation, and seasonal patterns
- Provides detailed crop suitability scores (0-100%)
- Suggests specific varieties and planting windows
- Offers expert planting tips and warnings
- Considers regional and climate factors

#### Fallback System
When AI is unavailable, the system provides:
- Weather-based crop recommendations
- Temperature and rainfall analysis
- Seasonal crop suggestions
- Basic planting guidance

### 3. How to Use

1. **Navigate to Crops Tab**
   - Open the app and go to the "Crops" tab
   - Toggle to "Recommendations" view

2. **Get Location-Based Recommendations**
   - Allow location access for accurate recommendations
   - Or search for a specific location
   - The system fetches current weather and 14-day forecast

3. **Browse Recommendations**
   - View crop cards with suitability scores
   - See planting windows and harvest times
   - Tap on crops for detailed information

4. **View Detailed Information**
   - Tap any crop recommendation for full details
   - See reasons why the crop is suitable
   - Read expert planting tips and warnings
   - View current weather context

5. **Add Crops to Your Farm**
   - Use "Add to My Crops" to track planted crops
   - Switch to "My Crops" view to see your current plants

### 4. Data Sources

- **Weather Data**: OpenMeteo API (free, no key required)
- **Location Services**: Expo Location for GPS coordinates
- **AI Recommendations**: Google Gemini AI
- **Fallback Data**: Built-in crop database with weather correlations

### 5. Troubleshooting

#### "API key not found" Error
- Ensure `.env` file exists in project root
- Verify `GOOGLE_AI_API_KEY` is set in `.env`
- Restart the development server after changing `.env`
- The app will use fallback recommendations if AI fails

#### Location Issues
- Enable location permissions in device settings
- Use manual location search if GPS is unavailable
- Check internet connection for weather data

#### No Recommendations Showing
- Verify internet connection
- Check if location services are enabled
- Try refreshing the recommendations
- Check console for error messages

### 6. Customization

You can customize the fallback recommendations by modifying the `getFallbackRecommendations` function in `hooks/useCropRecommendations.ts` to include:
- Regional crop varieties
- Local planting calendars
- Specific climate adaptations
- Cultural preferences

### 7. Future Enhancements

Planned improvements include:
- Soil type integration
- Market price considerations
- Pest and disease predictions
- Crop rotation suggestions
- Historical yield data
- Community recommendations

## Technical Architecture

- **Hook**: `useCropRecommendations` - Main logic and state management
- **Components**: 
  - `CropRecommendationsList` - Display recommendations
  - `CropDetailModal` - Detailed crop information
- **Services**: 
  - `gemini-ai.ts` - AI integration
  - OpenMeteo API - Weather data
- **Fallback**: Weather-based algorithm for offline/no-AI scenarios
