import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThumbsUp, Calendar, CheckCircle, MoreVertical } from 'lucide-react-native';
import { ForumReply } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';

interface ForumReplyCardProps {
  reply: ForumReply;
  onLike: () => void;
  onUnlike: () => void;
  onMarkAsAnswer?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isPostAuthor?: boolean;
}

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const replyTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - replyTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return replyTime.toLocaleDateString();
};

export const ForumReplyCard: React.FC<ForumReplyCardProps> = ({
  reply,
  onLike,
  onUnlike,
  onMarkAsAnswer,
  onEdit,
  onDelete,
  showActions = false,
  isPostAuthor = false
}) => {
  const { user } = useAuth();
  const isLiked = user ? reply.likedBy.includes(user.uid) : false;
  const isAuthor = user ? reply.author.uid === user.uid : false;

  const handleMoreActions = () => {
    const actions = [];
    
    if (isAuthor) {
      actions.push({ text: 'Edit', onPress: onEdit });
      actions.push({ text: 'Delete', onPress: onDelete, style: 'destructive' });
    }
    
    if (isPostAuthor && onMarkAsAnswer) {
      actions.push({ 
        text: reply.isAnswer ? 'Unmark as Answer' : 'Mark as Answer', 
        onPress: onMarkAsAnswer 
      });
    }

    if (actions.length > 0) {
      Alert.alert(
        'Reply Actions',
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
    <View 
      className={`bg-white rounded-lg p-4 mb-3 border-l-4 ${
        reply.isAnswer ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          {reply.isAnswer && (
            <View className="flex-row items-center mb-2">
              <CheckCircle size={16} color="#10b981" />
              <Text className="text-sm text-green-600 ml-1 font-medium">Accepted Answer</Text>
            </View>
          )}
          
          <Text className="text-sm text-gray-800 leading-relaxed">
            {reply.content}
          </Text>
        </View>
        
        {showActions && (
          <TouchableOpacity onPress={handleMoreActions} className="p-1">
            <MoreVertical size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Author and Time */}
      <View className="flex-row items-center mb-3">
        <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-2">
          <Text className="text-xs text-white font-medium">
            {reply.author.displayName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-sm text-gray-600 flex-1">
          {reply.author.displayName || 'Anonymous'}
        </Text>
        <View className="flex-row items-center">
          <Calendar size={12} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {formatTimeAgo(reply.createdAt)}
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View className="flex-row items-center pt-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={isLiked ? onUnlike : onLike}
          className="flex-row items-center"
        >
          <ThumbsUp 
            size={14} 
            color={isLiked ? '#ef4444' : '#6b7280'} 
            fill={isLiked ? '#ef4444' : 'none'}
          />
          <Text className={`text-sm ml-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
            {reply.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
