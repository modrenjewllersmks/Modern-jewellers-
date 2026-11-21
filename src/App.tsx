import React, { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CollectionsSection } from './components/CollectionsSection';
import { ContactEnquirySection } from './components/ContactEnquirySection';
import { FloatingSocials } from './components/FloatingSocials';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { LuxuryLoader, ScrollProgressBar } from './components/MotionPrimitives';
import { Navbar } from './components/Navbar';
import { ShowroomSection } from './components/ShowroomSection';
import { VideoShowroomSection } from './components/VideoShowroomSection';
import { StoreProvider } from './context/StoreContext';

function AppShell() {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>(() =>
    window.location.hash === '#admin' ? 'admin' : 'storefront'
  );

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: 'storefront' | 'admin', hash?: string) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.replaceState(null, '', '#admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (hash) {
      window.history.replaceState(null, '', hash);
      requestAnimationFrame(() => {
        const targetId = hash.replace('#', '');
        if (targetId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.history.replaceState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#292929]">
      <LuxuryLoader />
      <ScrollProgressBar />
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {currentView === 'admin' ? (
        <AdminDashboard onBackToStorefront={() => handleNavigate('storefront', '#top')} />
      ) : (
        <>
          <main>
            <HeroSection />
            <VideoShowroomSection />
            <CollectionsSection />
            <ShowroomSection />
            <AboutSection />
            <ContactEnquirySection />
          </main>
          <Footer onOpenAdmin={() => handleNavigate('admin')} />
          <FloatingSocials />
        </>
      )}

      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
