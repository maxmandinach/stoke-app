'use client';

import React, { useState, useCallback } from 'react';
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
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-