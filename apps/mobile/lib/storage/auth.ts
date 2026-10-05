import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'user_profile';
const FIRST_VISIT_KEY = 'first_visit';

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

// Token storage (SecureStore)
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
    throw error;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Profile storage (AsyncStorage)
export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    if (!profileJson) {
      return null;
    }
    return JSON.parse(profileJson) as UserProfile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const setProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error setting profile:', error);
    throw error;
  }
};

export const removeProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error removing profile:', error);
  }
};

// First visit storage (AsyncStorage)
export const getFirstVisit = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(FIRST_VISIT_KEY);
    // If key doesn't exist, it's the first visit (default to true)
    return value === null;
  } catch (error) {
    console.error('Error getting first visit:', error);
    // Default to true on error (safer to show onboarding)
    return true;
  }
};

export const setFirstVisitComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(FIRST_VISIT_KEY, 'false');
  } catch (error) {
    console.error('Error setting first visit:', error);
    throw error;
  }
};

export const resetFirstVisit = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FIRST_VISIT_KEY);
  } catch (error) {
    console.error('Error resetting first visit:', error);
    throw error;
  }
};
