# Stoke UI Requirements - Single Source of Truth

## **Current Problem**
Multiple conflicting UX documents and the Memory Waves design system are preventing successful UI rebuilds. This document replaces ALL previous UX documentation with a single, clear set of requirements.

## **What We're Building**
A clean, modern content selection and learning interface using shadcn/ui components, inspired by the clean design approach from the reference repository.

---

## **Visual Design System**

### **Colors (Final)**
```
Primary Blue: #2563EB (buttons, selection states, active elements)
Deep Navy: #1E293B (text, headers)  
Soft Gray: #64748B (secondary text, metadata)
Success Green: #059669 (positive feedback)
Light Gray: #F8FAFC (backgrounds, cards)
White: #FFFFFF (main background)
```

### **Logo & Branding**
- **Remove**: Memory Waves concentric circles logo (looks like camera)
- **Use**: Simple text-based "Stoke" wordmark
- **Style**: Clean typography, no complex iconography
- **Usage**: Minimal branding in headers only

### **Typography**
- **Display**: 28px, weight 600 (page headers)
- **Title**: 22px, weight 600 (content titles)  
- **Body**: 16px, weight 400 (main content)
- **Caption**: 14px, weight 400 (metadata)
- **Font**: System font stack (-apple-system, etc.)

### **Spacing**
- **8px grid system**: 8px, 16px, 24px, 32px, 48px
- **Touch targets**: 44px minimum
- **Card padding**: 16px
- **Edge margins**: 16px

### **Iconography**
- **Use**: Lucide React icons only (clean, consistent)
- **Style**: 16px-24px sizes, consistent stroke width
- **Examples**: Search, Filter, ChevronRight, Check, X
- **No custom logos or complex graphics**

---

## **Core Components to Build**

### **1. ContentSelectionInterface** 
**Replace**: Current complex content selection
**Build with**: shadcn Card, Button, Badge, Input
**Features**:
- Multi-select with checkboxes
- Search bar with Lucide Search icon
- Topic filtering chips  
- Selection counter ("3 items selected")
- Continue button

### **2. SessionConfigurationInterface**
**Replace**: Current session config
**Build with**: shadcn Select, Button, Card
**Features**:
- Session type selection (Read Summaries, Test Knowledge, Both)
- Duration selection (Quick, Medium, Extended) 
- Summary of selections
- Start session button

### **3. UnifiedSessionManager**
**Replace**: Current session interface  
**Build with**: shadcn Button, Progress, Card
**Features**:
- Question display
- Binary response buttons ("Got it", "Revisit")
- Progress indicator (simple progress bar)
- Next question flow

### **4. Clean Header**
**Replace**: Complex headers with Memory Waves
**Build with**: Simple text + shadcn Button
**Features**:
- "Stoke" text logo
- Minimal navigation
- Clean, professional appearance

---

## **User Flows (Simplified)**

### **Content Selection Flow**
1. User sees content library (main page)
2. User selects episodes with checkboxes
3. User clicks "Continue" → Goes to session config
4. User chooses session type and duration
5. User clicks "Start Session" → Goes to session

### **Session Flow**  
1. User answers questions with binary responses
2. Progress bar shows completion
3. Session ends with simple results
4. User returns to content library

---

## **Technical Requirements**

### **Tech Stack (Keep)**
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS + shadcn/ui components
- Keep all existing contexts, hooks, utils, API routes

### **Implementation Priority**
1. **Day 1**: Remove Memory Waves, rebuild ContentSelectionInterface
2. **Day 2**: Rebuild SessionConfigurationInterface  
3. **Day 3**: Rebuild UnifiedSessionManager
4. **Day 4**: Polish and mobile optimization

### **Component Patterns**
```tsx
// GOOD: Clean shadcn pattern (no Memory Waves)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

function ContentCard({ content, isSelected, onToggle }) {
  return (
    <Card className={cn("cursor-pointer", isSelected && "ring-2 ring-blue-500")}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Checkbox checked={isSelected} onChange={onToggle} />
          <CardTitle>{content.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{content.description}</p>
      </CardContent>
    </Card>
  )
}
```

---

## **Quality Standards**

### **Visual Quality**
- Matches Linear/Notion quality level
- Clean, minimal, professional appearance
- Consistent spacing and typography
- Smooth interactions
- **NO complex logos or graphics**

### **Mobile Requirements**  
- Responsive design (mobile-first)
- 44px touch targets
- Smooth scrolling and gestures
- Fast loading (< 2s)

### **Accessibility**
- Keyboard navigation
- Screen reader compatible
- Proper color contrast
- ARIA labels

---

## **Success Criteria**

**The rebuild is successful when:**
- [ ] All original functionality works identically
- [ ] Visual quality matches modern SaaS apps
- [ ] Mobile experience is smooth and responsive  
- [ ] Code is clean and maintainable
- [ ] Performance is fast (< 2s load times)
- [ ] No console errors or TypeScript issues
- [ ] **Memory Waves design system completely removed**

---

## **What NOT to Do**

❌ **Don't reference any other UX documents** - they're obsolete
❌ **Don't use Memory Waves logos or concentric circles** - they look like cameras
❌ **Don't overthink the design** - keep it simple and clean
❌ **Don't preserve current styling** - replace with shadcn/ui patterns
❌ **Don't add new features** - just rebuild the UI for existing functionality

---

**This document is the ONLY requirements reference. Ignore all other UX documentation.** 