import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore, SUPPORTED_LANGUAGES, LanguageCode } from '../../store/languageStore';
import { NotificationBell } from '../domain/NotificationBell';
import { VoiceAssistant } from '../domain/VoiceAssistant';
import { MandiBhavTicker } from '../common/MandiBhavTicker';
import { KisanMitraModal } from '../common/KisanMitraModal';
import { GlobalSearch } from '../common/GlobalSearch';
import { FarmerBottomNav } from './FarmerBottomNav';
import { OfficerSidebar } from './OfficerSidebar';
import { AdminSidebar } from './AdminSidebar';
import { Modal } from '../ui/Modal';


export const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggle: toggleDark } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isKisanMitraOpen, setIsKisanMitraOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const isFarmer = user?.role === 'farmer';
  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-gray-950 text-text-primary dark:text-gray-100 transition-colors duration-200">
      {/* Live Mandi Bhav Commodity Ticker */}
      <MandiBhavTicker />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-farmborder/50 dark:border-gray-800/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {(isOfficer || isAdmin) && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-gold shadow-md group-hover:scale-105 transition-all duration-300 ring-2 ring-primary/20">
              🌾
            </div>
            <div>
              <span className="font-heading text-xl font-black tracking-tight text-primary-dark dark:text-white block leading-tight">
                KrishiSeva
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold block flex items-center gap-1">
                <span>Govt of India</span>
                <span className="w-1 h-1 rounded-full bg-gold"></span>
                <span>DoCA</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Farmer Shortcuts (if farmer) */}
        {isAuthenticated && isFarmer && (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-text-muted">
            <Link to="/farmer/dashboard" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/dashboard' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              Dashboard
            </Link>
            <Link to="/farmer/innovations" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/innovations' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              🚀 Innovations
            </Link>
            <Link to="/farmer/crop-scanner" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/crop-scanner' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              🔬 Crop Lab
            </Link>
            <Link to="/farmer/recommendations" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/recommendations' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              💡 AI Advisory
            </Link>
            <Link to="/farmer/history" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/history' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              📜 Passbook
            </Link>
            <Link to="/farmer/book-slot" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/book-slot' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              Book Slot
            </Link>
            <Link to="/farmer/queue" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/queue' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              Queue
            </Link>
            <Link to="/farmer/centres" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/centres' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              Mandis
            </Link>
            <Link to="/farmer/msp-calculator" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/msp-calculator' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              MSP Shield
            </Link>
            <Link to="/farmer/payments" className={`px-3 py-1.5 rounded-full transition-all ${location.pathname === '/farmer/payments' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary hover:bg-surface-2 dark:hover:bg-gray-800'}`}>
              Payments
            </Link>
          </nav>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-farmborder/60 hover:bg-surface-2 dark:hover:bg-gray-800 text-xs font-medium text-text-muted dark:text-gray-400 transition-all shadow-xs"
            title="Search features, crops, mandis (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold border border-farmborder/60 dark:border-gray-700 rounded-md bg-surface dark:bg-gray-800">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-full border border-farmborder/50 dark:border-gray-800 text-text-muted hover:text-text-primary hover:bg-surface-2 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Picker */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-farmborder/60 hover:bg-surface-2 dark:hover:bg-gray-800 text-xs font-bold text-text-primary dark:text-gray-200 transition-all shadow-xs"
            title="Choose Language"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-full border border-farmborder/50 dark:border-gray-800 text-text-muted hover:text-text-primary hover:bg-surface-2 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Notifications */}
          {isAuthenticated && <NotificationBell />}

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-farmborder/60 dark:border-gray-800">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-primary-light font-bold flex items-center justify-center text-xs border border-primary/20 shadow-xs">
                {user?.name?.charAt(0) || 'K'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold block leading-tight truncate max-w-[110px]">
                  {user?.name || 'Farmer'}
                </span>
                <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-text-muted hover:text-red-600 rounded-full transition-colors ml-0.5 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary py-2 px-5 text-xs font-semibold"
            >
              Log In
            </Link>
          )}
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Officer Sidebar */}
        {isAuthenticated && isOfficer && (
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block z-20`}>
            <OfficerSidebar />
          </div>
        )}

        {/* Admin Sidebar */}
        {isAuthenticated && isAdmin && (
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block z-20`}>
            <AdminSidebar />
          </div>
        )}

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${isFarmer ? 'pb-20 md:pb-8' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Farmer Mobile Bottom Navigation */}
      {isAuthenticated && isFarmer && <FarmerBottomNav />}

      {/* Voice Assistant Widget (Farmer Pages) */}
      {isAuthenticated && isFarmer && <VoiceAssistant />}

      {/* Floating AI Kisan Mitra Action Button */}
      <button
        onClick={() => setIsKisanMitraOpen(true)}
        className={`fixed z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-xs shadow-2xl hover:scale-105 transition-all border-2 border-gold/70 ring-4 ring-primary/20 ${
          isAuthenticated && isFarmer
            ? 'bottom-20 md:bottom-8 right-24 md:right-28'
            : 'bottom-20 sm:bottom-6 right-5'
        }`}
        title="Ask AI Kisan Mitra (Voice & Chat Assistant)"
      >
        <Sparkles className="w-4 h-4 text-gold-light animate-pulse" />
        <span>AI Kisan Mitra</span>
      </button>

      {/* AI Kisan Mitra Interactive Modal */}
      <KisanMitraModal
        isOpen={isKisanMitraOpen}
        onClose={() => setIsKisanMitraOpen(false)}
      />

      {/* Language Selection Modal */}
      <Modal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        title="Select Language / भाषा चुनें"
        maxWidth="sm"
      >
        <div className="space-y-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  setIsLangModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-pale dark:bg-primary-dark/30 text-primary dark:text-primary-light'
                    : 'border-farmborder hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200'
                }`}
              >
                <span>{lang.label}</span>
                <span className="font-bold font-display text-base">{lang.native}</span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
