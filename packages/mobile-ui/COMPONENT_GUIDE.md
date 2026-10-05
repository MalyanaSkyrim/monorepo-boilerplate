# Component Creation Guide For mobile only

Essential guide for creating React Native components from Figma designs.
The components wont never be used for web.

## Overview

Systematic approach to:

1. Analyzing Figma JSON design specifications
2. Creating React Native components that match the design
3. Implementing proper state management and styling

## Step 1: Analyze Figma JSON

Extract from the Figma JSON:

- **Component States**: All possible states (default, hover, active, disabled, error, focused, etc.)
- **Variants**: Size variants (sm, md, lg), style variants (primary, secondary)
- **Sub-components**: Child components (Label, Icon, Indicator, Text, Prefix, Suffix)
- **Styling Details**: Colors, spacing, typography, border radius, shadows, icon sizes

## Step 2: Plan Component Structure

Before implementation, define:

- **Props Interface**: All props with TypeScript types and JSDoc comments
- **State Management**: What state is internal vs controlled
- **Sub-components**: Which components are public vs internal
- **Controlled vs Uncontrolled**: How the component handles state

### Example Props Interface

```typescript
type IComponentProps = {
  /** Component state - varies by component type */
  state?: 'default' | 'active' | 'disabled' | 'error'
  /** Default state for uncontrolled component */
  defaultState?: 'default' | 'active' | 'disabled' | 'error'
  /** Callback when state changes */
  onChange?: (state: 'default' | 'active' | 'disabled' | 'error') => void
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether component is disabled */
  isDisabled?: boolean
  /** Whether component is in error state */
  isInvalid?: boolean
  /** Custom className */
  className?: string
}
```

## Step 3: Set Up Component Files

### Directory Structure

```
packages/mobile-ui/src/components/
└── YourComponent/
    ├── index.tsx
    └── YourComponent.stories.tsx
```

**Important**: Components are placed directly under `src/components/` without nested folders.

### File Template

```typescript
'use client'

import { createComponent } from '@gluestack-ui/core/component/creator'
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { View, Text, Pressable } from 'react-native'

const SCOPE = 'YOUR_COMPONENT'

cssInterop(View, { className: 'style' })
cssInterop(Text, { className: 'style' })

const Root = withStyleContext(Pressable, SCOPE)

const UIComponent = createComponent({
  Root: Root,
  // ... other sub-components
})

const componentStyle = tva({
  base: 'base-classes',
  variants: {
    size: { sm: '...', md: '...' },
    state: { default: '...', active: '...' },
    disabled: { true: '...', false: '...' },
  },
  defaultVariants: { size: 'md', state: 'default', disabled: false },
})

type IComponentProps = {
  // ... props definition
}

const Component = React.forwardRef<..., IComponentProps>(
  function Component({ ...props }, ref) {
    // Implementation
  }
)

export { Component }
```

## Step 4: Implement Styling

### Using Tailwind Variants (tva)

```typescript
const componentStyle = tva({
  base: 'common-classes-for-all-variants',
  variants: {
    size: {
      sm: 'h-4 w-4 text-sm',
      md: 'h-5 w-5 text-base',
      lg: 'h-6 w-6 text-lg',
    },
    state: {
      default: 'bg-white border-greyscale-200',
      active: 'bg-primary-300 border-primary-300',
      disabled: 'bg-greyscale-50 border-greyscale-100',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  compoundVariants: [
    {
      state: 'active',
      disabled: true,
      class: 'bg-greyscale-50 border-greyscale-100',
    },
  ],
  defaultVariants: {
    size: 'md',
    state: 'default',
    disabled: false,
  },
})
```

### Variants vs Data Attributes

**Use variants for:**

- Props-based state: `disabled`, `size`, `variant`
- Component-controlled state: Pass through context

**Use data attributes for:**

- Gluestack-managed state: `data-[checked=true]`, `data-[focus=true]`, `data-[hover=true]`
- Automatically set by creator functions

**Combine both:**

```typescript
compoundVariants: [
  {
    disabled: true,
    class: 'data-[checked=true]:bg-greyscale-50',
  },
]
```

## Step 5: Implement State Management

### Controlled vs Uncontrolled Pattern

