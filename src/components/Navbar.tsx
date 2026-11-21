import React, { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INSTAGRAM_PROFILE_URL } from '../data/defaultContent';
import { safeExternalUrl } from '../lib/whatsapp';
import { InstagramLogoSvg } from './FloatingSocials';

interface NavbarProps {
  currentView: 'storefront' | 'admin';
  onNavigate: (view: 'storefront' | 'admin', hash?: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { settings, cartItemCount, openCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (hash: string) => {
    setMobileOpen(false);
    onNavigate('storefront', hash);
  };

  const handleAdmin = () => {
    setMobileOpen(false);
    onNavigate('admin');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled || currentView === 'admin'
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E9DFCE] shadow-[0_4px_20px_rgba(41,41,41,0.04)]'
          : 'bg-[#FFFFFF]/90 backdrop-blur-sm border-b border-[#E9DFCE]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('storefront', '#top')}
          className="font-editorial text-lg sm:text-xl tracking-[0.14em] uppercase font-medium text-[#292929] hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B] rounded"
        >
          {settings.brandName}
        </button>

        {/* Zone 2: Minimal Luxury Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#292929]/80"
        >
          <button
            type="button"
            onClick={() => handleLink('#top')}
            className="hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C6A66B]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLink('#bridal-films')}
            className="hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C6A66B]"
          >
            The Bridal Films
          </button>
          <button
            type="button"
            onClick={() => handleLink('#collections')}
            className="hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C6A66B]"
          >
            Collections
          </button>
          <button
            type="button"
            onClick={() => handleLink('#about')}
            className="hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C6A66B]"
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleLink('#contact')}
            className="hover:text-[#7D602B] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C6A66B]"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Instagram + Live Cart + Mobile Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <a
            href={safeExternalUrl(INSTAGRAM_PROFILE_URL)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Modern Jewellers Instagram"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E9DFCE] bg-[#F8F5EF] hover:border-[#C6A66B] transition-colors"
          >
            <InstagramLogoSvg className="w-5 h-5 rounded" />
          </a>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping bag (${cartItemCount} items)`}
            className="relative inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg border border-[#C6A66B]/55 bg-[#F8F5EF] text-[#292929] hover:border-[#C6A66B] hover:bg-[#E9DFCE]/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
          >
            <ShoppingBag className="w-4 h-4 text-[#7D602B]" aria-hidden="true" />
            <span className="hidden sm:inline text-xs tracking-[0.12em] uppercase font-semibold">
              Cart
            </span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded bg-[#C6A66B] text-[#FFFFFF] text-[11px] font-semibold tabular-nums">
              {cartItemCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#292929] hover:text-[#7D602B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#E9DFCE] px-6 py-6 shadow-lg">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleLink('#top')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLink('#bridal-films')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              The Bridal Films
            </button>
            <button
              type="button"
              onClick={() => handleLink('#collections')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              Collections
            </button>
            <button
              type="button"
              onClick={() => handleLink('#showroom')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              Showroom
            </button>
            <button
              type="button"
              onClick={() => handleLink('#about')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => handleLink('#contact')}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#292929] hover:text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={handleAdmin}
              className="text-left min-h-[44px] px-2 text-base font-medium text-[#7D602B] border-b border-[#E9DFCE]/70"
            >
              Owner Admin Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openCart();
              }}
              className="mt-3 w-full min-h-[44px] rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>View Cart ({cartItemCount})</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
