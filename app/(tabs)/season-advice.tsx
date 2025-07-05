import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useForum } from '@/hooks/useForum';
import { ForumPostCard } from '@/components/ForumPostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { id: 'all', label: 'All', color: '#6b7280' },
  { id: 'general', label: 'General', color: '#6b7280' },
  { id: 'crops', label: 'Crops', color: '#10b981' },
  { id: 'weather', label: 'Weather', color: '#3b82f6' },
  { id: 'pests', label: 'Pests', color: '#ef4444' },
  { id: 'soil', label: 'Soil', color: '#8b5cf6' },
  { id: 'irrigation', label: 'Water', color: '#06b6d4' },
  { id: 'equipment', label: 'Equipment', color: '#f59e0b' },
  { id: 'markets', label: 'Markets', color: '#84cc16' },
];

export default function ForumScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    posts,
    isLoading,
    error,
    createPost,
    likePost,
    unlikePost,
    loadPosts,
    searchPosts
  } = useForum();

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  const displayPosts = isSearching ? searchResults : filteredPosts;

  const onRefresh = useCallback(async () => {
    try {
      await loadPosts(selectedCategory === 'all' ? undefined : selectedCategory);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    }
  }, [loadPosts, selectedCategory]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchPosts(query.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchPosts]);

  const handleCreatePost = useCallback(async (postData: any) => {
    console.log('Forum Screen - User before create:', user);
    console.log('Forum Screen - Is authenticated:', isAuthenticated);
    
    if (!isAuthenticated || !user) {
      Alert.alert('Authentication Required', 'Please sign in to create a post.');
      return;
    }
    
    try {
      await createPost(postData);
      onRefresh();
    } catch (error) {
      console.error('Forum Screen - Create post error:', error);
      throw error;
    }
  }, [createPost, onRefresh, user, isAuthenticated]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    if (!isSearching) {
      loadPosts(category === 'all' ? undefined : category);
    }
  }, [loadPosts, isSearching]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Community Forum</Text>
            <Text className="text-sm text-gray-600 mt-1 max-w-sm">
              Share knowledge and get help from fellow farmers
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              if (!isAuthenticated) {
                Alert.alert('Authentication Required', 'Please sign in to create a post.');
                return;
              }
              setShowCreatePost(true);
            }}
            className={`px-4 py-2 rounded-lg flex-row items-center ${
              isAuthenticated ? 'bg-green-600' : 'bg-gray-400'
            }`}
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-medium ml-1">Post</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={16} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search posts, topics, or tags..."
            className="flex-1 ml-2 text-gray-900"
            placeholderTextColor="#6b7280"
          />
        </View>
      </View>

      {/* Category Filter */}
      <View className="bg-white border-b border-gray-200 py-3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full mr-3 border ${
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
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh}
            colors={['#16a34a']}
          />
        }
      >
        {/* Loading State */}
        {isLoading && !posts.length && (
          <View className="bg-white rounded-xl p-6 mb-4 items-center">
            <MessageSquare size={24} color="#16a34a" className="mb-2" />
            <Text className="text-gray-600">Loading forum posts...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 font-semibold mb-2">Error Loading Posts</Text>
            <Text className="text-red-700 text-sm mb-3">{error}</Text>
            <TouchableOpacity 
              onPress={onRefresh}
              className="bg-red-600 px-3 py-2 rounded-lg self-start"
            >
              <Text className="text-white text-sm font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results Header */}
        {isSearching && (
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </Text>
            <Text className="text-sm text-gray-600">
              {searchResults.length} post{searchResults.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {/* Posts List */}
        {displayPosts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onPress={() => {
              router.push(`/post-detail?postId=${post.id}`);
            }}
            onLike={() => likePost(post.id)}
            onUnlike={() => unlikePost(post.id)}
            showActions={true}
          />
        ))}

        {/* Empty State */}
        {displayPosts.length === 0 && !isLoading && (
          <View className="bg-white rounded-xl p-8 items-center">
            <MessageSquare size={48} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 mt-4">
              {isSearching ? 'No Results Found' : 'No Posts Yet'}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-2">
              {isSearching 
                ? 'Try adjusting your search terms'
                : 'Be the first to start a discussion in this category'
              }
            </Text>
            {!isSearching && (
              <TouchableOpacity
                onPress={() => setShowCreatePost(true)}
                className="bg-green-600 px-4 py-2 rounded-lg mt-4"
              >
                <Text className="text-white font-medium">Create First Post</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}
