import * as React from "react"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface HorizontalFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  contentCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  activeView: "all" | "selected";
  onViewChange: (view: "all" | "selected") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFilterClick?: () => void;
  className?: string;
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
  onFilterClick,
  className
}: HorizontalFilterBarProps) {
  return (
    <div 
      className={cn(
        // Base styles
        "sticky bg-white border-b border-gray-200/80 backdrop-blur-md z-40",
        // Positioning - below header
        "top-14 md:top-16",
        // Height and padding
        "h-14 px-4 md:px-6",
        className
      )}
    >
      <div className="flex items-center justify-between h-full max-w-full">
        {/* Left Section - Search and Content Toggles */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search episodes, topics..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Content Toggle Buttons */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeView === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("all")}
              className={cn(
                "h-7 px-3 text-xs font-medium rounded-md",
                activeView === "all" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              All Content ({contentCount})
            </Button>
            <Button
              variant={activeView === "selected" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("selected")}
              className={cn(
                "h-7 px-3 text-xs font-medium rounded-md",
                activeView === "selected" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              Selected ({selectedCount})
            </Button>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="h-9 px-3 border-gray-200 hover:border-gray-300 hidden sm:flex"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Filter</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "h-7 w-7 p-0 rounded-md",
                viewMode === "grid" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "h-7 w-7 p-0 rounded-md",
                viewMode === "list" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 w-auto min-w-[100px] border-gray-200 bg-white hover:border-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 hidden md:inline">Sort</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>

          {/* Select All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="h-9 px-3 border-gray-200 hover:border-gray-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Check className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Select All</span>
          </Button>
        </div>
      </div>

      {/* Mobile Content Toggles (when hidden on desktop) */}
      <div className="sm:hidden flex items-center justify-center gap-1 py-2 border-t border-gray-100">
        <Button
          variant={activeView === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("all")}
          className={cn(
            "h-8 px-4 text-xs font-medium",
            activeView === "all" 
              ? "bg-blue-100 text-blue-900 border-blue-200" 
              : "text-gray-600"
          )}
        >
          All ({contentCount})
        </Button>
        <Button
          variant={activeView === "selected" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("selected")}
          className={cn(
            "h-8 px-4 text-xs font-medium",
            activeView === "selected" 
              ? "bg-blue-100 text-blue-900 border-blue-200" 
              : "text-gray-600"
          )}
        >
          Selected ({selectedCount})
        </Button>
      </div>
    </div>
  )
} 