# Stoke: UI Styling & Aesthetic Guide

## Design Philosophy

### Visual Principles
Stoke's interface embodies **calm intelligence** - a design that feels thoughtful, spacious, and respectful of users' cognitive space. We avoid the attention-grabbing patterns of social media and instead create an environment that supports deep thinking and reflection.

### Core Aesthetic Values
- **Breathing Room**: Generous white space that gives content room to be absorbed
- **Subtle Intelligence**: AI assistance that feels helpful rather than intrusive
- **Honest Feedback**: Visual cues that inform without manipulating
- **Focused Attention**: Clear hierarchy that guides users without overwhelming

---

## Color Palette

### Primary Colors
```
Primary Blue: #2563EB (RGB: 37, 99, 235)
- Used for: Primary actions, progress indicators, selected states
- Usage: Start Review button, active selections, key interactive elements

Deep Navy: #1E293B (RGB: 30, 41, 59)
- Used for: Primary text, headers, important information
- Usage: Main content text, episode titles, key insights

Soft Gray: #64748B (RGB: 100, 116, 139)
- Used for: Secondary text, metadata, supporting information
- Usage: Timestamps, episode descriptions, hint text
```

### Background Colors
```
Pure White: #FFFFFF
- Primary background for main content areas

Light Gray: #F8FAFC (RGB: 248, 250, 252)
- Secondary background for sections, cards, input fields

Warm White: #FEFEFE (RGB: 254, 254, 254)
- Subtle background variation for layered content
```

### Feedback Colors
```
Success Green: #059669 (RGB: 5, 150, 105)
- Used for: Positive feedback, completion states
- Usage: "Got it!" responses, successful processing

Warning Amber: #D97706 (RGB: 217, 119, 6)
- Used for: Caution states, processing indicators
- Usage: "Still working on this" feedback, loading states

Subtle Red: #DC2626 (RGB: 220, 38, 38)
- Used for: Dismissal actions, removal states
- Usage: "Don't show me this again" feedback, error states

Neutral Purple: #7C3AED (RGB: 124, 58, 237)
- Used for: AI-generated content, system insights
- Usage: AI confidence indicators, processing status
```

---

## Typography

### Font Selection
**Primary Font**: System font stack for optimal performance and familiarity
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Type Scale (Mobile-Optimized)
```
Display: 28px, 32px line-height, 600 weight
- Used for: Main page headers, key section titles

Title: 22px, 28px line-height, 600 weight
- Used for: Episode titles, content headers

Subtitle: 18px, 24px line-height, 500 weight
- Used for: Section headers, important secondary text

Body: 16px, 24px line-height, 400 weight
- Used for: Main content text, descriptions, insights

Caption: 14px, 20px line-height, 400 weight
- Used for: Metadata, timestamps, supporting information

Small: 12px, 16px line-height, 400 weight
- Used for: Helper text, legal copy, fine print
```

### Reading Optimization
- **Line height**: 1.5x font size minimum for comfortable reading
- **Paragraph spacing**: 16px between paragraphs
- **Content width**: Maximum 65 characters per line for optimal readability
- **Text contrast**: Minimum 4.5:1 ratio for all body text

---

## Spacing & Layout

### Spacing Scale (8px Grid System)
```
XS: 4px   - Tight spacing within components
SM: 8px   - Component internal spacing
MD: 16px  - Standard content spacing
LG: 24px  - Section spacing
XL: 32px  - Major section breaks
2XL: 48px - Page-level spacing
3XL: 64px - Large layout separations
```

### Mobile Layout Principles
- **Touch Targets**: Minimum 44px height for all interactive elements
- **Thumb Zone**: Primary actions positioned within natural thumb reach
- **Edge Spacing**: Minimum 16px margins from screen edges
- **Content Blocks**: 16px spacing between related content groups

### Component Spacing Standards
```
Cards: 16px internal padding, 8px between cards
Buttons: 12px vertical, 16px horizontal internal padding
Form Fields: 12px internal padding, 8px between fields
List Items: 16px vertical padding, 8px between items
```

