import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';

interface StickyCtaBarProps {
  /** Ref to the hero CTA element — bar hides when hero is visible */
  heroRef?: React.RefObject<HTMLElement>;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({ heroRef }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;

      if (heroRef?.current) {
        const rect = heroRef.current.getBoundingClientRect();
        // Show bar when hero is scrolled off screen
        setVisible(rect.bottom < 0);
      } else {
        // Fallback: show after scrolling 400px
        setVisible(window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroRef, dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden animate-in slide-in-from-bottom duration-300"
      role="complementary"
      aria-label="Quick action bar"
    >
      <div className="bg-white dark:bg-gray-900 border-t border-farmborder dark:border-gray-700 shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Icon + Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-primary dark:text-white truncate">
            Book Your Mandi Slot — Guaranteed MSP
          </p>
          <p className="text-[11px] text-text-muted truncate">
            Direct bank transfer in 72 hrs · Zero queue
          </p>
        </div>

        {/* CTA Button */}
        <Link
          to="/farmer/book-slot"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Slot
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 text-text-muted hover:text-text-primary rounded-full"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
