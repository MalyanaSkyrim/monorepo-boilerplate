import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_DATA_KEY = 'auth_data';
const ACCESS_TOKEN_KEY = 'accessToken';

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

export type AuthData = {
  isFirstVisit: boolean;
  profile: UserProfile | null;
  isAuthenticated: boolean;
};

let memoryAuthData: AuthData | null = null;
let memoryAccessToken: string | null = null;

/**
 * Get all auth data from AsyncStorage (with memory cache fallback)
 */
export const getAuthData = async (): Promise<AuthData> => {
  try {
    const dataJson = await AsyncStorage.getItem(AUTH_DATA_KEY);
    if (!dataJson) {
      // Default values if no data exists
      const defaultData: AuthData = {
        isFirstVisit: true,
        profile: null,
        isAuthenticated: false,
      };
      memoryAuthData = defaultData;
      return defaultData;
    }
    const parsedData = JSON.parse(dataJson) as Partial<AuthData>;
    console.log('Storage data:', { parsedData, isFirstVisitInStorage: parsedData.isFirstVisit });
    // Ensure isFirstVisit defaults to true if not explicitly set
    const isFirstVisit = parsedData.isFirstVisit ?? true;
    const authData: AuthData = {
      isFirstVisit,
      profile: parsedData.profile ?? null,
      isAuthenticated: parsedData.isAuthenticated ?? false,
    };
    memoryAuthData = authData;
    return authData;
  } catch (error) {
    console.error('Error getting auth data:', error);
    // Return safe defaults on error
    const defaultData: AuthData = {
      isFirstVisit: true,
      profile: null,
      isAuthenticated: false,
    };
    memoryAuthData = defaultData;
    return defaultData;
  }
};

/**
 * Set auth data in AsyncStorage (partial update supported, memory cache updated instantly)
 */
export const setAuthData = async (data: Partial<AuthData>): Promise<void> => {
  try {
    const currentData = memoryAuthData ?? (await getAuthData());
    const updatedData: AuthData = {
      ...currentData,
      ...data,
    };
    memoryAuthData = updatedData;
    await AsyncStorage.setItem(AUTH_DATA_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error setting auth data:', error);
    throw error;
  }
};

/**
 * Clear all auth data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    memoryAuthData = null;
    await AsyncStorage.removeItem(AUTH_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Get access token from SecureStore (with memory cache fallback)
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (memoryAccessToken !== null) {
    return memoryAccessToken;
  }
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    memoryAccessToken = token;
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Set access token in SecureStore
 */
export const setAccessToken = async (token: string): Promise<void> => {
  try {
    memoryAccessToken = token;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting access token:', error);
    throw error;
  }
};

/**
 * Clear access token from SecureStore
 */
export const clearAccessToken = async (): Promise<void> => {
  try {
    memoryAccessToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing access token:', error);
  }
};

/**
 * Set first visit flag
 */
export const setFirstVisit = async (value: boolean): Promise<void> => {
  try {
    await setAuthData({ isFirstVisit: value });
  } catch (error) {
    console.error('Error setting first visit:', error);
    throw error;
  }
};