---

## Components & Patterns

### Button Styles

**Primary Button**
```css
background: #2563EB
color: white
border-radius: 8px
padding: 12px 16px
font-weight: 500
min-height: 44px
```

**Secondary Button**
```css
background: transparent
color: #2563EB
border: 1px solid #2563EB
border-radius: 8px
padding: 12px 16px
font-weight: 500
min-height: 44px
```

**Tertiary Button**
```css
background: transparent
color: #64748B
border: none
padding: 12px 16px
font-weight: 400
min-height: 44px
```

### Card Design
```css
background: white
border-radius: 12px
padding: 16px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
border: 1px solid #F1F5F9
```

### Input Fields
```css
background: #F8FAFC
border: 1px solid #E2E8F0
border-radius: 8px
padding: 12px
font-size: 16px
min-height: 44px
```

### Selection States
```css
/* Unselected */
border: 1px solid #E2E8F0
background: white

/* Selected */
border: 2px solid #2563EB
background: #EFF6FF
```

---

## Interaction Design

### Animation Principles
- **Subtle Movement**: 200-300ms duration for most transitions
- **Easing**: Use `ease-out` for entrances, `ease-in` for exits
- **Purpose-Driven**: Animations guide attention, don't distract
- **Performance**: Prefer transform and opacity changes over layout shifts

### Micro-Interactions
```css
/* Button hover/tap */
transition: all 200ms ease-out
transform: translateY(-1px) on hover
background opacity: 0.9 on press

/* Card selection */
transition: all 150ms ease-out
scale: 1.02 on selection
border-color change: 150ms

/* Loading states */
skeleton shimmer: 1.5s infinite ease-in-out
progress bars: smooth width transitions
```

### Touch Feedback (Mobile Web)
- **Immediate Visual Response**: Show touch state within 100ms using CSS :active pseudo-class
- **Visual Feedback Only**: No haptic feedback available in mobile web browsers
- **Touch Highlight Prevention**: `-webkit-tap-highlight-color: transparent` for custom touch states
- **Error Prevention**: Visual feedback before destructive actions
- **Success Confirmation**: Subtle positive feedback for completions

---

## Content Presentation

### AI Content Styling
```css
/* AI-generated insights */
border-left: 3px solid #7C3AED
padding-left: 12px
background: #FAFAFA
font-style: italic (subtle indication of AI origin)

/* Confidence indicators */
Low confidence: border-left: #D97706
High confidence: border-left: #059669
```

### Progress Indicators
```css
/* Session progress */
height: 4px
background: #E2E8F0
fill: #2563EB
border-radius: 2px

/* Processing status */
circular progress with percentage
color: #7C3AED for AI processing
smooth animation: 300ms ease-out
```

### Content Hierarchy
- **Primary Content**: Full contrast, standard sizing
- **Secondary Content**: 80% opacity, smaller sizing
- **Metadata**: 60% opacity, caption sizing
- **AI Indicators**: Purple accent, subtle styling

---

## Mobile-Specific Considerations

## Mobile Web Specific Considerations

### PWA Interface Elements

**Status Bar Integration**
```css
/* Ensure content doesn't overlap status bar */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

**Add to Home Screen Prompt**
```css
/* Install prompt styling */
.install-prompt {
  background: #EFF6FF;
  border: 1px solid #2563EB;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 1000;
}
```

**Offline State Indicators**
```css
/* Offline banner */
.offline-indicator {
  background: #FEF3C7;
  color: #92400E;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  border-bottom: 1px solid #F59E0B;
}

/* Offline content styling */
.offline-available {
  border-left: 3px solid #059669;
  opacity: 1;
}

.offline-unavailable {
  border-left: 3px solid #DC2626;
  opacity: 0.6;
}
```

### Browser Compatibility

**CSS Feature Support**
```css
/* Backdrop filter fallback */
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Fallback for older browsers */
@supports not (backdrop-filter: blur(4px)) {
  .modal-backdrop {
    background: rgba(0, 0, 0, 0.8);
  }
}

