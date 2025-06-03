# Feature Flag System

## Overview

This feature flag system enables safe testing of new design components alongside existing ones, providing risk-free development and easy rollback capability.

## Environment Setup

Add the following to your `.env.local` file:

```bash
# Feature Flags
# Set to 'true' to use new design components, 'false' for existing components
NEXT_PUBLIC_USE_NEW_DESIGN=false
```

## Available Feature Flags

### `useNewDesign`
- **Purpose**: Controls whether to use new design components or existing ones
- **Default**: `false` (existing components)
- **Environment Variable**: `NEXT_PUBLIC_USE_NEW_DESIGN`
- **Development Override**: Available via localStorage and dev toggle

## Development Tools

### Design Toggle Component
In development mode, a floating toggle appears in the bottom-right corner that allows you to:
- Switch between old and new designs
- Persist preferences in localStorage
- Automatically reload to apply changes

### Error Boundary Protection
All new components are wrapped in error boundaries that:
- Catch component errors safely
- Fallback to existing components automatically
- Show detailed error info in development
- Log errors for debugging

## Usage

### In Components
```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { useNewDesign } = useFeatureFlags();
  
  return useNewDesign ? <NewComponent /> : <ExistingComponent />;
}
```

### Adding New Flags
```tsx
// In src/hooks/useFeatureFlags.ts
interface FeatureFlags {
  useNewDesign: boolean;
  useNewAnalytics: boolean; // Add new flag
}

// In the hook
return {
  useNewDesign,
  useNewAnalytics: process.env.NEXT_PUBLIC_USE_NEW_ANALYTICS === 'true',
};
```

## Safety Measures

1. **Default to existing**: All flags default to `false` to use existing components
2. **Error boundaries**: New components are wrapped in error boundaries
3. **Graceful fallbacks**: Always maintain working fallback to existing components
4. **Development only toggles**: Live toggling only works in development mode
5. **TypeScript safety**: All flags are properly typed

## Testing Workflow

1. **Development**: Use the dev toggle to switch between designs
2. **Staging**: Set environment variable to test new design
3. **Production**: Deploy with flag set to `false` initially
4. **Gradual rollout**: Enable flag when ready to ship new design
5. **Quick rollback**: Change environment variable to disable if issues arise

## Current Implementation

- ✅ **ContentLibrary**: Uses `useNewDesign` flag for content selection interface
- ✅ **Error boundaries**: Protect against new component failures
- ✅ **Dev tools**: Toggle component for easy testing
- ✅ **Documentation**: This file for team reference

## Future Extensions

The system is designed to be extensible for additional feature flags:
- New analytics system
- Experimental features
- A/B testing capabilities
- Performance monitoring toggles 