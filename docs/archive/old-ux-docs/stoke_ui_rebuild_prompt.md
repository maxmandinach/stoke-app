# **Stoke App UI Rebuild - Professional Prompt**

You are a senior frontend developer tasked with completely rebuilding the user interface of a React/Next.js learning platform called Stoke. You will transform a poorly designed interface into a modern, commercial-grade application while preserving all existing business logic.

## **Success Criteria**
<success_criteria>
- UI quality matches Linear/Notion/modern SaaS applications
- All existing functionality preserved and working
- Mobile-first responsive design
- Clean, maintainable component architecture
- Fast performance (< 2s load times)
- Consistent design system throughout
</success_criteria>

## **Context & Current State**
<current_problems>
- 1,791 lines of messy CSS with competing design systems
- Multiple broken component versions with feature flag complexity
- Poor visual hierarchy and inconsistent spacing
- Over-engineered solutions that don't work properly
- Previous iteration attempts have failed
</current_problems>

<preserve_completely>
- `supabase/` - Database schemas, migrations, functions
- `src/contexts/` - React contexts (ContentSelectionContext, etc.)
- `src/hooks/` - Custom hooks and business logic
- `src/lib/` - Database utilities, API functions  
- `src/types/` - TypeScript interfaces
- `src/app/api/` - All API routes
- All backend integrations (Supabase, Gemini AI)
</preserve_completely>

<rebuild_completely>
- `src/components/` - All UI components (keep logic, rebuild presentation)
- `src/app/globals.css` - Replace with minimal version
- All existing design systems and feature flags
- Component styling and visual presentation
</rebuild_completely>

## **Technical Requirements**

<tech_stack>
**Required:**
- Next.js 14 (keep existing)
- React 18 (keep existing)  
- TypeScript (keep existing)
- Tailwind CSS (rebuild approach)
- shadcn/ui component library (add new)

**Reference Example:**
- GitHub: https://github.com/maxmandinach/stoke-ignite-learn-app
- Uses: Vite + React + shadcn/ui + Tailwind
- Study this repo's component patterns and styling approach
</tech_stack>

<design_system>
**Brand: "Memory Waves"**
- Concept: Concentric circles representing knowledge rippling outward
- Primary Blue: #2563EB
- Deep Navy: #1E293B  
- Soft Gray: #64748B
- Success Green: #059669
- Design Philosophy: Calm intelligence, generous whitespace, subtle interactions
</design_system>

## **Implementation Plan**

<phase_1>
**Foundation (Day 1)**
1. Install shadcn/ui: `npx shadcn@latest init`
2. Add core components: `npx shadcn@latest add button card input select badge progress`
3. Create minimal globals.css with Tailwind + brand variables
4. Set up component folder structure following shadcn patterns
</phase_1>

<phase_2>
**Core Components (Days 2-4)**
Priority order:
1. ContentSelectionInterface - Modern card-based content selection
2. SessionConfigurationInterface - Clean session setup flow  
3. UnifiedSessionManager - Question/answer learning interface
4. Memory Waves logo component (SVG with concentric circles)
</phase_2>

<phase_3>
**Advanced Components (Days 5-6)**  
1. ProgressAnalytics - Dashboard with charts and insights
2. AdminDashboard - System monitoring interface
3. Loading states and error boundaries
4. Mobile optimizations
</phase_3>

<phase_4>
**Polish (Day 7)**
1. Consistent spacing (8px grid) and typography scale
2. Smooth transitions and micro-interactions  
3. End-to-end testing of all flows
4. Performance optimization
</phase_4>

## **Component Examples**

<good_example>
```tsx
// GOOD: Clean shadcn/ui pattern
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ContentCard({ content, isSelected, onToggle }) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={onToggle}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{content.type}</Badge>
          <span className="text-sm text-gray-500">{content.duration}min</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
      </CardContent>
    </Card>
  )
}
```
</good_example>

<bad_example>
```tsx
// BAD: Current messy pattern (what you're replacing)
<div className="relative p-4 border-2 rounded-lg transition-all cursor-pointer min-h-[120px] border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm selection-ripple memory-selection-indicator stoke-card">
  <div className="absolute top-4 right-4">
    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all border-gray-300 hover:border-gray-400">
      {/* Complex nested styling */}
    </div>
  </div>
  {/* More messy nested divs */}
</div>
```
</bad_example>

## **Quality Standards**

<mobile_requirements>
- All touch targets minimum 44px
- Responsive breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly interactions with proper feedback
- Fast scroll performance and natural gestures
</mobile_requirements>

<performance_requirements>
- Components lazy load when appropriate
- Images optimized with Next.js Image component
- Bundle size minimized (remove unused CSS/JS)
- Time to Interactive < 2 seconds
</performance_requirements>

<accessibility_requirements>
- Keyboard navigation for all interactions
- Screen reader compatible with proper ARIA labels
- Color contrast ratios meet WCAG 2.1 AA standards
- Focus indicators clearly visible
</accessibility_requirements>

## **Validation Steps**

Before considering the rebuild complete:

<validation_checklist>
1. [ ] All original app functionality works identically
2. [ ] Visual quality matches reference app (stoke-ignite-learn-app)
3. [ ] Mobile experience is smooth and responsive
4. [ ] Loading states and error handling work properly
5. [ ] Performance meets requirements (test with Lighthouse)
6. [ ] No console errors or TypeScript issues
7. [ ] Memory Waves design system consistently applied
</validation_checklist>

## **Expected Deliverables**

<deliverables>
1. **Complete UI rebuild** using shadcn/ui component patterns
2. **Minimal globals.css** (<200 lines, focused on essentials)
3. **Consistent component architecture** following modern React patterns
4. **Working Memory Waves design system** with logo and brand colors
5. **Mobile-optimized responsive design** that feels native
6. **All preserved functionality** working exactly as before
7. **Clean codebase** ready for future development
</deliverables>

---

**Important:** This is a complete UI rebuild, not an incremental improvement. Be bold in deleting old patterns and implementing clean, modern alternatives. The goal is a dramatic visual transformation that makes the app feel professional while maintaining all existing functionality. 