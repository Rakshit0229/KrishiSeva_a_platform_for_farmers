import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KrishiSproutLoader } from '../../components/common/KrishiSproutLoader';
import { Button } from '../../components/ui/Button';
import {
  Home,
  Compass,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
  redirectPath?: string;
  autoRedirectSeconds?: number;
}

const AGRI_NUGGETS = [
  {
    title: 'न्यूनतम समर्थन मूल्य (MSP) गारंटी',
    desc: 'गेहूं MSP ₹2,425/क्विंटल एवं सरसों ₹5,950/क्विंटल पर सरकारी खरीद सीधे आपके बैंक खाते में 72 घंटे में जमा होती है।',
  },
  {
    title: 'FAQ नमी मानक (Moisture Limits)',
    desc: 'तौल से पूर्व गेहूं में अधिकतम 12.0% व धान में 17.0% नमी मान्य है। तिरपाल पर सुखाकर लाएं ताकि कट न लगे।',
  },
  {
    title: 'ट्रेक्टर ब्रेकडाउन ग्रेस पीरियड',
    desc: 'मंडी रास्ते में वाहन खराबी पर KrishiSeva 2 घंटे का अतिरिक्त ग्रेस टोकन स्वतः जारी करता है।',
  },
  {
    title: 'डिजिटल क्यूआर टोकन (No Queue)',
    desc: 'स्लॉट बुक करते ही प्राप्त क्यूआर कोड से मंडी गेट पर स्कैन कर बिना लंबी कतार के प्रवेश पाएं।',
  },
];

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'कृषि सेवा लोड हो रहा है...',
  subtitle = 'राष्ट्रीय कृषि खरीद नेटवर्क से डेटा सिंक्रनाइज़ किया जा रहा है',
  redirectPath = '/farmer/dashboard',
  autoRedirectSeconds = 0,
}) => {
  const navigate = useNavigate();
  const [nuggetIndex, setNuggetIndex] = useState(0);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    // Rotate knowledge nuggets every 4.5s
    const nuggetInterval = setInterval(() => {
      setNuggetIndex((prev) => (prev + 1) % AGRI_NUGGETS.length);
    }, 4500);

    // Progress counter simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 6;
      });
    }, 200);

    return () => {
      clearInterval(nuggetInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (autoRedirectSeconds > 0) {
      const timer = setTimeout(() => {
        navigate(redirectPath);
      }, autoRedirectSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoRedirectSeconds, navigate, redirectPath]);

  const activeNugget = AGRI_NUGGETS[nuggetIndex];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface dark:bg-[#0c140e] text-text-primary dark:text-emerald-50 px-4 py-8 sm:py-12 transition-colors">
      {/* Top Bar / Brand */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/25 border border-primary/20 flex items-center justify-center text-primary dark:text-emerald-400 font-bold text-lg">
            🌾
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-text-primary dark:text-white">
              कृषि सेवा <span className="text-gold font-display text-sm font-semibold">KRISHISEVA</span>
            </h2>
            <p className="text-[11px] text-text-muted dark:text-emerald-400/70 font-medium">
              National MSP Procurement Engine
            </p>
          </div>
        </div>

        {/* Live System Status Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>APMC गेटवे लाइव • 100% सुरक्षित</span>
        </div>
      </div>

      {/* Center Main Stage */}
      <div className="max-w-xl w-full mx-auto my-auto text-center space-y-6 py-6">
        {/* Animated Sprout Loader */}
        <div className="py-2">
          <KrishiSproutLoader size="xl" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-white tracking-tight font-heading">
            {title}
          </h1>
          <p className="text-sm text-text-muted dark:text-emerald-300/80 max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs font-mono font-medium text-text-muted dark:text-emerald-400/80">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-primary dark:text-emerald-400" />
              <span>डेटा सिंक हो रहा है...</span>
            </span>
            <span className="text-gold font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-surface-2 dark:bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-farmborder/60 dark:border-emerald-800/40">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out shimmer-bg"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2A6B35 0%, #D4A017 70%, #F5D97A 100%)',
              }}
            />
          </div>
        </div>

        {/* Dynamic Agri Knowledge Card (Carousel) */}
        <div className="max-w-md mx-auto mt-6 text-left">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-emerald-900/30 border border-farmborder/60 dark:border-emerald-800/40 shadow-xs backdrop-blur-md transition-all duration-500">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/15 dark:bg-gold/25 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gold-dark dark:text-gold-light uppercase tracking-wider">
                    किसान जानकारी • Tips
                  </span>
                  <span className="text-[10px] text-text-muted dark:text-emerald-400/60 font-mono">
                    {nuggetIndex + 1}/{AGRI_NUGGETS.length}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-emerald-100">
                  {activeNugget.title}
                </h3>
                <p className="text-xs text-text-muted dark:text-emerald-300/80 leading-relaxed">
                  {activeNugget.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(redirectPath)}
            className="flex items-center gap-2 font-medium"
          >
            <Home className="w-4 h-4" />
            <span>डैशबोर्ड पर जाएं (Go to Dashboard)</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/mandis')}
            className="flex items-center gap-2 font-medium"
          >
            <Compass className="w-4 h-4" />
            <span>मंडी देखें (Explore Mandis)</span>
          </Button>
        </div>
      </div>

      {/* Bottom Footer: Kisan Helpline Support */}
      <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-farmborder/40 dark:border-emerald-900/40 text-xs text-text-muted dark:text-emerald-400/70">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary dark:text-emerald-400" />
          <span>भारत सरकार एवं कृषि मंत्रालय द्वारा प्रमाणित डिजिटल खरीद प्रणाली</span>
        </div>

        <a
          href="tel:18001801551"
          className="inline-flex items-center gap-1.5 text-primary dark:text-emerald-300 hover:text-primary-dark font-medium transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-gold" />
          <span>किसान कॉल सेंटर: 1800-180-1551 (टोल-फ्री 24x7)</span>
        </a>
      </div>
    </div>
  );
};

export default LoadingPage;
