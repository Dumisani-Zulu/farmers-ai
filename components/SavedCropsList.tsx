import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Sprout, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Trash2,
  Edit3,
  Package
} from 'lucide-react-native';
import { SavedCrop } from '@/hooks/useSavedCrops';

interface SavedCropCardProps {
  crop: SavedCrop;
  onPress?: () => void;
  onUpdateStatus?: (cropId: string, status: SavedCrop['status']) => void;
  onDelete?: (cropId: string) => void;
}

const SavedCropCard = ({ crop, onPress, onUpdateStatus, onDelete }: SavedCropCardProps) => {
  const getStatusColor = (status: SavedCrop['status']) => {
    switch (status) {
      case 'planning': return '#6b7280';
      case 'planted': return '#10b981';
      case 'growing': return '#3b82f6';
      case 'harvested': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: SavedCrop['status']) => {
    const iconProps = { size: 16, color: getStatusColor(status) };
    switch (status) {
      case 'planning': return <Edit3 {...iconProps} />;
      case 'planted': return <Sprout {...iconProps} />;
      case 'growing': return <Sprout {...iconProps} />;
      case 'harvested': return <Package {...iconProps} />;
      default: return <Edit3 {...iconProps} />;
    }
  };

  const getStatusLabel = (status: SavedCrop['status']) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'planted': return 'Planted';
      case 'growing': return 'Growing';
      case 'harvested': return 'Harvested';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{crop.name}</Text>
          <Text className="text-sm text-gray-600">{crop.variety}</Text>
        </View>
        <View className="flex-row items-center">
          <View 
            className="px-3 py-1 rounded-full mr-2 flex-row items-center"
            style={{ backgroundColor: `${getStatusColor(crop.status)}20` }}
          >
            {getStatusIcon(crop.status)}
            <Text 
              className="text-xs font-medium ml-1 capitalize"
              style={{ color: getStatusColor(crop.status) }}
            >
              {getStatusLabel(crop.status)}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => onDelete?.(crop.id)}
            className="p-1"
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">Added</Text>
          </View>
          <Text className="text-sm font-medium">{formatDate(crop.dateAdded)}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <TrendingUp size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">Suitability</Text>
          </View>
          <Text className="text-sm font-medium">{crop.suitabilityScore}%</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Sprout size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">Planting Window</Text>
          </View>
          <Text className="text-sm font-medium text-green-600">{crop.plantingWindow}</Text>
        </View>
        <View className="flex-row space-x-2">
          {crop.status === 'planning' && (
            <TouchableOpacity 
              className="bg-green-600 px-3 py-1 rounded-lg"
              onPress={() => onUpdateStatus?.(crop.id, 'planted')}
            >
              <Text className="text-white text-xs font-medium">Mark Planted</Text>
            </TouchableOpacity>
          )}
          {crop.status === 'planted' && (
            <TouchableOpacity 
              className="bg-blue-600 px-3 py-1 rounded-lg"
              onPress={() => onUpdateStatus?.(crop.id, 'growing')}
            >
              <Text className="text-white text-xs font-medium">Mark Growing</Text>
            </TouchableOpacity>
          )}
          {crop.status === 'growing' && (
            <TouchableOpacity 
              className="bg-orange-600 px-3 py-1 rounded-lg"
              onPress={() => onUpdateStatus?.(crop.id, 'harvested')}
            >
              <Text className="text-white text-xs font-medium">Mark Harvested</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface SavedCropsListProps {
  savedCrops: SavedCrop[];
  isLoading: boolean;
  error: string | null;
  onCropPress?: (crop: SavedCrop) => void;
  onUpdateStatus?: (cropId: string, status: SavedCrop['status']) => void;
  onDeleteCrop?: (cropId: string) => void;
}

export const SavedCropsList = ({ 
  savedCrops, 
  isLoading, 
  error, 
  onCropPress, 
  onUpdateStatus, 
  onDeleteCrop 
}: SavedCropsListProps) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500 text-sm">Loading saved crops...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <AlertTriangle size={48} color="#ef4444" />
        <Text className="text-red-600 text-sm mt-2 text-center">{error}</Text>
      </View>
    );
  }

  if (savedCrops.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Sprout size={48} color="#d1d5db" />
        <Text className="text-gray-500 text-lg font-semibold mt-4">No Saved Crops</Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Browse recommendations and save crops to track them here
        </Text>
      </View>
    );
  }

  // Group crops by status
  const groupedCrops = savedCrops.reduce((acc, crop) => {
    if (!acc[crop.status]) {
      acc[crop.status] = [];
    }
    acc[crop.status].push(crop);
    return acc;
  }, {} as Record<SavedCrop['status'], SavedCrop[]>);

  const statusOrder: SavedCrop['status'][] = ['planning', 'planted', 'growing', 'harvested'];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {statusOrder.map(status => {
        const crops = groupedCrops[status];
        if (!crops || crops.length === 0) return null;

        return (
          <View key={status} className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-sm font-semibold text-gray-700 capitalize">
                {status} ({crops.length})
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>
            
            {crops.map((crop) => (
              <SavedCropCard
                key={crop.id}
                crop={crop}
                onPress={() => onCropPress?.(crop)}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDeleteCrop}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
};
