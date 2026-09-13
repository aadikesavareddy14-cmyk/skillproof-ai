import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SkillProofLogo } from '@/components/SkillProofLogo';

interface NavbarProps {
  onLogIn: () => void;
  onGetStarted: () => void;
  onSeeHowItWorks: () => void;
}

export function Navbar({ onLogIn, onGetStarted, onSeeHowItWorks }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-zinc-800/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center focus:outline-none">
            <SkillProofLogo variant="lockup" size="navbar" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={onSeeHowItWorks} className="text-sm text-zinc-400 hover:text-white transition-colors">
              How it works
            </button>
            <a href="#verification" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Verification
            </a>
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Stats
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogIn}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Get started free
            </button>
          </div>

          <button
            className="md:hidden text-zinc-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <button onClick={() => { onSeeHowItWorks(); setMenuOpen(false); }} className="block text-sm text-zinc-400 hover:text-white">
              How it works
            </button>
            <a href="#verification" onClick={() => setMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">
              Verification
            </a>
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">
              Features
            </a>
            <a href="#stats" onClick={() => setMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">
              Stats
            </a>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { onLogIn(); setMenuOpen(false); }}
                className="flex-1 text-sm font-medium px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-600 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => { onGetStarted(); setMenuOpen(false); }}
                className="flex-1 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
