import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { useLanguageStore } from '../../store/languageStore';

export const VoiceAssistant: React.FC = () => {
  const { isListening, feedback, transcript, toggleListening } = useVoice();
  const { language } = useLanguageStore();

  return (
    <div className="fixed bottom-20 right-5 z-40 md:bottom-8 md:right-8 flex flex-col items-end">
      {/* Voice feedback popover */}
      {(isListening || feedback) && (
        <div className="mb-2.5 max-w-xs bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 p-3 rounded-2xl shadow-xl text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-primary dark:text-primary-light">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
            <span>Kisan Voice AI ({language.toUpperCase()})</span>
          </div>
          <p className="text-text-primary dark:text-gray-200">{feedback}</p>
          {transcript && (
            <p className="text-text-muted italic border-t border-farmborder/40 pt-1">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {/* Floating Action Mic Button */}
      <button
        onClick={toggleListening}
        aria-label="Voice Assistant"
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-90 ${
          isListening
            ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900'
            : 'bg-primary hover:bg-primary-dark text-white ring-4 ring-primary/20 hover:scale-105'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 animate-bounce" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Subtle decorative ring */}
        {!isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
          </span>
        )}
      </button>
    </div>
  );
};
