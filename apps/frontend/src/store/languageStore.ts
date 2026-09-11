import { create } from 'zustand';

export type LanguageCode = 'hi' | 'en' | 'pa' | 'ta' | 'te' | 'mr' | 'bn';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const STORAGE_KEY = 'krishiseva-lang';

export const useLanguageStore = create<LanguageState>((set) => {
  const saved = (localStorage.getItem(STORAGE_KEY) as LanguageCode) || 'hi';

  return {
    language: saved,
    setLanguage: (lang: LanguageCode) => {
      localStorage.setItem(STORAGE_KEY, lang);
      set({ language: lang });
    },
  };
});
