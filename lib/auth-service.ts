import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  email: string;
  farmName?: string;
  location?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthState {
  isAuthenticated: boolean;
  hasConsent: boolean;
  user?: UserProfile;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    hasConsent: false,
  };

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<AuthState> {
    try {
      const [isAuthenticated, hasConsent, userProfile] = await Promise.all([
        AsyncStorage.getItem('is_authenticated'),
        AsyncStorage.getItem('consent_given'),
        AsyncStorage.getItem('user_profile'),
      ]);

      this.authState = {
        isAuthenticated: isAuthenticated === 'true',
        hasConsent: hasConsent === 'true',
        user: userProfile ? JSON.parse(userProfile) : undefined,
      };

      return this.authState;
    } catch (error) {
      console.error('Error initializing auth service:', error);
      return this.authState;
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would validate credentials with your backend
      const user: UserProfile = {
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem('is_authenticated', 'true'),
        AsyncStorage.setItem('user_profile', JSON.stringify(user)),
        AsyncStorage.setItem('user_email', email),
      ]);

      this.authState.isAuthenticated = true;
      this.authState.user = user;

      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  }

  async signUp(
    email: string,
    password: string,
    farmName: string,
    location?: string
  ): Promise<boolean> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user: UserProfile = {
        email,
        farmName,
        location,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem('is_authenticated', 'true'),
        AsyncStorage.setItem('user_profile', JSON.stringify(user)),
        AsyncStorage.setItem('user_email', email),
        AsyncStorage.setItem('farm_name', farmName),
        AsyncStorage.setItem('farm_location', location || ''),
      ]);

      this.authState.isAuthenticated = true;
      this.authState.user = user;

      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('is_authenticated'),
        AsyncStorage.removeItem('user_profile'),
        AsyncStorage.removeItem('user_email'),
        AsyncStorage.removeItem('farm_name'),
        AsyncStorage.removeItem('farm_location'),
        AsyncStorage.removeItem('consent_given'),
        AsyncStorage.removeItem('user_consents'),
      ]);

      this.authState = {
        isAuthenticated: false,
        hasConsent: false,
      };
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async giveConsent(consents: string[]): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.setItem('consent_given', 'true'),
        AsyncStorage.setItem('user_consents', JSON.stringify(consents)),
      ]);

      this.authState.hasConsent = true;
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

      const updatedUser = { ...this.authState.user, ...updates };
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));

      this.authState.user = updatedUser;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send a password reset email
      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
export type { AuthState, UserProfile };
