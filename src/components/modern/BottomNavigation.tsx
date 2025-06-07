import React from 'react';
import { Library, Search, Plus } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'library' | 'discover' | 'add';
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'add', icon: Plus, label: 'Add' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40 md:hidden shadow-lg">
      <div className="grid grid-cols-3 h-16 safe-area-padding-bottom">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button 
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:bg-gray-50 ${
              activeTab === id 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={20} className="transition-transform duration-200 hover:scale-110" />
            <span className={`text-xs transition-all duration-200 ${
              activeTab === id ? 'font-semibold' : 'font-medium'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
} 