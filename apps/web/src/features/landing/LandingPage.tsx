import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthError } from '../../lib/auth/error-utils';
import { HeroSection } from './sections/HeroSection';
import { WorkshopSection } from './sections/WorkshopSection';
import { WhyDifferentSection } from './sections/WhyDifferentSection';
import { ArchitectureSection } from './sections/ArchitectureSection';
import { ChoosePathSection } from './sections/ChoosePathSection';
import { SpeakerSection } from './sections/SpeakerSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import './LandingPage.css';

interface LocationState {
  error?: AuthError;
}

export const LandingPage = () => {
  const { isAuthenticated, signinRedirect } = useAuth();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [error, setError] = useState<AuthError | undefined>(locationState?.error);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSignIn = async () => {
    setError(undefined);
    try {
      await signinRedirect();
    } catch (e) {
      console.error('signinRedirect failed:', e);
      setError({ type: 'auth_failed', message: 'Error al iniciar sesión. Intenta de nuevo.' });
    }
  };

  return (
    <main className="landing">
      <HeroSection onSignIn={handleSignIn} error={error} />
      <WorkshopSection />
      <SpeakerSection />
      <WhyDifferentSection />
      <ArchitectureSection />
      <ChoosePathSection />
      <FinalCtaSection onSignIn={handleSignIn} />
    </main>
  );
};