/* Grid fallback */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* Flexbox fallback */
@supports not (display: grid) {
  .grid-container {
    display: flex;
    flex-wrap: wrap;
  }
  .grid-container > * {
    flex: 1 1 280px;
    margin: 8px;
  }
}
```

**Touch-Specific CSS**
```css
/* Prevent touch callouts */
.interactive-element {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Smooth scrolling for mobile */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Prevent zoom on input focus */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Viewport & Device Handling

**Viewport Configuration**
```html
<!-- Optimal mobile web viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
      maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**Device-Specific Adaptations**
```css
/* iPhone X+ safe areas */
@supports (padding: max(0px)) {
  .header {
    padding-top: max(16px, env(safe-area-inset-top));
  }
  .footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}

/* Android Chrome address bar compensation */
.full-height {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

### Service Worker Integration

**Loading States for Cached Content**
```css
/* Cache loading indicator */
.cache-loading {
  position: relative;
}

.cache-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent, rgba(255,255,255,0.6), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

**Update Available Notification**
```css
.update-available {
  background: #EFF6FF;
  border: 1px solid #2563EB;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Mobile Web Performance Guidelines

**Critical Resource Loading**
```css
/* Inline critical CSS for first paint */
/* Above-the-fold styles should be inlined in <head> */

/* Preload key resources */
<link rel="preload" href="/fonts/system-ui.woff2" as="font" type="font/woff2" crossorigin>

/* Defer non-critical CSS */
<link rel="preload" href="/css/components.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**Image Optimization for Mobile Web**
```css
/* Responsive images with WebP support */
.responsive-image {
  width: 100%;
  height: auto;
}

/* Picture element for format support */
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.avif" type="image/avif">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

**JavaScript Performance**
- **Bundle Splitting**: Load route-specific code on demand
- **Service Worker**: Cache resources for offline functionality  
- **Intersection Observer**: Efficient lazy loading implementation
- **Web Workers**: Heavy processing off main thread when possible

**Battery & Data Efficiency**
- **Reduce Animations**: Respect `prefers-reduced-motion` setting
- **Compress Assets**: Gzip/Brotli compression for all text resources
- **Efficient Polling**: Use exponential backoff for status updates
- **Cache Strategy**: Implement stale-while-revalidate for content

---

## Accessibility Standards

### Color & Contrast
- **Text Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Interactive Elements**: Minimum 3:1 contrast for borders and icons
- **Color Independence**: Never rely on color alone to convey information
- **Focus Indicators**: 2px solid outline with 2px offset

### Screen Reader Support
```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

### Keyboard Navigation
- **Tab Order**: Logical flow following visual layout
- **Skip Links**: Allow bypassing repetitive navigation
- **Focus Management**: Clear focus indicators on all interactive elements
- **Escape Hatches**: ESC key closes modals and overlays

---

## Implementation Notes

### CSS Architecture
- **Mobile-First**: Start with mobile styles, enhance for larger screens
- **Component-Based**: Reusable classes for consistent styling
- **Utility Classes**: Common patterns available as single-purpose classes
- **CSS Custom Properties**: Use for consistent theming and easy maintenance

### Performance Priorities
1. **First Paint**: Critical styles inline, non-critical deferred
2. **Font Loading**: System fonts prevent flash of invisible text
3. **Image Strategy**: Appropriate sizing and lazy loading
4. **Animation Performance**: Use transform and opacity when possible

### Dark Mode Considerations
While not in MVP scope, design system should accommodate future dark mode:
- Use CSS custom properties for colors
- Ensure contrast ratios work in both light and dark themes
- Test iconography and imagery for theme compatibility

This styling guide creates a foundation for a calm, intelligent interface that supports focused learning while maintaining the high-quality feel users expect from modern applications.