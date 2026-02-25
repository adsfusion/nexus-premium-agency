import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TerminalSquare, ArrowRight, Menu, X } from 'lucide-react';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Contact from '../components/Contact';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F23] selection:bg-[#7C3AED]/30">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between rounded-full px-6 py-4 glass-card transition-all duration-300 ${isScrolled ? 'shadow-lg border-white/20' : 'border-white/5'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                <TerminalSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">NEXUS<span className="text-[#06B6D4]">.</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</a>
              <a href="#work" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Work</a>
              <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
              <Link to="/auth" className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:border-[#7C3AED]/50">
                Client Portal
              </Link>
            </div>

            {/* Mobile Nav Toggle */}
            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#06B6D4]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/10 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-sm font-medium text-slate-200">Next-Gen Design Agency</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
            Design that <br />
            <span className="neon-text inline-block">defies gravity.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            We build premium digital experiences where AI-native technology meets
            flawless visual aesthetics. Elevate your brand to the next dimension.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#E2E8F0] text-[#0F0F23] font-semibold flex items-center justify-center gap-2 hover:bg-white transition-all transform hover:scale-105 active:scale-95">
              Start a Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#work" className="w-full sm:w-auto px-8 py-4 rounded-full glass-card text-white font-medium hover:bg-white/10 transition-all hover:border-[#06B6D4]/50 inline-flex justify-center items-center">
              View Our Work
            </a>
          </div>
        </div>

        {/* Abstract floating UI elements (decorative) */}
        <div className="absolute top-1/3 left-10 md:left-20 p-4 rounded-2xl glass-card hidden lg:block animate-pulse-slow">
          <div className="w-32 h-20 rounded bg-gradient-to-br from-white/5 to-white/0 border border-white/10" />
        </div>
        <div className="absolute bottom-1/4 right-10 md:right-20 p-4 rounded-3xl glass-card hidden lg:block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED]/20 to-transparent border border-[#7C3AED]/30 animate-spin-slow" />
        </div>
      </section>

      {/* Added Sections */}
      <Services />
      <Portfolio />
      <Contact />

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10 bg-[#0F0F23]/80">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} NEXUS Design. Elevating digital reality.
        </div>
      </footer>
    </div>
  );
}

export default App;
