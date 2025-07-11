/**
 * Weather Analysis UI Component
 * 
 * This component provides the user interface for weather-based farming recommendations,
 * including irrigation scheduling and activity timing.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { weatherAnalysisAI, WeatherAnalysisRequest, WeatherAnalysisResponse } from '../ai/tools/weather-analysis';

interface WeatherAnalysisProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onAnalysisComplete?: (result: WeatherAnalysisResponse) => void;
}

export const WeatherAnalysisTool: React.FC<WeatherAnalysisProps> = ({ 
  userLocation, 
  onAnalysisComplete 
}) => {
  const [formData, setFormData] = useState<Partial<WeatherAnalysisRequest>>({
    location: userLocation || { latitude: 0, longitude: 0 },
    cropType: '',
    farmingActivity: 'general',
    timeRange: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WeatherAnalysisResponse | null>(null);

  const handleInputChange = (field: keyof WeatherAnalysisRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const analyzeWeather = async () => {
    if (!formData.cropType) {
      Alert.alert('Error', 'Please specify the crop type');
      return;
    }

    setLoading(true);
    try {
      const request = formData as WeatherAnalysisRequest;
      const result = await weatherAnalysisAI.analyzeWeatherPattern(request);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze weather patterns. Please try again.');
      console.error('Weather analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Weather Analysis Settings
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Crop Type *
        </Text>
        <View className="border border-gray-300 rounded-lg">
          <Picker
            selectedValue={formData.cropType}
            onValueChange={(value: string) => handleInputChange('cropType', value)}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select crop type..." value="" />
            <Picker.Item label="Maize" value="maize" />
            <Picker.Item label="Wheat" value="wheat" />
            <Picker.Item label="Rice" value="rice" />
            <Picker.Item label="Beans" value="beans" />
            <Picker.Item label="Tomatoes" value="tomatoes" />
            <Picker.Item label="Vegetables" value="vegetables" />
            <Picker.Item label="Fruits" value="fruits" />
          </Picker>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Farming Activity
        </Text>
        <View className="border border-gray-300 rounded-lg">
          <Picker
            selectedValue={formData.farmingActivity}
            onValueChange={(value: string) => handleInputChange('farmingActivity', value)}
            style={{ height: 50 }}
          >
            <Picker.Item label="General farming" value="general" />
            <Picker.Item label="Planting" value="planting" />
            <Picker.Item label="Irrigation" value="irrigation" />
            <Picker.Item label="Harvesting" value="harvesting" />
            <Picker.Item label="Spraying" value="spraying" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={analyzeWeather}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Analyzing...' : 'Analyze Weather'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <ScrollView className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Weather Analysis Results
        </Text>
        
        {/* Weather Patterns */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Weather Patterns
          </Text>
          <View className="bg-blue-50 rounded-lg p-3 mb-2">
            <Text className="text-sm text-blue-700">
              Temperature Trend: {analysis.analysis.patterns.temperatureTrend}
            </Text>
            <Text className="text-sm text-blue-700">
              Precipitation: {analysis.analysis.patterns.precipitationPattern}
            </Text>
          </View>
          
          {analysis.analysis.patterns.extremeEvents.length > 0 && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Extreme Weather Alerts
              </Text>
              {analysis.analysis.patterns.extremeEvents.map((event, index) => (
                <View key={index} className={`rounded-lg p-3 mb-2 ${
                  event.severity === 'high' ? 'bg-red-50' :
                  event.severity === 'medium' ? 'bg-orange-50' : 'bg-yellow-50'
                }`}>
                  <Text className={`font-semibold ${
                    event.severity === 'high' ? 'text-red-800' :
                    event.severity === 'medium' ? 'text-orange-800' : 'text-yellow-800'
                  }`}>
                    {event.type.toUpperCase()}
                  </Text>
                  <Text className={`text-sm ${
                    event.severity === 'high' ? 'text-red-700' :
                    event.severity === 'medium' ? 'text-orange-700' : 'text-yellow-700'
                  }`}>
                    Probability: {Math.round(event.probability * 100)}%
                  </Text>
                  {event.expectedDate && (
                    <Text className={`text-sm ${
                      event.severity === 'high' ? 'text-red-600' :
                      event.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      Expected: {event.expectedDate.toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Risk Assessment */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Risk Assessment
          </Text>
          <View className="grid grid-cols-2 gap-2">
            <View className="bg-red-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-red-800">Crop Stress</Text>
              <Text className="text-lg font-bold text-red-700">
                {Math.round(analysis.analysis.risks.cropStress * 100)}%
              </Text>
            </View>
            <View className="bg-orange-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-orange-800">Disease Risk</Text>
              <Text className="text-lg font-bold text-orange-700">
                {Math.round(analysis.analysis.risks.diseaseRisk * 100)}%
              </Text>
            </View>
            <View className="bg-yellow-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-yellow-800">Pest Risk</Text>
              <Text className="text-lg font-bold text-yellow-700">
                {Math.round(analysis.analysis.risks.pestRisk * 100)}%
              </Text>
            </View>
            <View className="bg-purple-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-purple-800">Yield Impact</Text>
              <Text className="text-lg font-bold text-purple-700">
                {Math.round(analysis.analysis.risks.yieldImpact * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Irrigation Schedule */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Irrigation Schedule
          </Text>
          {analysis.recommendations.irrigationSchedule.slice(0, 5).map((irrigation, index) => (
            <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-semibold text-blue-800">
                  {irrigation.date.toLocaleDateString()}
                </Text>
                <View className={`px-2 py-1 rounded ${
                  irrigation.priority === 'high' ? 'bg-red-200' :
                  irrigation.priority === 'medium' ? 'bg-yellow-200' : 'bg-green-200'
                }`}>
                  <Text className={`text-xs font-medium ${
                    irrigation.priority === 'high' ? 'text-red-700' :
                    irrigation.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {irrigation.priority}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-blue-700">
                Duration: {irrigation.duration} minutes
              </Text>
              <Text className="text-sm text-blue-700">
                Amount: {irrigation.amount}mm
              </Text>
              <Text className="text-sm text-blue-600">
                {irrigation.reason}
              </Text>
            </View>
          ))}
        </View>

        {/* Activity Timing */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Optimal Activity Windows
          </Text>
          {analysis.recommendations.activityTiming.optimalWindows.slice(0, 3).map((window, index) => (
            <View key={index} className="bg-green-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-green-800">
                {window.start.toLocaleDateString()} - {window.end.toLocaleDateString()}
              </Text>
              <Text className="text-sm text-green-700">
                Conditions: {window.conditions}
              </Text>
            </View>
          ))}
          
          {analysis.recommendations.activityTiming.avoidPeriods.length > 0 && (
            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Periods to Avoid
              </Text>
              {analysis.recommendations.activityTiming.avoidPeriods.slice(0, 3).map((avoid, index) => (
                <View key={index} className="bg-red-50 rounded-lg p-3 mb-2">
                  <Text className="font-semibold text-red-800">
                    {avoid.start.toLocaleDateString()} - {avoid.end.toLocaleDateString()}
                  </Text>
                  <Text className="text-sm text-red-700">
                    Reason: {avoid.reason}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Protective Measures */}
        {analysis.recommendations.protectiveMeasures.length > 0 && (
          <View className="mb-6">
            <Text className="text-md font-medium text-gray-700 mb-3">
              Protective Measures
            </Text>
            {analysis.recommendations.protectiveMeasures.map((measure, index) => (
              <View key={index} className="bg-orange-50 rounded-lg p-3 mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-orange-800">{measure.measure}</Text>
                    <Text className="text-sm text-orange-700">
                      By: {measure.timing.toLocaleDateString()}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${
                    measure.urgency === 'immediate' ? 'bg-red-200' :
                    measure.urgency === 'within_24h' ? 'bg-orange-200' : 'bg-yellow-200'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      measure.urgency === 'immediate' ? 'text-red-700' :
                      measure.urgency === 'within_24h' ? 'text-orange-700' : 'text-yellow-700'
                    }`}>
                      {measure.urgency.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 7-Day Forecast */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            7-Day Forecast
          </Text>
          {analysis.forecast.shortTerm.daily.slice(0, 7).map((day, index) => (
            <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text className="text-sm text-gray-600">{day.conditions}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-gray-800">
                    {Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°
                  </Text>
                  <Text className="text-sm text-blue-600">
                    {day.precipitation}mm rain
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {day.humidity}% humidity
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Weather Analysis
        </Text>
        <Text className="text-gray-600">
          Get AI-powered weather insights and farming recommendations.
        </Text>
      </View>

      {renderFormSection()}
      {renderAnalysisResults()}
    </ScrollView>
  );
};
