# Remove Memory Waves Design System - Implementation Prompt

You are a senior frontend developer tasked with removing the Memory Waves design system from a React/Next.js application and replacing it with clean, modern design patterns inspired by Linear/Notion.

## **Success Criteria**
<success_criteria>
- All Memory Waves logos, concentric circles, and complex graphics removed
- Clean text-based "Stoke" wordmark implemented
- Lucide React icons used consistently throughout
- Professional, minimal appearance matching modern SaaS apps
- All existing functionality preserved
</success_criteria>

## **What to Remove**
<remove_completely>
- Memory Waves concentric circles logo (looks like camera)
- MemoryWaves.tsx component and all related animations
- StokeLogo.tsx complex SVG implementation
- Any ripple effects or wave animations
- Complex gradient backgrounds
- Memory Waves CSS classes and animations
- All references to "memory-" prefixed classes
</remove_completely>

## **What to Replace With**
<replace_with>
- Simple text-based "Stoke" wordmark using system fonts
- Lucide React icons for all UI elements
- Clean shadcn/ui components only
- Simple progress bars instead of animated circles
- Solid colors instead of gradients
- Minimal, professional typography
</replace_with>

## **Reference Implementation**
<good_example>
The target design should match this clean approach:
- Repository: https://github.com/maxmandinach/stoke-ignite-learn-app
- Tech Stack: Vite + React + TypeScript + shadcn/ui + Tailwind
- Design: Clean, minimal, no complex graphics
- Icons: Lucide React only
</good_example>

## **Specific Components to Update**

### **1. Header/Logo Updates**
```tsx
// BEFORE: Complex Memory Waves logo
<MemoryWaves size={32} />

// AFTER: Simple text wordmark
<h1 className="text-xl font-semibold text-gray-900">Stoke</h1>
```

### **2. Progress Indicators**
```tsx
// BEFORE: Memory Waves animated circles
<MemoryWavesProgress progress={0.6} />

// AFTER: Simple progress bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
</div>
```

### **3. Loading States**
```tsx
// BEFORE: Memory Waves loader
<MemoryWavesLoader />

// AFTER: Simple spinner or skeleton
<div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
```

### **4. Icons Throughout App**
```tsx
// BEFORE: Custom SVG icons
<CustomIcon />

// AFTER: Lucide React icons
import { Search, Filter, ChevronRight } from 'lucide-react'
<Search className="h-4 w-4" />
```

## **Files to Update**

### **Priority 1: Remove Core Memory Waves**
- [ ] `src/components/MemoryWaves.tsx` - Delete entirely
- [ ] `src/components/ui/StokeLogo.tsx` - Replace with simple text
- [ ] `src/app/globals.css` - Remove memory-waves classes
- [ ] `src/components/ModernContentSelection.tsx` - Remove Memory Waves imports

### **Priority 2: Update Headers**
- [ ] `src/components/ui/AppHeader.tsx` - Simplify to text logo
- [ ] Any navigation components using Memory Waves

### **Priority 3: Update Progress Indicators**
- [ ] Replace all MemoryWavesProgress with simple progress bars
- [ ] Update loading states throughout app
- [ ] Remove animated ripple effects

## **Implementation Steps**

### **Step 1: Remove Core Components**
1. Delete `src/components/MemoryWaves.tsx`
2. Update `src/components/ui/StokeLogo.tsx` to simple text
3. Remove Memory Waves CSS from globals.css

### **Step 2: Update Imports**
1. Find all components importing Memory Waves
2. Replace with Lucide icons or simple elements
3. Update TypeScript references

### **Step 3: Simplify Headers**
1. Replace complex logo with "Stoke" text
2. Use clean typography
3. Remove gradient backgrounds

### **Step 4: Update Progress Elements**
1. Replace animated circles with progress bars
2. Use shadcn/ui Progress component
3. Maintain same functionality, simpler appearance

## **Quality Checklist**
<validation_checklist>
- [ ] No Memory Waves components remain in codebase
- [ ] No "memory-" CSS classes in use
- [ ] All progress indicators use simple bars
- [ ] Logo is clean text-based wordmark
- [ ] All icons are Lucide React icons
- [ ] No console errors after changes
- [ ] App looks professional and minimal
- [ ] All existing functionality preserved
</validation_checklist>

## **Testing**
1. Search codebase for "MemoryWaves", "memory-", "concentric"
2. Verify no camera-like logos appear
3. Check all progress indicators are simple bars
4. Confirm clean, professional appearance
5. Test all functionality still works

---

**Goal**: Transform from complex Memory Waves design to clean, Linear/Notion-style interface while preserving all business logic. 