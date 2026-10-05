import {
  useForgotPassword,
  useHealth,
  useOAuthSignIn,
  useProfile,
  useResetPassword,
  useSendVerificationCode,
  useSignin,
  useSignup,
  useUpdateProfile,
  useVerifyEmail,
} from './auth.hooks';

export const auth = {
  signin: {
    useMutation: useSignin,
  },
  oauth: {
    useMutation: useOAuthSignIn,
  },
  signup: {
    useMutation: useSignup,
  },
  forgotPassword: {
    useMutation: useForgotPassword,
  },
  resetPassword: {
    useMutation: useResetPassword,
  },
  sendVerificationCode: {
    useMutation: useSendVerificationCode,
  },
  verifyEmail: {
    useMutation: useVerifyEmail,
  },
  profile: {
    useQuery: useProfile,
    useMutation: useUpdateProfile,
  },
  health: {
    useQuery: useHealth,
  },
} as const;
