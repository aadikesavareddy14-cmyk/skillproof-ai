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
import { SkillProofLogo } from '@/components/SkillProofLogo';

type Route = 'landing' | 'onboarding' | 'dashboard';
type AuthMode = 'signin' | 'signup';

function AppContent() {
  const { session, loading, isNewUser, completeOnboarding, signOut } = useAuth();
  const [route, setRoute] = useState<Route>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setRoute('dashboard');
    } else {
      setRoute('landing');
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (session && route === 'landing' && window.location.pathname === '/') {
      window.history.pushState({}, '', '/dashboard');
      setRoute('dashboard');
    }
  }, [session, loading, route]);

  useEffect(() => {
    if (loading) return;
    if (route === 'dashboard' && !session) {
      setAuthMode('signin');
      setAuthOpen(true);
    }
  }, [route, session, loading]);

  const openAuth = useCallback((mode: AuthMode = 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
  }, []);

  const handleAuthSuccess = useCallback((wasNewUser: boolean) => {
    closeAuth();
    if (wasNewUser) {
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

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      setRoute(path === '/dashboard' ? 'dashboard' : 'landing');
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
