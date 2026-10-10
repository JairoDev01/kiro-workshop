import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '../../lib/auth/error-utils';
import { HeroSection } from './sections/HeroSection';
import { WorkshopSection } from './sections/WorkshopSection';
import { WhyDifferentSection } from './sections/WhyDifferentSection';
import { ArchitectureSection } from './sections/ArchitectureSection';
import { ChoosePathSection } from './sections/ChoosePathSection';
import { SpeakerSection } from './sections/SpeakerSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  // Auth has been mocked: there is no real sign-in. Clicking "Iniciar sesión"
  // simply navigates to the (always-accessible) home workspace. We intentionally
  // do NOT auto-redirect based on auth state so the public landing stays visible
  // until the user explicitly chooses to enter.
  const [error] = useState<AuthError | undefined>(undefined);

  const handleSignIn = async () => {
    navigate('/home');
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