```typescript
const Component = ({ state, defaultState, onChange, ...props }) => {
  const isControlled = state !== undefined
  const [uncontrolledState, setUncontrolledState] = useState(
    defaultState ?? 'default'
  )
  const currentState = isControlled ? state : uncontrolledState

  const handleChange = (newState) => {
    if (isControlled) {
      onChange?.(newState)
    } else {
      setUncontrolledState(newState)
      onChange?.(newState)
    }
  }

  return (
    <UIComponent
      context={{ size, state: currentState, disabled }}
      {...props}
    />
  )
}
```

### State Management Rules

1. **Single Source of Truth**: State managed in ONE place (root component)
2. **Context for Sharing**: Pass state through context, never as props to children
3. **No Duplicate State**: Don't maintain the same state in parent and child
4. **Child Components**: Read state from context using `useStyleContext(SCOPE)`

```typescript
// ❌ BAD: Passing state as prop
<ChildComponent state={currentState} />

// ✅ GOOD: Passing through context
<UIComponent context={{ state: currentState }}>
  <ChildComponent /> {/* Reads from context */}
</UIComponent>
```

## Step 6: Implement Sub-components

```typescript
const ChildComponent = React.forwardRef<..., IChildProps>(
  function ChildComponent({ className, ...props }, ref) {
    const { size, state, disabled } = useStyleContext(SCOPE)

    return (
      <UIComponent.Child
        className={childStyle({
          parentVariants: { size },
          state,
          disabled,
          class: className,
        })}
        {...props}
        ref={ref}
      />
    )
  }
)
```

### Auto-rendering Sub-components

```typescript
const Indicator = ({ children, ...props }) => {
  const { state } = useStyleContext(SCOPE)
  const shouldAutoRender = !children || React.Children.count(children) === 0

  let iconToRender = null
  if (shouldAutoRender) {
    // Render appropriate icon based on state
    if (state === 'active') {
      iconToRender = <Icon as={ActiveIcon} />
    } else {
      iconToRender = <Icon as={DefaultIcon} />
    }
  }

  return (
    <UIComponent.Indicator {...props}>
      {iconToRender}
      {children}
    </UIComponent.Indicator>
  )
}
```

## Step 7: Handle Special Cases

### Focus Outlines

React Native doesn't support multiple box-shadows. Use an additional View:

```typescript
const Field = ({ isFocused, ...props }) => {
  return (
    <View className="relative">
      {isFocused && (
        <View
          className="border-primary-300 absolute inset-0 -m-[3px] border-2 opacity-15"
          style={{ borderRadius: borderRadius + 3 }}
        />
      )}
      <TextInput {...props} />
    </View>
  )
}
```

### Icon Positioning

```typescript
const Field = ({ leftIcon, rightIcon, size }) => {
  const inputHeight = size === 'sm' ? 40 : 48
  const iconSize = size === 'sm' ? 20 : 24
  const iconTop = (inputHeight - iconSize) / 2

  return (
    <View className="relative">
      {leftIcon && (
        <Icon className="absolute z-10" style={{ left: 12, top: iconTop }} />
      )}
      <TextInput />
    </View>
  )
}
```

## Step 8: Create Storybook Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react-native'
import { Component, ComponentLabel } from '.'

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Component>

export const Default: Story = {
  render: () => (
    <Component>
      <ComponentLabel>Default Component</ComponentLabel>
    </Component>
  ),
}

export const AllStates: Story = {
  render: () => (
    <View className="gap-4">
      <Component state="default">
        <ComponentLabel>Default</ComponentLabel>
      </Component>
      <Component state="active">
        <ComponentLabel>Active</ComponentLabel>
      </Component>
      <Component state="disabled" isDisabled>
        <ComponentLabel>Disabled</ComponentLabel>
      </Component>
    </View>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [state, setState] = useState('default')
    return (
      <Component state={state} onChange={setState}>
        <ComponentLabel>Controlled (Current: {state})</ComponentLabel>
      </Component>
    )
  },
}
```

## Step 9: Export Component

Add to `src/index.ts`:

```typescript
export {
  Component,
  ComponentLabel,
  ComponentIcon,
  // ... other public sub-components
} from './components/Component'
```

**Note**: Only export public sub-components. Internal components should not be exported.

## Common Patterns

### Multi-state Component

```typescript
type ComponentState = 'default' | 'active' | 'disabled' | 'error'

