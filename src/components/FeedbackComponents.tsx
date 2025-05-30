import React, { useState, useEffect } from 'react';

// Feedback types and colors from style guide
export type FeedbackType = 'success' | 'warning' | 'error' | 'info';

interface FeedbackColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

const feedbackColors: FeedbackColors = {
  success: '#059669',
  warning: '#D97706', 
  error: '#DC2626',
  info: '#2563EB'
};

// Base feedback message component
interface FeedbackMessageProps {
  type: FeedbackType;
  title?: string;
  message: string;
  className?: string;
  showIcon?: boolean;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function FeedbackMessage({ 
  type, 
  title, 
  message, 
  className = '', 
  showIcon = true,
  onDismiss,
  dismissible = false
}: FeedbackMessageProps) {
  const getConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return {
          bgColor: '#ECFDF5',
          borderColor: feedbackColors.success,
          textColor: '#065F46',
          iconColor: feedbackColors.success,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: '#FEF3C7',
          borderColor: feedbackColors.warning,
          textColor: '#92400E',
          iconColor: feedbackColors.warning,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: '#FEF2F2',
          borderColor: feedbackColors.error,
          textColor: '#B91C1C',
          iconColor: feedbackColors.error,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
        return {
          bgColor: '#EFF6FF',
          borderColor: feedbackColors.info,
          textColor: '#1E40AF',
          iconColor: feedbackColors.info,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const config = getConfig(type);

  return (
    <div 
      className={`rounded-lg border p-4 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.textColor
      }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0" style={{ color: config.iconColor }}>
            {config.icon}
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm leading-relaxed">
            {message}
          </p>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 transition-colors duration-200 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50"
              style={{ 
                color: config.iconColor
              }}
              aria-label="Dismiss message"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Form field error component
interface FieldErrorProps {
  message: string;
  id?: string;
}

export function FieldError({ message, id }: FieldErrorProps) {
  return (
    <p 
      id={id}
      className="mt-1 text-sm" 
      style={{ color: feedbackColors.error }}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

// Success state component
interface SuccessStateProps {
  title?: string;
  message: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function SuccessState({ title, message, actionButton, className = '' }: SuccessStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#ECFDF5' }}
      >
        <svg 
          className="w-8 h-8" 
          style={{ color: feedbackColors.success }}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
          {title}
        </h3>
      )}
      <p className="text-[#64748B] mb-4">
        {message}
      </p>
      {actionButton}
    </div>
  );
}

// Warning state component  
interface WarningStateProps {
  title?: string;
  message: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function WarningState({ title, message, actionButton, className = '' }: WarningStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FEF3C7' }}
      >
        <svg 
          className="w-8 h-8" 
          style={{ color: feedbackColors.warning }}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
          {title}
        </h3>
      )}
      <p className="text-[#64748B] mb-4">
        {message}
      </p>
      {actionButton}
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  title?: string;
  message: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function ErrorState({ title, message, actionButton, className = '' }: ErrorStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FEF2F2' }}
      >
        <svg 
          className="w-8 h-8" 
          style={{ color: feedbackColors.error }}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
          {title}
        </h3>
      )}
      <p className="text-[#64748B] mb-4">
        {message}
      </p>
      {actionButton}
    </div>
  );
}

// Toast notification interface
export interface Toast {
  id: string;
  type: FeedbackType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast notification component
interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

export function ToastNotification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  action,
  onDismiss 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
    
    // Return empty cleanup function when duration is not greater than 0
    return () => {};
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const getConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return {
          bgColor: '#FFFFFF',
          borderColor: feedbackColors.success,
          iconColor: feedbackColors.success,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: '#FFFFFF',
          borderColor: feedbackColors.warning,
          iconColor: feedbackColors.warning,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: '#FFFFFF',
          borderColor: feedbackColors.error,
          iconColor: feedbackColors.error,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bgColor: '#FFFFFF',
          borderColor: feedbackColors.info,
          iconColor: feedbackColors.info,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const config = getConfig(type);

  return (
    <div
      className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border-l-4 transition-all duration-300 ease-out ${
        isVisible && !isLeaving 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
      }`}
      style={{
        borderLeftColor: config.borderColor,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0" style={{ color: config.iconColor }}>
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-semibold text-[#1E293B]">
                {title}
              </p>
            )}
            <p className={`text-sm text-[#64748B] ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium rounded-md px-2 py-1 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: config.iconColor
                  }}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="rounded-md inline-flex text-[#94A3B8] hover:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#64748B] transition-colors duration-200"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container component
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0';
      case 'top-left':
        return 'top-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
    }
  };

  return (
    <div 
      className={`fixed z-50 p-6 space-y-4 ${getPositionClasses()}`}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastNotification 
          key={toast.id} 
          {...toast} 
          onDismiss={onDismiss} 
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    dismissToast,
    dismissAll
  };
} 