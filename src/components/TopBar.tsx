import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Brain, Calculator, Camera, Video, User, Info, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/learn', icon: BookOpen, labelEn: 'Learn', labelHi: 'सीखें' },
  { path: '/practice', icon: Brain, labelEn: 'Practice', labelHi: 'अभ्यास' },
  { path: '/abacus', icon: Calculator, labelEn: 'Abacus', labelHi: 'अबेकस' },
  { path: '/solver', icon: Camera, labelEn: 'Solver', labelHi: 'सॉल्वर' },
  { path: '/videos', icon: Video, labelEn: 'Videos', labelHi: 'वीडियो' },
  { path: '/about', icon: Info, labelEn: 'About', labelHi: 'हमारे बारे में' },
  { path: '/profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

const TopBar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl transition-colors duration-300 border-b-2 border-border/60 dark:border-primary/20 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,255,0,0.06)]">
      {/* Cinematic gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-[60px] md:h-[70px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.img
            src="/brand_logo.png"
            alt="Logo"
            className="h-[38px] md:h-[44px] w-auto object-contain"
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg gradient-primary shadow-warm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {!isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-lg"
                    whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.1)', scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5" />
                  {t(item.labelEn, item.labelHi)}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg bg-muted hover:bg-muted/70 border-2 border-border transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden border-t-2 border-primary/20 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto p-3 grid grid-cols-3 gap-2">
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all duration-200 border-2 ${
                        isActive
                          ? 'gradient-primary text-primary-foreground shadow-warm border-transparent'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm border-border hover:border-primary/40'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-display font-bold">{t(item.labelEn, item.labelHi)}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TopBar;
