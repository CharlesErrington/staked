# Component Architecture

This project follows the Atomic Design methodology for organizing UI components.

## Structure

### Atoms
The smallest building blocks of our UI. These are basic HTML elements that can't be broken down further.
- Examples: Button, Input, Label, Icon, Badge

### Molecules
Simple groups of atoms functioning together as a unit.
- Examples: FormField (Label + Input), SearchBar (Input + Button), Card, ListItem

### Organisms
Complex components composed of molecules and/or atoms.
- Examples: Header, Form, Modal, Navigation, UserProfile

### Templates
Page-level objects that place components into a layout.
- Examples: AuthTemplate, DashboardTemplate, ProfileTemplate

## Component Guidelines

### Naming Conventions
- PascalCase for component names
- Descriptive names that indicate purpose
- Prefix with component type when ambiguous

### File Structure
```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   └── index.ts
├── molecules/
│   └── index.ts
├── organisms/
│   └── index.ts
└── templates/
    └── index.ts
```

### Component Composition
- Components should be pure and predictable
- Use TypeScript for all prop interfaces
- Provide default props where appropriate
- Document complex components with JSDoc

### Styling
- Use NativeWind/TailwindCSS classes
- Create variant props for different styles
- Support theme-aware styling
- Ensure accessibility standards