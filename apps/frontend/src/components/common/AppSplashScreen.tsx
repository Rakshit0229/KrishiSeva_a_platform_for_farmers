import React, { useState, useEffect } from 'react';
import { KrishiSproutLoader } from './KrishiSproutLoader';
import { KrishiLetterSwap } from './KrishiLetterSwap';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
  forceShow?: boolean;
}

const MILESTONES = [
  { progress: 20, textHi: 'कृषि सेवा इंजन प्रारंभ हो रहा है...', textEn: 'Initializing KrishiSeva Gateway...' },
  { progress: 48, textHi: 'राष्ट्रीय 2025-26 MSP दरें एवं मंडी स्लॉट सिंक...', textEn: 'Syncing National APMC Mandis & MSP...' },
  { progress: 78, textHi: 'AgriStack व प्रत्यक्ष लाभ अंतरण (DBT) सत्यापित...', textEn: 'Verifying AgriStack & DBT Rails...' },
  { progress: 100, textHi: 'भारत के अन्नदाता का स्वागत है...', textEn: 'Welcome to Bharat’s Smart Agri Engine' },
];

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  minDurationMs = 1900,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    try {
      return !sessionStorage.getItem('krishiseva_splash_viewed');
    } catch {
      return true;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(12);
  const [milestoneIndex, setMilestoneIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Progress tick intervals
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        const jump = Math.floor(Math.random() * 12) + 6;
        const next = Math.min(prev + jump, 98);
        return next;
      });
    }, 130);

    // Milestone text update based on progress
    const milestoneTimer = setInterval(() => {
      setProgress((cur) => {
        if (cur > 75) setMilestoneIndex(3);
        else if (cur > 50) setMilestoneIndex(2);
        else if (cur > 25) setMilestoneIndex(1);
        else setMilestoneIndex(0);
        return cur;
      });
    }, 150);

    // Minimum display duration before smooth fade out
    const timeout = setTimeout(() => {
      setProgress(100);
      setMilestoneIndex(3);
      setIsFadingOut(true);

      try {
        sessionStorage.setItem('krishiseva_splash_viewed', 'true');
      } catch {
        // ignore storage error
      }

      setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 650); // Wait for transition fade out
    }, minDurationMs);

    return () => {
      clearInterval(interval);
      clearInterval(milestoneTimer);
      clearTimeout(timeout);
    };
  }, [visible, minDurationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem('krishiseva_splash_viewed', 'true');
    } catch {
      // ignore
    }
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 300);
  };

  if (!visible) return null;

  const currentMilestone = MILESTONES[milestoneIndex] || MILESTONES[0];

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between p-6 overflow-hidden select-none transition-all duration-700 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 40%, #17381F 0%, #0F2615 45%, #08150C 100%)',
      }}
      role="dialog"
      aria-label="KrishiSeva Loading Splash"
    >
      {/* Background Animated Topography Gradients & Organic Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Amber sunrise aura */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-gold/20 via-primary/25 to-transparent rounded-full blur-3xl animate-aura-breathe" />
        {/* Emerald base aura */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl" />

        {/* Ambient floating dust/pollen dots */}
        <div className="absolute inset-0 opacity-30">
          {[
            { top: '20%', left: '15%', delay: '0s' },
            { top: '35%', left: '80%', delay: '1s' },
            { top: '65%', left: '25%', delay: '2s' },
            { top: '75%', left: '70%', delay: '1.5s' },
            { top: '15%', left: '60%', delay: '0.7s' },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-gold-light animate-ping"
              style={{
                top: dot.top,
                left: dot.left,
                animationDuration: '3.5s',
                animationDelay: dot.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Header: National Badge & Skip Button */}
      <div className="w-full max-w-2xl flex items-center justify-between relative z-20 pt-2 animate-fade-in">
        {/* National Tricolor Micro Accent Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90">
          <div className="flex h-2.5 w-4 rounded-sm overflow-hidden border border-white/30 shadow-xs">
            <span className="w-1/3 bg-[#FF9933]" />
            <span className="w-1/3 bg-white flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-[#000080]" />
            </span>
            <span className="w-1/3 bg-[#138808]" />
          </div>
          <span className="font-medium tracking-wide">भारत सरकार | Digital AgriStack</span>
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-medium text-emerald-200/90 border border-white/10 transition-all cursor-pointer hover:border-gold/50 active:scale-95"
        >
          <span>छोड़ें (Skip)</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-light" />
        </button>
      </div>

      {/* Central Hero: Sprout Animation & Kinetic Letter-Swap Forming 'KrishiSeva' */}
      <div className="flex flex-col items-center justify-center text-center relative z-20 my-auto py-4">
        {/* Animated Sprout Loader Glyph */}
        <div className="mb-2 transform hover:scale-105 transition-transform duration-500">
          <KrishiSproutLoader size="md" />
        </div>

        {/* Kinetic Letter Swap Animation: Letters move & swap, forming KrishiSeva */}
        <KrishiLetterSwap durationMs={1800} className="my-1" />

        <p className="text-xs sm:text-sm text-emerald-200/80 font-medium tracking-wide max-w-md mx-auto pt-2">
          न्यूनतम समर्थन मूल्य (MSP) गारंटी • पारदर्शी तौल • 72 घंटे में सीधा बैंक भुगतान
        </p>

        {/* Live Milestone Progress Ticker */}
        <div className="min-h-[44px] flex flex-col items-center justify-center px-4 py-1.5 mt-2">
          <p className="text-sm font-medium text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold animate-spin" style={{ animationDuration: '6s' }} />
            <span>{currentMilestone.textHi}</span>
          </p>
          <p className="text-xs text-white/50 tracking-wider">
            {currentMilestone.textEn}
          </p>
        </div>
      </div>

      {/* Bottom Footer: Progress Bar, Security Seal & Version */}
      <div className="w-full max-w-md relative z-20 pb-4 space-y-3">
        {/* Sleek Golden Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-emerald-200/70 font-mono font-medium">
            <span>आपूर्ति श्रृंखला सत्यापन...</span>
            <span className="text-gold-light">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/10 backdrop-blur-sm">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out shimmer-bg"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2A6B35 0%, #D4A017 65%, #F5D97A 100%)',
                boxShadow: '0 0 12px rgba(212, 160, 23, 0.7)',
              }}
            />
          </div>
        </div>

        {/* Security & Regulatory Endorsement */}
        <div className="flex items-center justify-between text-[11px] text-emerald-200/60 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256-GCM Encrypted & DPDP 2023 Compliant</span>
          </div>
          <span className="font-mono">v1.0 • 2026</span>
        </div>
      </div>
    </div>
  );
};

export default AppSplashScreen;
