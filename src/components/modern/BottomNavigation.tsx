import * as React from "react"
import { Library, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeTab: 'library' | 'discover' | 'add';
  onTabChange: (tab: 'library' | 'discover' | 'add') => void;
  className?: string;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  className
}: BottomNavigationProps) {
  const navigationItems = [
    {
      id: 'library' as const,
      label: 'Library',
      icon: Library,
      isActive: activeTab === 'library'
    },
    {
      id: 'discover' as const,
      label: 'Discover',
      icon: Search,
      isActive: activeTab === 'discover'
    },
    {
      id: 'add' as const,
      label: 'Add',
      icon: Plus,
      isActive: activeTab === 'add',
      isSpecial: true // Different styling for the add button
    }
  ]

  return (
    <nav 
      className={cn(
        // Base positioning and visibility
        "fixed bottom-0 left-0 right-0 z-40",
        // Hide on large screens (desktop)
        "lg:hidden",
        // Background and backdrop
        "bg-white/80 backdrop-blur-md border-t border-gray-200/80",
        // Height and padding
        "h-16 pb-safe",
        className
      )}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                // Base button styles
                "flex flex-col items-center justify-center",
                // Touch target - minimum 44px
                "min-h-[44px] min-w-[44px] px-3 py-1",
                // Rounded corners for touch
                "rounded-lg",
                // Transition effects
                "transition-all duration-200 ease-in-out",
                // Hover effect (for devices that support it)
                "hover:bg-gray-100/80 active:bg-gray-200/80",
                // Special styling for add button
                item.isSpecial && !item.isActive && [
                  "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
                  "text-white rounded-full",
                  "shadow-lg hover:shadow-xl",
                  "transform hover:scale-105 active:scale-95"
                ],
                // Active add button
                item.isSpecial && item.isActive && [
                  "bg-blue-700",
                  "text-white rounded-full",
                  "shadow-xl"
                ]
              )}
            >
              {/* Icon */}
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  // Color states for regular tabs
                  !item.isSpecial && [
                    item.isActive 
                      ? "text-blue-600" 
                      : "text-gray-500"
                  ],
                  // Color for special add button (always white when special)
                  item.isSpecial && "text-white"
                )} 
              />
              
              {/* Label */}
              <span 
                className={cn(
                  "text-xs leading-none",
                  // Font weight and color for regular tabs
                  !item.isSpecial && [
                    item.isActive 
                      ? "font-semibold text-blue-600" 
                      : "font-medium text-gray-500"
                  ],
                  // Font weight and color for special add button
                  item.isSpecial && "font-semibold text-white"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* iOS-style home indicator space */}
      <div className="h-1 bg-transparent" />
    </nav>
  )
} 