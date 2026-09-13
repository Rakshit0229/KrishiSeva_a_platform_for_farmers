import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  Scale,
  CreditCard,
  ShieldCheck,
  Calculator,
  Compass,
  Mic,
  AlertCircle,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CentreCard } from '../../components/domain/CentreCard';
import { Modal } from '../../components/ui/Modal';
import { MandiBhavTicker } from '../../components/common/MandiBhavTicker';
import { KisanMitraModal } from '../../components/common/KisanMitraModal';
import { FeatureDetailModal, FeatureDetail } from '../../components/common/FeatureDetailModal';
import { AgriOSShowcase } from '../../components/common/AgriOSShowcase';
import { differentiatorsData } from '../../data/differentiatorsData';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore, SUPPORTED_LANGUAGES, LanguageCode } from '../../store/languageStore';
import toast from 'react-hot-toast';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { isDark, toggle: toggleDark } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isKisanMitraOpen, setIsKisanMitraOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterPhone, setNewsletterPhone] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterPhone) {
      toast.error('Please enter a valid phone number');
      return;
    }
    toast.success('Subscribed! You will receive instant SMS alerts when MSP rates update.');
    setNewsletterPhone('');
  };

  const differentiators = differentiatorsData;

  const cropsShowcase = [
    {
      name: 'Wheat',
      hindi: 'गेहूं',
      msp: '₹2,425 / Qtl',
      season: 'Rabi 2026',
      image: '/images/crops/wheat.jpg',
      badge: 'Active Procurement',
    },
    {
      name: 'Paddy / Basmati',
      hindi: 'धान (बासमती)',
      msp: '₹2,300 / Qtl',
      season: 'Kharif 2025',
      image: '/images/crops/paddy.jpg',
      badge: 'High Demand',
    },
    {
      name: 'Mustard',
      hindi: 'सरसों',
      msp: '₹5,950 / Qtl',
      season: 'Rabi 2026',
      image: '/images/crops/mustard.jpg',
      badge: 'MSP Shielded',
    },
    {
      name: 'Cotton',
      hindi: 'कपास (नरमा)',
      msp: '₹7,121 / Qtl',
      season: 'Kharif 2025',
      image: '/images/crops/cotton.jpg',
      badge: 'Certified Scale',
    },
    {
      name: 'Maize',
      hindi: 'मक्का',
      msp: '₹2,090 / Qtl',
      season: 'Kharif 2025',
      image: '/images/crops/maize.jpg',
      badge: 'Fast Clearance',
    },
    {
      name: 'Chickpea / Gram',
      hindi: 'चना (दाल)',
      msp: '₹5,650 / Qtl',
      season: 'Rabi 2026',
      image: '/images/crops/chickpea.jpg',
      badge: 'Direct DBT',
    },
    {
      name: 'Soybean',
      hindi: 'सोयाबीन',
      msp: '₹4,892 / Qtl',
      season: 'Kharif 2025',
      image: '/images/crops/soybean.jpg',
      badge: 'Direct DBT',
    },
    {
      name: 'Groundnut',
      hindi: 'मूंगफली',
      msp: '₹6,783 / Qtl',
      season: 'Kharif 2025',
      image: '/images/crops/groundnut.jpg',
      badge: 'Certified Quality',
    },
  ];

  const testimonials = [
    {
      name: 'Gurpreet Singh',
      village: 'Tarn Taran, Amritsar, Punjab',
      crop: 'Wheat (48 Quintals)',
      avatar: '/images/farmers/gurpreet.jpg',
      quote:
        'Earlier, I used to wait in tractor lines for 3 days and nights in November cold. With KrishiSeva, I booked slot 10 AM, weighed in 20 minutes, and money reached my PNB account in 48 hours!',
      rating: 5,
    },
    {
      name: 'Ramesh Yadav',
      village: 'Saharsa, Patna, Bihar',
      crop: 'Paddy & Maize',
      avatar: '/images/farmers/ramesh.jpg',
      quote:
        'Local traders offered ₹1,800 for paddy when MSP was ₹2,300. KrishiSeva helped me book a slot at the central mandi and saved ₹24,000 on my harvest!',
      rating: 5,
    },
    {
      name: 'Sunita Devi',
      village: 'Narnaul, Hisar, Haryana',
      crop: 'Mustard (30 Quintals)',
      avatar: '/images/farmers/sunita.jpg',
      quote:
        'The live queue on phone is a blessing. We reached the mandi only when token #40 was called, avoiding waiting with our children in dusty sheds.',
      rating: 5,
    },
  ];

  const sampleCentres = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Amritsar Central Mandi',
      district: 'Amritsar',
      state: 'Punjab',
      address: 'GT Road, Near Bus Stand',
      today_booked_slots: 62,
      today_max_slots: 80,
      load_pct: 78,
      congestion: 'medium',
      estimated_wait_minutes: 25,
      avg_rating: 4.9,
      crops_accepted: ['wheat', 'paddy', 'maize'],
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Ludhiana Grain Market',
      district: 'Ludhiana',
      state: 'Punjab',
      address: 'Miller Ganj, Ludhiana',
      today_booked_slots: 40,
      today_max_slots: 100,
      load_pct: 40,
      congestion: 'low',
      estimated_wait_minutes: 15,
      avg_rating: 4.8,
      crops_accepted: ['wheat', 'paddy', 'cotton'],
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Hisar Procurement Centre',
      district: 'Hisar',
      state: 'Haryana',
      address: 'Sector 14, Hisar',
      today_booked_slots: 55,
      today_max_slots: 60,
      load_pct: 92,
      congestion: 'peak',
      estimated_wait_minutes: 50,
      avg_rating: 4.7,
      crops_accepted: ['wheat', 'mustard', 'barley'],
    },
  ];

  const faqs = [
    {
      q: 'How does KrishiSeva eliminate long mandi queues?',
      a: 'Farmers book guaranteed 1-hour time slots through the app, web, IVR, or WhatsApp. You arrive only when your token window opens, cutting waiting times from 18 hours to under 30 minutes.',
    },
    {
      q: 'When and how will I receive payment for my grain?',
      a: 'Once your grain is weighed at the digital weighbridge, an automated procurement receipt is generated. Payment is disbursed directly to your Aadhaar-linked bank account within 72 hours via PFMS Direct Benefit Transfer (DBT).',
    },
    {
      q: 'Can I use KrishiSeva without a smartphone?',
      a: 'Yes! KrishiSeva supports automated IVR phone call booking and SMS alerts in 6 regional languages. Village CSC centres and FPO leaders can also bulk-book on your behalf.',
    },
    {
      q: 'What happens if my crop moisture is slightly higher than the norm?',
      a: 'Use the built-in AI Crop Pre-Scanner before travelling. It provides immediate recommendations on whether you should dry your crop for 1–2 days to avoid rejection at the mandi gate.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* Real-time Mandi Bhav Ticker */}
      <MandiBhavTicker />

      {/* TOP NAVIGATION BAR (Matching User Requested Section) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-farmborder/60 dark:border-gray-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-gold shadow-md group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <span className="font-heading text-xl font-bold tracking-tight text-primary-dark dark:text-white block leading-tight">
                KrishiSeva
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                Govt of India · DoCA
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (From User Screenshot) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-semibold text-text-muted">
          <Link
            to="/farmer/dashboard"
            className="hover:text-primary dark:hover:text-primary-light transition-colors py-1"
          >
            Dashboard
          </Link>
          <Link
            to="/farmer/book-slot"
            className="text-primary dark:text-primary-light font-bold hover:text-primary-dark transition-colors py-1"
          >
            Book Slot
          </Link>
          <Link
            to="/farmer/queue"
            className="hover:text-primary dark:hover:text-primary-light transition-colors py-1"
          >
            Live Queue
          </Link>
          <Link
            to="/farmer/centres"
            className="hover:text-primary dark:hover:text-primary-light transition-colors py-1"
          >
            Mandis
          </Link>
          <Link
            to="/farmer/map"
            className="hover:text-primary dark:hover:text-primary-light transition-colors py-1"
          >
            GIS Map
          </Link>
          <Link
            to="/farmer/crop-scanner"
            className="hover:text-primary dark:hover:text-primary-light transition-colors py-1 flex items-center gap-1"
          >
            <span>🔬 Crop Lab</span>
          </Link>
          <Link
            to="/farmer/innovations"
            className="text-primary dark:text-primary-light font-bold hover:text-primary-dark transition-colors py-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20"
          >
            <span>🚀 Innovations</span>
          </Link>
        </nav>

        {/* Right: Language Pill, Theme Toggle, & Login CTA */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector Pill (As shown in screenshot: Globe icon + EN) */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-farmborder dark:border-gray-700 bg-surface dark:bg-gray-800 hover:bg-surface-2 dark:hover:bg-gray-700 text-xs font-bold text-text-primary dark:text-gray-200 transition-all shadow-xs"
            title="Choose Language"
          >
            <Globe className="w-4 h-4 text-primary dark:text-primary-light" />
            <span className="uppercase tracking-wider">{language}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-full border border-farmborder/60 dark:border-gray-700 hover:bg-surface-2 dark:hover:bg-gray-800 text-text-muted transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Action Button */}
          {isAuthenticated ? (
            <Link to={user?.role === 'farmer' ? '/farmer/dashboard' : user?.role === 'officer' ? '/officer/dashboard' : '/admin/analytics'}>
              <Button variant="primary" size="sm" className="text-xs font-bold px-4 hidden sm:inline-flex">
                My Account
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" className="text-xs font-bold px-4 hidden sm:inline-flex">
                Login / OTP
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-farmborder p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <Link
              to="/farmer/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/farmer/book-slot"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl bg-primary-pale dark:bg-primary-dark/30 text-primary font-bold"
            >
              📅 Book Slot
            </Link>
            <Link
              to="/farmer/queue"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              🎫 Live Queue
            </Link>
            <Link
              to="/farmer/centres"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              📍 Mandis
            </Link>
            <Link
              to="/farmer/map"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              🗺️ GIS Map
            </Link>
            <Link
              to="/farmer/msp-calculator"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              🧮 MSP Calculator
            </Link>
            <Link
              to="/farmer/payments"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              💳 Payments
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileNavOpen(false)}
              className="p-2.5 rounded-xl hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-200"
            >
              ❓ Help Center
            </Link>
          </div>
          <div className="pt-2 border-t border-farmborder">
            <Link to="/login" onClick={() => setMobileNavOpen(false)} className="block">
              <Button variant="primary" size="sm" className="w-full">
                {isAuthenticated ? 'Open Farmer Portal' : 'Login with OTP'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION (Pattern B: Full-bleed Farm Photography with Deep Cinematic Glow) */}
      <section className="relative min-h-[640px] lg:min-h-[740px] flex items-center bg-primary-dark text-white overflow-hidden organic-texture">
        {/* Farm Background Image with Heavy Left Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#113117]/98 via-[#184420]/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,160,23,0.18)_0%,transparent_50%)]" />

        {/* Decorative Floating Wheat SVGs (Pattern C) */}
        <div className="absolute right-12 top-16 opacity-30 animate-float-gentle pointer-events-none hidden lg:block">
          <svg className="w-28 h-80" viewBox="0 0 60 180" fill="none">
            <path d="M30 170 Q30 90 30 10" stroke="#D4A017" strokeWidth="2.5" />
            <ellipse cx="30" cy="30" rx="14" ry="7" fill="#D4A017" transform="rotate(-30 30 30)" />
            <ellipse cx="30" cy="50" rx="14" ry="7" fill="#D4A017" transform="rotate(30 30 50)" />
            <ellipse cx="30" cy="70" rx="12" ry="6" fill="#D4A017" transform="rotate(-20 30 70)" />
            <ellipse cx="30" cy="90" rx="11" ry="5.5" fill="#D4A017" transform="rotate(25 30 90)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gold/15 backdrop-blur-md border border-gold/40 text-gold-light text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              <span>Department of Consumer Affairs · Govt of India</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.12] tracking-tight drop-shadow-sm">
              किसान को मिलेगा{' '}
              <span className="inline-flex items-center align-middle mx-1.5 px-2.5 py-1 rounded-full bg-gold/30 backdrop-blur-md border border-gold/60 shadow-lg hover:scale-105 transition-transform">
                <img
                  src="/images/farmers/gurpreet.jpg"
                  alt="Kisan"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gold shadow"
                />
              </span>
              <br />
              <span className="text-gold-light italic font-serif">उसका हक़</span>{' '}
              <span className="inline-flex items-center align-middle mx-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/50 shadow-lg hover:scale-105 transition-transform">
                <img
                  src="/images/crops/wheat.jpg"
                  alt="Golden Grain"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow"
                />
              </span>
            </h1>

            <p className="text-lg sm:text-xl font-semibold text-gray-100 leading-snug">
              Farmers Get What They Deserve — Guaranteed MSP & Zero Mandi Queues.
            </p>

            <p className="text-sm sm:text-base text-primary-pale/95 max-w-xl leading-relaxed font-normal">
              Eliminate 6–18 hour mandi queues, middleman commission exploitation, and 90-day payment delays.
              Book your slot in advance, monitor live queues in real-time, and receive direct bank transfer within 72 hours.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/farmer/book-slot">
                <Button variant="gold" size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" icon={<ArrowRight className="w-5 h-5" />}>
                  Book Mandi Slot Now
                </Button>
              </Link>
              <Link to="/farmer/crop-scanner">
                <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md" icon={<Sparkles className="w-5 h-5 text-gold" />}>
                  AI Crop Quality Lab
                </Button>
              </Link>
              <Link to="/farmer/innovations">
                <Button variant="outline" size="lg" className="border-white/70 text-white hover:bg-white hover:text-primary-dark backdrop-blur-sm">
                  🚀 20 Agri Innovations
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/20 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>5,00,000+ Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>500+ Mandi Centres</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>₹2,400 Cr Disbursed</span>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Floating Live Status Card with Glassmorphism */}
          <div className="lg:col-span-5">
            <div className="bg-white/15 backdrop-blur-xl p-7 rounded-3xl border border-white/25 shadow-2xl space-y-5 text-white transition-all hover:border-white/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-1.5">
                  🌾 KrishiSeva Guarantee
                </span>
                <span className="flex items-center gap-1.5 text-xs bg-emerald-500/25 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/40 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Network
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span className="font-semibold">Amritsar Central Mandi</span>
                  <span className="text-gold font-bold">Bay 1 Operational</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Now Serving</span>
                    <span className="font-display text-4xl font-black text-white tracking-tight">Token #44</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Average Wait</span>
                    <span className="font-display text-2xl font-black text-emerald-400">&lt; 20 Mins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-primary-pale font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                  <span>Zero queue arrival guarantee with digital QR ticket</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                  <span>Certified electronic weighbridge — zero manipulation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                  <span>Direct PFMS credit in your bank account in 72 hours</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/display/10000000-0000-0000-0000-000000000001" target="_blank">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    View Live Mandi Display Board (TV Mode) →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (Pattern D: Agrile Stats Bar) */}
      <section className="bg-primary py-12 text-white border-y border-primary-dark">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-primary-dark">
            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold text-gold-light">
                5,00,000+
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-pale">Farmers Registered</p>
            </div>
            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold text-gold-light">
                500+
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-pale">APMC Procurement Centres</p>
            </div>
            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold text-gold-light">
                ₹2,400 Cr
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-pale">MSP Payments Disbursed</p>
            </div>
            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold text-gold-light">
                &lt; 30 Min
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-pale">Average Mandi Wait Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NATIONAL DIFFERENTIATORS GRID */}
      <section className="py-20 bg-surface dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="section-label">National Breakthrough Innovations</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary dark:text-white">
              Built for <span className="text-primary underline decoration-gold decoration-4 underline-offset-4">Bharat's Farmers</span>
            </h2>
            <p className="text-sm text-text-muted">
              Deep-tech agricultural infrastructure replacing chaotic queues, middleman exploitation, and quality disputes with complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedFeature(d)}
                  className="card-farm flex flex-col justify-between group cursor-pointer hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative border-2 border-transparent"
                  title="Click to learn how it works and use this feature"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-primary-pale dark:bg-primary-dark/40 flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold-pale text-earth-brown dark:bg-gold/20 dark:text-gold border border-gold/30">
                        {d.badge}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-farmborder/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeature(d);
                      }}
                      className="text-xs font-bold text-primary dark:text-primary-light flex items-center gap-1 hover:underline"
                    >
                      <span>Learn how it works</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(d.route);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary dark:text-primary-light dark:hover:bg-primary text-xs font-bold transition-all flex items-center gap-1 border border-primary/20"
                    >
                      <span>Use Feature</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full-width Innovations Suite Spotlight */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-earth-brown text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-gold/30">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="w-4 h-4" /> Comprehensive National AgriTech Suite
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">
                Explore All 20 Breakthrough Agricultural Innovations
              </h3>
              <p className="text-xs sm:text-sm text-primary-pale max-w-2xl">
                From Sentinel-2 satellite yield caps and acoustic stem-borer probes to solar micro-cold rooms, parali bio-CNG markets, and instant AI Lokpal legal ombudsman hearings.
              </p>
            </div>
            <Link to="/farmer/innovations" className="shrink-0 w-full md:w-auto">
              <Button variant="gold" size="lg" className="w-full md:w-auto shadow-lg" icon={<ArrowRight className="w-5 h-5" />}>
                Launch Innovations Suite (20 Tools)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 50 ADVANCED AGRI-OS CAPABILITIES & PILLARS SHOWCASE */}
      <AgriOSShowcase />

      {/* 4. THREE-STEP PROCESS (Photographic Cards) */}
      <section className="py-20 bg-surface-2 dark:bg-gray-950 border-y border-farmborder/60">
        <div className="container mx-auto px-4 lg:px-8 space-y-14">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="section-label">Simple Process</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary dark:text-white">
              From Farm to Bank in 3 Steps
            </h2>
            <p className="text-sm text-text-muted">
              Zero hassle, complete transparency, guaranteed government rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-farm overflow-hidden p-0 group flex flex-col justify-between border-2 hover:border-primary transition-all">
              <div className="h-48 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
                  alt="Farmer Booking Slot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary text-white font-display text-lg font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  1
                </div>
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  Step 1: Digital Booking
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">Register & Book Slot</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Choose your local mandi, pick visit date & time window, enter crop quantity, and receive your digital QR token pass on WhatsApp and SMS.
                </p>
              </div>
            </div>

            <div className="card-farm overflow-hidden p-0 group flex flex-col justify-between border-2 hover:border-gold transition-all">
              <div className="h-48 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=600&auto=format&fit=crop"
                  alt="Mandi Electronic Weighbridge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-gold text-white font-display text-lg font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  2
                </div>
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  Step 2: Gate Check-in
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">Visit & Weigh Grain</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Arrive at your scheduled time. Scan QR at mandi gate. Grain is weighed automatically on certified electronic telemetry weighbridges.
                </p>
              </div>
            </div>

            <div className="card-farm overflow-hidden p-0 group flex flex-col justify-between border-2 hover:border-primary-dark transition-all">
              <div className="h-48 w-full overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop"
                  alt="Farmer Receiving Direct DBT Payment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary-dark text-white font-display text-lg font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  3
                </div>
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  Step 3: Direct Bank Credit
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">Track & Receive Payment</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Download official PDF procurement receipt on the spot. Direct benefit transfer (DBT) is credited into your bank account within 72 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4B. VISUAL CROP SHOWCASE (Major Crops & Live Government MSP Rates) */}
      <section className="py-20 bg-surface dark:bg-gray-900 border-b border-farmborder/60">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="section-label">National MSP Rates 2025–26</div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary dark:text-white">
                Crops Covered Under <span className="text-primary underline decoration-gold decoration-4 underline-offset-4">Guaranteed MSP</span>
              </h2>
              <p className="text-sm text-text-muted max-w-xl">
                Government assured minimum support prices protecting farmers from distress sales and middleman undercutting.
              </p>
            </div>
            <Link to="/farmer/msp-calculator" className="text-sm font-bold text-primary dark:text-primary-light hover:underline flex items-center gap-1.5">
              <span>Compare against local trader offer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cropsShowcase.map((crop, idx) => (
              <div
                key={idx}
                className="card-farm overflow-hidden p-0 group flex flex-col justify-between border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="h-40 w-full overflow-hidden relative">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-primary-dark shadow-sm">
                    {crop.season}
                  </span>
                  <div className="absolute bottom-2.5 left-3">
                    <span className="text-[11px] text-gold-light font-medium block leading-none">{crop.hindi}</span>
                    <h4 className="font-heading text-base font-bold text-white leading-tight">{crop.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block">Official MSP</span>
                      <span className="font-display text-lg font-extrabold text-primary dark:text-primary-light">
                        {crop.msp}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {crop.badge}
                    </span>
                  </div>

                  <Link to="/farmer/book-slot" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                      Book Slot for {crop.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROCUREMENT CENTRES PREVIEW */}
      <section className="py-20 bg-surface dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="section-label">Nearby Mandis</div>
              <h2 className="font-heading text-3xl font-bold text-text-primary dark:text-white">
                Active Procurement Centres
              </h2>
            </div>
            <Link to="/farmer/centres" className="text-sm font-bold text-primary dark:text-primary-light hover:underline flex items-center gap-1">
              <span>View all 500+ centres across India</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleCentres.map((centre, idx) => (
              <CentreCard key={centre.id} centre={centre} featured={idx === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. FARMER VOICES & TESTIMONIALS */}
      <section className="py-20 bg-primary-dark text-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="section-label text-gold-light">Farmer Testimonials</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Real Impact from Real Fields
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/15 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm italic leading-relaxed text-gray-200">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gold shadow-md shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gold-light">{t.name}</h4>
                    <p className="text-[11px] text-gray-300">{t.village}</p>
                    <span className="text-[10px] text-primary-pale mt-0.5 inline-block">Sold: {t.crop}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6B. AGRICULTURAL INFRASTRUCTURE & APMC GALLERY */}
      <section className="py-20 bg-surface-2 dark:bg-gray-950 border-y border-farmborder/60">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="section-label">State-of-the-Art Facilities</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary dark:text-white">
              Transforming <span className="text-primary underline decoration-gold decoration-4 underline-offset-4">500+ Mandis Across Bharat</span>
            </h2>
            <p className="text-sm text-text-muted">
              Equipped with tamper-proof electronic weighbridges, digital quality testing labs, and 72-hour direct PFMS bank transfer terminals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-farmborder shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=600&auto=format&fit=crop"
                  alt="Modern APMC Electronic Weighbridge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  ⚖️ Digital Weighbridges
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-heading text-sm font-bold text-text-primary dark:text-white">Certified Electronic Scales</h4>
                <p className="text-[11px] text-text-muted">Direct telemetry sync to cloud, preventing weight manipulation.</p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-farmborder shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop"
                  alt="Lush Wheat Harvest"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  🌾 Golden Grain Harvests
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-heading text-sm font-bold text-text-primary dark:text-white">Fair Average Quality (FAQ)</h4>
                <p className="text-[11px] text-text-muted">Standardized moisture and grading norms protecting farmer prices.</p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-farmborder shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop"
                  alt="Farmer Community and FPO Groups"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  👥 FPO Collective Power
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-heading text-sm font-bold text-text-primary dark:text-white">Bulk Group Bookings</h4>
                <p className="text-[11px] text-text-muted">Farmer Producer Organisations reserve combined convoy time slots.</p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-farmborder shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
                  alt="Mobile SMS and Digital Receipts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  💳 Direct Bank Credit
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-heading text-sm font-bold text-text-primary dark:text-white">72-Hour PFMS Guarantee</h4>
                <p className="text-[11px] text-text-muted">Immediate electronic procurement receipt and Aadhaar-linked payout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION PREVIEW */}
      <section className="py-20 bg-surface dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <div className="section-label">Questions & Answers</div>
            <h2 className="font-heading text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-farmborder dark:border-gray-800 bg-white dark:bg-gray-800/80 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-text-primary dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-text-muted dark:text-gray-300 leading-relaxed border-t border-farmborder/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Link to="/help" className="text-sm font-bold text-primary dark:text-primary-light hover:underline">
              Visit Full KrishiSeva Help & Grievance Centre →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER / SMS ALERTS */}
      <section className="py-16 bg-gold-pale dark:bg-gray-800/50 border-t border-farmborder">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-earth-brown dark:text-gold font-bold text-xs uppercase tracking-wider">
            🔔 Never Miss a Rate Revision
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">
            Get Instant Government MSP & Weather SMS Alerts
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Enter your mobile number to get automatic alerts when MSP rates are updated for your district crops.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={newsletterPhone}
              onChange={(e) => setNewsletterPhone(e.target.value)}
              className="input-farm flex-1 text-sm"
              required
            />
            <Button variant="primary" type="submit">
              Subscribe Free
            </Button>
          </form>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-dark text-gray-400 py-16 text-xs border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="font-heading text-xl font-bold text-white">KrishiSeva</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              India's National Smart Farmer Procurement Platform for the Ministry of Consumer Affairs, Food & Public Distribution.
            </p>
            <p className="text-gold font-semibold text-[10px]">Unified National Farmer Procurement & Direct Benefit Transfer Portal</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">For Farmers</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link to="/farmer/book-slot" className="hover:text-white">Book Mandi Slot</Link></li>
              <li><Link to="/farmer/queue" className="hover:text-white">Live Queue Monitor</Link></li>
              <li><Link to="/farmer/msp-calculator" className="hover:text-white">MSP vs Trader Calculator</Link></li>
              <li><Link to="/farmer/payments" className="hover:text-white">Direct Bank Disbursals</Link></li>
              <li><Link to="/farmer/map" className="hover:text-white">Mandi GIS Heatmap</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Officers & Admin</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link to="/login" className="hover:text-white">Officer Gate Login</Link></li>
              <li><Link to="/login" className="hover:text-white">Weighbridge Dashboard</Link></li>
              <li><Link to="/admin/analytics" className="hover:text-white">National Analytics</Link></li>
              <li><Link to="/admin/grievances" className="hover:text-white">72h SLA Grievance Cell</Link></li>
              <li><Link to="/display/10000000-0000-0000-0000-000000000001" className="hover:text-white">TV Token Display Board</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Government of India</h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Department of Consumer Affairs<br />
              Krishi Bhawan, New Delhi, 110001<br />
              Toll Free Helpline: 1800-180-1551
            </p>
            <div className="pt-2 flex flex-col gap-1 text-[11px]">
              <Link to="/privacy" className="text-gold hover:text-gold-light underline font-medium">
                🛡️ DPDP Act Privacy Policy & Compliance Notice
              </Link>
              <span className="text-gray-500 text-[10px]">
                © 2026 KrishiSeva Platform. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Kisan Mitra Assistant on Landing Page */}
      <button
        onClick={() => setIsKisanMitraOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-2xl hover:scale-105 transition-all border-2 border-gold/70 ring-4 ring-primary/20"
        title="Ask AI Kisan Mitra"
      >
        <Sparkles className="w-4 h-4 text-gold-light animate-pulse" />
        <span>Ask AI Kisan Mitra 🌾</span>
      </button>

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

      {/* Feature Detail & Workflow Modal */}
      <FeatureDetailModal
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        feature={selectedFeature}
        onUseFeature={(route) => {
          setSelectedFeature(null);
          navigate(route);
        }}
      />
    </div>
  );
};

export default Landing;

