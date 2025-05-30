'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FeedbackMessage, useToast } from './FeedbackComponents';

// PWA Installation Interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Offline State Indicator
interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function OfflineIndicator({ className = '', showWhenOnline = false }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      if (showWhenOnline) {
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showWhenOnline]);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${className}`}
      style={{ 
        paddingTop: 'max(env(safe-area-inset-top), 0px)',
        transform: showIndicator ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div 
        className={`px-4 py-3 text-center text-sm font-medium transition-colors duration-200 ${
          isOnline 
            ? 'bg-[#059669] text-white' 
            : 'bg-[#F59E0B] text-white'
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Back online! Your content is syncing.</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Offline mode - Changes will sync when connected</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// PWA Install Prompt Component
interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function InstallPrompt({ onInstall, onDismiss, className = '' }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay to avoid immediately interrupting user
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setIsInstalling(false);
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
    // Don't show again for this session
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out ${className}`}
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        transform: showPrompt ? 'translateY(0)' : 'translateY(100%)'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-6 mx-auto max-w-sm"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        role="dialog"
        aria-labelledby="install-title"
        aria-describedby="install-description"
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            <svg 
              className="w-6 h-6 text-[#2563EB]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 id="install-title" className="text-[16px] leading-[24px] font-semibold text-[#1E293B] mb-1">
              Install Stoke App
            </h3>
            <p id="install-description" className="text-[14px] leading-[20px] text-[#64748B] mb-4">
              Add to your home screen for quick access and a native app experience.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 bg-white text-[#64748B] border border-[#E2E8F0] px-4 py-2 rounded-lg font-medium text-[14px] transition-all duration-200 hover:bg-[#F8FAFC] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#64748B] focus:ring-offset-2"
                disabled={isInstalling}
              >
                Maybe Later
              </button>
              
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-[#2563EB] text-white px-4 py-2 rounded-lg font-medium text-[14px] transition-all duration-200 hover:bg-[#1D4ED8] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 flex items-center justify-center gap-2"
                aria-describedby="install-help"
              >
                {isInstalling ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Installing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Install
                  </>
                )}
              </button>
            </div>
            
            <span id="install-help" className="sr-only">
              Install the app to your device for offline access and native app experience
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update Available Notification
interface UpdateNotificationProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });

      // Check for updates periodically
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update();
          }
        });
      };

      // Check every 30 minutes
      const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
    
    // Return empty cleanup function when serviceWorker is not available
    return () => {};
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // Reload the page to apply updates
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onUpdate?.();
      
      addToast({
        type: 'success',
        title: 'Update Applied',
        message: 'The app is reloading with the latest version.'
      });
      
    } catch (error) {
      console.error('Error applying update:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not apply the update. Please refresh manually.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    onDismiss?.();
  };

  if (!showUpdate) return null;

  return (
    <div
      className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto"
      style={{ 
        marginTop: 'max(env(safe-area-inset-top), 16px)'
      }}
    >
      <FeedbackMessage
        type="info"
        title="App Update Available"
        message="A new version of the app is ready. Update now for the latest features and improvements."
        dismissible
        onDismiss={handleDismiss}
      />
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 bg-white text-[#64748B] border border-[#E2E8F0] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#64748B] focus:ring-offset-2"
          disabled={isUpdating}
        >
          Later
        </button>
        
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1 bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 flex items-center justify-center gap-1"
        >
          {isUpdating ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating...
            </>
          ) : (
            'Update Now'
          )}
        </button>
      </div>
    </div>
  );
}

// Safe Area Container Component
interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
  enableInsets?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

export function SafeAreaContainer({ 
  children, 
  className = '', 
  enableInsets = { top: true, bottom: true, left: true, right: true }
}: SafeAreaContainerProps) {
  const paddingStyle = {
    paddingTop: enableInsets.top ? 'max(env(safe-area-inset-top), 0px)' : undefined,
    paddingBottom: enableInsets.bottom ? 'max(env(safe-area-inset-bottom), 0px)' : undefined,
    paddingLeft: enableInsets.left ? 'max(env(safe-area-inset-left), 0px)' : undefined,
    paddingRight: enableInsets.right ? 'max(env(safe-area-inset-right), 0px)' : undefined,
  };

  return (
    <div className={className} style={paddingStyle}>
      {children}
    </div>
  );
}

// Touch Feedback Component
interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  haptic?: boolean;
  ripple?: boolean;
  scale?: boolean;
}

export function TouchFeedback({ 
  children, 
  className = '', 
  haptic = false, 
  ripple = true,
  scale = true 
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    triggerHaptic();
    
    if (ripple && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const newRipple = {
        id: crypto.randomUUID(),
        x,
        y
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden transition-transform duration-150 ease-out ${
        scale && isPressed ? 'transform scale-95' : ''
      } ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
      
      {/* Ripple Effect */}
      {ripple && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className="block w-0 h-0 rounded-full bg-white bg-opacity-30 animate-ping"
            style={{
              animation: 'ripple 0.6s ease-out forwards',
            }}
          />
        </span>
      ))}
    </div>
  );
}

// Page Transition Component
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade';
  duration?: number;
  className?: string;
}

export function PageTransition({ 
  children, 
  direction = 'slide-right', 
  duration = 300,
  className = '' 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getTransitionClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-out`;
    
    switch (direction) {
      case 'slide-left':
        return `${baseClasses} ${isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`;
      case 'slide-right':
        return `${baseClasses} ${isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`;
      case 'slide-up':
        return `${baseClasses} ${isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'}`;
      case 'slide-down':
        return `${baseClasses} ${isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'}`;
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      default:
        return `${baseClasses} ${isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`;
    }
  };

  return (
    <div className={`${getTransitionClasses()} ${className}`}>
      {children}
    </div>
  );
}

// App Shell Component
interface AppShellProps {
  children: React.ReactNode;
  showOfflineIndicator?: boolean;
  showInstallPrompt?: boolean;
  showUpdateNotification?: boolean;
  className?: string;
}

export function AppShell({ 
  children, 
  showOfflineIndicator = true,
  showInstallPrompt = true,
  showUpdateNotification = true,
  className = '' 
}: AppShellProps) {
  return (
    <SafeAreaContainer className={`min-h-screen bg-[#F8FAFC] ${className}`}>
      {/* Offline Indicator */}
      {showOfflineIndicator && <OfflineIndicator showWhenOnline />}
      
      {/* Update Notification */}
      {showUpdateNotification && <UpdateNotification />}
      
      {/* Main Content */}
      <PageTransition direction="fade">
        {children}
      </PageTransition>
      
      {/* Install Prompt */}
      {showInstallPrompt && <InstallPrompt />}
    </SafeAreaContainer>
  );
}

// PWA Status Hook
export function usePWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Installation status
    const handleAppInstalled = () => setIsInstalled(true);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if already installed (standalone mode)
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setHasUpdate(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isOnline,
    isInstalled,
    hasUpdate,
    isStandalone
  };
} 