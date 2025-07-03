# Weather-Based Crop Recommendations System

## Overview

This implementation provides a comprehensive weather-based crop recommendation system that caches location and weather data globally across the app and uses AI-powered suggestions for optimal crop selection.

## Key Features

### 🌍 Global Location & Weather Context
- **Centralized State Management**: Single source of truth for location and weather data
- **Automatic Caching**: 30-minute cache duration to minimize API calls
- **Persistent Storage**: Data survives app restarts using AsyncStorage
- **Real-time Updates**: Weather data refreshes automatically when needed

### 🤖 AI-Powered Crop Recommendations
- **Gemini AI Integration**: Uses Google's Gemini AI for intelligent crop suggestions
- **Weather-Based Analysis**: Considers temperature, humidity, rainfall, and wind patterns
- **Seasonal Timing**: Factors in planting windows and harvest schedules
- **Fallback System**: Provides smart recommendations even when AI is unavailable

### 🔍 Smart Location Search
- **Auto-complete Search**: Fast, responsive location search with caching
- **Current Location**: GPS-based location detection with permissions handling
- **Multiple Results**: Shows multiple location options with detailed information
- **Format Flexibility**: Accepts city names, regions, or coordinates

### 📱 Enhanced UI Components
- **Location Search Modal**: Beautiful, accessible location selection interface
- **Weather Summary Cards**: Real-time weather information display
- **Crop Recommendation Cards**: Detailed crop information with suitability scores
- **Smart Refresh**: Pull-to-refresh and automatic data updates

## Architecture

### Core Components

1. **LocationWeatherContext** (`contexts/LocationWeatherContext.tsx`)
   - Global state management for location and weather data
   - Automatic caching and persistence
   - API integration with Open-Meteo weather service

2. **useWeatherBasedCropRecommendations** (`hooks/useWeatherBasedCropRecommendations.ts`)
   - React hook for generating crop recommendations
   - Integrates with LocationWeatherContext
   - Provides fallback recommendations

3. **LocationSearchModal** (`components/LocationSearchModal.tsx`)
   - User-friendly location search interface
   - Integrates with global location context
   - Supports both search and GPS location

4. **Enhanced Gemini AI Service** (`lib/gemini-ai.ts`)
   - Improved crop recommendation prompts
   - Weather-pattern analysis
   - Seasonal and regional considerations

### Data Flow

```
User Searches Location → LocationWeatherContext → Weather API → Cache Storage
                    ↓
Weather Data → useWeatherBasedCropRecommendations → Gemini AI → Crop Suggestions
                    ↓
Crop Recommendations → UI Components → User Interface
```

## Usage

### Setting Up Location

1. **Automatic Location**: The app will request location permissions on first use
2. **Manual Search**: Users can search for any location using the search modal
3. **Cached Results**: Previously searched locations are cached for quick access

### Getting Crop Recommendations

1. **Automatic Generation**: Recommendations generate automatically when location is set
2. **Weather Analysis**: System analyzes 14-day weather forecast
3. **AI Processing**: Gemini AI provides intelligent crop suggestions
4. **Fallback System**: Smart fallback recommendations if AI is unavailable

### Caching System

- **Location Data**: Cached for 30 minutes
- **Weather Data**: Cached for 30 minutes
- **Search Results**: Cached to improve performance
- **Automatic Refresh**: Data refreshes when cache expires

## Configuration

### Environment Variables

```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

### API Endpoints

- **Weather Data**: Open-Meteo API (free, no API key required)
- **Geocoding**: Open-Meteo Geocoding API
- **AI Recommendations**: Google Gemini AI API

## Implementation Details

### Weather Data Structure

```typescript
interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  };
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number };
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  }>;
  location: LocationData;
  lastUpdated: number;
}
```

### Crop Recommendation Structure

```typescript
interface CropRecommendation {
  id: string;
  name: string;
  variety: string;
  suitabilityScore: number; // 0-100
  plantingWindow: string;
  expectedHarvest: string;
  reasons: string[];
  warnings?: string[];
  plantingTips: string[];
}
```

## Error Handling

### Network Failures
- Graceful degradation when APIs are unavailable
- Cached data used when network is offline
- User-friendly error messages

### Location Permissions
- Handles denied location permissions
- Provides manual location search alternative
- Clear permission request messaging

### AI Service Failures
- Fallback to rule-based recommendations
- No interruption to user experience
- Logging for debugging purposes

## Performance Optimizations

### Caching Strategy
- **30-minute cache duration** for weather data
- **AsyncStorage persistence** for offline access
- **Memory caching** for frequent requests
- **Debounced search** to reduce API calls

### API Usage
- **Single weather API call** per location
- **Batch geocoding requests** when possible
- **Efficient data structures** for storage
- **Automatic retry** for failed requests

## Testing

Run the integration test:

```bash
npx ts-node scripts/test-integration.ts
```

This verifies:
- Context imports correctly
- Hook functionality works
- Data structures are valid
- Basic integration is functional

## Future Enhancements

### Planned Features
- **Crop Disease Prediction**: AI-powered disease risk assessment
- **Market Price Integration**: Real-time crop pricing data
- **Planting Calendar**: Personalized planting schedules
- **Yield Estimation**: Predicted harvest quantities

### Technical Improvements
- **Offline Mode**: Full functionality without internet
- **Push Notifications**: Weather alerts and planting reminders
- **Data Analytics**: Usage patterns and recommendation accuracy
- **Multi-language Support**: Internationalization

## Contributing

When adding new features:
1. Use the existing context for location/weather data
2. Follow the established caching patterns
3. Provide fallback options for all AI-powered features
4. Include comprehensive error handling
5. Add appropriate TypeScript types

## Dependencies

### Core Dependencies
- `@react-native-async-storage/async-storage`: Data persistence
- `@google/generative-ai`: Gemini AI integration
- `expo-location`: GPS and geocoding services
- `openmeteo`: Weather data API

### UI Dependencies
- `lucide-react-native`: Icons
- `react-native-safe-area-context`: Safe area handling
- `expo-linear-gradient`: UI gradients

## License

This implementation is part of the Farmers AI app and follows the project's existing license terms.
