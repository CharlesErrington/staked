# Styling Architecture Guide

## Overview
This project uses NativeWind (TailwindCSS for React Native) as the primary styling solution, with support for dark mode and responsive design.

## Core Principles

### 1. Utility-First
- Use TailwindCSS utility classes for styling
- Avoid inline styles unless absolutely necessary
- Compose utilities for complex styles

### 2. Component Variants
- Define variants as props (size, variant, state)
- Use consistent naming across components
- Document available variants

### 3. Dark Mode Support
- Use dark: prefix for dark mode styles
- Ensure all components support both themes
- Test components in both light and dark modes

## Naming Conventions

### Class Names
```tsx
// ✅ Good - Logical grouping
className="flex flex-row items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 rounded-lg"

// ❌ Bad - Random ordering
className="bg-white px-4 flex rounded-lg dark:bg-gray-900 py-2 items-center flex-row justify-between"
```

### Order of Classes
1. Layout (flex, grid, position)
2. Spacing (padding, margin)
3. Sizing (width, height)
4. Typography (font, text)
5. Colors (background, text, border)
6. Effects (shadow, opacity, transition)
7. Dark mode variants
8. Responsive variants

## Component Patterns

### Base Component Structure
```tsx
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string; // For composition
}

const Component = ({ variant = 'primary', size = 'md', className = '' }) => {
  const baseStyles = 'base classes here';
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];
  
  return (
    <View className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}>
      {/* Content */}
    </View>
  );
};
```

### Variant Maps
```tsx
const variants = {
  primary: 'bg-orange-500 text-white',
  secondary: 'bg-calm-blue-500 text-white',
  ghost: 'bg-transparent border border-gray-300 text-gray-700'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};
```

## Responsive Design

### Breakpoints
- Default: Mobile-first approach
- sm: 640px and up
- md: 768px and up
- lg: 1024px and up
- xl: 1280px and up

### Usage
```tsx
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Dark Mode

### Implementation
```tsx
// In components
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"

// Complex dark mode
className={`
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  text-gray-900 dark:text-gray-100
  hover:bg-gray-50 dark:hover:bg-gray-800
`}
```

## Animation Classes

### Predefined Animations
- `animate-fade-in`: Fade in effect
- `animate-slide-up`: Slide up from bottom
- `animate-pulse-soft`: Gentle pulsing

### Transitions
```tsx
className="transition-all duration-200 ease-in-out"
className="transition-colors duration-150"
className="transition-transform duration-300"
```

## Color System

### Semantic Colors
- Primary: `text-orange-500`, `bg-orange-500`
- Secondary: `text-calm-blue-500`, `bg-calm-blue-500`
- Success: `text-success`, `bg-success`
- Warning: `text-warning`, `bg-warning`
- Error: `text-error`, `bg-error`
- Info: `text-info`, `bg-info`

### Text Colors
- Primary: `text-text-primary` (adaptive)
- Secondary: `text-text-secondary` (adaptive)
- Muted: `text-gray-500 dark:text-gray-400`

## Spacing Scale

### Standard Spacing
- `p-1` (4px)
- `p-2` (8px)
- `p-3` (12px)
- `p-4` (16px)
- `p-6` (24px)
- `p-8` (32px)

### Custom Spacing
- `p-18` (72px)
- `p-88` (352px)
- `p-128` (512px)

## Border Radius

### Standard Radii
- `rounded` (0.25rem)
- `rounded-lg` (0.5rem)
- `rounded-xl` (1rem)
- `rounded-2xl` (1.5rem)
- `rounded-3xl` (2rem)
- `rounded-full` (9999px)

## Shadows

### Custom Shadows
- `shadow-soft`: Subtle shadow
- `shadow-medium`: Medium depth
- `shadow-large`: Deep shadow
- `shadow-glow`: Orange glow effect

## Performance Guidelines

### Do's
- Use NativeWind classes for all styling
- Leverage style composition
- Reuse variant maps
- Memoize style calculations when needed

### Don'ts
- Avoid StyleSheet.create for new components
- Don't use inline style objects
- Avoid dynamic class generation in render
- Don't mix styling approaches

## Testing Styles

### Checklist
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] All variants display properly
- [ ] Responsive breakpoints work
- [ ] Animations are smooth
- [ ] Touch targets meet minimum size (44x44)
- [ ] Text remains readable in all states

## Migration from StyleSheet

When migrating from StyleSheet to NativeWind:

1. Identify StyleSheet definitions
2. Map styles to Tailwind utilities
3. Convert to className prop
4. Test all variants and states
5. Remove old StyleSheet code

Example:
```tsx
// Before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  }
});

// After
className="flex-1 p-4 bg-white dark:bg-gray-900"
```