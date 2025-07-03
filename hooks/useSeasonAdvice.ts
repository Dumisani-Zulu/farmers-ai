import { useState, useCallback, useEffect } from 'react';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { geminiAI } from '@/lib/gemini-ai';

export interface SeasonAdvice {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'planting' | 'harvesting' | 'maintenance' | 'weather' | 'irrigation' | 'pest_control';
  daysLeft?: number;
  completed?: boolean;
  season: string;
  actionItems: string[];
  timing: string;
}

interface UseSeasonAdviceReturn {
  advice: SeasonAdvice[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  currentSeason: string;
  
  // Methods
  generateAdvice: () => Promise<void>;
  refreshAdvice: () => Promise<void>;
  markCompleted: (adviceId: string) => void;
  clearAdvice: () => void;
}

export const useSeasonAdvice = (): UseSeasonAdviceReturn => {
  const [advice, setAdvice] = useState<SeasonAdvice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>('Unknown');

  const { weatherData, currentLocation, isLoading: locationLoading } = useLocationWeather();

  // Determine current season based on date and location
  const getCurrentSeason = useCallback(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    // Southern hemisphere seasons (if latitude is negative)
    if (currentLocation && currentLocation.latitude < 0) {
      if (month >= 2 && month <= 4) return 'Autumn'; // Mar-May
      if (month >= 5 && month <= 7) return 'Winter'; // Jun-Aug
      if (month >= 8 && month <= 10) return 'Spring'; // Sep-Nov
      return 'Summer'; // Dec-Feb
    }
    
    // Northern hemisphere seasons (default)
    if (month >= 2 && month <= 4) return 'Spring'; // Mar-May
    if (month >= 5 && month <= 7) return 'Summer'; // Jun-Aug
    if (month >= 8 && month <= 10) return 'Autumn'; // Sep-Nov
    return 'Winter'; // Dec-Feb
  }, [currentLocation]);

