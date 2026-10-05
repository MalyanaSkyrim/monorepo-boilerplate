import { FetchInstance } from '../../fetch'
import { FetchHttpClient } from '../../fetch/client'
import {
  apiAuthSchema,
  type ForgotPasswordInput,
  type ForgotPasswordOutput,
  type OAuthInput,
  type OAuthOutput,
  type ProfileOutput,
  type ResetPasswordInput,
  type ResetPasswordOutput,
  type SendVerificationCodeInput,
  type SendVerificationCodeOutput,
  type SigninInput,
  type SigninOutput,
  type SignupInput,
  type SignupOutput,
  type UpdateProfileInput,
  type VerifyEmailInput,
  type VerifyEmailOutput,
} from './schema'

export class ApiAuth {
  private baseURL: string
  private token?: string
  private headers: Record<string, string>
  private client: FetchInstance<typeof apiAuthSchema>

  constructor(
    baseURL: string,
    initialToken?: string,
    headers?: Record<string, string>,
  ) {
    this.baseURL = baseURL
    this.token = initialToken
    this.headers = headers || {}

    this.client = FetchHttpClient.createClient({
      schema: apiAuthSchema,
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
    })
  }

  setToken(token: string | undefined) {
    this.token = token
  }

  setHeaders(headers: Record<string, string>) {
    this.headers = headers
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value
  }

  getToken() {
    return this.token
  }

  getHeaders() {
    return { ...this.headers }
  }

  private getRequestHeaders() {
    return {
      ...this.headers,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    }
  }

  getHealth = () =>
    this.client('@get/health', { headers: this.getRequestHeaders() })

  signup = (body: SignupInput): Promise<SignupOutput> =>
    this.client('@post/v1/auth/signup', {
      body,
      headers: this.getRequestHeaders(),
    })

  signin = (body: SigninInput): Promise<SigninOutput> =>
    this.client('@post/v1/auth/signin', {
      body,
      headers: this.getRequestHeaders(),
    })

  oauth = (body: OAuthInput): Promise<OAuthOutput> =>
    this.client('@post/v1/auth/oauth', {
      body,
      headers: this.getRequestHeaders(),
    })

  profile = (): Promise<ProfileOutput> =>
    this.client('@get/v1/auth/profile', {
      headers: this.getRequestHeaders(),
    })

  updateProfile = (body: UpdateProfileInput): Promise<ProfileOutput> =>
    this.client('@patch/v1/auth/profile', {
      body,
      headers: this.getRequestHeaders(),
    })

  forgotPassword = (body: ForgotPasswordInput): Promise<ForgotPasswordOutput> =>
    this.client('@post/v1/auth/forgot-password', {
      body,
      headers: this.getRequestHeaders(),
    })

  resetPassword = (body: ResetPasswordInput): Promise<ResetPasswordOutput> =>
    this.client('@post/v1/auth/reset-password', {
      body,
      headers: this.getRequestHeaders(),
    })

  sendVerificationCode = (
    body: SendVerificationCodeInput,
  ): Promise<SendVerificationCodeOutput> =>
    this.client('@post/v1/auth/send-verification-code', {
      body,
      headers: this.getRequestHeaders(),
    })

  verifyEmail = (body: VerifyEmailInput): Promise<VerifyEmailOutput> =>
    this.client('@post/v1/auth/verify-email', {
      body,
      headers: this.getRequestHeaders(),
    })
}
