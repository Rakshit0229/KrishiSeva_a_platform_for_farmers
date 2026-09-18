import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KrishiSproutLoader } from '../../components/common/KrishiSproutLoader';
import { KrishiLetterSwap } from '../../components/common/KrishiLetterSwap';
import { Button } from '../../components/ui/Button';
import {
  Home,
  Compass,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface LoadingPageProps {
  redirectPath?: string;
  autoRedirectSeconds?: number;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  redirectPath = '/farmer/dashboard',
  autoRedirectSeconds = 0,
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(25);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    // Progress counter simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 6;
      });
    }, 180);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (autoRedirectSeconds > 0) {
      const timer = setTimeout(() => {
        navigate(redirectPath);
      }, autoRedirectSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoRedirectSeconds, navigate, redirectPath]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface dark:bg-[#0c140e] text-text-primary dark:text-emerald-50 px-4 py-8 sm:py-12 transition-colors">
      {/* Top Bar / Minimal Brand */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/25 border border-primary/20 flex items-center justify-center text-primary dark:text-emerald-400 font-bold text-base">
            🌾
          </div>
          <span className="text-sm font-bold text-text-primary dark:text-white">
            कृषि सेवा <span className="text-gold font-display text-xs">KRISHISEVA</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>लाइव गेटवे (Live)</span>
        </div>
      </div>

      {/* Center Main Stage: Sprout, Kinetic Name, and Minimal Loading Bar */}
      <div className="max-w-md w-full mx-auto my-auto text-center space-y-5 py-4">
        {/* Animated Sprout Loader */}
        <div className="py-1">
          <KrishiSproutLoader size="md" />
        </div>

        {/* Kinetic Letter Swap Animation */}
        <div className="py-1">
          <KrishiLetterSwap key={replayKey} durationMs={1800} />
        </div>

        {/* Minimal Animated Loading Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono font-medium text-text-muted dark:text-emerald-400/80">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-primary dark:text-emerald-400" />
              <span>लोड हो रहा है...</span>
            </span>
            <span className="text-gold font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-surface-2 dark:bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-farmborder/60 dark:border-emerald-800/40">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out shimmer-bg"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2A6B35 0%, #D4A017 70%, #F5D97A 100%)',
              }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(redirectPath)}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>डैशबोर्ड (Dashboard)</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setReplayKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>पुनः चलाएं (Replay)</span>
          </Button>
        </div>
      </div>

      {/* Bottom Minimal Footer: Helpline */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between text-xs text-text-muted dark:text-emerald-400/70 border-t border-farmborder/40 dark:border-emerald-900/40 pt-4">
        <span>भारत सरकार डिजिटल पहल</span>
        <a
          href="tel:18001801551"
          className="inline-flex items-center gap-1.5 text-primary dark:text-emerald-300 font-medium hover:underline"
        >
          <PhoneCall className="w-3 h-3 text-gold" />
          <span>किसान हेल्पलाइन: 1800-180-1551</span>
        </a>
      </div>
    </div>
  );
};

export default LoadingPage;
