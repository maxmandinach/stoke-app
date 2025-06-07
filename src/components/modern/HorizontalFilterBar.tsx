import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Check
} from 'lucide-react';

interface HorizontalFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  contentCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  activeView: 'all' | 'selected';
  onViewChange: (view: 'all' | 'selected') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFilterClick: () => void;
}

export default function HorizontalFilterBar({
  searchValue,
  onSearchChange,
  contentCount,
  selectedCount,
  onSelectAll,
  activeView,
  onViewChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onFilterClick
}: HorizontalFilterBarProps) {
  return (
    <div 
      className={cn(
        // Fixed positioning below header
        "fixed left-0 right-0 z-40",
        "top-14 sm:top-16",
        // Enhanced backdrop and styling
        "bg-white/95 backdrop-blur-lg border-b border-gray-200/80",
        "shadow-sm"
      )}
      role="toolbar"
      aria-label="Content filtering and view options"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 h-14">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              type="text"
              placeholder="Search content..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-10 h-9 text-body-sm",
                "input-enhanced",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
              aria-label="Search content by title or topic"
            />
          </div>

          {/* Content View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('all')}
              className={cn(
                "px-3 py-1.5 rounded-md text-body-sm font-medium transition-all duration-200",
                "focus-ring-inset",
                activeView === 'all'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-pressed={activeView === 'all'}
              aria-label={`Show all content (${contentCount} items)`}
            >
              All <span className="ml-1 font-semibold">({contentCount})</span>
            </button>
            <button
              onClick={() => onViewChange('selected')}
              className={cn(
                "px-3 py-1.5 rounded-md text-body-sm font-medium transition-all duration-200",
                "focus-ring-inset",
                activeView === 'selected'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-pressed={activeView === 'selected'}
              aria-label={`Show selected content (${selectedCount} items)`}
            >
              Selected <span className="ml-1 font-semibold">({selectedCount})</span>
            </button>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-gray-300" aria-hidden="true" />

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className={cn(
              "hidden sm:flex items-center gap-2 h-9",
              "btn-secondary border-gray-300 hover:border-gray-400"
            )}
            aria-label="Open advanced filters"
            aria-haspopup="dialog"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-body-sm">Filter</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-1.5 rounded transition-all duration-200",
                "focus-ring-inset",
                viewMode === 'grid'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-1.5 rounded transition-all duration-200",
                "focus-ring-inset",
                viewMode === 'list'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative hidden lg:block">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={cn(
                "appearance-none bg-white border border-gray-300 rounded-lg",
                "px-3 py-1.5 pr-8 h-9 text-body-sm",
                "hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                "transition-all duration-200"
              )}
              aria-label="Sort content by"
            >
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="progress">Progress</option>
              <option value="duration">Duration</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
          </div>

          {/* Select All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className={cn(
              "hidden xl:flex items-center gap-2 h-9",
              "btn-secondary border-gray-300 hover:border-gray-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={contentCount === 0}
            aria-label={`Select all ${contentCount} items`}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span className="text-body-sm">Select All</span>
          </Button>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className={cn(
              "sm:hidden p-2 h-9 w-9",
              "btn-secondary border-gray-300 hover:border-gray-400"
            )}
            aria-label="Open filters"
            aria-haspopup="dialog"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
} 