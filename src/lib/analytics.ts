// Analytics and monitoring utilities for production

// Error reporting setup
export const reportError = (error: Error, context?: Record<string, any>) => {
  // In production, you would send this to Sentry or similar service
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    // Example: Sentry.captureException(error, { extra: context });
    console.error('Production error reported:', error, context);
  } else {
    console.error('Error:', error, context);
  }
};

// User analytics tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // In production, you would send this to PostHog, Mixpanel, etc.
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    // Example: posthog.capture(eventName, properties);
    console.log('Event tracked:', eventName, properties);
  } else if (import.meta.env.DEV) {
    console.log('Analytics event:', eventName, properties);
  }
};

// Performance monitoring
export const trackPerformance = (metric: string, value: number, labels?: Record<string, string>) => {
  if (import.meta.env.PROD) {
    // Send to monitoring service
    console.log('Performance metric:', metric, value, labels);
  }
};

// Business metrics
export const trackBusinessEvent = (event: string, data: Record<string, any>) => {
  trackEvent(`business_${event}`, data);
};

// Common events
export const analytics = {
  // User events
  userSignUp: (method: string) => trackEvent('user_signup', { method }),
  userSignIn: (method: string) => trackEvent('user_signin', { method }),
  userSignOut: () => trackEvent('user_signout'),
  
  // Resume events
  resumeGenerated: (template: string, jobType?: string) => 
    trackBusinessEvent('resume_generated', { template, jobType }),
  resumeDownloaded: (template: string, format: string) => 
    trackBusinessEvent('resume_downloaded', { template, format }),
  templateSelected: (templateId: string) => 
    trackEvent('template_selected', { templateId }),
  
  // Subscription events
  subscriptionStarted: (plan: string, amount: number) => 
    trackBusinessEvent('subscription_started', { plan, amount }),
  subscriptionUpgraded: (fromPlan: string, toPlan: string) => 
    trackBusinessEvent('subscription_upgraded', { fromPlan, toPlan }),
  subscriptionCancelled: (plan: string, reason?: string) => 
    trackBusinessEvent('subscription_cancelled', { plan, reason }),
  
  // Credit events
  creditsUsed: (amount: number, action: string) => 
    trackBusinessEvent('credits_used', { amount, action }),
  creditsPurchased: (amount: number, packageType: string, price: number) => 
    trackBusinessEvent('credits_purchased', { amount, packageType, price }),
  
  // Engagement events
  profileCompleted: (completionPercent: number) => 
    trackEvent('profile_completed', { completionPercent }),
  featureUsed: (feature: string) => 
    trackEvent('feature_used', { feature }),
  
  // Error events
  paymentFailed: (reason: string, amount: number) => 
    trackEvent('payment_failed', { reason, amount }),
  errorEncountered: (error: string, page: string) => 
    trackEvent('error_encountered', { error, page }),
};

// Page view tracking
export const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
  trackEvent('page_view', { page: pageName, ...additionalData });
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    // Example: posthog.identify(userId, properties);
    console.log('User properties set:', properties);
  }
};