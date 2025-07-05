# Firebase Authentication Setup Guide

This document provides instructions for setting up Firebase Authentication with Google Sign In for the Farmers AI app.

## Prerequisites

1. Firebase project created (already configured: `farmers-ai-4c1b7`)
2. Firebase Authentication enabled
3. Google Sign In provider enabled in Firebase Console

## Setup Steps

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `farmers-ai-4c1b7`
3. Navigate to Authentication > Sign-in method
4. Enable Email/Password provider
5. Enable Google provider
6. Configure OAuth consent screen

### 2. Google OAuth Configuration

#### For Web (Development)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID for Web application
4. Add authorized redirect URIs:
   - `http://localhost:19006/--/auth/oauth/callback` (for Expo web dev)
   - `https://your-domain.com/--/auth/oauth/callback` (for production)

#### For Android
1. Create OAuth 2.0 Client ID for Android application
2. Add package name: `com.farmersweather.app`
3. Add SHA-1 certificate fingerprint:
   ```bash
   # For debug builds
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

#### For iOS
1. Create OAuth 2.0 Client ID for iOS application
2. Add bundle identifier: `com.farmersweather.app`

### 3. Environment Variables Setup

Update your `.env` file with the following configurations:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=farmers-ai-4c1b7
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=farmers-ai-4c1b7.firebaseapp.com
FIREBASE_STORAGE_BUCKET=farmers-ai-4c1b7.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
```

### 4. Download Configuration Files

#### For Android
1. Download `google-services.json` from Firebase Console
2. Place it in the root directory of your project

#### For iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in the root directory of your project

### 5. Update app.json

The `app.json` file has been configured with:
- Firebase configuration references
- Google OAuth client IDs
- Proper scheme for deep linking: `farmers-ai`

### 6. Firestore Security Rules

Set up Firestore security rules for user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow read access to public data (if any)
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

## Features Implemented

### Authentication Methods
- ✅ Email/Password Sign In
- ✅ Email/Password Sign Up
- ✅ Google Sign In (with mock implementation for development)
- ✅ Password Reset
- ✅ User Profile Management

### Security Features
- ✅ Firebase Auth integration
- ✅ Firestore user profiles
- ✅ Persistent authentication state
- ✅ Secure password handling
- ✅ Error handling with user-friendly messages

### User Experience
- ✅ Loading states
- ✅ Form validation
- ✅ Responsive design
- ✅ Auth state management
- ✅ Consent management
- ✅ Profile updates

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Test email/password authentication
3. Test form validation
4. Test error scenarios
5. Test password reset functionality

### Production Testing
1. Build the app: `npm run build:web` or EAS build
2. Test with real Google OAuth credentials
3. Test on actual devices
4. Verify deep linking works correctly

## Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check Firebase configuration in `.env`
   - Verify Firebase project settings

2. **Google Sign In not working**
   - Verify OAuth client IDs are correct
   - Check redirect URIs configuration
   - Ensure SHA-1 fingerprints are added for Android

3. **Authentication state not persisting**
   - Check AsyncStorage permissions
   - Verify Firebase auth persistence configuration

4. **Network errors**
   - Check internet connectivity
   - Verify Firebase project is active
   - Check quota limits

### Debug Tips

1. Enable Firebase debug logging:
   ```javascript
   import { getAuth, connectAuthEmulator } from 'firebase/auth';
   
   // For development only
   if (__DEV__) {
     connectAuthEmulator(auth, 'http://localhost:9099');
   }
   ```

2. Check browser developer tools for network requests
3. Use Firebase Console to monitor authentication events
4. Check device logs for native errors

## Security Considerations

1. **Never commit sensitive credentials to version control**
2. **Use environment variables for all configuration**
3. **Implement proper Firestore security rules**
4. **Validate user input on both client and server**
5. **Use HTTPS in production**
6. **Regularly rotate API keys and secrets**
7. **Monitor authentication events for suspicious activity**

## Next Steps

1. Set up real Google OAuth credentials
2. Configure production Firebase project
3. Implement additional authentication providers (Apple, Facebook)
4. Add two-factor authentication
5. Implement email verification
6. Add user roles and permissions
7. Set up analytics and monitoring
