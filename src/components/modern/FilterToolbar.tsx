import React from 'react';
import { Search, Filter, CheckSquare, MoreHorizontal } from 'lucide-react';

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  contentCount: number;
  selectedCount: number;
  onSelectAll: () => void;
}

export default function FilterToolbar({ 
  searchValue, 
  onSearchChange, 
  contentCount, 
  selectedCount, 
  onSelectAll 
}: FilterToolbarProps) {
  return (
    <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Enhanced Search */}
          <div className="flex-1 min-w-[300px] max-w-lg">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all duration-200" size={18} />
              <input
                type="text"
                placeholder="Search content, topics, or sources..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 hover:shadow-md placeholder:text-gray-500"
              />
            </div>
          </div>
          
          {/* Enhanced Count Badges */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all duration-200 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              All Content ({contentCount})
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 shadow-sm ${
              selectedCount > 0 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${selectedCount > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
              Selected ({selectedCount})
            </div>
          </div>
          
          {/* Enhanced Control Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-300 transition-all duration-200 hover:shadow-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
              <Filter size={16} />
              Advanced Filters
            </button>
            
            <button 
              onClick={onSelectAll}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-300 transition-all duration-200 hover:shadow-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
            >
              <CheckSquare size={16} />
              Select All
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-300 transition-all duration-200 hover:shadow-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
              <MoreHorizontal size={16} />
              More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 