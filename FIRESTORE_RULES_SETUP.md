# Firestore Security Rules Setup Guide

## Quick Fix for Permission Errors

You're getting the "Missing or insufficient permissions" error because Firestore security rules are blocking access to your data. Follow these steps to fix it:

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules
1. You'll see the current rules editor
2. **Replace ALL existing rules** with the contents from `firestore.rules` file in your project
3. Click **Publish** to apply the new rules

### Step 3: Verify Rules Are Applied
The new rules will:
- ✅ Allow authenticated users to read/write their own data
- ✅ Protect user data from unauthorized access
- ✅ Enable proper user profile management
- ✅ Support future forum/community features

### Alternative: Quick Test Rules (DEVELOPMENT ONLY)
If you want to test quickly, you can temporarily use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: Only use test rules during development. Replace with proper rules before production!**

### Step 4: Test the Fix
1. Save and publish the rules
2. Restart your Expo development server
3. Try signing in and accessing the profile page
4. The permission errors should be resolved

### Current Collections Structure
The rules are configured for these collections:
- `user_profiles` - User profile data
- `user_preferences` - User app preferences
- `user_farms` - Farm information
- `user_crops` - Crop data
- `user_activities` - Farming activities
- `forum_topics` - Community discussions (future)
- `forum_replies` - Discussion replies (future)

### Security Features
- ✅ Users can only access their own data
- ✅ Authenticated access required
- ✅ Proper validation of document ownership
- ✅ Support for community features with appropriate permissions
- ✅ Public read access for forum content
- ✅ Protected write access for user-generated content

### Troubleshooting
If you still get permission errors after applying the rules:

1. **Check Authentication**: Make sure you're properly signed in
2. **Verify UID**: Ensure the document ID matches the authenticated user's UID
3. **Check Network**: Verify internet connectivity
4. **Rule Propagation**: Wait a few minutes for rules to propagate
5. **Clear Cache**: Restart your app and clear any cached data

### Testing Your Setup
After applying the rules, test these operations:
- ✅ Sign in with email/password
- ✅ Sign in with Google
- ✅ View profile page
- ✅ Edit profile information
- ✅ View user information table
- ✅ Create and view farm data
- ✅ Add and manage crops

If any of these fail, check the Firebase Console logs for specific error messages.
