import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface LetterItem {
  id: string;
  char: string;
  targetChar: string;
  targetIndex: number;
  currentIndex: number;
  isLocked: boolean;
}

interface KrishiLetterSwapProps {
  onComplete?: () => void;
  className?: string;
  durationMs?: number;
}

// Target string: "KrishiSeva"
const TARGET_WORD = 'KrishiSeva';
const TARGET_CHARS = TARGET_WORD.split('');

// Initial scrambled arrangement of letters with unique ids
const INITIAL_SCRAMBLE = [
  { id: 'let-s2', char: 'S', targetChar: 'S', targetIndex: 6 },
  { id: 'let-e', char: 'e', targetChar: 'e', targetIndex: 7 },
  { id: 'let-v', char: 'v', targetChar: 'v', targetIndex: 8 },
  { id: 'let-a', char: 'a', targetChar: 'a', targetIndex: 9 },
  { id: 'let-k', char: 'K', targetChar: 'K', targetIndex: 0 },
  { id: 'let-r', char: 'r', targetChar: 'r', targetIndex: 1 },
  { id: 'let-i1', char: 'i', targetChar: 'i', targetIndex: 2 },
  { id: 'let-s1', char: 's', targetChar: 's', targetIndex: 3 },
  { id: 'let-h', char: 'h', targetChar: 'h', targetIndex: 4 },
  { id: 'let-i2', char: 'i', targetChar: 'i', targetIndex: 5 },
];

export const KrishiLetterSwap: React.FC<KrishiLetterSwapProps> = ({
  onComplete,
  className = '',
  durationMs = 1800,
}) => {
  const [letters, setLetters] = useState<LetterItem[]>(() =>
    INITIAL_SCRAMBLE.map((item, idx) => ({
      ...item,
      currentIndex: idx,
      isLocked: false,
    }))
  );

  const [isFormed, setIsFormed] = useState(false);
  const [activeSwappingPair, setActiveSwappingPair] = useState<[number, number] | null>(null);
  const [shimmerActive, setShimmerActive] = useState(false);

  useEffect(() => {
    // Step-by-step swapping schedule over ~1.2 seconds, then final lock
    const stepDuration = Math.max(90, Math.floor((durationMs * 0.65) / 8));

    // Array of planned swaps to bring scrambled order [S,e,v,a, K,r,i,s, h,i] into [K,r,i,s, h,i,S,e, v,a]
    const swapSequence: Array<[number, number]> = [
      [0, 4], // Swap S and K
      [1, 5], // Swap e and r
      [2, 6], // Swap v and i
      [3, 7], // Swap a and s
      [4, 8], // Swap S and h
      [5, 9], // Swap e and i
      [6, 8], // Swap v and S
      [7, 9], // Swap a and e
    ];

    let currentStep = 0;

    const swapInterval = setInterval(() => {
      if (currentStep < swapSequence.length) {
        const [idxA, idxB] = swapSequence[currentStep];
        setActiveSwappingPair([idxA, idxB]);

        setLetters((prev) => {
          const next = [...prev];
          const temp = next[idxA];
          next[idxA] = next[idxB];
          next[idxB] = temp;

          // Update current indices
          return next.map((item, idx) => ({
            ...item,
            currentIndex: idx,
            isLocked: item.targetIndex === idx,
          }));
        });

        currentStep++;
      } else {
        clearInterval(swapInterval);
        setActiveSwappingPair(null);

        // Lock all into final exact order
        setLetters(
          TARGET_CHARS.map((char, idx) => ({
            id: `final-${idx}`,
            char,
            targetChar: char,
            targetIndex: idx,
            currentIndex: idx,
            isLocked: true,
          }))
        );

        setIsFormed(true);
        setShimmerActive(true);

        if (onComplete) {
          setTimeout(onComplete, durationMs * 0.35);
        }
      }
    }, stepDuration);

    return () => clearInterval(swapInterval);
  }, [durationMs, onComplete]);

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Main Kinetic Letter Container */}
      <div className="relative flex items-center justify-center gap-1 sm:gap-2 px-2 py-2">
        {/* Background Radiant Aura behind letters */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-primary/30 via-gold/25 to-emerald-400/25 rounded-3xl blur-2xl transition-all duration-700 ${
            isFormed ? 'opacity-100 scale-110 animate-aura-breathe' : 'opacity-40 scale-95'
          }`}
        />

        {/* Shimmer light sweep line */}
        {shimmerActive && (
          <div className="absolute inset-x-0 -inset-y-2 pointer-events-none overflow-hidden rounded-2xl">
            <div className="w-full h-full shimmer-bg" />
          </div>
        )}

        {letters.map((item, index) => {
          const isSwapping =
            activeSwappingPair !== null &&
            (activeSwappingPair[0] === index || activeSwappingPair[1] === index);

          // Differentiation: 'Krishi' is deep emerald/green, 'Seva' is radiant gold
          const isSevaPart = isFormed ? index >= 6 : item.targetIndex >= 6;

          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-center w-8 h-12 sm:w-11 sm:h-16 md:w-13 md:h-20 rounded-xl sm:rounded-2xl transition-all duration-300 font-display font-extrabold ${
                isSwapping
                  ? 'scale-115 -translate-y-3 z-30 shadow-[0_0_20px_rgba(212,160,23,0.8)] rotate-3 border-gold bg-white/20 dark:bg-emerald-800/80'
                  : item.isLocked
                  ? 'scale-100 translate-y-0 z-10'
                  : 'scale-95 translate-y-0 z-10'
              } ${
                isFormed
                  ? isSevaPart
                    ? 'text-gold-light bg-gradient-to-b from-amber-500/20 to-gold/30 border border-gold/50 shadow-[0_0_16px_rgba(212,160,23,0.4)]'
                    : 'text-emerald-100 bg-gradient-to-b from-primary/30 to-emerald-700/30 border border-primary/50 shadow-[0_0_16px_rgba(42,107,53,0.4)]'
                  : 'text-white bg-white/10 dark:bg-black/40 border border-white/15'
              }`}
              style={{
                perspective: '600px',
              }}
            >
              {/* Individual Letter Glyph */}
              <span
                className={`text-xl sm:text-3xl md:text-4xl drop-shadow-md transition-transform duration-300 ${
                  isSwapping ? 'scale-110' : 'scale-100'
                } ${isFormed && isSevaPart ? 'text-gold-light' : 'text-white'}`}
              >
                {item.char}
              </span>

              {/* Little lock indicator micro-dot */}
              {item.isLocked && (
                <span
                  className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    isSevaPart ? 'bg-gold shadow-[0_0_6px_#D4A017]' : 'bg-emerald-400 shadow-[0_0_6px_#4C9E5A]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Synchronized Hindi Devanagari Script blooming underneath */}
      <div
        className={`mt-3 text-center transition-all duration-700 ease-out ${
          isFormed ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gold/70" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-emerald-100 font-heading drop-shadow-sm">
            कृषि सेवा
          </h2>
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold/70" />
        </div>
      </div>
    </div>
  );
};

export default KrishiLetterSwap;
