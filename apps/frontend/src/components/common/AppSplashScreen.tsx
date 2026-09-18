import React, { useState, useEffect } from 'react';
import { KrishiSproutLoader } from './KrishiSproutLoader';
import { KrishiLetterSwap } from './KrishiLetterSwap';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
  forceShow?: boolean;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  minDurationMs = 1800,
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
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!visible) return;

    // Fast, lightweight progress ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        const jump = Math.floor(Math.random() * 14) + 8;
        return Math.min(prev + jump, 98);
      });
    }, 110);

    // Fade out after duration
    const timeout = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);

      try {
        sessionStorage.setItem('krishiseva_splash_viewed', 'true');
      } catch {
        // ignore storage error
      }

      setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 550);
    }, minDurationMs);

    return () => {
      clearInterval(interval);
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
    }, 250);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden select-none transition-all duration-600 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none blur-xs'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #14321B 0%, #0D2012 50%, #07120A 100%)',
      }}
      role="dialog"
      aria-label="KrishiSeva Loading"
    >
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gold/15 rounded-full blur-3xl animate-aura-breathe" />
      </div>

      {/* Top Bar: Minimal Badge & Quick Skip */}
      <div className="w-full max-w-lg flex items-center justify-between relative z-20">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-white/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide">भारत सरकार • Digital India</span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs text-white/80 border border-white/10 transition-all cursor-pointer active:scale-95"
        >
          <span>छोड़ें (Skip)</span>
          <ArrowRight className="w-3 h-3 text-gold-light" />
        </button>
      </div>

      {/* Central Hero: Sprout & Kinetic Name Animation */}
      <div className="flex flex-col items-center justify-center text-center relative z-20 my-auto py-2">
        <div className="mb-2">
          <KrishiSproutLoader size="md" />
        </div>

        {/* The Name with moving/swapping letters */}
        <KrishiLetterSwap durationMs={1800} />
      </div>

      {/* Bottom Footer: Minimal Loading Bar & Necessary Details */}
      <div className="w-full max-w-sm relative z-20 pb-4 space-y-2.5">
        {/* Loading Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-emerald-200/80 font-mono">
            <span>लोड हो रहा है...</span>
            <span className="text-gold font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out shimmer-bg"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2A6B35 0%, #D4A017 70%, #F5D97A 100%)',
                boxShadow: '0 0 10px rgba(212, 160, 23, 0.6)',
              }}
            />
          </div>
        </div>

        {/* Necessary Details (Security & Version) */}
        <div className="flex items-center justify-between text-[11px] text-emerald-200/50 pt-0.5">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>AES-256-GCM Secure</span>
          </div>
          <span className="font-mono">v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default AppSplashScreen;
