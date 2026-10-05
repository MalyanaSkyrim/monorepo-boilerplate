---
name: add-app-feature-guide
description: Quick reference for building features in the mobile app (React Native / Expo) with API structure, React Query patterns, error handling, and best practices. Use ONLY for mobile applications, NOT for web applications.
---

# New Feature Guide

Quick reference for building features in the mobile app.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when building new API features in mobile app
- Use when setting up React Query hooks in mobile app
- Use when handling errors and toasts in mobile app
- Use when deciding between custom hooks vs context in mobile app

## Instructions

### API Structure

Follow tRPC-like pattern: `api/{module}/{route}/{route}.{handler|hook|schema}.ts`

- **handler.ts**: HTTP request using `httpClient.post<Input, Output>(endpoint, body)`
- **hook.ts**: React Query hook - `useMutation({ mutationFn, retry: createMutationRetry() })` or `useQuery({ queryKey, queryFn, ...createQueryOptions() })`
- **schema.ts**: Zod schemas with `z.infer<typeof schema>` types

**Module export:** `export const auth = { signup: { useMutation: useSignup } } as const`
**Main export:** `export const api = { auth, ... } as const`
**Usage:** `api.auth.signup.useMutation()`

### React Query

- **Queries:** Use `createQueryOptions()` - retries on network errors
- **Mutations:** Use `createMutationRetry()` - only retries network errors (not HTTP 401/409/500)

Mutations should NOT use `createQueryOptions()` - it's for queries only.

### Error Handling

Always use `extractErrorMessage(error)` then `toast.error(message)`. Don't duplicate error extraction logic.

### Toast Notifications

Use `sonner-native` directly. Wrap app in `GestureHandlerRootView` for gestures.

### Custom Hooks & Refactoring

Extract complex logic when: multiple related state, multiple effects, reusable logic, or complex business logic.

- **Global state:** Context (`lib/contexts/`)
- **Reusable logic:** Custom hook (`lib/hooks/`)

### Storage

- **AsyncStorage:** Non-sensitive data (profile, preferences) - group related data in single keys
- **SecureStore:** Sensitive data (tokens, API keys)

Use unified utilities in `lib/storage/`.

### Best Practices

- ✅ Match API schemas exactly (no transformation)
- ✅ Use `extractErrorMessage` for all errors
- ✅ Mutations: `createMutationRetry()`, not `createQueryOptions()`
- ✅ Extract complex logic to hooks/contexts
- ❌ Don't use `createQueryOptions()` for mutations
- ❌ Don't duplicate error extraction logic
- ❌ Don't put business logic in screen components

### When to Ask Questions

Use ask questions tool if unclear on:

- API module structure for new features
- Whether to use hook vs context
- Storage strategy for specific data types
