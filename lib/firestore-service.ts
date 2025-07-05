import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase-config';

// Utility function to clean data for Firestore
export const cleanDataForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanDataForFirestore).filter(item => item !== null && item !== undefined);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      const cleanedValue = cleanDataForFirestore(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return data;
};

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_FARMS: 'user_farms',
  USER_CROPS: 'user_crops',
  USER_ACTIVITIES: 'user_activities',
  USER_PREFERENCES: 'user_preferences',
  FORUM_POSTS: 'forum_posts',
  FORUM_REPLIES: 'forum_replies',
} as const;

// User Profile Interface for Firestore
export interface FirestoreUserProfile {
  // Basic Info
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // Personal Info
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  language: string;
  timezone: string;
  
  // Address Info
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Account Info
  accountStatus: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActiveAt: Timestamp;
}

// Farm Information Interface
export interface FirestoreUserFarm {
  id?: string;
  userId: string;
  
  // Farm Details
  farmName: string;
  farmSize: number; // in acres or hectares
  farmSizeUnit: 'acres' | 'hectares';
  farmType: 'small_scale' | 'medium_scale' | 'large_scale' | 'commercial' | 'subsistence';
  
  // Location
  location: {
    country: string;
    state: string;
    city: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Farming Details
  farmingMethod: 'organic' | 'conventional' | 'mixed' | 'permaculture' | 'hydroponic';
  soilType: string[];
  waterSource: string[];
  climateZone?: string;
  elevation?: number;
  
  // Experience
  farmingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  
  // Certifications
  certifications?: string[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Crops Interface
export interface FirestoreUserCrop {
  id?: string;
  userId: string;
  farmId?: string;
  
  // Crop Details
  cropName: string;
  variety?: string;
  category: string;
  
  // Planting Info
  plantingDate: Timestamp;
  expectedHarvestDate: Timestamp;
  actualHarvestDate?: Timestamp;
  
  // Area and Quantity
  areaPlanted: number;
  areaUnit: 'sq_meters' | 'acres' | 'hectares';
  quantityPlanted?: number;
  quantityUnit?: string;
  
  // Status
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
  growthStage?: string;
  
  // Additional Info
  notes?: string;
  images?: string[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Activity/Log Interface
export interface FirestoreUserActivity {
  id?: string;
  userId: string;
  farmId?: string;
  cropId?: string;
  
  // Activity Details
  type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'disease_treatment' | 'other';
  title: string;
  description?: string;
  
  // Activity Data
  activityDate: Timestamp;
  duration?: number; // in minutes
  cost?: number;
  currency?: string;
  
  // Results/Outcomes
  outcome?: 'successful' | 'partially_successful' | 'failed';
  notes?: string;
  images?: string[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Preferences Interface
export interface FirestoreUserPreferences {
  userId: string;
  
  // App Preferences
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Notification Preferences
  notifications: {
    weather: boolean;
    seasonalAdvice: boolean;
    cropRecommendations: boolean;
    pestAlerts: boolean;
    marketPrices: boolean;
    communityUpdates: boolean;
    systemUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    shareLocation: boolean;
    shareFarmData: boolean;
    allowDataAnalytics: boolean;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirestoreService {
  // User Profile Operations
  static async createUserProfile(profile: Omit<FirestoreUserProfile, 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'lastActiveAt'>): Promise<void> {
    try {
      console.log('🔨 Creating user profile for UID:', profile.uid);
      
      // Validate input
      if (!profile.uid || !profile.email) {
        console.error('❌ createUserProfile: Missing required fields (uid or email)');
        throw new Error('User ID and email are required');
      }
      
      const userRef = doc(db, COLLECTIONS.USER_PROFILES, profile.uid);
      const now = serverTimestamp();
      
      // Filter out undefined values to avoid Firestore errors
      const cleanProfile = cleanDataForFirestore(profile);
      
      const profileData = cleanDataForFirestore({
        ...cleanProfile,
        // Ensure required fields have defaults
        language: profile.language || 'en',
        timezone: profile.timezone || 'UTC',
        accountStatus: profile.accountStatus || 'active',
        emailVerified: profile.emailVerified || false,
        phoneVerified: profile.phoneVerified || false,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        lastActiveAt: now,
      });
      
      console.log('📊 Profile data to save:', Object.keys(profileData));
      
      await setDoc(userRef, profileData);
      
      console.log('✅ User profile created successfully');
    } catch (error: any) {
      console.error('❌ Error creating user profile:', error);
      
      if (error?.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED: Check your Firestore security rules');
        console.error('💡 Apply the rules from firestore.rules file to your Firebase Console');
      }
      
      throw error;
    }
  }

  static async getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
    try {
      console.log('🔍 Getting user profile for UID:', uid);
      
      // Validate input
      if (!uid) {
        console.error('❌ getUserProfile: No UID provided');
        throw new Error('User ID is required');
      }
      
      const userRef = doc(db, COLLECTIONS.USER_PROFILES, uid);
      console.log('📍 Firestore document path:', `${COLLECTIONS.USER_PROFILES}/${uid}`);
      
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ User profile found in Firestore');
        const data = userSnap.data() as FirestoreUserProfile;
        console.log('📊 Profile data keys:', Object.keys(data));
        return data;
      } else {
        console.log('⚠️ User profile not found in Firestore - document does not exist');
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      
      // Provide more specific error information
      if (error?.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED: Check your Firestore security rules');
        console.error('💡 Solution: Apply the rules from firestore.rules file to your Firebase Console');
        console.error('🔗 Go to: https://console.firebase.google.com/ -> Your Project -> Firestore -> Rules');
      } else if (error?.code === 'unavailable') {
        console.error('📡 NETWORK ERROR: Firestore service unavailable');
        console.error('💡 Check your internet connection and Firebase project status');
      } else if (error?.code === 'unauthenticated') {
        console.error('🔐 AUTHENTICATION ERROR: User not properly authenticated');
        console.error('💡 Make sure user is signed in before accessing Firestore');
      }
      
      throw error;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<FirestoreUserProfile>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USER_PROFILES, uid);
      
      // Filter out undefined values to avoid Firestore errors
      const cleanUpdates = cleanDataForFirestore(updates);
      
      await updateDoc(userRef, cleanDataForFirestore({
        ...cleanUpdates,
        updatedAt: serverTimestamp(),
      }));
      
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  static async updateLastActivity(uid: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USER_PROFILES, uid);
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Error updating last activity:', error);
      // Don't throw error for this operation
    }
  }

  // Farm Operations
  static async createUserFarm(farm: Omit<FirestoreUserFarm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const farmRef = collection(db, COLLECTIONS.USER_FARMS);
      const docRef = await addDoc(farmRef, {
        ...farm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User farm created successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating user farm:', error);
      throw error;
    }
  }

  static async getUserFarms(userId: string): Promise<FirestoreUserFarm[]> {
    try {
      const farmsRef = collection(db, COLLECTIONS.USER_FARMS);
      const q = query(farmsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreUserFarm[];
    } catch (error) {
      console.error('❌ Error getting user farms:', error);
      throw error;
    }
  }

  // Crop Operations
  static async createUserCrop(crop: Omit<FirestoreUserCrop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cropRef = collection(db, COLLECTIONS.USER_CROPS);
      const docRef = await addDoc(cropRef, {
        ...crop,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User crop created successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating user crop:', error);
      throw error;
    }
  }

  static async getUserCrops(userId: string, farmId?: string): Promise<FirestoreUserCrop[]> {
    try {
      const cropsRef = collection(db, COLLECTIONS.USER_CROPS);
      let q = query(cropsRef, where('userId', '==', userId));
      
      if (farmId) {
        q = query(q, where('farmId', '==', farmId));
      }
      
      q = query(q, orderBy('plantingDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreUserCrop[];
    } catch (error) {
      console.error('❌ Error getting user crops:', error);
      throw error;
    }
  }

  // Activity Operations
  static async createUserActivity(activity: Omit<FirestoreUserActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const activityRef = collection(db, COLLECTIONS.USER_ACTIVITIES);
      const docRef = await addDoc(activityRef, {
        ...activity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User activity created successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating user activity:', error);
      throw error;
    }
  }

  static async getUserActivities(userId: string, limitCount: number = 50): Promise<FirestoreUserActivity[]> {
    try {
      const activitiesRef = collection(db, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef, 
        where('userId', '==', userId), 
        orderBy('activityDate', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreUserActivity[];
    } catch (error) {
      console.error('❌ Error getting user activities:', error);
      throw error;
    }
  }

  // Preferences Operations
  static async createUserPreferences(preferences: Omit<FirestoreUserPreferences, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const prefRef = doc(db, COLLECTIONS.USER_PREFERENCES, preferences.userId);
      await setDoc(prefRef, {
        ...preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User preferences created successfully');
    } catch (error) {
      console.error('❌ Error creating user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(userId: string): Promise<FirestoreUserPreferences | null> {
    try {
      const prefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
      const prefSnap = await getDoc(prefRef);
      
      if (prefSnap.exists()) {
        return prefSnap.data() as FirestoreUserPreferences;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(userId: string, updates: Partial<FirestoreUserPreferences>): Promise<void> {
    try {
      const prefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
      await updateDoc(prefRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User preferences updated successfully');
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      throw error;
    }
  }

  // Utility Methods
  static async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete user profile
      await deleteDoc(doc(db, COLLECTIONS.USER_PROFILES, userId));
      
      // Delete user preferences
      await deleteDoc(doc(db, COLLECTIONS.USER_PREFERENCES, userId));
      
      // Delete user farms
      const farms = await this.getUserFarms(userId);
      for (const farm of farms) {
        if (farm.id) {
          await deleteDoc(doc(db, COLLECTIONS.USER_FARMS, farm.id));
        }
      }
      
      // Delete user crops
      const crops = await this.getUserCrops(userId);
      for (const crop of crops) {
        if (crop.id) {
          await deleteDoc(doc(db, COLLECTIONS.USER_CROPS, crop.id));
        }
      }
      
      // Delete user activities
      const activities = await this.getUserActivities(userId, 1000);
      for (const activity of activities) {
        if (activity.id) {
          await deleteDoc(doc(db, COLLECTIONS.USER_ACTIVITIES, activity.id));
        }
      }
      
      console.log('✅ User data deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user data:', error);
      throw error;
    }
  }
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: Omit<FirestoreUserPreferences, 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: 'auto',
  units: 'metric',
  currency: 'KES',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  notifications: {
    weather: true,
    seasonalAdvice: true,
    cropRecommendations: true,
    pestAlerts: true,
    marketPrices: false,
    communityUpdates: true,
    systemUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  },
  privacy: {
    profileVisibility: 'public',
    shareLocation: true,
    shareFarmData: true,
    allowDataAnalytics: true,
  },
};
