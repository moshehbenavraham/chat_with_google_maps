/**
 * LandingPage Component
 *
 * Public landing page for the application.
 * Introduces the product and provides sign-in/sign-up options.
 *
 * @module src/pages/LandingPage
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth';
import './landing.css';

/**
 * LandingPage Component
 *
 * Features:
 * - Hero section with product introduction
 * - App preview section with screenshot/demo placeholder
 * - Features grid highlighting key capabilities
 * - Call-to-action to get started
 * - Redirects to app if already authenticated
 *
 * @example
 * ```tsx
 * <Route path="/" element={<LandingPage />} />
 * ```
 */
export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to app (or saved destination)
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname ?? '/app';
      void navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="landing-loading">
        <div className="landing-spinner">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    // Pass along any saved destination from ProtectedRoute redirect
    const state = location.state as { from?: { pathname?: string } } | null;
    void navigate('/auth', { state });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">Chat with Maps</div>
        <div className="landing-nav-actions">
          <button className="landing-nav-button" onClick={handleGetStarted}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-hero">
          <h1 className="landing-title">Chat with Google Maps</h1>
          <p className="landing-subtitle">
            Explore the world through AI-powered conversations about any place on Earth. Voice
            control, 3D maps, and real-time grounding.
          </p>
          <button className="landing-cta" onClick={handleGetStarted}>
            Get Started - It&apos;s Free
          </button>
        </section>

        {/* Preview Section */}
        <section className="landing-preview">
          <div className="landing-preview-container">
            <div className="landing-preview-placeholder">
              <span className="icon">map</span>
              <span>Interactive map and chat experience</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="landing-features">
          <div className="landing-features-grid">
            <article className="landing-feature">
              <div className="landing-feature-icon voice">
                <span className="icon">mic</span>
              </div>
              <h3 className="landing-feature-title">Voice Control</h3>
              <p className="landing-feature-description">
                Talk naturally to explore places. Ask questions, get directions, and discover points
                of interest using just your voice.
              </p>
            </article>

            <article className="landing-feature">
              <div className="landing-feature-icon maps">
                <span className="icon">public</span>
              </div>
              <h3 className="landing-feature-title">3D Maps</h3>
              <p className="landing-feature-description">
                Explore in full 3D satellite view. Tilt, rotate, and zoom to see places from any
                angle with stunning detail.
              </p>
            </article>

            <article className="landing-feature">
              <div className="landing-feature-icon realtime">
                <span className="icon">bolt</span>
              </div>
              <h3 className="landing-feature-title">Real-time Grounding</h3>
              <p className="landing-feature-description">
                AI responses are grounded in real Google Maps data. Get accurate, up-to-date
                information about any location.
              </p>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-footer-copyright">
          &copy; {new Date().getFullYear()} Chat with Maps
        </span>
        <div className="landing-footer-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-link"
          >
            <span className="icon">code</span>
            GitHub
          </a>
          <a
            href="#"
            className="landing-footer-link"
            onClick={e => {
              e.preventDefault();
            }}
          >
            <span className="icon">description</span>
            Docs
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
