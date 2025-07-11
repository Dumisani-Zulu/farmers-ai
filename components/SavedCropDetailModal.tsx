import * as React from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { 
  X,
  Calendar, 
  TrendingUp,
  AlertTriangle,
  Edit3,
  Trash2,
  Save
} from 'lucide-react-native';
import { SavedCrop } from '@/hooks/useSavedCrops';

interface SavedCropDetailModalProps {
  crop: SavedCrop | null;
  isVisible: boolean;
  onClose: () => void;
  onUpdateStatus?: (cropId: string, status: SavedCrop['status'], additionalData?: Partial<SavedCrop>) => void;
  onDeleteCrop?: (cropId: string) => void;
}

export const SavedCropDetailModal = ({ 
  crop, 
  isVisible, 
  onClose, 
  onUpdateStatus,
  onDeleteCrop 
}: SavedCropDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(crop?.notes || '');

  if (!crop) return null;

  const getStatusColor = (status: SavedCrop['status']) => {
    switch (status) {
      case 'planning': return '#6b7280';
      case 'planted': return '#10b981';
      case 'growing': return '#3b82f6';
      case 'harvested': return '#f59e0b';
      default: return '#6b7280';
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

  const handleSave = () => {
    if (onUpdateStatus) {
      onUpdateStatus(crop.id, crop.status, {
        notes,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${crop.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDeleteCrop?.(crop.id);
            onClose();
          }
        }
      ]
    );
  };

  const handleStatusChange = (newStatus: SavedCrop['status']) => {
    const additionalData: Partial<SavedCrop> = {};
    
    if (newStatus === 'planted' && !crop.plantedDate) {
      additionalData.plantedDate = new Date().toISOString();
    } else if (newStatus === 'harvested' && !crop.harvestDate) {
      additionalData.harvestDate = new Date().toISOString();
    }

    onUpdateStatus?.(crop.id, newStatus, additionalData);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Crop Details</Text>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              className="mr-3 p-2"
            >
              <Edit3 size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Crop Info */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">{crop.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">{crop.variety}</Text>
              </View>
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${getStatusColor(crop.status)}20` }}
              >
                <Text 
                  className="text-xs font-medium capitalize"
                  style={{ color: getStatusColor(crop.status) }}
                >
                  {getStatusLabel(crop.status)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Suitability Score: {crop.suitabilityScore}%
              </Text>
            </View>

            <View className="flex-row items-center">
              <Calendar size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Added: {formatDate(crop.dateAdded)}
              </Text>
            </View>
          </View>

          {/* Status Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {crop.status === 'planning' && (
                <TouchableOpacity 
                  className="bg-green-600 px-4 py-2 rounded-lg"
                  onPress={() => handleStatusChange('planted')}
                >
                  <Text className="text-white font-medium">Mark as Planted</Text>
                </TouchableOpacity>
              )}
              {crop.status === 'planted' && (
                <TouchableOpacity 
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                  onPress={() => handleStatusChange('growing')}
                >
                  <Text className="text-white font-medium">Mark as Growing</Text>
                </TouchableOpacity>
              )}
              {crop.status === 'growing' && (
                <TouchableOpacity 
                  className="bg-orange-600 px-4 py-2 rounded-lg"
                  onPress={() => handleStatusChange('harvested')}
                >
                  <Text className="text-white font-medium">Mark as Harvested</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Dates */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Important Dates</Text>
            <View className="bg-white rounded-xl p-4 border border-gray-200">
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Planting Window</Text>
                <Text className="text-base text-gray-900 mt-1">{crop.plantingWindow}</Text>
              </View>
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Expected Harvest</Text>
                <Text className="text-base text-gray-900 mt-1">{crop.expectedHarvest}</Text>
              </View>
              {crop.plantedDate && (
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700">Planted Date</Text>
                  <Text className="text-base text-gray-900 mt-1">{formatDate(crop.plantedDate)}</Text>
                </View>
              )}
              {crop.harvestDate && (
                <View>
                  <Text className="text-sm font-medium text-gray-700">Harvest Date</Text>
                  <Text className="text-base text-gray-900 mt-1">{formatDate(crop.harvestDate)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Notes</Text>
            {isEditing ? (
              <TextInput
                className="bg-white rounded-xl p-4 border border-gray-200 min-h-[100px]"
                placeholder="Add notes about this crop..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <View className="bg-white rounded-xl p-4 border border-gray-200 min-h-[100px]">
                <Text className="text-gray-900">
                  {crop.notes || 'No notes added yet. Tap edit to add notes.'}
                </Text>
              </View>
            )}
          </View>

          {/* Original Recommendations */}
          {crop.reasons && crop.reasons.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Why This Crop?</Text>
              <View className="bg-green-50 rounded-xl p-4">
                {crop.reasons.map((reason, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-green-600 mr-2">•</Text>
                    <Text className="text-green-700 flex-1">{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Planting Tips */}
          {crop.plantingTips && crop.plantingTips.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Planting Tips</Text>
              <View className="bg-blue-50 rounded-xl p-4">
                {crop.plantingTips.map((tip, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-blue-600 mr-2">•</Text>
                    <Text className="text-blue-700 flex-1">{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Warnings */}
          {crop.warnings && crop.warnings.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Warnings</Text>
              <View className="bg-red-50 rounded-xl p-4">
                {crop.warnings.map((warning, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <AlertTriangle size={16} color="#ef4444" className="mr-2 mt-0.5" />
                    <Text className="text-red-700 flex-1">{warning}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-20" />
        </ScrollView>

        {/* Save Button (only when editing) */}
        {isEditing && (
          <View className="bg-white px-4 py-4 border-t border-gray-200">
            <TouchableOpacity 
              className="bg-blue-600 rounded-xl py-4 px-6 flex-row items-center justify-center"
              onPress={handleSave}
            >
              <Save size={20} color="white" />
              <Text className="text-white text-center font-semibold text-base ml-2">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default SavedCropDetailModal;
