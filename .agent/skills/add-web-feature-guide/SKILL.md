---
name: add-web-feature-guide
description: Guidelines and best practices for building features in Next.js web applications (apps/web) with next-intl, @app/ui component reuse, named constant handlers, accessibility, and modular refactoring. Use ONLY for web applications, NOT for mobile.
---

# Web Feature Guide (Next.js & @app/ui)

Standard workflow and rules for implementing web features in `apps/web`.

## When to Use

- Use ONLY for web applications (`apps/web`, `packages/ui`)
- Do NOT use for mobile applications (`apps/mobile`, `packages/mobile-ui`)
- Use when building new web pages, tabs, modals, or web features
- Use when refactoring web components

---

## Core Guidelines

### 1. Internationalization (`next-intl`)

- **Never hardcode user-facing strings.**
- Always use `useTranslations('namespace')` for text and `useLocale()` for locale-aware formatting.
- **Maintain locale parity:** When adding or updating a translation key, update all locale files (`en.json`, `fr.json`, etc.) synchronously.
- **Strictly typed keys:** Never cast `t('key' as any)`. Translation keys are auto-derived from the JSON shape.
- Use locale-aware formatters:
  ```tsx
  const locale = useLocale()
  const formatDate = useCallback(
    (date: Date) =>
      new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(date)),
    [locale],
  )
  ```

---

### 2. Event Handlers & Callback Props

- **Never use inline arrow functions directly in JSX props** (e.g. `onClick={() => setOpen(true)}` or `onValueChange={(val) => setTab(val)}`).
- **Always declare named constant handlers above the `return` statement** using `useCallback` and pass the function reference directly:

  ```tsx
  // ✅ GOOD: Declared above return statement
  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  return (
    <div>
      <Button type="button" onClick={handleOpenDialog}>
        {t('open_button')}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        ...
      </Dialog>
    </div>
  )
  ```

---

### 3. Reuse Components from `@app/ui`

- **Always reuse existing design system components** from `@app/ui`:
  - `DataTable`, `DataList`
  - `Button`, `Card`, `CardContent`, `CardHeader`, `CardTitle`
  - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
  - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
  - `Skeleton` (`Skeleton.Root`, `Skeleton.Row`, `Skeleton.Avatar`, `Skeleton.Button`, etc.)
- **Compound Components:** Always render subcomponents inside their respective context wrapper (e.g., `<Skeleton.Root>` wraps `<Skeleton.Row>`, `<Skeleton.Avatar>`).

---

### 4. Accessibility (a11y)

- **Keyboard Navigation:** Ensure all interactive custom elements support keyboard navigation (`tabIndex={0}`, `role="button"`, and `onKeyDown` with `Enter` and `Space` detection).
- **Interactive Guards:** When attaching row/container click handlers, guard against nested interactive elements (buttons, links, inputs, checkboxes, dropdown items) so clicking child actions does not trigger parent container navigation.
- **Labels & ARIA:**
  - Provide accessible names for icon-only buttons (`aria-label` or `<span className="sr-only">Label</span>`).
  - Use semantic HTML (`<main>`, `<header>`, `<nav>`, `<h1>` heading hierarchy).
  - Use `aria-describedby` and `aria-invalid` for form error states.
- **Modal Dialogs:** Ensure `DialogFooter` provides consistent spacing (`gap-3`) between action buttons.

---

### 5. Component Refactoring & Architecture

- **Granular Data Fetching:** Each dashboard/overview card or tab section should fetch its own data using its own dedicated query and display its own loading skeleton.
- **Single Responsibility:** Break large screens (> 100-150 lines) into focused subcomponents placed in a local `components/` folder with a barrel export (`index.ts`).
- **Strict TypeScript:**
  - Zero `any` and zero type assertions (`as X`).
  - Use discriminated unions, narrowing, and `satisfies` operator.

---

### 6. Styling & Class Merging (`classMerge`)

- **Always use `classMerge` instead of `cn`** when combining Tailwind class names:

  ```tsx
  // ✅ GOOD: Standard class merging utility
  import { classMerge } from '@app/ui/lib/utils' // or '../../lib/utils' inside @app/ui

  <div className={classMerge('flex items-center gap-2', className)}>
  ```

- **Never import or define `cn`.** The design system standardizes on `classMerge` (`twMerge(clsx(...))`).
