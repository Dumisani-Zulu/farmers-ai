import { useState, useCallback, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { useAuth } from '@/contexts/AuthContext';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  createdAt: any;
  updatedAt: any;
  likes: number;
  likedBy: string[];
  replies: number;
  tags: string[];
  isResolved: boolean;
  isPinned: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  createdAt: any;
  likes: number;
  likedBy: string[];
  isAnswer: boolean;
}

interface UseForumReturn {
  posts: ForumPost[];
  replies: ForumReply[];
  isLoading: boolean;
  error: string | null;
  
  // Post methods
  createPost: (postData: Partial<ForumPost>) => Promise<string>;
  updatePost: (postId: string, updates: Partial<ForumPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  markPostResolved: (postId: string, resolved: boolean) => Promise<void>;
  
  // Reply methods
  createReply: (postId: string, content: string) => Promise<string>;
  updateReply: (replyId: string, content: string) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
  likeReply: (replyId: string) => Promise<void>;
  unlikeReply: (replyId: string) => Promise<void>;
  markReplyAsAnswer: (replyId: string, isAnswer: boolean) => Promise<void>;
  
  // Utility methods
  loadPosts: (category?: string) => Promise<void>;
  loadReplies: (postId: string) => Promise<void>;
  searchPosts: (searchTerm: string) => Promise<ForumPost[]>;
}

export const useForum = (): UseForumReturn => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const createPost = useCallback(async (postData: Partial<ForumPost>): Promise<string> => {
    if (!user) {
      console.error('No user found when trying to create post');
      throw new Error('User must be authenticated');
    }
    
    console.log('Creating post with user:', user);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build author object without undefined values
      const author: any = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous'
      };
      
      // Only add photoURL if it exists and is not undefined
      if (user.photoURL) {
        author.photoURL = user.photoURL;
      }

      const newPost = {
        title: postData.title || '',
        content: postData.content || '',
        category: postData.category || 'general',
        author,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        replies: 0,
        tags: postData.tags || [],
        isResolved: false,
        isPinned: false
      };

      console.log('Attempting to create post with data:', newPost);
      const docRef = await addDoc(collection(db, 'forum_posts'), newPost);
      console.log('Post created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePost = useCallback(async (postId: string, updates: Partial<ForumPost>): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deletePost = useCallback(async (postId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, 'forum_posts', postId));
      
      // Also delete all replies to this post
      const repliesQuery = query(
        collection(db, 'forum_replies'),
        where('postId', '==', postId)
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      
      const deletePromises = repliesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const likePost = useCallback(async (postId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like post';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const unlikePost = useCallback(async (postId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlike post';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const markPostResolved = useCallback(async (postId: string, resolved: boolean): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        isResolved: resolved,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post status';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const createReply = useCallback(async (postId: string, content: string): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build author object without undefined values
      const author: any = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous'
      };
      
      // Only add photoURL if it exists and is not undefined
      if (user.photoURL) {
        author.photoURL = user.photoURL;
      }

      const newReply = {
        postId,
        content,
        author,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        isAnswer: false
      };

      const docRef = await addDoc(collection(db, 'forum_replies'), newReply);
      
      // Update post reply count
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        replies: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reply';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateReply = useCallback(async (replyId: string, content: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const replyRef = doc(db, 'forum_replies', replyId);
      await updateDoc(replyRef, {
        content,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reply';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const deleteReply = useCallback(async (replyId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const replyRef = doc(db, 'forum_replies', replyId);
      const replyDoc = await getDocs(query(collection(db, 'forum_replies'), where('__name__', '==', replyId)));
      
      if (!replyDoc.empty) {
        const replyData = replyDoc.docs[0].data();
        
        await deleteDoc(replyRef);
        
        // Update post reply count
        const postRef = doc(db, 'forum_posts', replyData.postId);
        await updateDoc(postRef, {
          replies: increment(-1)
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reply';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const likeReply = useCallback(async (replyId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const replyRef = doc(db, 'forum_replies', replyId);
      await updateDoc(replyRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like reply';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const unlikeReply = useCallback(async (replyId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const replyRef = doc(db, 'forum_replies', replyId);
      await updateDoc(replyRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlike reply';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const markReplyAsAnswer = useCallback(async (replyId: string, isAnswer: boolean): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const replyRef = doc(db, 'forum_replies', replyId);
      await updateDoc(replyRef, {
        isAnswer
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark reply as answer';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const loadPosts = useCallback(async (category?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let q = query(
        collection(db, 'forum_posts'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      
      if (category && category !== 'all') {
        q = query(
          collection(db, 'forum_posts'),
          where('category', '==', category),
          orderBy('updatedAt', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      let postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];
      
      // Sort pinned posts to the top client-side
      postsData = postsData.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      
      setPosts(postsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadReplies = useCallback(async (postId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simple query without ordering to avoid composite index
      const q = query(
        collection(db, 'forum_replies'),
        where('postId', '==', postId)
      );

      const snapshot = await getDocs(q);
      let repliesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumReply[];
      
      // Sort client-side: answers first, then by creation time
      repliesData = repliesData.sort((a, b) => {
        // First, sort by isAnswer (answers first)
        if (a.isAnswer && !b.isAnswer) return -1;
        if (!a.isAnswer && b.isAnswer) return 1;
        
        // Then sort by creation time (oldest first for chronological order)
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return aTime.getTime() - bTime.getTime();
      });
      
      setReplies(repliesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load replies';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPosts = useCallback(async (searchTerm: string): Promise<ForumPost[]> => {
    try {
      const q = query(
        collection(db, 'forum_posts'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];
      
      // Simple client-side search (in production, use Algolia or similar)
      const searchResults = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search posts';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    replies,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    markPostResolved,
    createReply,
    updateReply,
    deleteReply,
    likeReply,
    unlikeReply,
    markReplyAsAnswer,
    loadPosts,
    loadReplies,
    searchPosts
  };
};
