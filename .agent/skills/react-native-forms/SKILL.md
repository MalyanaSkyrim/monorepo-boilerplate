---
name: react-native-forms
description: Set up and handle React Native mobile forms with React Hook Form, Zod validation, submission, and error handling. Use ONLY for mobile applications, NOT for web applications.
---

# React Native Forms

Complete guide for mobile forms with React Hook Form and Zod validation.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when creating any form in mobile app
- Use when adding validation in mobile app
- Use when handling form submission and errors in mobile app

## Instructions

### Setup (3 Steps)

**Step 1: Install dependencies**

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

**Step 2: Create validation schema in `lib/validations/`**

```tsx
// lib/validations/auth.ts
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignInFormValues = z.infer<typeof signInSchema>
```

**Step 3: Initialize form with useForm**

```tsx
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const form = useForm<SignInFormValues>({
  resolver: zodResolver(signInSchema),
  defaultValues: { email: '', password: '' },
})
```

### Build Form UI

**Always use design system FormInput:**

```tsx
import { Form, FormInput, Button } from '@app/mobile-ui'

;<Form form={form} onSubmit={handleSubmit}>
  <FormInput
    name="email"
    control={form.control}
    label="Email"
    placeholder="Enter email"
    keyboardType="email-address"
    autoCapitalize="none"
  />

  <FormInput
    name="password"
    control={form.control}
    label="Password"
    secureTextEntry
  />

  <Button onPress={form.handleSubmit(handleSubmit)}>Submit</Button>
</Form>
```

### Form Submission

**With loading state:**

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (data: FormValues) => {
  setIsLoading(true)
  try {
    await submitAPI(data)
  } catch (error) {
    form.setError('root', { message: 'Something went wrong' })
  } finally {
    setIsLoading(false)
  }
}

;<Button onPress={form.handleSubmit(handleSubmit)} isLoading={isLoading}>
  Submit
</Button>
```

### Error Handling

**Form-level errors:**

```tsx
// Set error
form.setError('root', { message: 'Invalid credentials' })

// Display error
const rootError = form.formState.errors.root?.message
{
  rootError && <Text className="text-red-500">{rootError}</Text>
}
```

**Map API errors to fields:**

```tsx
catch (error) {
  if (error.response?.data?.errors) {
    Object.entries(error.response.data.errors).forEach(([field, message]) => {
      form.setError(field as keyof FormValues, {
        type: 'manual',
        message: message as string,
      });
    });
  } else {
    form.setError('root', { message: 'Unexpected error' });
  }
}
```

### Common Patterns

**Password toggle:**

```tsx
import { Eye, EyeOff } from 'lucide-react-native'

const [showPassword, setShowPassword] = useState(false)

;<FormInput
  name="password"
  control={form.control}
  secureTextEntry={!showPassword}
  rightIcon={showPassword ? Eye : EyeOff}
  onRightIconPress={() => setShowPassword(!showPassword)}
/>
```

**Conditional fields:**

```tsx
const userType = form.watch('userType')

{
  userType === 'business' && (
    <FormInput name="companyName" control={form.control} label="Company" />
  )
}
```

**Multi-step forms:**

```tsx
const [step, setStep] = useState(1)

const handleNext = async () => {
  const isValid = await form.trigger(['email', 'password'])
  if (isValid) setStep(2)
}

{
  step === 1 && (
    <>
      <FormInput name="email" control={form.control} />
      <Button onPress={handleNext}>Next</Button>
    </>
  )
}

{
  step === 2 && (
    <>
      <FormInput name="name" control={form.control} />
      <Button onPress={form.handleSubmit(handleSubmit)}>Submit</Button>
    </>
  )
}
```

**Reset form:**

```tsx
form.reset() // Reset to defaults
form.reset({ email: 'new@email.com' }) // Reset to specific values
```

### Common Validation Patterns

```tsx
// Required
field: z.string().min(1, 'Required')

// Email
email: z.string().email('Invalid email')

// Number range
age: z.number().min(18).max(120)

// Optional
bio: z.string().optional()

// Enum
role: z.enum(['user', 'admin'])

// Custom regex
username: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid username')

// Dependent validation
const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
```

### FormInput Props

**Required:**

- `name` - Field name matching schema
- `control` - Form control object

**Common:**

- `label` - Field label
- `placeholder` - Input placeholder
- `keyboardType` - `email-address`, `numeric`, `phone-pad`, `url`
- `secureTextEntry` - Password fields
- `autoCapitalize` - `none`, `words`, `sentences`
- `rightIcon` - Icon component
- `onRightIconPress` - Icon handler
- `multiline` - Textarea
- `numberOfLines` - Textarea height

### Quick Rules

✅ Define schemas in `lib/validations/`
✅ Use `zodResolver` with `useForm`
✅ Initialize all fields in `defaultValues`
✅ Use FormInput from design system
✅ Use `form.handleSubmit()` for submission
✅ Set loading states during API calls
✅ Handle both field and form-level errors
❌ Never create custom input components
❌ Never manually validate with useState
❌ Never skip error handling

### Common Issues

**Form not validating:**

- Check `resolver: zodResolver(schema)` is set
- Verify field `name` matches schema key

**Submit not working:**

- Use `form.handleSubmit(handler)` not just `handler`

**Errors not showing:**

- Ensure FormInput has `control` prop

**Default values ignored:**

- Set in `useForm` config, not after mount
- Initialize ALL fields (even optional as empty strings)

### When to Ask Questions

Use ask questions tool if unclear on:

- Specific validation rules
- API error response format
- Multi-step form flow details
