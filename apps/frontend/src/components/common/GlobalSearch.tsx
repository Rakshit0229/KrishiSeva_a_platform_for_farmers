import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  Leaf,
  MapPin,
  Calculator,
  Calendar,
  BarChart2,
  Mic,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Star,
} from 'lucide-react';

interface SearchItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  route: string;
  category: string;
  keywords: string[];
}

const ALL_ITEMS: SearchItem[] = [
  // Core Features
  {
    id: 'book-slot',
    label: 'Book Mandi Slot',
    sublabel: 'Schedule your guaranteed time slot',
    icon: <Calendar className="w-4 h-4 text-primary" />,
    route: '/farmer/book-slot',
    category: 'Core Features',
    keywords: ['book', 'slot', 'mandi', 'schedule', 'appointment', 'बुकिंग'],
  },
  {
    id: 'live-queue',
    label: 'Live Queue Monitor',
    sublabel: 'Track real-time token status',
    icon: <BarChart2 className="w-4 h-4 text-primary" />,
    route: '/farmer/queue',
    category: 'Core Features',
    keywords: ['queue', 'token', 'wait', 'live', 'status'],
  },
  {
    id: 'payments',
    label: 'Payment & DBT Status',
    sublabel: 'Direct bank transfer tracking',
    icon: <ShieldCheck className="w-4 h-4 text-primary" />,
    route: '/farmer/payments',
    category: 'Core Features',
    keywords: ['payment', 'dbt', 'bank', 'money', 'transfer', 'pfms', 'भुगतान'],
  },
  {
    id: 'msp-calculator',
    label: 'MSP Calculator',
    sublabel: 'Compare MSP vs trader offers',
    icon: <Calculator className="w-4 h-4 text-gold" />,
    route: '/farmer/msp-calculator',
    category: 'Tools',
    keywords: ['msp', 'calculator', 'rate', 'price', 'compare', 'trader', 'minimum support'],
  },
  {
    id: 'crop-scanner',
    label: 'AI Crop Quality Lab',
    sublabel: 'Scan grain quality before mandi visit',
    icon: <Leaf className="w-4 h-4 text-green-600" />,
    route: '/farmer/crop-scanner',
    category: 'Tools',
    keywords: ['crop', 'scan', 'quality', 'moisture', 'ai', 'lab', 'फसल'],
  },
  {
    id: 'centres',
    label: 'Find Mandis / APMC Centres',
    sublabel: 'Locate nearby procurement centres',
    icon: <MapPin className="w-4 h-4 text-red-500" />,
    route: '/farmer/centres',
    category: 'Navigation',
    keywords: ['mandi', 'centre', 'apmc', 'nearby', 'location', 'find', 'मंडी'],
  },
  {
    id: 'gis-map',
    label: 'Mandi GIS Heatmap',
    sublabel: 'Visual congestion map across India',
    icon: <MapPin className="w-4 h-4 text-primary" />,
    route: '/farmer/map',
    category: 'Navigation',
    keywords: ['map', 'gis', 'heatmap', 'location', 'district'],
  },
  {
    id: 'innovations',
    label: '20 Agri Innovations Suite',
    sublabel: 'AI tools, satellite yield, solar cold rooms',
    icon: <Star className="w-4 h-4 text-gold" />,
    route: '/farmer/innovations',
    category: 'Tools',
    keywords: ['innovations', 'ai', 'satellite', 'solar', 'tools', 'agri', 'technology'],
  },
  {
    id: 'weather',
    label: 'Weather & Crop Advisory',
    sublabel: '7-day district weather forecast',
    icon: <Leaf className="w-4 h-4 text-blue-500" />,
    route: '/farmer/weather',
    category: 'Tools',
    keywords: ['weather', 'rain', 'forecast', 'advisory', 'मौसम'],
  },
  {
    id: 'history',
    label: 'Procurement Passbook',
    sublabel: 'Past transactions and receipts',
    icon: <BookOpen className="w-4 h-4 text-primary" />,
    route: '/farmer/history',
    category: 'Account',
    keywords: ['history', 'passbook', 'transactions', 'receipts', 'past'],
  },
  {
    id: 'recommendations',
    label: 'AI Advisory & Recommendations',
    sublabel: 'Personalised crop and market advice',
    icon: <Mic className="w-4 h-4 text-purple-500" />,
    route: '/farmer/recommendations',
    category: 'Tools',
    keywords: ['advisory', 'recommendation', 'ai', 'advice', 'personalized'],
  },
  {
    id: 'help',
    label: 'Help & Grievance Centre',
    sublabel: 'Support, complaints, and FAQs',
    icon: <HelpCircle className="w-4 h-4 text-text-muted" />,
    route: '/help',
    category: 'Support',
    keywords: ['help', 'grievance', 'complaint', 'support', 'faq', 'शिकायत'],
  },
  // MSP Rates
  {
    id: 'wheat',
    label: 'Wheat (गेहूं) — MSP ₹2,425/Qtl',
    sublabel: 'Rabi 2026 · Active Procurement',
    icon: <span className="text-lg">🌾</span>,
    route: '/farmer/book-slot',
    category: 'MSP Rates',
    keywords: ['wheat', 'gehu', 'गेहूं', 'rabi', '2425'],
  },
  {
    id: 'paddy',
    label: 'Paddy / Basmati (धान) — MSP ₹2,300/Qtl',
    sublabel: 'Kharif 2025 · High Demand',
    icon: <span className="text-lg">🌾</span>,
    route: '/farmer/book-slot',
    category: 'MSP Rates',
    keywords: ['paddy', 'basmati', 'dhan', 'धान', 'rice', '2300'],
  },
  {
    id: 'mustard',
    label: 'Mustard (सरसों) — MSP ₹5,950/Qtl',
    sublabel: 'Rabi 2026 · MSP Shielded',
    icon: <span className="text-lg">🌼</span>,
    route: '/farmer/book-slot',
    category: 'MSP Rates',
    keywords: ['mustard', 'sarson', 'सरसों', 'rabi', '5950'],
  },
  {
    id: 'cotton',
    label: 'Cotton (कपास) — MSP ₹7,121/Qtl',
    sublabel: 'Kharif 2025 · Certified Scale',
    icon: <span className="text-lg">☁️</span>,
    route: '/farmer/book-slot',
    category: 'MSP Rates',
    keywords: ['cotton', 'kapas', 'narma', 'कपास', '7121'],
  },
  {
    id: 'chickpea',
    label: 'Chickpea / Gram (चना) — MSP ₹5,650/Qtl',
    sublabel: 'Rabi 2026 · Direct DBT',
    icon: <span className="text-lg">🫘</span>,
    route: '/farmer/book-slot',
    category: 'MSP Rates',
    keywords: ['chickpea', 'gram', 'chana', 'dal', 'चना', '5650'],
  },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useCallback(() => {
    if (!query.trim()) return ALL_ITEMS.slice(0, 8);
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel?.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [query]);

  const results = filtered();

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIdx(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIdx]) {
          navigate(results[selectedIdx].route);
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, results, selectedIdx, navigate, onClose]);

  if (!isOpen) return null;

  // Group results by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-farmborder dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-farmborder dark:border-gray-700">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, crops, mandis... / खोजें"
            className="flex-1 text-sm bg-transparent text-text-primary dark:text-white placeholder:text-text-muted focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-text-muted border border-farmborder dark:border-gray-700 rounded-lg bg-surface dark:bg-gray-800">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>
                No results for &ldquo;<span className="font-semibold text-text-primary dark:text-white">{query}</span>&rdquo;
              </p>
              <p className="text-xs mt-1">Try searching for crops, features, or mandis</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-gray-500">
                  {category}
                </div>
                {items.map((item) => {
                  const globalIdx = results.indexOf(item);
                  const isSelected = globalIdx === selectedIdx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.route);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-pale dark:bg-primary-dark/30'
                          : 'hover:bg-surface-2 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-surface-2 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-farmborder dark:border-gray-700">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary dark:text-white truncate">
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className="text-[11px] text-text-muted truncate">{item.sublabel}</div>
                        )}
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100 text-primary' : 'opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-farmborder dark:border-gray-700 flex items-center gap-4 text-[11px] text-text-muted bg-surface dark:bg-gray-800/50">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 border border-farmborder dark:border-gray-600 rounded text-[10px] font-bold bg-white dark:bg-gray-700">
              ↑↓
            </kbd>{' '}
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 border border-farmborder dark:border-gray-600 rounded text-[10px] font-bold bg-white dark:bg-gray-700">
              ↵
            </kbd>{' '}
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 border border-farmborder dark:border-gray-600 rounded text-[10px] font-bold bg-white dark:bg-gray-700">
              Ctrl K
            </kbd>{' '}
            Toggle
          </span>
          <span className="ml-auto">🌾 KrishiSeva Search</span>
        </div>
      </div>
    </div>
  );
};
