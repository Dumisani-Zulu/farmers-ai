/**
 * Weather Analysis Utilities
 * Functions to analyze weather data and determine crop suitability
 */

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  };
  forecast: {
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  }[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    timestamp: number;
    accuracy?: number;
  };
  lastUpdated: number;
}

export interface WeatherAnalysis {
  averageTemperature: number;
  temperatureRange: { min: number; max: number };
  totalRainfall: number;
  averageHumidity: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  climateZone: 'tropical' | 'subtropical' | 'temperate' | 'arid';
  growingSeason: boolean;
  weatherTrends: {
    temperature: 'increasing' | 'decreasing' | 'stable';
    rainfall: 'increasing' | 'decreasing' | 'stable';
    humidity: 'increasing' | 'decreasing' | 'stable';
  };
}

/**
 * Analyze weather data to extract relevant agricultural information
 */
export const analyzeWeatherData = (weatherData: WeatherData): WeatherAnalysis => {
  const { current, forecast } = weatherData;
  
  // Calculate averages from forecast data
  const temperatures = [current.temperature, ...forecast.map(f => (f.temperature.min + f.temperature.max) / 2)];
  const humidities = [current.humidity, ...forecast.map(f => f.humidity)];
  const rainfalls = [current.precipitation, ...forecast.map(f => f.precipitation)];
  
  const averageTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  const averageHumidity = humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length;
  const totalRainfall = rainfalls.reduce((sum, rain) => sum + rain, 0);
  
  const temperatureRange = {
    min: Math.min(...temperatures),
    max: Math.max(...temperatures),
  };

  // Determine season based on temperature and location
  const season = determineSeason(averageTemperature, new Date(), weatherData.location.latitude);
  
  // Determine climate zone
  const climateZone = determineClimateZone(averageTemperature, averageHumidity, totalRainfall);
  
  // Check if it's growing season
  const growingSeason = isGrowingSeason(averageTemperature, season);
  
  // Analyze trends (simplified - in real app, you'd need historical data)
  const weatherTrends = {
    temperature: analyzeTrend(temperatures) as 'increasing' | 'decreasing' | 'stable',
    rainfall: analyzeTrend(rainfalls) as 'increasing' | 'decreasing' | 'stable',
    humidity: analyzeTrend(humidities) as 'increasing' | 'decreasing' | 'stable',
  };

  return {
    averageTemperature,
    temperatureRange,
    totalRainfall,
    averageHumidity,
    season,
    climateZone,
    growingSeason,
    weatherTrends,
  };
};

/**
 * Determine the current season based on temperature and location
 */
const determineSeason = (temperature: number, date: Date, latitude: number): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = date.getMonth(); // 0-11
  const isNorthernHemisphere = latitude > 0;
  
  // Adjust months for southern hemisphere
  const adjustedMonth = isNorthernHemisphere ? month : (month + 6) % 12;
  
  if (adjustedMonth >= 2 && adjustedMonth <= 4) return 'spring';
  if (adjustedMonth >= 5 && adjustedMonth <= 7) return 'summer';
  if (adjustedMonth >= 8 && adjustedMonth <= 10) return 'autumn';
  return 'winter';
};

/**
 * Determine climate zone based on weather patterns
 */
const determineClimateZone = (temperature: number, humidity: number, rainfall: number): 'tropical' | 'subtropical' | 'temperate' | 'arid' => {
  if (rainfall < 200) return 'arid';
  if (temperature > 25 && humidity > 70) return 'tropical';
  if (temperature > 20 && temperature <= 25) return 'subtropical';
  return 'temperate';
};

/**
 * Check if current conditions support growing season
 */
const isGrowingSeason = (temperature: number, season: string): boolean => {
  // Growing season typically when temperature is above 10°C
  return temperature > 10 && (season === 'spring' || season === 'summer' || season === 'autumn');
};

/**
 * Analyze trend in a series of values
 */
const analyzeTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  const threshold = Math.abs(firstAvg) * 0.1; // 10% threshold
  
  if (difference > threshold) return 'increasing';
  if (difference < -threshold) return 'decreasing';
  return 'stable';
};

/**
 * Calculate suitability score for a crop based on weather conditions
 */
export const calculateWeatherSuitability = (
  weatherAnalysis: WeatherAnalysis,
  cropRequirements: {
    temperature: { min: number; max: number; optimal: { min: number; max: number } };
    rainfall: { min: number; max: number; optimal: { min: number; max: number } };
    humidity: { min: number; max: number; optimal: { min: number; max: number } };
  }
): { score: number; factors: { temperature: number; rainfall: number; humidity: number } } => {
  
  // Temperature suitability
  const tempScore = calculateRangeScore(
    weatherAnalysis.averageTemperature,
    cropRequirements.temperature.optimal,
    cropRequirements.temperature
  );
  
  // Rainfall suitability (use weekly average)
  const weeklyRainfall = weatherAnalysis.totalRainfall * 52 / 7; // Convert to annual estimate
  const rainfallScore = calculateRangeScore(
    weeklyRainfall,
    cropRequirements.rainfall.optimal,
    cropRequirements.rainfall
  );
  
  // Humidity suitability
  const humidityScore = calculateRangeScore(
    weatherAnalysis.averageHumidity,
    cropRequirements.humidity.optimal,
    cropRequirements.humidity
  );
  
  const overallScore = (tempScore + rainfallScore + humidityScore) / 3;
  
  return {
    score: Math.max(0, Math.min(100, overallScore)),
    factors: {
      temperature: tempScore,
      rainfall: rainfallScore,
      humidity: humidityScore,
    },
  };
};

/**
 * Calculate score based on how well a value fits within optimal and acceptable ranges
 */
const calculateRangeScore = (
  value: number,
  optimal: { min: number; max: number },
  acceptable: { min: number; max: number }
): number => {
  // Perfect score if within optimal range
  if (value >= optimal.min && value <= optimal.max) {
    return 100;
  }
  
  // Partial score if within acceptable range but outside optimal
  if (value >= acceptable.min && value <= acceptable.max) {
    const distanceFromOptimal = value < optimal.min 
      ? optimal.min - value 
      : value - optimal.max;
    
    const rangeWidth = value < optimal.min 
      ? optimal.min - acceptable.min 
      : acceptable.max - optimal.max;
    
    // Linear falloff from 100 to 50
    return Math.max(50, 100 - (distanceFromOptimal / rangeWidth) * 50);
  }
  
  // Low score if outside acceptable range
  return Math.max(0, 30 - Math.abs(value - (acceptable.min + acceptable.max) / 2));
};
