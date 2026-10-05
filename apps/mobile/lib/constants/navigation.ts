/**
 * Navigation constants for the mobile app
 */

export const NAVIGATION_REDIRECT_DELAY_MS = 100;

export const ROUTES = {
  ONBOARDING: '/',
  GET_STARTED: '/get-started',
  AUTH_GROUP: '/(auth)',
  HOME_GROUP: '/(home)',
  SIGNIN: 'signin',
  SIGNUP: 'signup',
} as const;

// Route segment names (without leading slash)
export const ROUTE_SEGMENTS = {
  GET_STARTED: 'get-started',
  AUTH_GROUP: '(auth)',
  HOME_GROUP: '(home)',
  SIGNIN: 'signin',
  SIGNUP: 'signup',
} as const;
