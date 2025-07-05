import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MessageCircle, Calendar, Pin, CheckCircle, MoreVertical, ThumbsUp } from 'lucide-react-native';
import { ForumPost } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';

interface ForumPostCardProps {
  post: ForumPost;
  onPress: () => void;
  onLike: () => void;
  onUnlike: () => void;
  onPin?: () => void;
  onMarkResolved?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'crops': return '#10b981';
    case 'weather': return '#3b82f6';
    case 'pests': return '#ef4444';
    case 'soil': return '#8b5cf6';
    case 'irrigation': return '#06b6d4';
    case 'equipment': return '#f59e0b';
    case 'markets': return '#84cc16';
    default: return '#6b7280';
  }
};

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return postTime.toLocaleDateString();
};

export const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  onPress,
  onLike,
  onUnlike,
  onPin,
  onMarkResolved,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const { user } = useAuth();
  const isLiked = user ? post.likedBy.includes(user.uid) : false;
  const isAuthor = user ? post.author.uid === user.uid : false;

  const handleMoreActions = () => {
    const actions = [];
    
    if (isAuthor) {
      actions.push({ text: 'Edit', onPress: onEdit });
      actions.push({ text: 'Delete', onPress: onDelete, style: 'destructive' });
    }
    
    if (onPin) {
      actions.push({ 
        text: post.isPinned ? 'Unpin' : 'Pin', 
        onPress: onPin 
      });
    }
    
    if (onMarkResolved) {
      actions.push({ 
        text: post.isResolved ? 'Mark Unresolved' : 'Mark Resolved', 
        onPress: onMarkResolved 
      });
    }

    if (actions.length > 0) {
      Alert.alert(
        'Post Actions',
        'Choose an action',
        [
          ...actions.map(action => ({
            text: action.text,
            onPress: action.onPress,
            style: action.style as any
          })),
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${
        post.isPinned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'
      } ${post.isResolved ? 'opacity-75' : ''}`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            {post.isPinned && (
              <Pin size={14} color="#f59e0b" className="mr-2" />
            )}
            <View 
              className="px-2 py-1 rounded-full mr-2"
              style={{ backgroundColor: `${getCategoryColor(post.category)}20` }}
            >
              <Text 
                className="text-xs font-medium capitalize"
                style={{ color: getCategoryColor(post.category) }}
              >
                {post.category}
              </Text>
            </View>
            {post.isResolved && (
              <View className="flex-row items-center">
                <CheckCircle size={14} color="#10b981" />
                <Text className="text-xs text-green-600 ml-1 font-medium">Resolved</Text>
              </View>
            )}
          </View>
          
          <Text className={`text-lg font-semibold text-gray-900 mb-1 ${post.isResolved ? 'line-through' : ''}`}>
            {post.title}
          </Text>
          
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {post.content}
          </Text>
          
          {post.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1">
                  <Text className="text-xs text-gray-600">#{tag}</Text>
                </View>
              ))}
              {post.tags.length > 3 && (
                <View className="bg-gray-100 rounded-full px-2 py-1">
                  <Text className="text-xs text-gray-600">+{post.tags.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {showActions && (
          <TouchableOpacity onPress={handleMoreActions} className="p-1">
            <MoreVertical size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Author and Time */}
      <View className="flex-row items-center mb-3">
        <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center mr-2">
          <Text className="text-xs text-white font-medium">
            {post.author.displayName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-sm text-gray-600 flex-1">
          {post.author.displayName || 'Anonymous'}
        </Text>
        <View className="flex-row items-center">
          <Calendar size={12} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {formatTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={isLiked ? onUnlike : onLike}
            className="flex-row items-center mr-4"
          >
            <ThumbsUp 
              size={16} 
              color={isLiked ? '#ef4444' : '#6b7280'} 
              fill={isLiked ? '#ef4444' : 'none'}
            />
            <Text className={`text-sm ml-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <MessageCircle size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">{post.replies}</Text>
          </View>
        </View>
        
        <Text className="text-xs text-gray-500">
          Updated {formatTimeAgo(post.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
