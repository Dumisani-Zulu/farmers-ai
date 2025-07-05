import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthState, UserProfile } from '../lib/auth-service';

interface AuthContextType {
  authState: AuthState;
  user: UserProfile | undefined;
  isAuthenticated: boolean;
  hasConsent: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, farmName: string, location?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  giveConsent: (consents: string[]) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    hasConsent: false,
    loading: true,
  });

  useEffect(() => {
    const handleAuthStateChange = (newAuthState: AuthState) => {
      setAuthState(newAuthState);
    };

    authService.addAuthStateListener(handleAuthStateChange);

    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    farmName: string,
    location?: string
  ): Promise<void> => {
    try {
      await authService.signUp(email, password, farmName, location);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const giveConsent = async (consents: string[]): Promise<boolean> => {
    return await authService.giveConsent(consents);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    return await authService.updateProfile(updates);
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    authState,
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    hasConsent: authState.hasConsent,
    loading: authState.loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    giveConsent,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
