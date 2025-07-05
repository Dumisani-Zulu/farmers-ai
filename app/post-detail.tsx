import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, ThumbsUp, CheckCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForum, ForumPost } from '@/hooks/useForum';
import { ForumReplyCard } from '@/components/ForumReplyCard';
import { useAuth } from '@/contexts/AuthContext';

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    posts,
    replies,
    isLoading,
    error,
    likePost,
    unlikePost,
    likeReply,
    unlikeReply,
    createReply,
    loadReplies,
    markReplyAsAnswer
  } = useForum();

  // Find the post from the posts array
  useEffect(() => {
    if (postId && posts.length > 0) {
      const foundPost = posts.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
        loadReplies(postId);
      }
    }
  }, [postId, posts, loadReplies]);

  const handleSubmitReply = useCallback(async () => {
    if (!replyText.trim() || !postId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createReply(postId, replyText.trim());
      setReplyText('');
      // Reload replies
      await loadReplies(postId);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [replyText, postId, isSubmitting, createReply, loadReplies]);

  const onRefresh = useCallback(async () => {
    if (postId) {
      await loadReplies(postId);
    }
  }, [postId, loadReplies]);

  if (!post && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Post Not Found</Text>
          <Text className="text-gray-600 text-center mb-4">
            The post you are looking for does not exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPostAuthor = user && post ? post.author.uid === user.uid : false;
  const isLiked = user && post ? post.likedBy.includes(user.uid) : false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 mr-2"
          >
            <ArrowLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">Discussion</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh}
            colors={['#16a34a']}
          />
        }
      >
        {/* Post Content */}
        {post && (
          <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
            {/* Category */}
            <View className="flex-row items-center mb-3">
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: '#10b98120' }}
              >
                <Text className="text-sm font-medium text-green-600 capitalize">
                  {post.category}
                </Text>
              </View>
              {post.isResolved && (
                <View className="flex-row items-center ml-3">
                  <CheckCircle size={16} color="#10b981" />
                  <Text className="text-sm text-green-600 ml-1 font-medium">Resolved</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-gray-900 mb-3">
              {post.title}
            </Text>

            {/* Content */}
            <Text className="text-gray-800 leading-relaxed mb-4">
              {post.content}
            </Text>

            {/* Tags */}
            {post.tags.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {post.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-sm text-gray-600">#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Author and Actions */}
            <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-3">
                  <Text className="text-sm text-white font-medium">
                    {post.author.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-900">
                    {post.author.displayName || 'Anonymous'}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={isLiked ? () => unlikePost(post.id) : () => likePost(post.id)}
                  className="flex-row items-center mr-4"
                >
                  <ThumbsUp 
                    size={18} 
                    color={isLiked ? '#ef4444' : '#6b7280'} 
                    fill={isLiked ? '#ef4444' : 'none'}
                  />
                  <Text className={`text-sm ml-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-600">{post.replies} replies</Text>
              </View>
            </View>
          </View>
        )}

        {/* Replies Section */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Replies ({replies.length})
          </Text>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-800 font-semibold">Error Loading Replies</Text>
              <Text className="text-red-700 text-sm mt-1">{error}</Text>
            </View>
          )}

          {replies.map((reply) => (
            <ForumReplyCard
              key={reply.id}
              reply={reply}
              onLike={() => likeReply(reply.id)}
              onUnlike={() => unlikeReply(reply.id)}
              onMarkAsAnswer={() => markReplyAsAnswer(reply.id, !reply.isAnswer)}
              showActions={true}
              isPostAuthor={isPostAuthor}
            />
          ))}

          {replies.length === 0 && !isLoading && (
            <View className="bg-white rounded-xl p-8 items-center">
              <Text className="text-gray-600 text-center">
                No replies yet. Be the first to contribute!
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding for reply input */}
        <View className="h-20" />
      </ScrollView>

      {/* Reply Input */}
      {user && (
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-end">
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write a reply..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-3 max-h-24"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmitReply}
              disabled={!replyText.trim() || isSubmitting}
              className={`p-3 rounded-lg ${
                !replyText.trim() || isSubmitting
                  ? 'bg-gray-300'
                  : 'bg-green-600'
              }`}
            >
              <Send 
                size={16} 
                color={!replyText.trim() || isSubmitting ? '#6b7280' : 'white'} 
              />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {replyText.length}/500 characters
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
