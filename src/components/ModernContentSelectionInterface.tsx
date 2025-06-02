'use client';

import React, { useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';

// Modern Content Type Indicator with rich colors and gradients
function ModernContentTypeIndicator({ source, className = '' }: { source: string; className?: string }) {
  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return {
          label: 'Podcast',
          icon: '🎧',
          gradient: 'from-purple-500 to-pink-500',
          bgGradient: 'from-purple-50 to-pink-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 'video':
        return {
          label: 'Video',
          icon: '🎬',
          gradient: 'from-red-500 to-orange-500',
          bgGradient: 'from-red-50 to-orange-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'article':
        return {
          label: 'Article',
          icon: '📄',
          gradient: 'from-emerald-500 to-teal-500',
          bgGradient: 'from-emerald-50 to-teal-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200'
        };
      case 'book':
        return {
          label: 'Book',
          icon: '📚',
          gradient: 'from-violet-500 to-purple-500',
          bgGradient: 'from-violet-50 to-purple-50',
          textColor: 'text-violet-700',
          borderColor: 'border-violet-200'
        };
      case 'interview':
        return {
          label: 'Interview',
          icon: '🎙️',
          gradient: 'from-blue-500 to-cyan-500',
          bgGradient: 'from-blue-50 to-cyan-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          label: 'Content',
          icon: '📋',
          gradient: 'from-gray-500 to-slate-500',
          bgGradient: 'from-gray-50 to-slate-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getSourceConfig(source);

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
      text-xs font-semibold tracking-wide bg-gradient-to-r ${config.bgGradient} 
      ${config.textColor} ${config.borderColor} border backdrop-blur-sm
      shadow-sm hover:shadow-md transition-all duration-200 ${className}
    `}>
      <span className="text-sm">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

// Floating Action Button for Continue
function FloatingContinueButton() {
  const { state } = useContentSelection();
  
  if (state.selectionCount === 0) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => {}}
        className="
          group relative flex items-center gap-3 px-6 py-4 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          text-white font-semibold rounded-2xl shadow-2xl
          hover:from-indigo-500 hover:to-purple-500
          transform hover:scale-105 transition-all duration-300
          before:absolute before:inset-0 before:rounded-2xl
          before:bg-gradient-to-r before:from-indigo-400 before:to-purple-400
          before:opacity-0 before:hover:opacity-20 before:transition-opacity
        "
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
            {state.selectionCount}
          </span>
          <span>Continue with Selected</span>
        </div>
        <svg 
          className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}

// Main Modern Content Selection Interface
export default function ModernContentSelectionInterface() {
  const { state } = useContentSelection();

  const handleContentSelect = useCallback((content: ContentWithTopics) => {
    contentSelectionActions.toggleContent(content.id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">Select Content for Learning</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Choose Your Learning Materials
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the content you'd like to study. We'll create personalized learning sessions based on your choices.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {state.filteredContent.map((content) => (
            <div
              key={content.id}
              onClick={() => handleContentSelect(content)}
              className="group cursor-pointer"
            >
              <div className={`
                relative p-6 bg-white/70 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300
                hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1
                ${state.selectedContentIds.has(content.id) 
                  ? 'border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-100/50' 
                  : 'border-white/20 hover:border-blue-200'
                }
              `}>
                {/* Selection Indicator */}
                <div className={`
                  absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200
                  ${state.selectedContentIds.has(content.id)
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-slate-300 group-hover:border-blue-400'
                  }
                `}>
                  {state.selectedContentIds.has(content.id) && (
                    <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className="mb-4">
                  <ModernContentTypeIndicator source={content.source} className="mb-3" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {content.quick_summary}
                  </p>
                </div>

                {/* Topics */}
                {content.topics && content.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.topics.slice(0, 3).map((topic, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                      >
                        {topic.name}
                      </span>
                    ))}
                    {content.topics.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        +{content.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <FloatingContinueButton />
      </div>
    </div>
  );
}
