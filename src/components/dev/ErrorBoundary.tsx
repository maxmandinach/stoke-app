/**
 * Error Boundary for New Design Components
 * 
 * Catches errors from new design components and provides fallback to existing components.
 * This ensures that new features never break the existing user experience.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DesignErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Design component error:', error, errorInfo);
    
    // In development, show more detailed error info
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 New Design Component Error');
      console.log('Component:', this.props.componentName || 'Unknown');
      console.log('Error:', error);
      console.log('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      // In development, show error details
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-4">
            <div className="flex items-center mb-2">
              <span className="text-red-600 text-sm font-semibold">
                ⚠️ New Design Component Error
              </span>
            </div>
            <p className="text-red-700 text-xs mb-3">
              Component: {this.props.componentName || 'Unknown'}
            </p>
            <p className="text-red-600 text-xs mb-3">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <div className="border-t border-red-200 pt-3">
              <p className="text-red-700 text-xs mb-2">Falling back to existing component:</p>
              {this.props.fallback}
            </div>
          </div>
        );
      }
      
      // In production, silently fallback to existing component
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default DesignErrorBoundary; 