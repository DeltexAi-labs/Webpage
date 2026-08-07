// Cookie consent management utilities

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean; // Always true
  timestamp: number;
}

const CONSENT_STORAGE_KEY = "cookie-consent-preferences";
const CONSENT_BANNER_KEY = "cookie-consent-shown";

export const cookieConsent = {
  /**
   * Get current consent preferences from localStorage
   */
  getPreferences(): ConsentPreferences | null {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Save consent preferences to localStorage
   */
  savePreferences(preferences: ConsentPreferences): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    localStorage.setItem(CONSENT_BANNER_KEY, "true");
  },

  /**
   * Accept all cookies
   */
  acceptAll(): void {
    const preferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    this.savePreferences(preferences);
  },

  /**
   * Reject all non-necessary cookies
   */
  rejectAll(): void {
    const preferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    this.savePreferences(preferences);
  },

  /**
   * Save custom preferences
   */
  saveCustom(analytics: boolean, marketing: boolean): void {
    const preferences: ConsentPreferences = {
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
    };
    this.savePreferences(preferences);
  },

  /**
   * Check if consent banner has been shown
   */
  hasConsented(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CONSENT_BANNER_KEY) === "true";
  },

  /**
   * Clear all consent data (for testing or user request)
   */
  clearConsent(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem(CONSENT_BANNER_KEY);
  },

  /**
   * Track event based on consent
   */
  trackEvent(eventName: string, data?: Record<string, unknown>): void {
    const preferences = this.getPreferences();

    if (!preferences) return;

    if (preferences.analytics) {
      // Send analytics event
      if (typeof window !== "undefined" && "gtag" in window) {
        (window as any).gtag("event", eventName, data);
      }
    }
  },

  /**
   * Check if a specific cookie type is allowed
   */
  isAllowed(cookieType: "necessary" | "analytics" | "marketing"): boolean {
    if (cookieType === "necessary") return true;

    const preferences = this.getPreferences();
    if (!preferences) return false;

    return preferences[cookieType];
  },
};
