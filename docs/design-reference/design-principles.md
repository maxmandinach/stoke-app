# Stoke Design Upgrade Principles

Based on Lovable's implementation, targeting a clean productivity app aesthetic.

## Visual Direction
- Clean, minimal design (Linear/Notion style)
- Light backgrounds with purposeful color accents
- Professional typography hierarchy
- No giant meaningless icons
- Premium learning app feel that users trust

## Color Palette
- Primary: Blue gradients (blue-500 to blue-600)
- Success: Green (green-500) for progress indicators
- Backgrounds: Clean whites (bg-white) and light grays (bg-gray-50)
- Text: Gray-900 for primary headings, Gray-600 for secondary text
- Borders: Gray-200 for subtle divisions
- Selected states: Blue-100 backgrounds with blue-500 borders

## Typography Hierarchy
- Large titles: text-2xl font-bold
- Section headers: text-xl font-semibold
- Body text: text-base
- Secondary text: text-sm text-gray-600
- Metadata: text-xs text-gray-500

## Key UX Improvements Over Current Design
- Proper brand identity with clean logo (no more Memory Waves confusion)
- No accidental navigation (explicit "Continue" CTAs only)
- Thumb-friendly touch targets (44px minimum for mobile)
- Clear information hierarchy (titles prominent, metadata secondary)
- Sticky selection summaries with action buttons
- Professional progress indicators (no confusing circular waves)
- Consistent spacing using Tailwind scale
- Clean search and filtering interfaces

## Component Design Patterns

### Headers
- Sticky positioning with white background
- Logo on left, back button when needed
- Clean typography for page titles
- Optional right actions slot

### Content Cards
- White background with subtle gray borders
- Clear selection states with blue accents
- Proper spacing and readability
- Progress indicators that make sense
- Content type indicators (not dominant)

### Buttons
- Multiple variants: primary (blue), secondary (gray), ghost (transparent)
- Proper sizing: sm, md, lg with consistent padding
- Hover and focus states
- Disabled states

### Navigation Flow
- Always clear how to go back
- Explicit forward progression
- No surprise redirects or auto-navigation

## Mobile Optimization
- Touch targets minimum 44px
- Proper thumb zones for primary actions
- Readable text sizes
- Adequate spacing between interactive elements
- Responsive layout that works on all screen sizes

## Accessibility Standards
- Proper contrast ratios
- Focus indicators for keyboard navigation
- Screen reader friendly markup
- Semantic HTML structure
- ARIA labels where needed
