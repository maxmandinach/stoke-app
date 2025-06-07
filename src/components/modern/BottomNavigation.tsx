import React from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Compass, Plus } from 'lucide-react';

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
  const navItems = [
    {
      id: 'library' as const,
      label: 'Library',
      icon: BookOpen,
      description: 'Your content library'
    },
    {
      id: 'discover' as const,
      label: 'Discover',
      icon: Compass,
      description: 'Find new content'
    },
    {
      id: 'add' as const,
      label: 'Add',
      icon: Plus,
      description: 'Add new content'
    }
  ];

  return (
    <nav
      className={cn(
        // Mobile-only display
        "lg:hidden",
        // Fixed positioning at bottom
        "fixed bottom-0 left-0 right-0 z-40",
        // Enhanced backdrop and styling
        "bg-white/95 backdrop-blur-lg",
        "border-t border-gray-200/80",
        // Height and safe area support
        "h-16 safe-area-bottom",
        // Shadow for depth
        "shadow-lg",
        className
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isAddButton = item.id === 'add';
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                // Base button styles
                "flex flex-col items-center justify-center",
                "touch-target rounded-xl transition-all duration-200 ease-out",
                "focus-ring-inset",
                // Special styling for Add button
                isAddButton && [
                  "bg-blue-600 text-white shadow-lg",
                  "hover:bg-blue-700 hover:shadow-xl active:scale-95",
                  "w-12 h-12 rounded-full"
                ],
                // Regular tab styling
                !isAddButton && [
                  "px-3 py-2",
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-500 hover:text-gray-700 active:text-gray-800"
                ]
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={`${item.label} - ${item.description}`}
              aria-controls={`${item.id}-panel`}
            >
              {/* Icon */}
              <div className={cn(
                "transition-all duration-200",
                isAddButton ? "mb-0" : "mb-1",
                isActive && !isAddButton && "transform scale-110"
              )}>
                <Icon 
                  className={cn(
                    isAddButton ? "w-5 h-5" : "w-5 h-5",
                    "transition-transform duration-200"
                  )} 
                  aria-hidden="true"
                />
              </div>
              
              {/* Label - Hidden for Add button */}
              {!isAddButton && (
                <span className={cn(
                  "text-caption font-medium leading-none",
                  "transition-all duration-200",
                  isActive && "font-semibold transform scale-105"
                )}>
                  {item.label}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && !isAddButton && (
                <div 
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Tab panels for screen readers */}
      <div className="sr-only">
        <div id="library-panel" role="tabpanel" aria-labelledby="library">
          Library content panel
        </div>
        <div id="discover-panel" role="tabpanel" aria-labelledby="discover">
          Discover content panel
        </div>
        <div id="add-panel" role="tabpanel" aria-labelledby="add">
          Add content panel
        </div>
      </div>
    </nav>
  );
} 