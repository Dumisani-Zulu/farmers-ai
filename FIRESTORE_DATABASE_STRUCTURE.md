# Firestore Database Structure

This document describes the complete Firestore database structure for storing user information in the Farmers AI app.

## 📋 Collection Overview

The database is organized into the following main collections:

- `user_profiles` - Core user profile information
- `user_farms` - Farm-specific information  
- `user_crops` - Crop tracking and management
- `user_activities` - Activity logs and farming operations
- `user_preferences` - App settings and preferences

## 🗂️ Collection Details

### 1. `user_profiles` Collection

**Document ID**: User UID from Firebase Auth

**Fields**:
```typescript
{
  // Basic Info
  uid: string,
  email: string,
  displayName?: string,
  photoURL?: string,
  phoneNumber?: string,
  
  // Personal Info
  fullName?: string,
  dateOfBirth?: string,
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say',
  language: string,
  timezone: string,
  
  // Address Info
  country?: string,
  state?: string,
  city?: string,
  address?: string,
  coordinates?: {
    latitude: number,
    longitude: number
  },
  
  // Account Info
  accountStatus: 'active' | 'inactive' | 'suspended',
  emailVerified: boolean,
  phoneVerified: boolean,
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  lastActiveAt: Timestamp
}
```

### 2. `user_farms` Collection

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  id?: string,
  userId: string,
  
  // Farm Details
  farmName: string,
  farmSize: number,
  farmSizeUnit: 'acres' | 'hectares',
  farmType: 'small_scale' | 'medium_scale' | 'large_scale' | 'commercial' | 'subsistence',
  
  // Location
  location: {
    country: string,
    state: string,
    city: string,
    address?: string,
    coordinates?: {
      latitude: number,
      longitude: number
    }
  },
  
  // Farming Details
  farmingMethod: 'organic' | 'conventional' | 'mixed' | 'permaculture' | 'hydroponic',
  soilType: string[],
  waterSource: string[],
  climateZone?: string,
  elevation?: number,
  
  // Experience
  farmingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  yearsOfExperience: number,
  
  // Certifications
  certifications?: string[],
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. `user_crops` Collection

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  id?: string,
  userId: string,
  farmId?: string,
  
  // Crop Details
  cropName: string,
  variety?: string,
  category: string,
  
  // Planting Info
  plantingDate: Timestamp,
  expectedHarvestDate: Timestamp,
  actualHarvestDate?: Timestamp,
  
  // Area and Quantity
  areaPlanted: number,
  areaUnit: 'sq_meters' | 'acres' | 'hectares',
  quantityPlanted?: number,
  quantityUnit?: string,
  
  // Status
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed',
  growthStage?: string,
  
  // Additional Info
  notes?: string,
  images?: string[],
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. `user_activities` Collection

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  id?: string,
  userId: string,
  farmId?: string,
  cropId?: string,
  
  // Activity Details
  type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'disease_treatment' | 'other',
  title: string,
  description?: string,
  
  // Activity Data
  activityDate: Timestamp,
  duration?: number, // in minutes
  cost?: number,
  currency?: string,
  
  // Results/Outcomes
  outcome?: 'successful' | 'partially_successful' | 'failed',
  notes?: string,
  images?: string[],
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. `user_preferences` Collection

**Document ID**: User UID from Firebase Auth

**Fields**:
```typescript
{
  userId: string,
  
  // App Preferences
  theme: 'light' | 'dark' | 'auto',
  units: 'metric' | 'imperial',
  currency: string,
  dateFormat: string,
  timeFormat: '12h' | '24h',
  
  // Notification Preferences
  notifications: {
    weather: boolean,
    seasonalAdvice: boolean,
    cropRecommendations: boolean,
    pestAlerts: boolean,
    marketPrices: boolean,
    communityUpdates: boolean,
    systemUpdates: boolean,
    emailNotifications: boolean,
    pushNotifications: boolean,
    smsNotifications: boolean
  },
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private',
    shareLocation: boolean,
    shareFarmData: boolean,
    allowDataAnalytics: boolean
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔧 Usage Examples

### Creating a User Profile

```typescript
import { FirestoreService } from '@/lib/firestore-service';

// Create user profile
await FirestoreService.createUserProfile({
  uid: 'user123',
  email: 'farmer@example.com',
  displayName: 'John Farmer',
  fullName: 'John Smith',
  language: 'en',
  timezone: 'Africa/Nairobi',
  accountStatus: 'active',
  emailVerified: true,
  phoneVerified: false,
});
```

### Adding a Farm

```typescript
// Create user farm
const farmId = await FirestoreService.createUserFarm({
  userId: 'user123',
  farmName: 'Green Valley Farm',
  farmSize: 5,
  farmSizeUnit: 'acres',
  farmType: 'small_scale',
  location: {
    country: 'Kenya',
    state: 'Central',
    city: 'Nairobi',
    address: '123 Farm Road'
  },
  farmingMethod: 'organic',
  soilType: ['clay', 'loam'],
  waterSource: ['well', 'rainwater'],
  farmingExperience: 'intermediate',
  yearsOfExperience: 8
});
```

### Tracking Crops

```typescript
// Add a crop
const cropId = await FirestoreService.createUserCrop({
  userId: 'user123',
  farmId: farmId,
  cropName: 'Maize',
  variety: 'Hybrid',
  category: 'Cereal',
  plantingDate: Timestamp.now(),
  expectedHarvestDate: Timestamp.fromDate(new Date('2025-10-15')),
  areaPlanted: 2,
  areaUnit: 'acres',
  status: 'planted'
});
```

### Logging Activities

```typescript
// Log farming activity
await FirestoreService.createUserActivity({
  userId: 'user123',
  farmId: farmId,
  cropId: cropId,
  type: 'fertilizing',
  title: 'Applied organic fertilizer',
  description: 'Applied compost fertilizer to maize field',
  activityDate: Timestamp.now(),
  duration: 120, // 2 hours
  cost: 50,
  currency: 'KES',
  outcome: 'successful'
});
```

## 📊 Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can only access their own data
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User farms - users can only access their own farms
    match /user_farms/{farmId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User crops - users can only access their own crops
    match /user_crops/{cropId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User activities - users can only access their own activities
    match /user_activities/{activityId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User preferences - users can only access their own preferences
    match /user_preferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔍 Indexes

Recommended composite indexes:

1. **user_farms**: `userId` (Ascending) + `createdAt` (Descending)
2. **user_crops**: `userId` (Ascending) + `plantingDate` (Descending)
3. **user_crops**: `userId` (Ascending) + `farmId` (Ascending) + `plantingDate` (Descending)
4. **user_activities**: `userId` (Ascending) + `activityDate` (Descending)
5. **user_activities**: `userId` (Ascending) + `type` (Ascending) + `activityDate` (Descending)

## 🚀 Setup Instructions

1. **Enable Firestore** in your Firebase project
2. **Set up security rules** using the rules above
3. **Create indexes** as needed
4. **Import the FirestoreService** in your app
5. **Start using the methods** to manage user data

## 📈 Migration Plan

For existing users with data in the old structure:

1. The auth service will automatically try the new structure first
2. Falls back to old structure if new data doesn't exist
3. New registrations will use the new structure
4. Old data can be migrated using a migration script

This structure provides a comprehensive and scalable solution for storing all user-related information in your farming app.
