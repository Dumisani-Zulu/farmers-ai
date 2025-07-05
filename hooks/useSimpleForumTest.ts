import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { useAuth } from '@/contexts/AuthContext';

export const useSimpleForumTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const createSimplePost = useCallback(async (title: string, content: string): Promise<string> => {
    console.log('=== Simple Forum Test ===');
    console.log('User:', user);
    
    if (!user) {
      throw new Error('User must be authenticated');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const simplePost = {
        title,
        content,
        authorUid: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        createdAt: serverTimestamp(),
        testPost: true
      };

      console.log('Creating simple post:', simplePost);
      
      const docRef = await addDoc(collection(db, 'forum_posts'), simplePost);
      console.log('Simple post created with ID:', docRef.id);
      
      return docRef.id;
    } catch (err) {
      console.error('Simple post creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    createSimplePost,
    isLoading,
    error
  };
};
