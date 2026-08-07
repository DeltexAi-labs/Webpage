"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cookieConsent } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    // Check consent after client hydration
    // This intentionally sets state in effect to handle hydration mismatch with localStorage
    const hasConsented = cookieConsent.hasConsented();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(!hasConsented);
  }, []);

  const handleAcceptAll = () => {
    cookieConsent.acceptAll();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    cookieConsent.rejectAll();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    cookieConsent.saveCustom(analytics, marketing);
    setIsVisible(false);
    setShowDetails(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {showDetails && (
        <div
          className="cookie-consent-backdrop"
          onClick={() => setShowDetails(false)}
          aria-hidden="true"
        />
      )}

      {/* Banner */}
      <div
        className="cookie-consent-banner"
        role="dialog"
        aria-label="Cookie consent"
        suppressHydrationWarning
      >
        <div className="cookie-consent-content">
          {!showDetails ? (
            <>
              <div>
                <h2 className="cookie-consent-title">Privacy & Cookies</h2>
                <p className="cookie-consent-description">
                  We use cookies to enhance your experience and analyze site usage. We do not track you across
                  other sites. By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can customize
                  your preferences or learn more in our{" "}
                  <Link href="/privacy" className="cookie-consent-link">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>

              <div className="cookie-consent-actions">
                <button
                  onClick={handleRejectAll}
                  className="cookie-consent-btn cookie-consent-btn-secondary"
                  aria-label="Reject all cookies"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="cookie-consent-btn cookie-consent-btn-secondary"
                  aria-label="Customize cookie preferences"
                >
                  Customize
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="cookie-consent-btn cookie-consent-btn-primary"
                  aria-label="Accept all cookies"
                >
                  Accept All
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="cookie-consent-title">Cookie Preferences</h2>
                <p className="cookie-consent-description">
                  Manage which cookies we can use. Necessary cookies are always enabled.
                </p>

                <div className="cookie-consent-preferences">
                  {/* Necessary Cookies */}
                  <div className="cookie-consent-preference">
                    <div className="cookie-consent-preference-header">
                      <label className="cookie-consent-preference-label">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="cookie-consent-checkbox"
                          aria-label="Necessary cookies"
                        />
                        <span>
                          <strong>Necessary Cookies</strong>
                          <span className="cookie-consent-badge">Always On</span>
                        </span>
                      </label>
                    </div>
                    <p className="cookie-consent-preference-desc">
                      Essential for the website to function properly, including security, authentication, and
                      basic functionality.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="cookie-consent-preference">
                    <div className="cookie-consent-preference-header">
                      <label className="cookie-consent-preference-label">
                        <input
                          type="checkbox"
                          checked={analytics}
                          onChange={(e) => setAnalytics(e.target.checked)}
                          className="cookie-consent-checkbox"
                          aria-label="Analytics cookies"
                        />
                        <span>Analytics Cookies</span>
                      </label>
                    </div>
                    <p className="cookie-consent-preference-desc">
                      Help us understand how visitors use the site by collecting anonymous usage data.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="cookie-consent-preference">
                    <div className="cookie-consent-preference-header">
                      <label className="cookie-consent-preference-label">
                        <input
                          type="checkbox"
                          checked={marketing}
                          onChange={(e) => setMarketing(e.target.checked)}
                          className="cookie-consent-checkbox"
                          aria-label="Marketing cookies"
                        />
                        <span>Marketing Cookies</span>
                      </label>
                    </div>
                    <p className="cookie-consent-preference-desc">
                      Used for advertising purposes and to track the effectiveness of marketing campaigns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="cookie-consent-actions">
                <button
                  onClick={() => setShowDetails(false)}
                  className="cookie-consent-btn cookie-consent-btn-secondary"
                  aria-label="Go back to cookie consent banner"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="cookie-consent-btn cookie-consent-btn-primary"
                  aria-label="Save cookie preferences"
                >
                  Save Preferences
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .cookie-consent-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.2s ease-in-out;
        }

        .cookie-consent-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--ink);
          color: var(--paper);
          border-top: 1px solid var(--line);
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .cookie-consent-content {
          width: var(--shell);
          margin-inline: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .cookie-consent-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--mint);
        }

        .cookie-consent-description {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--paper);
        }

        .cookie-consent-link {
          color: var(--blue);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .cookie-consent-link:hover {
          color: var(--mint);
        }

        .cookie-consent-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cookie-consent-btn {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .cookie-consent-btn:hover {
          transform: translateY(-2px);
        }

        .cookie-consent-btn-primary {
          background: var(--mint-strong);
          color: var(--ink);
        }

        .cookie-consent-btn-primary:hover {
          background: var(--mint);
        }

        .cookie-consent-btn-secondary {
          background: transparent;
          color: var(--paper);
          border: 1px solid var(--paper);
        }

        .cookie-consent-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--mint);
          color: var(--mint);
        }

        .cookie-consent-preferences {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 16px;
        }

        .cookie-consent-preference {
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--ink-soft);
        }

        .cookie-consent-preference-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .cookie-consent-preference-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-weight: 600;
          color: var(--paper);
        }

        .cookie-consent-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--mint-strong);
        }

        .cookie-consent-checkbox:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cookie-consent-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          background: var(--mint-strong);
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cookie-consent-preference-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-muted);
        }

        @media (max-width: 768px) {
          .cookie-consent-content {
            padding: 16px;
          }

          .cookie-consent-title {
            font-size: 16px;
          }

          .cookie-consent-description {
            font-size: 13px;
          }

          .cookie-consent-actions {
            flex-direction: column;
          }

          .cookie-consent-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
