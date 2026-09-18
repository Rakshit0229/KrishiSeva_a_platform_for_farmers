import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Home,
  Compass,
  ArrowLeft,
  PhoneCall,
  Search,
  AlertTriangle,
  RefreshCw,
  LifeBuoy,
  FileQuestion,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ErrorPageProps {
  type?: '404' | '500' | 'offline';
  error?: Error | null;
  errorInfo?: string | null;
  onReset?: () => void;
}

const QUICK_LINKS = [
  { label: 'स्लॉट बुक करें (Book Slot)', path: '/farmer/book-slot', icon: '📅' },
  { label: 'लाइव कतार स्थिति (Queue Status)', path: '/farmer/queue', icon: '⏱️' },
  { label: 'MSP कैलकुलेटर (MSP Rates)', path: '/farmer/msp-calculator', icon: '💰' },
  { label: 'मंडी केंद्र खोजें (Find Centres)', path: '/farmer/centres', icon: '📍' },
  { label: 'मौसम पूर्वानुमान (Weather)', path: '/farmer/weather', icon: '🌦️' },
  { label: 'सहायता केंद्र (Help Center)', path: '/help', icon: '📖' },
];

export const ErrorPage: React.FC<ErrorPageProps> = ({
  type: initialType = '404',
  error,
  errorInfo,
  onReset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeType, setActiveType] = useState<'404' | '500' | 'offline'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Filter quick links based on search
  const filteredLinks = QUICK_LINKS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getErrorContent = () => {
    switch (activeType) {
      case '500':
        return {
          code: '500',
          badge: 'सिस्टम व्यवधान • Internal Server Error',
          badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
          titleHi: 'खेत में तकनीकी रुकावट आ गई है',
          titleEn: 'Field Engine Encountered an Obstacle',
          desc: 'सर्वर में अप्रत्याशित समस्या उत्पन्न हुई है। हमारी तकनीकी टीम हल पर कार्य कर रही है। आपका डेटा पूरी तरह सुरक्षित है।',
          primaryBtnText: 'पुनः प्रयास करें (Try Again)',
          primaryAction: () => {
            if (onReset) onReset();
            else window.location.reload();
          },
        };
      case 'offline':
        return {
          code: 'OFFLINE',
          badge: 'इंटरनेट डिस्कनेक्ट • Network Disconnected',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
          titleHi: 'इंटरनेट संपर्क टूट गया है',
          titleEn: 'Mandi Network Connection Lost',
          desc: 'आपका उपकरण ऑफ़लाइन है। कृपया अपना वाई-फाई अथवा मोबाइल डेटा कनेक्शन जांचें। ऑफलाइन में पहले से सहेजा गया डेटा सुरक्षित है।',
          primaryBtnText: 'कनेक्शन पुनः जांचें (Check Connection)',
          primaryAction: () => window.location.reload(),
        };
      case '404':
      default:
        return {
          code: '404',
          badge: 'पगडंडी नहीं मिली • Page Not Found',
          badgeColor: 'bg-gold/15 text-earth-brown border-gold/30 dark:bg-gold/20 dark:text-gold-light dark:border-gold/40',
          titleHi: 'खेत की पगडंडी छूट गई है',
          titleEn: 'Detour: The Mandi Path Does Not Exist',
          desc: `आप जिस पृष्ठ या स्लॉट (${location.pathname}) को खोज रहे हैं, वह स्थानांतरित हो चुका है या उपलब्ध नहीं है। कृपया नीचे दिए गए विकल्पों से सही मार्ग चुनें।`,
          primaryBtnText: 'मुख्य पृष्ठ / डैशबोर्ड (Go to Home)',
          primaryAction: () => navigate('/'),
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0c140e] text-text-primary dark:text-emerald-50 flex flex-col justify-between p-4 sm:p-8 transition-colors">
      {/* Top Header & Interactive Mode Switcher */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-farmborder/40 dark:border-emerald-900/40">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/25 border border-primary/20 flex items-center justify-center text-primary dark:text-emerald-400 font-bold text-lg group-hover:scale-105 transition-transform">
            🌾
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-1.5">
              <span>कृषि सेवा</span>
              <span className="text-gold font-display text-sm font-semibold">KRISHISEVA</span>
            </h1>
            <p className="text-[11px] text-text-muted dark:text-emerald-400/70 font-medium">
              राष्ट्रीय किसान संबल एवं MSP मंच
            </p>
          </div>
        </div>

        {/* Interactive Mode Tester for Preview / Evaluation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 dark:bg-emerald-950/60 border border-farmborder/50 dark:border-emerald-800/40 text-xs">
          <span className="text-[11px] px-2 text-text-muted dark:text-emerald-400/70 font-medium hidden md:inline">
            त्रुटि मोड (Preview Mode):
          </span>
          {(['404', '500', 'offline'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveType(mode)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeType === mode
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted dark:text-emerald-300 hover:text-text-primary hover:bg-white/50 dark:hover:bg-emerald-900/50'
              }`}
            >
              {mode === '404' ? '404 Not Found' : mode === '500' ? '500 Crash' : 'Offline'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Stylized Agricultural Vector Artwork */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              {/* Sunbeam & Aura Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold/20 via-primary/20 to-emerald-400/10 blur-2xl animate-aura-breathe" />

              {/* Aesthetic Agricultural Detour SVG Artwork */}
              <svg
                viewBox="0 0 280 280"
                className="w-full h-full relative z-10 drop-shadow-xl select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="hillGreenGrad" x1="0" y1="180" x2="280" y2="280" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2A6B35" />
                    <stop offset="100%" stopColor="#153B1D" />
                  </linearGradient>

                  <linearGradient id="furrowGrad" x1="0" y1="200" x2="280" y2="280" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D4A017" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6B4A2A" stopOpacity="0.8" />
                  </linearGradient>

                  <linearGradient id="skySunGrad" x1="140" y1="20" x2="140" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FEF9E8" />
                    <stop offset="50%" stopColor="#F5D97A" />
                    <stop offset="100%" stopColor="#D4A017" />
                  </linearGradient>
                </defs>

                {/* Gentle Golden Sun Disc */}
                <circle cx="140" cy="85" r="46" fill="url(#skySunGrad)" opacity="0.85" />
                <circle cx="140" cy="85" r="54" stroke="#D4A017" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

                {/* Distant Hills / Terraced Fields */}
                <path
                  d="M0 170 Q70 140, 140 160 T280 150 L280 280 L0 280 Z"
                  fill="#4C9E5A"
                  opacity="0.35"
                />
                <path
                  d="M0 190 Q90 165, 170 185 T280 175 L280 280 L0 280 Z"
                  fill="url(#hillGreenGrad)"
                />

                {/* Winding Farmland Dirt Path (Detour) */}
                <path
                  d="M60 280 Q110 240, 130 215 T165 185 Q180 175, 205 180"
                  stroke="url(#furrowGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M60 280 Q110 240, 130 215 T165 185 Q180 175, 205 180"
                  stroke="#FAFAF7"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  fill="none"
                  opacity="0.85"
                />

                {/* Milestone Signpost: "404 KM - पगडंडी" */}
                <g transform="translate(195, 145)">
                  {/* Wooden Post */}
                  <rect x="18" y="32" width="6" height="34" rx="2" fill="#6B4A2A" />
                  {/* Milestone Board */}
                  <path
                    d="M4 14 C4 4, 38 4, 38 14 L38 34 C38 36, 4 36, 4 34 Z"
                    fill="#FAFAF7"
                    stroke="#D5D0C4"
                    strokeWidth="2"
                  />
                  {/* Top Saffron / Green Stripe */}
                  <path d="M4 14 C4 8, 38 8, 38 14 L38 18 L4 18 Z" fill="#E67E22" />
                  {/* Text on Milestone */}
                  <text x="21" y="29" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1F2B1F" fontFamily="sans-serif">
                    {content.code}
                  </text>
                </g>

                {/* Stylized Modern Tractor (Friendly Farmer Vehicle) */}
                <g transform="translate(68, 165)">
                  {/* Tractor Body Cabin */}
                  <path d="M38 18 L24 18 L20 32 L44 32 Z" fill="#2A6B35" stroke="#1A4A22" strokeWidth="1.5" />
                  {/* Cabin Window */}
                  <path d="M36 21 L26 21 L23 30 L37 30 Z" fill="#D4E6C3" opacity="0.9" />
                  {/* Tractor Engine Hood */}
                  <path d="M44 26 L62 26 L62 34 L44 34 Z" fill="#2A6B35" stroke="#1A4A22" strokeWidth="1.5" />
                  {/* Exhaust Pipe */}
                  <rect x="56" y="15" width="2.5" height="12" fill="#1A1A1A" rx="1" />
                  {/* Headlight Beam */}
                  <polygon points="62,28 85,22 85,38 62,32" fill="#F5D97A" opacity="0.4" />
                  {/* Big Rear Wheel */}
                  <circle cx="28" cy="38" r="14" fill="#1A1A1A" />
                  <circle cx="28" cy="38" r="8" fill="#D4A017" stroke="#6B4A2A" strokeWidth="1.5" />
                  <circle cx="28" cy="38" r="3" fill="#1A1A1A" />
                  {/* Small Front Wheel */}
                  <circle cx="56" cy="42" r="8" fill="#1A1A1A" />
                  <circle cx="56" cy="42" r="4" fill="#D4A017" stroke="#6B4A2A" strokeWidth="1" />
                </g>

                {/* Wheat Stalks at Roadside */}
                <g transform="translate(22, 210)">
                  <path d="M10 35 Q12 15, 20 0" stroke="#D4A017" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="20" cy="2" rx="3" ry="5" fill="#D4A017" transform="rotate(20 20 2)" />
                  <ellipse cx="17" cy="8" rx="2.5" ry="4" fill="#F5D97A" transform="rotate(-20 17 8)" />
                  <ellipse cx="19" cy="14" rx="2.5" ry="4" fill="#D4A017" transform="rotate(25 19 14)" />
                </g>
              </svg>
            </div>

            {/* Error Code Large Stamp */}
            <div className="text-center mt-2">
              <span className="text-5xl sm:text-6xl font-black font-display tracking-tight text-primary/80 dark:text-emerald-400/80 drop-shadow-sm">
                {content.code}
              </span>
            </div>
          </div>

          {/* Right Column: Error Message, Search & Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Error Category Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${content.badgeColor}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{content.badge}</span>
              </span>
              <span className="text-xs text-text-muted dark:text-emerald-400/60 font-mono">
                URI: {location.pathname}
              </span>
            </div>

            {/* Headings */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-white font-heading tracking-tight">
                {content.titleHi}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-primary dark:text-emerald-300 font-display">
                {content.titleEn}
              </p>
              <p className="text-xs sm:text-sm text-text-muted dark:text-emerald-200/80 leading-relaxed pt-1">
                {content.desc}
              </p>
            </div>

            {/* Quick Mandi Navigation Search Bar */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted dark:text-emerald-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary dark:text-emerald-400" />
                <span>कहाँ जाना चाहते हैं? (Quick Jump):</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खोजें: स्लॉट, MSP, कतार, मंडी, मौसम, शिकायत..."
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/90 dark:bg-emerald-950/70 border border-farmborder/80 dark:border-emerald-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 text-text-primary dark:text-white placeholder:text-text-muted/60 dark:placeholder:text-emerald-500/60 shadow-xs"
                />
                <Search className="w-4 h-4 text-text-muted/60 dark:text-emerald-400/60 absolute left-3.5 top-3" />
              </div>

              {/* Quick Navigation Filter Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {filteredLinks.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 border border-farmborder/60 dark:border-emerald-800/40 text-xs font-medium text-text-primary dark:text-emerald-100 transition-all cursor-pointer active:scale-95"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={content.primaryAction}
                className="flex items-center gap-2 font-medium"
              >
                {activeType === '500' || activeType === 'offline' ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Home className="w-4 h-4" />
                )}
                <span>{content.primaryBtnText}</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>पिछला पृष्ठ (Go Back)</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/help')}
                className="flex items-center gap-2 font-medium"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>सहायता (Help Desk)</span>
              </Button>
            </div>

            {/* Technical Error Details Accordion (for 500 or debug assistance) */}
            {(error || errorInfo) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="flex items-center gap-1.5 text-xs text-text-muted dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>तकनीकी विवरण (Technical Diagnostic Details)</span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showTechnicalDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-black/5 dark:bg-black/40 border border-farmborder/60 dark:border-emerald-900/60 font-mono text-[11px] text-red-700 dark:text-red-300 overflow-x-auto space-y-1">
                    <p className="font-bold">Error: {error?.message || 'Unknown render exception'}</p>
                    {error?.stack && <pre className="whitespace-pre-wrap text-[10px] opacity-75">{error.stack}</pre>}
                    {errorInfo && <pre className="whitespace-pre-wrap text-[10px] opacity-75">{errorInfo}</pre>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Kisan Call Centre Toll-Free Assistance */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-farmborder/40 dark:border-emerald-900/40 text-xs text-text-muted dark:text-emerald-400/70">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary dark:text-emerald-400" />
          <span>कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:18001801551"
            className="inline-flex items-center gap-1.5 font-semibold text-primary dark:text-emerald-300 hover:text-primary-dark transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-gold animate-bounce" />
            <span>किसान कॉल सेंटर: 1800-180-1551 (टोल-फ्री 24x7)</span>
          </a>

          <button
            type="button"
            onClick={() => navigate('/farmer/grievances')}
            className="inline-flex items-center gap-1 text-gold hover:underline cursor-pointer"
          >
            <span>शिकायत दर्ज करें</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
