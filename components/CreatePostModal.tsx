import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal 
} from 'react-native';
import { X, Plus, Tag } from 'lucide-react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

const categories = [
  { id: 'general', label: 'General Discussion', color: '#6b7280' },
  { id: 'crops', label: 'Crops & Planting', color: '#10b981' },
  { id: 'weather', label: 'Weather & Climate', color: '#3b82f6' },
  { id: 'pests', label: 'Pest Control', color: '#ef4444' },
  { id: 'soil', label: 'Soil & Fertilizer', color: '#8b5cf6' },
  { id: 'irrigation', label: 'Water & Irrigation', color: '#06b6d4' },
  { id: 'equipment', label: 'Tools & Equipment', color: '#f59e0b' },
  { id: 'markets', label: 'Markets & Sales', color: '#84cc16' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory('general');
    setTagInput('');
    setTags([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        tags
      });
      handleClose();
    } catch (error) {
      console.error('Error in CreatePostModal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleClose} className="p-2">
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">New Post</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !title.trim() || !content.trim()}
              className={`px-4 py-2 rounded-lg ${
                isLoading || !title.trim() || !content.trim()
                  ? 'bg-gray-300' 
                  : 'bg-green-600'
              }`}
            >
              <Text className={`font-medium ${
                isLoading || !title.trim() || !content.trim()
                  ? 'text-gray-500' 
                  : 'text-white'
              }`}>
                {isLoading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Title Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What's your question or topic?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              multiline={false}
              maxLength={100}
            />
            <Text className="text-xs text-gray-500 mt-1">{title.length}/100</Text>
          </View>

          {/* Category Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full mr-2 border ${
                      selectedCategory === category.id
                        ? 'border-transparent'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id
                        ? `${category.color}20`
                        : undefined
                    }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedCategory === category.id
                          ? 'text-gray-900'
                          : 'text-gray-600'
                      }`}
                      style={{
                        color: selectedCategory === category.id
                          ? category.color
                          : undefined
                      }}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Content Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Provide details about your question or share your knowledge..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text className="text-xs text-gray-500 mt-1">{content.length}/1000</Text>
          </View>

          {/* Tags Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Tags (Optional)</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 mr-2"
                onSubmitEditing={addTag}
                maxLength={20}
              />
              <TouchableOpacity
                onPress={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className={`p-2 rounded-lg ${
                  !tagInput.trim() || tags.length >= 5
                    ? 'bg-gray-300'
                    : 'bg-green-600'
                }`}
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View className="flex-row flex-wrap">
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => removeTag(index)}
                    className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                  >
                    <Tag size={12} color="#6b7280" />
                    <Text className="text-sm text-gray-700 ml-1">{tag}</Text>
                    <X size={14} color="#6b7280" className="ml-1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Text className="text-xs text-gray-500 mt-1">
              {tags.length}/5 tags • Help others find your post
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
