'use client';

import React, { useState } from 'react';
import { 
  OfflineIndicator, 
  InstallPrompt, 
  UpdateNotification, 
  SafeAreaContainer, 
  TouchFeedback, 
  PageTransition, 
  AppShell,
  usePWAStatus 
} from '@/components/PWAComponents';
import { FeedbackMessage, ToastContainer, useToast } from '@/components/FeedbackComponents';

export default function PWADemoPage() {
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade'>('fade');
  
  const { toasts, addToast, dismissToast } = useToast();
  const pwaStatus = usePWAStatus();

  const simulateOffline = () => {
    setShowOfflineIndicator(true);
    addToast({
      type: 'warning',
      title: 'Demo Mode',
      message: 'Simulating offline state for 5 seconds'
    });
    setTimeout(() => setShowOfflineIndicator(false), 5000);
  };

  const simulateInstallPrompt = () => {
    setShowInstallPrompt(true);
    addToast({
      type: 'info',
      title: 'Demo Mode',
      message: 'Showing install prompt simulation'
    });
  };

  const simulateUpdateNotification = () => {
    setShowUpdateNotification(true);
    addToast({
      type: 'info',
      title: 'Demo Mode',
      message: 'Showing update notification simulation'
    });
  };

  const handleInstall = () => {
    setShowInstallPrompt(false);
    addToast({
      type: 'success',
      title: 'Installation Successful',
      message: 'App has been installed to your device!'
    });
  };

  const handleUpdate = () => {
    setShowUpdateNotification(false);
    addToast({
      type: 'success',
      title: 'Update Applied',
      message: 'App has been updated to the latest version!'
    });
  };

  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
      addToast({
        type: 'success',
        title: 'Haptic Feedback',
        message: 'Device vibration triggered!'
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Not Supported',
        message: 'Haptic feedback not available on this device'
      });
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Demo Offline Indicator */}
      {showOfflineIndicator && (
        <OfflineIndicator 
          className="z-50" 
          showWhenOnline={false}
        />
      )}
      
      {/* Demo Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt 
          onInstall={handleInstall}
          onDismiss={() => setShowInstallPrompt(false)}
        />
      )}
      
      {/* Demo Update Notification */}
      {showUpdateNotification && (
        <UpdateNotification 
          onUpdate={handleUpdate}
          onDismiss={() => setShowUpdateNotification(false)}
        />
      )}

      <SafeAreaContainer className="min-h-screen bg-[#F8FAFC]">
        <PageTransition direction={transitionDirection}>
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] leading-[40px] font-bold text-[#1E293B] mb-4">
                PWA Visual Features Demo
              </h1>
              <p className="text-[16px] leading-[24px] text-[#64748B] max-w-2xl mx-auto">
                Experience all the Progressive Web App visual features including offline indicators, 
                install prompts, update notifications, safe area handling, touch feedback, and smooth transitions.
              </p>
            </div>

            {/* PWA Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
              <h2 className="text-[20px] leading-[28px] font-semibold text-[#1E293B] mb-4">
                Current PWA Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${pwaStatus.isOnline ? 'bg-[#059669]' : 'bg-[#DC2626]'}`} />
                  <div className="text-sm font-medium text-[#1E293B]">
                    {pwaStatus.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${pwaStatus.isInstalled ? 'bg-[#059669]' : 'bg-[#64748B]'}`} />
                  <div className="text-sm font-medium text-[#1E293B]">
                    {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${pwaStatus.hasUpdate ? 'bg-[#D97706]' : 'bg-[#64748B]'}`} />
                  <div className="text-sm font-medium text-[#1E293B]">
                    {pwaStatus.hasUpdate ? 'Update Available' : 'Up to Date'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${pwaStatus.isStandalone ? 'bg-[#059669]' : 'bg-[#64748B]'}`} />
                  <div className="text-sm font-medium text-[#1E293B]">
                    {pwaStatus.isStandalone ? 'Standalone' : 'Browser'}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Demos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Offline State Indicators */}
              <TouchFeedback haptic ripple>
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F59E0B] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v2m0 16v2m10-10h-2M4 12H2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[18px] leading-[24px] font-semibold text-[#1E293B] mb-2">
                        Offline State Indicators
                      </h3>
                      <p className="text-[14px] leading-[20px] text-[#64748B] mb-4">
                        Visual feedback when the app goes offline, with smooth transitions and proper styling.
                      </p>
                      <button
                        onClick={simulateOffline}
                        className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors duration-200"
                      >
                        Simulate Offline
                      </button>
                    </div>
                  </div>
                </div>
              </TouchFeedback>

              {/* Install Prompt */}
              <TouchFeedback haptic ripple>
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2563EB] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[18px] leading-[24px] font-semibold text-[#1E293B] mb-2">
                        Install Prompt
                      </h3>
                      <p className="text-[14px] leading-[20px] text-[#64748B] mb-4">
                        Native-style installation prompt with proper styling and animations.
                      </p>
                      <button
                        onClick={simulateInstallPrompt}
                        className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors duration-200"
                      >
                        Show Install Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </TouchFeedback>

              {/* Update Notifications */}
              <TouchFeedback haptic ripple>
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#059669] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[18px] leading-[24px] font-semibold text-[#1E293B] mb-2">
                        Update Notifications
                      </h3>
                      <p className="text-[14px] leading-[20px] text-[#64748B] mb-4">
                        Elegant notifications when app updates are available.
                      </p>
                      <button
                        onClick={simulateUpdateNotification}
                        className="bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors duration-200"
                      >
                        Show Update Alert
                      </button>
                    </div>
                  </div>
                </div>
              </TouchFeedback>

              {/* Touch Feedback */}
              <TouchFeedback haptic ripple>
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#7C3AED] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[18px] leading-[24px] font-semibold text-[#1E293B] mb-2">
                        Touch Feedback
                      </h3>
                      <p className="text-[14px] leading-[20px] text-[#64748B] mb-4">
                        Haptic feedback and visual ripple effects for touch interactions.
                      </p>
                      <button
                        onClick={triggerHapticFeedback}
                        className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors duration-200"
                      >
                        Try Haptic Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </TouchFeedback>
            </div>

            {/* Page Transitions Demo */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#1E293B] mb-4">
                Page Transitions Demo
              </h3>
              <p className="text-[14px] leading-[20px] text-[#64748B] mb-6">
                Try different transition animations to see smooth app-like navigation.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                  { direction: 'slide-left' as const, label: 'Slide Left' },
                  { direction: 'slide-right' as const, label: 'Slide Right' },
                  { direction: 'slide-up' as const, label: 'Slide Up' },
                  { direction: 'slide-down' as const, label: 'Slide Down' },
                  { direction: 'fade' as const, label: 'Fade' }
                ].map((transition) => (
                  <TouchFeedback key={transition.direction} haptic ripple scale>
                    <button
                      onClick={() => setTransitionDirection(transition.direction)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transitionDirection === transition.direction
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {transition.label}
                    </button>
                  </TouchFeedback>
                ))}
              </div>

              <FeedbackMessage
                type="info"
                title="Transition Active"
                message={`Currently using ${transitionDirection.replace('-', ' ')} transition. Select a different option above to see the effect.`}
              />
            </div>

            {/* Safe Area Demo */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#1E293B] mb-4">
                Safe Area Handling
              </h3>
              <p className="text-[14px] leading-[20px] text-[#64748B] mb-6">
                This demo page automatically handles safe areas for devices with notches, rounded corners, or home indicators.
              </p>
              
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0]">
                <div className="text-sm text-[#64748B] space-y-1">
                  <div>• Top safe area: Automatically avoids status bar and notches</div>
                  <div>• Bottom safe area: Accounts for home indicators and navigation</div>
                  <div>• Side safe areas: Handles curved edges and camera cutouts</div>
                  <div>• Touch targets: Properly sized for accessibility</div>
                </div>
              </div>
            </div>

            {/* Demo Controls */}
            <div className="mt-8 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <h4 className="text-sm font-semibold text-[#1E293B] mb-2">Demo Notes:</h4>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• All components use exact style guide colors (#F8FAFC, #E2E8F0, etc.)</li>
                <li>• Touch feedback includes ripple effects and haptic vibration (where supported)</li>
                <li>• Animations respect user's reduced motion preferences</li>
                <li>• Components are fully accessible with proper ARIA labels</li>
                <li>• Safe area handling works automatically on supported devices</li>
              </ul>
            </div>
          </div>
        </PageTransition>
      </SafeAreaContainer>
    </>
  );
} 