const Component = ({ state, defaultState, onChange, ...props }) => {
  const isControlled = state !== undefined
  const [uncontrolledState, setUncontrolledState] = useState(
    defaultState ?? 'default'
  )
  const currentState = isControlled ? state : uncontrolledState

  // Convert to Gluestack format if needed
  // Check Gluestack UI documentation for your component type
  const gluestackProps = {
    // Map your state to Gluestack props
  }

  return (
    <UIComponent
      {...gluestackProps}
      context={{ size, state: currentState }}
      {...props}
    />
  )
}
```

### Group Components

```typescript
const ComponentGroup = ({ value, onChange, children, ...props }) => {
  // value type depends on component (string for Radio, string[] for Checkbox, etc.)
  return (
    <UIComponent.Group
      {...(value !== undefined && { value })}
      {...(onChange !== undefined && { onChange })}
      {...props}
    >
      {children}
    </UIComponent.Group>
  )
}
```

## Best Practices

### Component Structure

- ✅ Use `React.forwardRef` for all components
- ✅ Set `displayName` for debugging
- ✅ Use TypeScript, avoid `any` types
- ✅ Use `VariantProps<typeof styleFunction>` for variant props
- ✅ Define context types explicitly to avoid type assertions

### Styling

- ✅ Use `tva` for all style variants
- ✅ Define `defaultVariants` for sensible defaults
- ✅ Use `compoundVariants` for complex combinations
- ✅ Reference design tokens from Figma
- ✅ Use semantic class names (e.g., `bg-primary-300` not `bg-blue-500`)
- ✅ Use `disabled` variant instead of `data-[disabled=true]`
- ✅ Keep data attributes for Gluestack-managed states

### State Management

- ✅ Manage state in root component only
- ✅ Pass state through context, never as props
- ✅ Support both controlled and uncontrolled modes
- ✅ Use `React.useMemo` for context values with actual state in dependencies
- ✅ Single source of truth - no duplicate state

### TypeScript

- ✅ Avoid type assertions (`as`) - define proper types
- ✅ Avoid `any` types - use `Partial<>`, `Record<>`, or specific types
- ✅ Use proper prop types extending React Native component props
- ✅ Use `VariantProps` for variant typing
- ✅ Define context types explicitly

## Common Mistakes to Avoid

1. ❌ **Extracting state from data attributes in React Native**: Data attributes only work on web. Use props and context instead.
2. ❌ **Using internal state when component is controlled**: If state prop is provided, use it directly.
3. ❌ **Passing state as props to child components**: Always pass through context.
4. ❌ **Using data attributes for prop-based state**: Use variants for state from props (like `disabled`).
5. ❌ **Not handling controlled/uncontrolled modes**: Always detect and handle both modes.
6. ❌ **State synchronization issues**: Don't sync props to internal state when controlled.
7. ❌ **Forgetting to set required props for Gluestack**: Check Gluestack UI documentation for required prop combinations.

## Troubleshooting

1. **Styles not applying**: Ensure `cssInterop` is called before using components
2. **Context not working**: Verify SCOPE is unique and `withStyleContext`/`useStyleContext` use same SCOPE
3. **State not updating**: Ensure state is managed internally and passed via context, not props
4. **Indicator/Icon not showing**: Check Gluestack UI documentation for required prop combinations
5. **Navigation context errors**: Use Gluestack UI creator functions instead of directly using `withStyleContext` on base components
6. **Type errors with conditional props**: Use conditional spreading: `{...(value && { value })}`

## Reference Implementations

See these examples:

- **Input Component**: `packages/mobile-ui/src/components/Input/index.tsx`
- **Button Component**: `packages/mobile-ui/src/components/Button/index.tsx`
- **Checkbox Component**: `packages/mobile-ui/src/components/Checkbox/index.tsx`
- **Radio Component**: `packages/mobile-ui/src/components/Radio/index.tsx`

These demonstrate:

- Analyzing Figma JSON and extracting requirements
- Using Gluestack UI creator functions
- Complex variant systems
- Internal state management (state never passed as props)
- Controlled/uncontrolled component patterns
- Multi-state components
- Sub-component composition
- Proper context usage
