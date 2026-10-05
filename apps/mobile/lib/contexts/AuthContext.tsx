import { getProfile } from '@/api/auth/auth.handlers';
import { createQueryOptions, isInvalidSessionError } from '@/lib/api/query-config';
import {
  clearAccessToken,
  clearAuthData,
  getAccessToken,
  getAuthData,
  setAccessToken,
  setAuthData,
  type UserProfile,
} from '@/lib/storage/auth-storage';
import type { ProfileOutput } from '@app/http-client';
import * as Sentry from '@sentry/react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isTokenExpired } from '@/lib/utils/jwt';

type AuthState = {
  isFirstVisit: boolean;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  accessToken: string | null;
};

type AuthContextType = AuthState & {
  signIn: (profile: UserProfile, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  setFirstVisit: (value: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  const [state, setState] = useState<AuthState>({
    isFirstVisit: true,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    isProfileLoading: false,
    accessToken: null,
  });

  // Read through a ref rather than as an effect dependency: `profile` changes identity on
  // every profile update, and an effect that calls setState would re-trigger itself forever.
  const profileRef = useRef(state.profile);
  useEffect(() => {
    profileRef.current = state.profile;
  });

  // Initialize from storage on mount
  useEffect(() => {
    console.log('[App Startup: Auth] Starting storage initialization...');
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Auth initialization started',
      level: 'info',
    });

    const initialize = async () => {
      try {
        const [authData, token] = await Promise.all([getAuthData(), getAccessToken()]);

        // Validate token expiration locally (0ms) - avoid masquerading expired tokens as active sessions
        const hasValidToken = Boolean(token && !isTokenExpired(token));

        if (token && !hasValidToken) {
          console.warn('[App Startup: Auth] Stored access token has expired. Clearing session.');
          Sentry.addBreadcrumb({
            category: 'auth',
            message: 'Stored token expired, clearing session',
            level: 'info',
          });
          await Promise.all([
            clearAccessToken(),
            setAuthData({ isAuthenticated: false, profile: null }),
          ]);
        }

        const isUserAuthenticated = Boolean(
          hasValidToken && authData.profile && !authData.isFirstVisit
        );

        console.log('[App Startup: Auth] Storage initialized successfully:', {
          isFirstVisit: authData.isFirstVisit,
          hasProfile: !!authData.profile,
          hasToken: !!token,
          hasValidToken,
          isAuthenticated: isUserAuthenticated,
        });

        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Storage initialized successfully',
          level: 'info',
          data: {
            isFirstVisit: authData.isFirstVisit,
            hasProfile: !!authData.profile,
            hasToken: !!token,
            hasValidToken,
            isAuthenticated: isUserAuthenticated,
          },
        });

        // Set Sentry user context if profile exists and user is authenticated
        if (isUserAuthenticated && authData.profile) {
          Sentry.setUser({
            id: authData.profile.id,
            email: authData.profile.email,
            username: `${authData.profile.firstName} ${authData.profile.lastName || ''}`.trim(),
          });
        }

        setState({
          isFirstVisit: authData.isFirstVisit,
          profile: isUserAuthenticated ? authData.profile : null,
          isAuthenticated: isUserAuthenticated,
          isLoading: false, // Storage is ready, unblock app startup
          isProfileLoading: false,
          accessToken: hasValidToken ? token : null,
        });
      } catch (error) {
        console.error('[App Startup: Auth] Error initializing auth from storage:', error);
        Sentry.captureException(error, { tags: { section: 'auth-initialize' } });
        setState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        setIsStorageLoading(false);
      }
    };

    initialize();
  }, []);

  // Update profile helper function
  const updateProfile = useCallback(async (profile: UserProfile) => {
    try {
      await setAuthData({
        profile,
        isAuthenticated: true,
      });

      // Set Sentry user context
      Sentry.setUser({
        id: profile.id,
        email: profile.email,
        username: `${profile.firstName} ${profile.lastName || ''}`.trim(),
      });

      setState((prev) => ({
        ...prev,
        profile,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      Sentry.captureException(error, { tags: { section: 'auth-updateProfile' } });
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[App Startup: Auth] signOut called');
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'signOut called',
      level: 'info',
    });
    try {
      await Promise.all([clearAccessToken(), clearAuthData()]);

      // Clear Sentry user context
      Sentry.setUser(null);
      queryClient.removeQueries({ queryKey: ['profile'] });

      setState({
        isFirstVisit: false,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        isProfileLoading: false,
        accessToken: null,
      });
    } catch (error) {
      console.error('[App Startup: Auth] Error signing out:', error);
      Sentry.captureException(error, { tags: { section: 'auth-signOut' } });
      throw error;
    }
  }, [queryClient]);

  // Validate/refresh profile in background when token exists (staleTime: 5 min prevents redundant calls)
  const shouldFetchProfile = Boolean(state.accessToken && !state.isFirstVisit && !isStorageLoading);

  useEffect(() => {
    if (shouldFetchProfile) {
      console.log(
        '[App Startup: Auth] Access token found and storage loaded. Background profile validation check...'
      );
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Background profile validation check',
        level: 'info',
      });
    }
  }, [shouldFetchProfile]);

  const {
    data: profileData,
    error: profileError,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: shouldFetchProfile,
    ...createQueryOptions<ProfileOutput, Error>(),
    retry: false, // Never retry startup profile check - fail immediately on 401 or network error
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent redundant profile fetches on mount/login
  });

  // Update isProfileLoading in state
  useEffect(() => {
    setState((prev) => {
      const next = shouldFetchProfile ? isProfileLoading : false;
      // Returning `prev` unchanged lets React bail out of the re-render entirely
      if (prev.isProfileLoading === next) {
        return prev;
      }
      return { ...prev, isProfileLoading: next };
    });
  }, [shouldFetchProfile, isProfileLoading]);

  // Update profile when fetched from API
  useEffect(() => {
    if (profileData) {
      console.log('[App Startup: Auth] Profile fetched successfully from API:', {
        id: profileData.id,
        email: profileData.email,
      });
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Profile fetched successfully from API',
        level: 'info',
        data: {
          id: profileData.id,
          email: profileData.email,
        },
      });

      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName ?? null,
        phone: profileData.phone ?? null,
        avatar: null,
        createdAt: profileData.createdAt.toISOString(),
        updatedAt: profileData.updatedAt.toISOString(),
        emailVerified: profileData.emailVerified?.toISOString() ?? null,
      };

      updateProfile(userProfile)
        .then(() => {
          console.log('[App Startup: Auth] AuthState set to authenticated');
          Sentry.addBreadcrumb({
            category: 'auth',
            message: 'AuthState set to authenticated',
            level: 'info',
          });
          // Set isAuthenticated to true only after successful profile fetch
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isLoading: false, // Fully loaded now
          }));
        })
        .catch((error) => {
          console.error('[App Startup: Auth] Error updating profile state:', error);
          Sentry.captureException(error, { tags: { section: 'auth-updateProfile-fetch' } });
          setState((prev) => ({ ...prev, isLoading: false }));
        });
    }
  }, [profileData, updateProfile]);

  // Handle profile fetch errors - only logout when the session itself is dead
  useEffect(() => {
    if (profileError) {
      const errorMessage =
        profileError instanceof Error ? profileError.message : String(profileError);

      console.error('[App Startup: Auth] Profile fetch failed:', errorMessage);
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Profile fetch failed',
        level: 'error',
        data: { error: errorMessage },
      });

      // Logout only when the session can never succeed again: 401/403, or 404 USER_NOT_FOUND
      // (token verifies but the user row is gone - retaining the cached profile here would
      // leave the app permanently authenticated against a nonexistent account)
      const isDeadSession = isInvalidSessionError(profileError);

      if (isDeadSession) {
        console.warn('[App Startup: Auth] Invalid session, logging out user...');
        Sentry.captureMessage('Logging out user due to invalid session (401/403/USER_NOT_FOUND)', {
          level: 'warning',
          extra: { profileError: errorMessage },
        });
        signOut().catch((error) => {
          console.error('[App Startup: Auth] Error during logout:', error);
          Sentry.captureException(error, { tags: { section: 'auth-invalid-session-logout' } });
          setState((prev) => (prev.isLoading ? { ...prev, isLoading: false } : prev));
        });
      } else {
        // Other errors (network, offline, timeout, 500, etc.) - log but don't logout, use cached profile
        const hasCachedProfile = !!profileRef.current;
        console.warn(
          '[App Startup: Auth] Non-auth or offline error during profile fetch. Retaining cached profile.',
          {
            error: errorMessage,
            hasCachedProfile,
          }
        );
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Retaining cached profile due to non-auth/offline error',
          level: 'warning',
          data: { error: errorMessage, hasCachedProfile },
        });
        setState((prev) => {
          // Retain authentication while offline
          const isAuthenticated = Boolean(prev.accessToken && prev.profile);
          // Returning `prev` unchanged lets React bail out of the re-render entirely
          if (prev.isAuthenticated === isAuthenticated && !prev.isLoading) {
            return prev;
          }
          return { ...prev, isAuthenticated, isLoading: false };
        });
      }
    }
  }, [profileError, signOut]);

  const signIn = useCallback(
    async (profile: UserProfile, token: string) => {
      console.log('[App Startup: Auth] signIn called for user:', profile.id);
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'signIn called',
        level: 'info',
        data: { userId: profile.id },
      });
      try {
        await Promise.all([
          setAccessToken(token),
          setAuthData({
            profile,
            isAuthenticated: true,
          }),
        ]);

        // Pre-populate query cache so useQuery(['profile']) does not immediately refetch
        const queryProfileData: ProfileOutput = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
        };
        queryClient.setQueryData(['profile'], queryProfileData);

        // Set Sentry user context
        Sentry.setUser({
          id: profile.id,
          email: profile.email,
          username: `${profile.firstName} ${profile.lastName || ''}`.trim(),
        });

        setState({
          isFirstVisit: false,
          profile,
          isAuthenticated: true,
          isLoading: false,
          isProfileLoading: false,
          accessToken: token,
        });
      } catch (error) {
        console.error('Error signing in:', error);
        Sentry.captureException(error, { tags: { section: 'auth-signIn' } });
        throw error;
      }
    },
    [queryClient]
  );

  const setFirstVisit = useCallback(async (value: boolean) => {
    console.log('[App Startup: Auth] setFirstVisit called with value:', value);
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'setFirstVisit called',
      level: 'info',
      data: { value },
    });
    try {
      await setAuthData({ isFirstVisit: value });

      setState((prev) => ({
        ...prev,
        isFirstVisit: value,
      }));
    } catch (error) {
      console.error('Error setting first visit:', error);
      Sentry.captureException(error, { tags: { section: 'auth-setFirstVisit' } });
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.accessToken && !state.isFirstVisit) {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  }, [queryClient, state.accessToken, state.isFirstVisit]);

  // Memoized so consumers (NavigationGuard, AppContent, PushNotificationProvider, ...) only
  // re-render when auth state actually changes, not on every AuthProvider render
  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      signIn,
      signOut,
      updateProfile,
      setFirstVisit,
      refreshProfile,
    }),
    [state, signIn, signOut, updateProfile, setFirstVisit, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
