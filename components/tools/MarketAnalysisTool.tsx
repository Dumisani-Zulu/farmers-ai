/**
 * Market Analysis UI Component
 * 
 * This component provides the user interface for market analysis and pricing insights,
 * helping farmers make informed decisions about when and where to sell their crops.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { marketAnalysisAI, MarketAnalysisRequest, MarketAnalysisResponse } from '../../ai/tools/market-analysis';

interface MarketAnalysisProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    region: string;
  };
  onAnalysisComplete?: (result: MarketAnalysisResponse) => void;
}

export const MarketAnalysisTool: React.FC<MarketAnalysisProps> = ({ 
  userLocation, 
  onAnalysisComplete 
}) => {
  const [formData, setFormData] = useState<Partial<MarketAnalysisRequest>>({
    location: userLocation || { latitude: 0, longitude: 0, region: '' },
    cropType: '',
    quantity: 0,
    quality: 'standard',
    harvestDate: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysisResponse | null>(null);

  const handleInputChange = (field: keyof MarketAnalysisRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const analyzeMarket = async () => {
    if (!formData.cropType || !formData.quantity) {
      Alert.alert('Error', 'Please fill in crop type and quantity');
      return;
    }

    setLoading(true);
    try {
      const request = formData as MarketAnalysisRequest;
      const result = await marketAnalysisAI.analyzeMarket(request);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze market. Please try again.');
      console.error('Market analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Market Analysis Input
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Crop Type *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Maize, Wheat, Coffee"
          value={formData.cropType || ''}
          onChangeText={(text) => handleInputChange('cropType', text)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Quantity (tons) *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter quantity in tons"
          value={formData.quantity?.toString() || ''}
          onChangeText={(text) => handleInputChange('quantity', parseFloat(text) || 0)}
          keyboardType="numeric"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Quality Grade
        </Text>
        <View className="flex-row space-x-2">
          {(['premium', 'standard', 'below_standard'] as const).map((quality) => (
            <TouchableOpacity
              key={quality}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                formData.quality === quality 
                  ? 'bg-green-100 border-green-500' 
                  : 'bg-gray-50 border-gray-300'
              }`}
              onPress={() => handleInputChange('quality', quality)}
            >
              <Text className={`text-center text-sm ${
                formData.quality === quality ? 'text-green-700 font-medium' : 'text-gray-600'
              }`}>
                {quality.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Region
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Central Region, Nairobi"
          value={formData.location?.region || ''}
          onChangeText={(text) => handleInputChange('location', { 
            ...formData.location!, 
            region: text 
          })}
        />
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-green-600'}`}
        onPress={analyzeMarket}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Analyzing Market...' : 'Analyze Market'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <ScrollView className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Market Analysis Results
        </Text>
        
        {/* Current Price Analysis */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Current Market Price
          </Text>
          <View className="bg-green-50 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-2xl font-bold text-green-800">
                {analysis.priceAnalysis.currency} {analysis.priceAnalysis.currentPrice.toLocaleString()}
              </Text>
              <View className={`px-3 py-1 rounded-full ${
                analysis.priceAnalysis.trend === 'rising' ? 'bg-green-200' :
                analysis.priceAnalysis.trend === 'falling' ? 'bg-red-200' : 'bg-gray-200'
              }`}>
                <Text className={`text-sm font-medium ${
                  analysis.priceAnalysis.trend === 'rising' ? 'text-green-700' :
                  analysis.priceAnalysis.trend === 'falling' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {analysis.priceAnalysis.trend}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-green-700">
              Range: {analysis.priceAnalysis.currency} {analysis.priceAnalysis.priceRange.min} - {analysis.priceAnalysis.priceRange.max}
            </Text>
          </View>
        </View>

        {/* Market Factors */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Price Influencing Factors
          </Text>
          {analysis.priceAnalysis.factors.map((factor, index) => (
            <View key={index} className={`rounded-lg p-3 mb-2 ${
              factor.impact === 'positive' ? 'bg-green-50' :
              factor.impact === 'negative' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <View className="flex-row justify-between items-center">
                <Text className={`font-medium ${
                  factor.impact === 'positive' ? 'text-green-800' :
                  factor.impact === 'negative' ? 'text-red-800' : 'text-gray-800'
                }`}>
                  {factor.factor}
                </Text>
                <View className="flex-row items-center">
                  <Text className={`text-sm ${
                    factor.impact === 'positive' ? 'text-green-600' :
                    factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                  </Text>
                  <Text className="text-sm text-gray-600 ml-1">
                    {Math.round(factor.magnitude * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Selling Recommendations */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Optimal Selling Strategy
          </Text>
          
          {/* Timing */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Best Selling Times
            </Text>
            {analysis.recommendations.selling.optimalTiming.slice(0, 3).map((timing, index) => (
              <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-blue-800">
                    {timing.date.toLocaleDateString()}
                  </Text>
                  <Text className="text-blue-700 font-medium">
                    {analysis.priceAnalysis.currency} {timing.expectedPrice.toLocaleString()}
                  </Text>
                </View>
                <Text className="text-sm text-blue-700">
                  Confidence: {Math.round(timing.confidence * 100)}%
                </Text>
                <Text className="text-sm text-blue-600">
                  {timing.reasoning}
                </Text>
              </View>
            ))}
          </View>

          {/* Market Channels */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Market Channels
            </Text>
            {analysis.recommendations.selling.marketChannels.map((channel, index) => (
              <View key={index} className="bg-yellow-50 rounded-lg p-3 mb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-yellow-800 capitalize">
                    {channel.channel.replace('_', ' ')}
                  </Text>
                  <Text className="text-yellow-700 font-medium">
                    {Math.round(channel.profitMargin * 100)}% margin
                  </Text>
                </View>
                <Text className="text-sm text-yellow-700">
                  Price: {analysis.priceAnalysis.currency} {channel.price.toLocaleString()}/ton
                </Text>
                <Text className="text-sm text-yellow-700">
                  Max Volume: {channel.volume} tons
                </Text>
                {channel.requirements.length > 0 && (
                  <Text className="text-sm text-yellow-600">
                    Requirements: {channel.requirements.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Storage Recommendation */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Storage Strategy
          </Text>
          <View className={`rounded-lg p-4 ${
            analysis.recommendations.storage.recommended ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Text className={`font-semibold mb-2 ${
              analysis.recommendations.storage.recommended ? 'text-green-800' : 'text-red-800'
            }`}>
              {analysis.recommendations.storage.recommended ? 'Storage Recommended' : 'Sell Immediately'}
            </Text>
            {analysis.recommendations.storage.recommended && (
              <>
                <Text className="text-sm text-green-700">
                  Duration: {analysis.recommendations.storage.duration} months
                </Text>
                <Text className="text-sm text-green-700">
                  Expected Price Increase: {Math.round(analysis.recommendations.storage.expectedPriceIncrease * 100)}%
                </Text>
                <Text className="text-sm text-green-700">
                  Storage Costs: {analysis.priceAnalysis.currency} {analysis.recommendations.storage.storageCosts.toLocaleString()}
                </Text>
                <Text className="text-sm text-green-600 font-medium">
                  Net Benefit: {analysis.priceAnalysis.currency} {analysis.recommendations.storage.netBenefit.toLocaleString()}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Value Addition Options */}
        {analysis.recommendations.valueAddition.length > 0 && (
          <View className="mb-6">
            <Text className="text-md font-medium text-gray-700 mb-3">
              Value Addition Opportunities
            </Text>
            {analysis.recommendations.valueAddition.map((option, index) => (
              <View key={index} className="bg-purple-50 rounded-lg p-3 mb-2">
                <Text className="font-semibold text-purple-800">{option.process}</Text>
                <Text className="text-sm text-purple-700">
                  Investment: {analysis.priceAnalysis.currency} {option.investmentRequired.toLocaleString()}
                </Text>
                <Text className="text-sm text-purple-700">
                  Price Increase: {Math.round(option.expectedPriceIncrease * 100)}%
                </Text>
                <Text className="text-sm text-purple-700">
                  Time to Market: {option.timeToMarket} months
                </Text>
                <Text className="text-sm text-purple-600">
                  Market Demand: {option.marketDemand}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Profitability Analysis */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Profitability Scenarios
          </Text>
          {analysis.profitability.scenarios.map((scenario, index) => (
            <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-800">{scenario.scenario}</Text>
                <View className={`px-2 py-1 rounded ${
                  scenario.riskLevel === 'low' ? 'bg-green-200' :
                  scenario.riskLevel === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                }`}>
                  <Text className={`text-xs font-medium ${
                    scenario.riskLevel === 'low' ? 'text-green-700' :
                    scenario.riskLevel === 'medium' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {scenario.riskLevel} risk
                  </Text>
                </View>
              </View>
              <View className="grid grid-cols-2 gap-2">
                <Text className="text-sm text-gray-600">
                  Revenue: {analysis.priceAnalysis.currency} {scenario.revenue.toLocaleString()}
                </Text>
                <Text className="text-sm text-gray-600">
                  Costs: {analysis.priceAnalysis.currency} {scenario.costs.toLocaleString()}
                </Text>
                <Text className="text-sm font-medium text-gray-700">
                  Profit: {analysis.priceAnalysis.currency} {scenario.profit.toLocaleString()}
                </Text>
                <Text className="text-sm font-medium text-gray-700">
                  Margin: {Math.round(scenario.profitMargin * 100)}%
                </Text>
              </View>
            </View>
          ))}
          
          <View className="bg-blue-50 rounded-lg p-3 mt-3">
            <Text className="font-medium text-blue-800 mb-1">Break-even Analysis</Text>
            <Text className="text-sm text-blue-700">
              Break-even Price: {analysis.priceAnalysis.currency} {analysis.profitability.breakEvenPrice.toLocaleString()}/ton
            </Text>
            {analysis.profitability.riskFactors.length > 0 && (
              <Text className="text-sm text-blue-600 mt-1">
                Risk Factors: {analysis.profitability.riskFactors.join(', ')}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Market Analysis
        </Text>
        <Text className="text-gray-600">
          Get AI-powered market insights and pricing recommendations.
        </Text>
      </View>

      {renderFormSection()}
      {renderAnalysisResults()}
    </ScrollView>
  );
};
