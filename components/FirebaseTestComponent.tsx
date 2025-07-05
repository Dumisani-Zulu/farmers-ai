import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSimpleForumTest } from '@/hooks/useSimpleForumTest';

export const FirebaseTestComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [testing, setTesting] = useState(false);
  const { createSimplePost } = useSimpleForumTest();

  const testFirebaseConnection = async () => {
    setTesting(true);
    try {
      console.log('=== Firebase Test Started ===');
      console.log('User authenticated:', isAuthenticated);
      console.log('User object:', user);
      
      if (!user) {
        Alert.alert('Test Failed', 'No user found. Please sign in first.');
        return;
      }

      // Test creating a simple document
      const testDoc = {
        test: true,
        message: 'Test document',
        author: {
          uid: user.uid,
          displayName: user.displayName || 'Test User'
        },
        createdAt: serverTimestamp()
      };

      console.log('Attempting to create test document:', testDoc);
      
      const docRef = await addDoc(collection(db, 'test_collection'), testDoc);
      console.log('Test document created with ID:', docRef.id);
      
      Alert.alert('Test Successful', `Document created with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Firebase test error:', error);
      Alert.alert('Test Failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const testSimplePost = async () => {
    setTesting(true);
    try {
      const postId = await createSimplePost('Test Post', 'This is a test post content');
      Alert.alert('Post Test Successful', `Post created with ID: ${postId}`);
    } catch (error) {
      console.error('Simple post test error:', error);
      Alert.alert('Post Test Failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 m-4 border border-gray-200">
      <Text className="text-lg font-semibold mb-2">Firebase Connection Test</Text>
      <Text className="text-sm text-gray-600 mb-2">
        Authenticated: {isAuthenticated ? 'Yes' : 'No'}
      </Text>
      <Text className="text-sm text-gray-600 mb-4">
        User: {user?.displayName || user?.email || 'None'}
      </Text>
      
      <TouchableOpacity
        onPress={testFirebaseConnection}
        disabled={testing || !isAuthenticated}
        className={`px-4 py-2 rounded-lg mb-2 ${
          testing || !isAuthenticated ? 'bg-gray-400' : 'bg-blue-600'
        }`}
      >
        <Text className="text-white font-medium text-center">
          {testing ? 'Testing...' : 'Test Firebase Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={testSimplePost}
        disabled={testing || !isAuthenticated}
        className={`px-4 py-2 rounded-lg ${
          testing || !isAuthenticated ? 'bg-gray-400' : 'bg-green-600'
        }`}
      >
        <Text className="text-white font-medium text-center">
          {testing ? 'Testing...' : 'Test Simple Post Creation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
