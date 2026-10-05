---
name: react-native-figma-conversion
description: Convert Figma designs to React Native code with proper spacing, typography, and NativeWind class mapping. Use ONLY for mobile applications, NOT for web applications.
---

# React Native Figma Conversion

Convert Figma design values to React Native code with NativeWind.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when implementing mobile screens from Figma
- Use when translating design specs to mobile code
- Use when unsure about spacing/typography mapping in mobile app

## Instructions

### Figma to NativeWind Mapping

**Spacing (Padding/Margin):**

| Figma Value | NativeWind      | Inline Style      |
| ----------- | --------------- | ----------------- |
| 4px         | `p-1` / `m-1`   | `{ padding: 4 }`  |
| 8px         | `p-2` / `m-2`   | `{ padding: 8 }`  |
| 12px        | `p-3` / `m-3`   | `{ padding: 12 }` |
| 16px        | `p-4` / `m-4`   | `{ padding: 16 }` |
| 20px        | `p-5` / `m-5`   | `{ padding: 20 }` |
| 24px        | `p-6` / `m-6`   | `{ padding: 24 }` |
| 32px        | `p-8` / `m-8`   | `{ padding: 32 }` |
| 48px        | `p-12` / `m-12` | `{ padding: 48 }` |

**Directional spacing:**

| Figma                 | NativeWind | Inline                      |
| --------------------- | ---------- | --------------------------- |
| paddingLeft: 16       | `pl-4`     | `{ paddingLeft: 16 }`       |
| paddingRight: 16      | `pr-4`     | `{ paddingRight: 16 }`      |
| paddingTop: 16        | `pt-4`     | `{ paddingTop: 16 }`        |
| paddingBottom: 16     | `pb-4`     | `{ paddingBottom: 16 }`     |
| paddingHorizontal: 24 | `px-6`     | `{ paddingHorizontal: 24 }` |
| paddingVertical: 16   | `py-4`     | `{ paddingVertical: 16 }`   |

**Gap (Stack spacing):**

| Figma         | NativeWind | Inline              |
| ------------- | ---------- | ------------------- |
| gap: 8        | `gap-2`    | `{ gap: 8 }`        |
| gap: 12       | `gap-3`    | `{ gap: 12 }`       |
| gap: 16       | `gap-4`    | `{ gap: 16 }`       |
| gap: 24       | `gap-6`    | `{ gap: 24 }`       |
| rowGap: 16    | `gap-y-4`  | `{ rowGap: 16 }`    |
| columnGap: 16 | `gap-x-4`  | `{ columnGap: 16 }` |

### Typography

**Font sizes:**

| Figma | NativeWind  | Inline             |
| ----- | ----------- | ------------------ |
| 12px  | `text-xs`   | `{ fontSize: 12 }` |
| 14px  | `text-sm`   | `{ fontSize: 14 }` |
| 16px  | `text-base` | `{ fontSize: 16 }` |
| 18px  | `text-lg`   | `{ fontSize: 18 }` |
| 20px  | `text-xl`   | `{ fontSize: 20 }` |
| 24px  | `text-2xl`  | `{ fontSize: 24 }` |
| 30px  | `text-3xl`  | `{ fontSize: 30 }` |

**Font weights:**

| Figma          | NativeWind      |
| -------------- | --------------- |
| 400 (Regular)  | `font-normal`   |
| 500 (Medium)   | `font-medium`   |
| 600 (Semibold) | `font-semibold` |
| 700 (Bold)     | `font-bold`     |

**Text alignment:**

| Figma  | NativeWind    |
| ------ | ------------- |
| Left   | `text-left`   |
| Center | `text-center` |
| Right  | `text-right`  |

### Layout

**Width/Height:**

| Figma        | NativeWind | Inline               |
| ------------ | ---------- | -------------------- |
| width: 100%  | `w-full`   | `{ width: '100%' }`  |
| height: 100% | `h-full`   | `{ height: '100%' }` |
| width: 48px  | `w-12`     | `{ width: 48 }`      |
| height: 48px | `h-12`     | `{ height: 48 }`     |

