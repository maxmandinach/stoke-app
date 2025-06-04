# Development Guidelines

## TypeScript Build Strategy

### Problem
Previously, TypeScript build errors for "unused" imports/variables forced us to remove potentially useful code just to deploy, degrading the intended UX and breaking incremental development.

### Solution
We've implemented a development-friendly approach that maintains code quality while allowing for incremental feature development.

## Configuration Changes

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,     // Allow unused variables during development
    "noUnusedParameters": false  // Allow unused parameters during development
  }
}
```

**Benefits:**
- ✅ Prevents build failures from unused imports
- ✅ Allows incremental feature development
- ✅ Maintains strict type checking for actual safety issues
- ✅ Enables preparing code for upcoming features

## Development Best Practices

### 1. Import Management
```typescript
// ✅ GOOD: Keep imports for planned features with documentation
import { 
  PlayCircle, // For upcoming video play buttons
  Checkbox    // For planned bulk selection features
} from 'lucide-react';

// ❌ BAD: Removing imports just to fix build errors
// This breaks incremental development and planned UX improvements
```

### 2. Component Documentation
```typescript
/**
 * Component Name
 * 
 * CURRENT FEATURES:
 * - List implemented features
 * 
 * PLANNED FEATURES (imports prepared):
 * - PlayCircle: Video play functionality
 * - Checkbox: Bulk selection operations
 */
```

### 3. Parameter Handling
```typescript
// ✅ GOOD: Use underscore prefix for intentionally unused parameters
{items.map((item, _index) => (
  // _index signals "unused for now but may be needed later"
))}

// ✅ GOOD: Keep parameters that will be used in upcoming features
{items.map((item, index) => (
  // index will be used for alternating styles/animations
))}
```

### 4. Incremental Development
- **Plan ahead**: Import what you'll need for upcoming features
- **Document intent**: Explain why imports exist with comments
- **Staged implementation**: Build features incrementally without breaking builds
- **Preserve UX intent**: Don't sacrifice planned functionality for quick deploys

## Deployment Strategy

### Build Process
1. TypeScript compiles with unused import tolerance
2. ESLint can still warn about genuinely problematic unused code
3. Production builds focus on type safety, not artificial cleanliness
4. Features can be developed incrementally without constant import management

### Code Quality
- **Type Safety**: Maintained through strict TypeScript settings
- **Runtime Quality**: Ensured through testing and code review
- **UX Quality**: Preserved by not removing planned functionality
- **Development Velocity**: Improved by removing artificial build barriers

## When to Remove Imports

Only remove imports when:
- ✅ Feature is permanently cancelled
- ✅ Refactoring makes the import genuinely obsolete
- ✅ Import was added by mistake with no planned use

**Never remove imports just to fix build errors during active development.**

## Benefits of This Approach

1. **Better UX**: Planned features aren't accidentally removed
2. **Faster Development**: No constant import management overhead
3. **Cleaner Git History**: Fewer "fix build" commits that add no value
4. **Preserved Intent**: Original design vision stays intact
5. **Professional Quality**: Interface remains as sophisticated as intended

## Migration from Previous Approach

We've restored several imports that were removed for build fixes:
- `PlayCircle` - For video/audio content interactions
- `CheckSquare`/`Square` - For bulk selection features
- Various parameters - For upcoming styling and functionality

These are now properly implemented or documented for future implementation. 