  // Generate seasonal advice using AI
  const generateSeasonalAdvice = useCallback(async (): Promise<SeasonAdvice[]> => {
    if (!weatherData || !currentLocation) {
      throw new Error('Weather data and location are required for seasonal advice');
    }

    try {
      console.log('🤖 Generating seasonal advice with Gemini AI...');
      await geminiAI.initialize();

      const season = getCurrentSeason();
      setCurrentSeason(season);

      const prompt = `Based on the following weather data and location, provide seasonal farming advice for ${season}:

Location: ${currentLocation.city || currentLocation.address || 'Unknown location'}, ${currentLocation.region || ''}, ${currentLocation.country || ''}
Current Temperature: ${weatherData.current.temperature}°C
Humidity: ${weatherData.current.humidity}%
Current Conditions: ${weatherData.current.description}
Season: ${season}

14-day forecast:
${weatherData.forecast.slice(0, 14).map((day, i) => 
  `Day ${i + 1}: ${day.temperature.min}-${day.temperature.max}°C, ${day.condition}, ${day.precipitation}mm rain`
).join('\n')}

Please provide 6-8 actionable seasonal farming advice items in JSON format with this structure:
{
  "advice": [
    {
      "id": "advice_1",
      "title": "Brief title",
      "description": "Detailed description of what to do and why",
      "priority": "high|medium|low",
      "category": "planting|harvesting|maintenance|weather|irrigation|pest_control",
      "daysLeft": number (optional, for time-sensitive tasks),
      "completed": false,
      "season": "${season}",
      "actionItems": ["Step 1", "Step 2", "Step 3"],
      "timing": "When to do this (e.g., 'Next 7 days', 'Before month end')"
    }
  ]
}

Focus on:
- Current season-appropriate activities
- Weather-responsive recommendations
- Time-sensitive farming tasks
- Regional farming practices
- Preparation for upcoming season
- Maintenance and care activities`;

      const result = await geminiAI.generateResponse(prompt);
      
      console.log('🌾 Received seasonal advice response (first 200 chars):', result.substring(0, 200) + '...');
      
      // Try to parse the JSON response
      try {
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          console.warn('❌ No JSON found in advice response, using fallback');
          throw new Error('No JSON found in response');
        }
        
        const jsonStr = result.substring(jsonStart, jsonEnd);
        console.log('📋 Extracted JSON from advice response');
        
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.advice || !Array.isArray(parsed.advice)) {
          console.warn('❌ Invalid advice response format, using fallback');
          throw new Error('Invalid response format');
        }
        
        console.log('✅ Successfully parsed', parsed.advice.length, 'seasonal advice items');
        
        return parsed.advice.map((item: any, index: number) => ({
          ...item,
          id: item.id || `advice_${index + 1}`,
          priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
          category: ['planting', 'harvesting', 'maintenance', 'weather', 'irrigation', 'pest_control'].includes(item.category) 
            ? item.category : 'maintenance',
          completed: false,
          season: season,
          actionItems: Array.isArray(item.actionItems) ? item.actionItems : [item.actionItems || item.description],
          timing: item.timing || 'Ongoing',
        }));
      } catch (parseError: any) {
        console.warn('❌ Failed to parse advice JSON, using fallback:', parseError.message);
        return getFallbackAdvice(season, weatherData, currentLocation);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('API key not found')) {
        console.warn('⚠️ Gemini AI API key not configured, using fallback seasonal advice');
      } else {
        console.error('❌ Failed to generate AI seasonal advice:', error.message);
      }
      console.log('🔄 Using fallback seasonal advice instead');
      return getFallbackAdvice(getCurrentSeason(), weatherData, currentLocation);
    }
  }, [weatherData, currentLocation, getCurrentSeason]);

  // Fallback advice based on season and basic weather data
  const getFallbackAdvice = (season: string, weather: any, location: any): SeasonAdvice[] => {
    const baseAdvice: Omit<SeasonAdvice, 'id'>[] = [];
    
    // Season-specific advice
    if (season === 'Spring') {
      baseAdvice.push(
        {
          title: 'Prepare Soil for Planting',
          description: 'Test soil pH and add organic matter. Spring is ideal for soil preparation.',
          priority: 'high',
          category: 'maintenance',
          daysLeft: 14,
          completed: false,
          season,
          actionItems: ['Test soil pH', 'Add compost or organic matter', 'Till soil if needed'],
          timing: 'Next 2 weeks'
        },
        {
          title: 'Plant Spring Vegetables',
          description: 'Start planting cool-season crops like lettuce, spinach, and peas.',
          priority: 'high',
          category: 'planting',
          daysLeft: 21,
          completed: false,
          season,
          actionItems: ['Choose appropriate varieties', 'Plant in well-drained soil', 'Water regularly'],
          timing: 'Next 3 weeks'
        }
      );
    } else if (season === 'Summer') {
      baseAdvice.push(
        {
          title: 'Increase Irrigation',
          description: 'Monitor soil moisture and increase watering frequency during hot weather.',
          priority: 'high',
          category: 'irrigation',
          completed: false,
          season,
          actionItems: ['Check soil moisture daily', 'Water early morning or evening', 'Apply mulch to retain moisture'],
          timing: 'Daily monitoring'
        },
        {
          title: 'Harvest Summer Crops',
          description: 'Regularly harvest tomatoes, peppers, and other summer vegetables.',
          priority: 'medium',
          category: 'harvesting',
          completed: false,
          season,
          actionItems: ['Check ripeness daily', 'Harvest in cool hours', 'Store properly'],
          timing: 'Ongoing'
        }
      );
    } else if (season === 'Autumn') {
      baseAdvice.push(
        {
          title: 'Plant Winter Crops',
          description: 'Plant vegetables that can withstand cooler temperatures.',
          priority: 'high',
          category: 'planting',
          daysLeft: 30,
          completed: false,
          season,
          actionItems: ['Choose cold-hardy varieties', 'Plant before first frost', 'Prepare protective covers'],
          timing: 'Before first frost'
        },
        {
          title: 'Preserve Harvest',
          description: 'Process and store the autumn harvest for winter use.',
          priority: 'medium',
          category: 'harvesting',
          completed: false,
          season,
          actionItems: ['Harvest before frost', 'Clean and process vegetables', 'Store in cool, dry place'],
          timing: 'Before frost'
        }
      );
    } else { // Winter
      baseAdvice.push(
        {
          title: 'Protect Plants from Frost',
          description: 'Cover sensitive plants and check for frost damage.',
          priority: 'high',
          category: 'maintenance',
          completed: false,
          season,
          actionItems: ['Cover sensitive plants', 'Check for frost damage', 'Bring potted plants indoors'],
          timing: 'Before cold snaps'
        },
        {
          title: 'Plan Next Season',
          description: 'Review this season and plan for spring planting.',
          priority: 'low',
          category: 'maintenance',
          completed: false,
          season,
          actionItems: ['Review crop performance', 'Order seeds for spring', 'Plan garden layout'],
          timing: 'Winter months'
        }
      );
    }

    // Weather-specific advice
    if (weather.current.humidity > 70) {
      baseAdvice.push({
        title: 'Monitor for Fungal Diseases',
        description: 'High humidity increases risk of fungal diseases. Ensure good air circulation.',
        priority: 'medium',
        category: 'pest_control',
        completed: false,
        season,
        actionItems: ['Check plants for disease signs', 'Improve air circulation', 'Avoid overhead watering'],
        timing: 'Weekly monitoring'
      });
    }

    if (weather.current.temperature > 30) {
      baseAdvice.push({
        title: 'Provide Shade Protection',
        description: 'High temperatures can stress plants. Provide afternoon shade.',
        priority: 'high',
        category: 'maintenance',
        completed: false,
        season,
        actionItems: ['Install shade cloth', 'Water more frequently', 'Mulch around plants'],
        timing: 'During heat waves'
      });
    }

    return baseAdvice.map((item, index) => ({
      ...item,
      id: `fallback_${index + 1}`
    }));
  };

  const generateAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAdvice = await generateSeasonalAdvice();
      setAdvice(newAdvice);
      setLastUpdated(Date.now());
      console.log('✅ Generated', newAdvice.length, 'seasonal advice items');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate seasonal advice';
      setError(errorMessage);
      console.error('❌ Failed to generate seasonal advice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generateSeasonalAdvice]);

  // Initialize and generate advice on mount
  useEffect(() => {
    if (weatherData && currentLocation && !locationLoading && advice.length === 0) {
      console.log('Auto-generating seasonal advice for:', currentLocation.city || 'current location');
      generateAdvice();
    }
  }, [weatherData, currentLocation, locationLoading, advice.length, generateAdvice]);

  const refreshAdvice = useCallback(async () => {
    await generateAdvice();
  }, [generateAdvice]);

  const markCompleted = useCallback((adviceId: string) => {
    setAdvice(prev => prev.map(item => 
      item.id === adviceId ? { ...item, completed: true } : item
    ));
  }, []);

  const clearAdvice = useCallback(() => {
    setAdvice([]);
    setLastUpdated(null);
    setError(null);
  }, []);

  return {
    advice,
    isLoading,
    error,
    lastUpdated,
    currentSeason,
    generateAdvice,
    refreshAdvice,
    markCompleted,
    clearAdvice,
  };
};
