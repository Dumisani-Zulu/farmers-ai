import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  farmName?: string;
  location?: string;
  createdAt: string;
  lastLogin: string;
  photoURL?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  hasConsent: boolean;
  user?: UserProfile;
  loading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    hasConsent: false,
    loading: true,
  };
  private authStateListeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initializeAuthListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        const hasConsent = await this.checkConsent();
        
        this.authState = {
          isAuthenticated: true,
          hasConsent,
          user: userProfile || this.createUserProfileFromFirebaseUser(user),
          loading: false,
        };
      } else {
        this.authState = {
          isAuthenticated: false,
          hasConsent: false,
          user: undefined,
          loading: false,
        };
      }
      
      this.notifyListeners();
    });
  }

  private createUserProfileFromFirebaseUser(user: User): UserProfile {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
  }

  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      console.log('📖 Attempting to get user profile for uid:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        console.log('✅ User profile found in Firestore');
        return userDoc.data() as UserProfile;
      } else {
        console.log('❌ No user profile found in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user profile from Firestore:', error);
      // Don't throw the error, just return null to allow fallback
      return null;
    }
  }

  private async saveUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      console.log('💾 Saving user profile to Firestore for uid:', userProfile.uid);
      await setDoc(doc(db, 'users', userProfile.uid), userProfile);
      console.log('✅ User profile saved successfully');
    } catch (error) {
      console.error('❌ Error saving user profile to Firestore:', error);
      throw error;
    }
  }

  private async checkConsent(): Promise<boolean> {
    try {
      const hasConsent = await AsyncStorage.getItem('consent_given');
      return hasConsent === 'true';
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  private notifyListeners() {
    this.authStateListeners.forEach(listener => listener(this.authState));
  }

  addAuthStateListener(listener: (state: AuthState) => void) {
    this.authStateListeners.push(listener);
    // Immediately call with current state
    listener(this.authState);
  }

  removeAuthStateListener(listener: (state: AuthState) => void) {
    this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
  }

  async initialize(): Promise<AuthState> {
    // Auth state is managed by the Firebase listener
    return this.authState;
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      if (userCredential.user) {
        await this.updateLastLogin(userCredential.user.uid);
      }
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(
    email: string,
    password: string,
    farmName: string,
    location?: string
  ): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      if (farmName) {
        await updateProfile(user, { displayName: farmName });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: farmName || undefined,
        farmName,
        location,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await this.saveUserProfile(userProfile);
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.signInWithGoogleWeb();
      } else {
        return await this.signInWithGoogleNative();
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  private async signInWithGoogleNative(): Promise<boolean> {
    try {
      // For React Native apps, you would typically use @react-native-google-signin/google-signin
      // For now, we'll use the web-based OAuth flow which works in Expo
      return await this.signInWithGoogleWeb();
    } catch (error) {
      console.error('Google native sign in error:', error);
      throw error;
    }
  }

  private async signInWithGoogleWeb(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Use Firebase's Google Auth Provider for web
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        
        if (result.user) {
          await this.handleGoogleUserProfile(result.user);
          return true;
        }
      } else {
        // For React Native/Expo, use OAuth flow
        const clientId = Constants.expoConfig?.extra?.googleOAuthClientIdWeb || 
                       process.env.GOOGLE_OAUTH_CLIENT_ID_WEB;
        
        if (!clientId) {
          throw new Error('Google OAuth client ID not configured for web');
        }

        const redirectUri = AuthSession.makeRedirectUri();

        const request = new AuthSession.AuthRequest({
          clientId,
          scopes: ['openid', 'profile', 'email'],
          redirectUri,
          responseType: AuthSession.ResponseType.Code,
        });

        const result = await request.promptAsync({
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        });

        if (result.type === 'success' && result.params.code) {
          // Exchange the authorization code for an access token
          const tokenResult = await this.exchangeCodeForToken(result.params.code, clientId, redirectUri);
          
          if (tokenResult.access_token) {
            // Create Firebase credential and sign in
            const credential = GoogleAuthProvider.credential(tokenResult.id_token);
            const firebaseResult = await signInWithCredential(auth, credential);
            
            if (firebaseResult.user) {
              await this.handleGoogleUserProfile(firebaseResult.user);
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Google web sign in error:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string, clientId: string, redirectUri: string): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  private async handleGoogleUserProfile(user: User): Promise<void> {
    try {
      // Check if user profile already exists
      const existingProfile = await this.getUserProfile(user.uid);
      
      if (!existingProfile) {
        // Create new user profile
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          farmName: user.displayName || undefined, // Use display name as farm name initially
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        await this.saveUserProfile(userProfile);
      } else {
        // Update last login
        await this.updateLastLogin(user.uid);
      }
    } catch (error) {
      console.error('Error handling Google user profile:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      
      // Clear local consent data
      await Promise.all([
        AsyncStorage.removeItem('consent_given'),
        AsyncStorage.removeItem('user_consents'),
      ]);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async giveConsent(consents: string[]): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.setItem('consent_given', 'true'),
        AsyncStorage.setItem('user_consents', JSON.stringify(consents)),
      ]);

      this.authState.hasConsent = true;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Consent error:', error);
      return false;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      if (!this.authState.user) {
        throw new Error('No user logged in');
      }

      const updatedProfile = { ...this.authState.user, ...updates };
      await this.saveUserProfile(updatedProfile);

      this.authState.user = updatedProfile;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  hasConsent(): boolean {
    return this.authState.hasConsent;
  }

  getUser(): UserProfile | undefined {
    return this.authState.user;
  }

  async getConsents(): Promise<string[]> {
    try {
      const consents = await AsyncStorage.getItem('user_consents');
      return consents ? JSON.parse(consents) : [];
    } catch (error) {
      console.error('Error getting consents:', error);
      return [];
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
export type { AuthState, UserProfile };