**Flexbox:**

| Figma                  | NativeWind                    |
| ---------------------- | ----------------------------- |
| Auto Layout Vertical   | `flex flex-col`               |
| Auto Layout Horizontal | `flex flex-row`               |
| Space Between          | `justify-between`             |
| Centered               | `items-center justify-center` |
| flex: 1                | `flex-1`                      |

**Border radius:**

| Figma         | NativeWind     | Inline                   |
| ------------- | -------------- | ------------------------ |
| 4px           | `rounded`      | `{ borderRadius: 4 }`    |
| 8px           | `rounded-lg`   | `{ borderRadius: 8 }`    |
| 12px          | `rounded-xl`   | `{ borderRadius: 12 }`   |
| 16px          | `rounded-2xl`  | `{ borderRadius: 16 }`   |
| Full (9999px) | `rounded-full` | `{ borderRadius: 9999 }` |

### Colors

**Use design system colors:**

```tsx
// From Figma color names
<View className="bg-primary-500" />
<Text className="text-gray-700" />
<View className="border-gray-200" />
```

**Common patterns:**

| Purpose        | NativeWind                      |
| -------------- | ------------------------------- |
| Background     | `bg-white` `bg-gray-50`         |
| Text           | `text-gray-900` `text-gray-600` |
| Border         | `border-gray-200`               |
| Primary button | `bg-primary-500`                |
| Disabled       | `bg-gray-300`                   |

### Conversion Examples

**Figma component:**

```
Frame "Sign In Button"
  width: 100%
  height: 48
  paddingHorizontal: 24
  paddingVertical: 12
  backgroundColor: #3B82F6
  borderRadius: 8

  Text "Sign In"
    fontSize: 16
    fontWeight: 600
    color: #FFFFFF
```

**React Native code:**

```tsx
<TouchableOpacity className="h-12 w-full items-center justify-center rounded-lg bg-blue-500 px-6 py-3">
  <Text className="text-base font-semibold text-white">Sign In</Text>
</TouchableOpacity>
```

**Figma layout:**

```
Auto Layout Vertical
  gap: 16
  paddingHorizontal: 24
  paddingVertical: 32
```

**React Native code:**

```tsx
<View className="gap-4 px-6 py-8">{/* Children */}</View>
```

### When to Use NativeWind vs Inline

**Use NativeWind when:**

- Value is static
- Matches Tailwind scale
- No calculation needed

**Use inline style when:**

- Value is dynamic (from state/props)
- Calculation required (safe area + offset)
- Non-standard value (e.g., 17px)

**Example:**

```tsx
// Static - Use NativeWind
<View className="px-6 py-4 bg-white" />

// Dynamic - Use inline
<View style={{ marginTop: topPadding + 16 }} />

// Mixed
<View className="px-6 bg-white" style={{ paddingTop: topPadding }} />
```

### Common Patterns

**Card component:**

```tsx
<View className="rounded-xl border border-gray-200 bg-white p-4">
  {/* Content */}
</View>
```

**Input container:**

```tsx
<View className="rounded-lg border border-gray-300 px-4 py-3">
  <TextInput className="text-base" />
</View>
```

**Button:**

```tsx
<TouchableOpacity className="bg-primary-500 rounded-lg px-6 py-3">
  <Text className="text-base font-semibold text-white">Label</Text>
</TouchableOpacity>
```

### Quick Rules

✅ Prefer NativeWind for static values
✅ Use inline for dynamic/calculated values
✅ Check design system for existing components
✅ Match Figma spacing exactly
✅ Use design system color names
❌ Don't hardcode pixel values without checking scale
❌ Don't use arbitrary values in NativeWind (e.g., `p-[17px]`)
❌ Don't ignore design system components

### When to Ask Questions

Use ask questions tool if unclear on:

- Custom color mappings
- Non-standard spacing values
- Complex layout requirements
- Design system component availability
