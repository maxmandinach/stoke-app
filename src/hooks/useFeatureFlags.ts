/**
 * Feature Flag Hook
 * 
 * Provides centralized access to feature flags for safe testing of new components.
 * Environment variables control the flags, with localStorage overrides for development.
 */

interface FeatureFlags {
  /**
   * Controls whether to use new design components or existing ones.
   * Default: true (new modern design)
   * Environment: NEXT_PUBLIC_USE_NEW_DESIGN
   */
  useNewDesign: boolean;
}

/**
 * Hook to access feature flags throughout the application.
 * 
 * @returns Object containing all feature flags
 */
export const useFeatureFlags = (): FeatureFlags => {
  // Check environment variable first
  const envUseNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN !== 'false';
  
  // In development, allow localStorage override
  let localStorageOverride = true;
  let hasLocalStorageOverride = false;
  
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const stored = localStorage.getItem('stoke_dev_use_new_design');
    if (stored !== null) {
      localStorageOverride = stored === 'true';
      hasLocalStorageOverride = true;
    }
  }
  
  const useNewDesign = process.env.NODE_ENV === 'development' && hasLocalStorageOverride
    ? localStorageOverride 
    : envUseNewDesign;

  return {
    useNewDesign,
    // Future flags can be added here
    // useNewAnalytics: process.env.NEXT_PUBLIC_USE_NEW_ANALYTICS === 'true',
    // useExperimentalFeatures: process.env.NEXT_PUBLIC_EXPERIMENTAL_FEATURES === 'true',
  };
};

/**
 * Development-only function to toggle feature flags.
 * Only works in development mode for safety.
 */
export const toggleFeatureFlag = (flag: keyof FeatureFlags, value?: boolean): void => {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    console.warn('Feature flag toggling is only available in development mode');
    return;
  }

  switch (flag) {
    case 'useNewDesign':
      const newValue = value !== undefined ? value : !JSON.parse(localStorage.getItem('stoke_dev_use_new_design') || 'true');
      localStorage.setItem('stoke_dev_use_new_design', String(newValue));
      // Trigger a page refresh to apply changes
      window.location.reload();
      break;
    default:
      console.warn(`Unknown feature flag: ${flag}`);
  }
}; 