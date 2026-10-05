import { ApiAuth } from '@app/http-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { rewriteLocalhostForAndroid } from './rewriteLocalhostForAndroid';

// Get base URL from expo-constants or default to localhost:4000
const getBaseURL = (): string => {
  const apiAuthUrl = Constants.expoConfig?.extra?.apiAuthUrl;

  // If env variable is explicitly provided, use it (works in both dev and production)
  if (apiAuthUrl) {
    return rewriteLocalhostForAndroid(apiAuthUrl);
  }

  // Development fallback - handle different platforms
  const apiAuthPort = Constants.expoConfig?.extra?.apiAuthPort;
  const localPort = apiAuthPort ? Number.parseInt(String(apiAuthPort), 10) : 4000;

  if (Platform.OS === 'android') {
    // Android emulator
    return `http://10.0.2.2:${localPort}`;
  }

  // iOS simulator and web
  return `http://localhost:${localPort}`;
};

// Create ApiAuth instance
const apiAuth = new ApiAuth(getBaseURL());

// Export the instance
export { apiAuth };
