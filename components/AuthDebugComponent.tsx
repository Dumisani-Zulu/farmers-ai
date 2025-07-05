import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase-config';
import { collection, doc, getDoc } from 'firebase/firestore';

export const AuthDebugComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const runTests = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        authState: {
          isAuthenticated,
          loading,
          user: user ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          } : null,
        },
        firebaseAuth: {
          currentUser: auth.currentUser ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
          } : null,
        },
        firestore: {
          available: !!db,
        }
      };

      // Test Firestore connection
      try {
        const testCollection = collection(db, 'test');
        info.firestore.collectionCreated = true;
        
        // Try to read a non-existent document (should not error)
        const testDoc = await getDoc(doc(db, 'test', 'nonexistent'));
        info.firestore.canRead = true;
        info.firestore.testDocExists = testDoc.exists();
      } catch (error) {
        info.firestore.error = error instanceof Error ? error.message : 'Unknown error';
      }

      setDebugInfo(info);
    };

    runTests();
  }, [user, isAuthenticated, loading]);

  const createTestUser = async () => {
    try {
      // This would normally be done through the auth service
      console.log('Creating test user...');
      // For now, just log - we'll implement this if needed
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 m-4 shadow-sm">
      <Text className="text-lg font-bold mb-4">🔍 Auth Debug Info</Text>
      
      <ScrollView className="max-h-96">
        <Text className="text-xs text-gray-600 mb-4 font-mono">
          {JSON.stringify(debugInfo, null, 2)}
        </Text>
      </ScrollView>

      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity 
          onPress={() => window.location.reload()}
          className="bg-blue-500 px-3 py-2 rounded"
        >
          <Text className="text-white text-sm">Reload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={createTestUser}
          className="bg-green-500 px-3 py-2 rounded"
        >
          <Text className="text-white text-sm">Test User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
