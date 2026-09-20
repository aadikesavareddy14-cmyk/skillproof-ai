import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { VerificationDemo } from '@/components/VerificationDemo';
import { Features } from '@/components/Features';
import { Stats } from '@/components/Stats';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { Dashboard } from '@/components/Dashboard';
import { Onboarding } from '@/components/Onboarding';
import { AuthCallback } from '@/components/AuthCallback';
import { ResetPasswordPage } from '@/components/ResetPasswordPage';
import { SkillProofLogo } from '@/components/SkillProofLogo';

type Route = 'landing' | 'onboarding' | 'dashboard' | 'callback' | 'reset-password';
type AuthMode = 'signin' | 'signup' | 'forgot';

function AppContent() {
  const { session, loading, isNewUser, completeOnboarding, signOut } = useAuth();
  const [route, setRoute] = useState<Route>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [authCallbackError, setAuthCallbackError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth error parameters in query or hash across all routes
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    let hashParams = new URLSearchParams();
    if (window.location.hash) {
      hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    }

    const errorParam =
      searchParams.get('error') ||
      searchParams.get('error_code') ||
      hashParams.get('error') ||
      hashParams.get('error_code');
    const errorDesc =
      searchParams.get('error_description') ||
      searchParams.get('msg') ||
      hashParams.get('error_description') ||
      hashParams.get('msg');

    if (errorParam || errorDesc) {
      console.warn('[OAuth Return Error]:', { errorParam, errorDesc });
      window.history.replaceState({}, '', '/');
      setRoute('landing');
      if (
        errorParam === 'access_denied' ||
        (errorDesc && errorDesc.toLowerCase().includes('denied')) ||
        (errorDesc && errorDesc.toLowerCase().includes('cancel'))
      ) {
        setAuthCallbackError('Google sign-in was cancelled. Please try again.');
      } else {
        setAuthCallbackError('Something went wrong signing in with Google — please try again');
      }
      setAuthMode('signin');
      setAuthOpen(true);
      return;
    }

    const path = window.location.pathname;
    if (path === '/auth/callback' || path.startsWith('/auth/callback')) {
      setRoute('callback');
    } else if (path === '/reset-password' || path.startsWith('/reset-password')) {
      setRoute('reset-password');
    } else if (path === '/dashboard') {
      setRoute('dashboard');
    } else if (path === '/onboarding') {
      setRoute('onboarding');
    } else {
      setRoute('landing');
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (route === 'callback' || route === 'reset-password') return;
    if (session && route === 'landing' && window.location.pathname === '/') {
      window.history.pushState({}, '', '/dashboard');
      setRoute('dashboard');
    }
  }, [session, loading, route]);

  // Route first-time users to onboarding, clean up OAuth query/hash params from /dashboard
  useEffect(() => {
    if (loading) return;
    if (session && (window.location.search || window.location.hash)) {
      // Clean up OAuth query parameters from URL bar
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (route === 'dashboard' && session && isNewUser) {
      window.history.replaceState({}, '', '/onboarding');
      setRoute('onboarding');
    }
  }, [route, session, isNewUser, loading]);

  useEffect(() => {
    if (loading) return;
    if (route === 'dashboard' && !session) {
      setAuthMode('signin');
      setAuthOpen(true);
    }
  }, [route, session, loading]);

  const openAuth = useCallback((mode: AuthMode = 'signup') => {
    setAuthMode(mode);
    setAuthCallbackError(null);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setAuthCallbackError(null);
  }, []);

  const handleAuthSuccess = useCallback((wasNewUser: boolean) => {
    closeAuth();
    if (wasNewUser) {
      window.history.pushState({}, '', '/onboarding');
      setRoute('onboarding');
    } else {
      window.history.pushState({}, '', '/dashboard');
      setRoute('dashboard');
    }
  }, [closeAuth]);

  const handleOnboardingComplete = useCallback(async () => {
    await completeOnboarding();
    window.history.pushState({}, '', '/dashboard');
    setRoute('dashboard');
  }, [completeOnboarding]);

  const scrollToHowItWorks = useCallback(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    window.history.pushState({}, '', '/');
    setRoute('landing');
  }, [signOut]);

  const handleCallbackSuccess = useCallback((wasNewUser: boolean) => {
    if (wasNewUser) {
      window.history.replaceState({}, '', '/onboarding');
      setRoute('onboarding');
    } else {
      window.history.replaceState({}, '', '/dashboard');
      setRoute('dashboard');
    }
  }, []);

  const handleCallbackError = useCallback((errorMessage: string | null) => {
    window.history.replaceState({}, '', '/');
    setRoute('landing');
    if (errorMessage) {
      setAuthCallbackError(errorMessage);
      setAuthMode('signin');
      setAuthOpen(true);
    } else {
      // Quiet return when user cancelled provider consent
      setAuthCallbackError(null);
      setAuthOpen(false);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path === '/auth/callback' || path.startsWith('/auth/callback')) {
        setRoute('callback');
      } else if (path === '/reset-password' || path.startsWith('/reset-password')) {
        setRoute('reset-password');
      } else if (path === '/dashboard') {
        setRoute('dashboard');
      } else if (path === '/onboarding') {
        setRoute('onboarding');
      } else {
        setRoute('landing');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6">
        <SkillProofLogo variant="full" size="auth" animated />
        <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Loading verified environment...</span>
        </div>
      </div>
    );
  }

  if (route === 'callback') {
    return (
      <AuthCallback
        onSuccess={handleCallbackSuccess}
        onError={handleCallbackError}
      />
    );
  }

  if (route === 'reset-password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          window.history.pushState({}, '', '/dashboard');
          setRoute('dashboard');
        }}
        onRequestNewLink={() => {
          window.history.pushState({}, '', '/');
          setRoute('landing');
          openAuth('forgot');
        }}
      />
    );
  }

  if (route === 'onboarding' && session) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (route === 'dashboard' && session) {
    if (isNewUser) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }
    return <Dashboard onSignOut={handleSignOut} />;
  }

  return (
    <>
      <Navbar
        onLogIn={() => openAuth('signin')}
        onGetStarted={() => openAuth('signup')}
        onSeeHowItWorks={scrollToHowItWorks}
      />
      <main>
        <Hero onGetStarted={() => openAuth('signup')} onSeeHowItWorks={scrollToHowItWorks} />
        <HowItWorks />
        <VerificationDemo />
        <Features />
        <Stats />
        <CTA onGetStarted={() => openAuth('signup')} />
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onClose={closeAuth}
        initialMode={authMode}
        initialError={authCallbackError}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
