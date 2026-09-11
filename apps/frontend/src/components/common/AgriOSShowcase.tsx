import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Satellite,
  Bug,
  Landmark,
  Truck,
  Lock,
  HeartPulse,
  Award,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Droplets,
  CloudLightning,
  Compass,
  Leaf,
  Radio,
  FlaskConical,
  Scale,
  Sun,
  CreditCard,
  TrendingUp,
  Layers,
  Plane,
  Camera,
  FileText,
  AlertTriangle,
  Gavel,
  Play,
} from 'lucide-react';
import { AGRI_PILLARS, AGRI_OS_FEATURES, AgriOSFeature } from '../../data/agriOSFeaturesData';
import { Button } from '../ui/Button';

// Icon Map Resolver
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Satellite,
  Bug,
  Landmark,
  Truck,
  Lock,
  HeartPulse,
  Award,
  ShieldCheck,
  Droplets,
  CloudLightning,
  Compass,
  Leaf,
  Radio,
  FlaskConical,
  Scale,
  Sun,
  CreditCard,
  TrendingUp,
  Layers,
  Plane,
  Camera,
  FileText,
  AlertTriangle,
  Gavel,
  Play,
};

interface Props {
  onSelectFeature?: (feature: AgriOSFeature) => void;
}

export const AgriOSShowcase: React.FC<Props> = ({ onSelectFeature }) => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFeatures = AGRI_OS_FEATURES.filter((f) => {
    const matchesPillar = activePillar === 'all' || f.pillar === activePillar;
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  return (
    <section className="py-20 bg-surface-2 dark:bg-gray-950 border-t border-farmborder/60">
      <div className="container mx-auto px-4 lg:px-8 space-y-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary-dark/40 text-primary dark:text-primary-light text-xs font-bold uppercase tracking-wider border border-primary/20">
            <Sparkles className="w-4 h-4 text-gold" /> The National Agri-OS Ecosystem
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-text-primary dark:text-white">
            50 Breakthrough Capabilities for <span className="text-primary underline decoration-gold decoration-4 underline-offset-4">Empowered Kisan</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted dark:text-gray-400 leading-relaxed">
            From Sentinel-2 satellite sub-surface SAR radar to decentralized e-Rupee tokens, 360° AI anti-katoti yard cameras, and ₹5 Lakh family emergency shields.
          </p>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {AGRI_PILLARS.map((p) => {
            const Icon = ICON_MAP[p.icon] || Sparkles;
            const isSelected = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 text-text-muted hover:text-text-primary border-farmborder dark:border-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-2 dark:bg-gray-700 text-text-muted'
                  }`}
                >
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFeatures.map((f) => {
            const Icon = ICON_MAP[f.iconName] || Sparkles;
            return (
              <div
                key={f.id}
                className="card-farm flex flex-col justify-between group hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative border-2 border-transparent bg-white dark:bg-gray-900"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-primary-pale dark:bg-primary-dark/40 flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold-pale text-earth-brown dark:bg-gold/20 dark:text-gold border border-gold/30">
                      {f.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                      {f.tagline}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder/50 text-[11px] text-text-primary dark:text-gray-300 font-medium">
                    <span className="font-bold text-primary dark:text-primary-light block text-[10px] uppercase">Farmer Impact:</span>
                    {f.benefit}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-farmborder/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectFeature) onSelectFeature(f);
                      else navigate(f.route);
                    }}
                    className="text-xs font-bold text-primary dark:text-primary-light flex items-center gap-1 hover:underline"
                  >
                    <span>Explore System</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(f.route)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary dark:text-primary-light dark:hover:bg-primary text-xs font-bold transition-all flex items-center gap-1 border border-primary/20"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Footer Spotlight */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-earth-brown text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-gold/30">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" /> Comprehensive Government Agri-Infrastructure
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white">
              Every Tool Integrated Into A Unified Farmer Operating System
            </h3>
            <p className="text-xs sm:text-sm text-primary-pale max-w-2xl">
              Equipping every smallholder farmer in India with satellite surveillance, neural diagnostics, instant liquidity, and legal enforcement rights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button
              variant="gold"
              size="lg"
              onClick={() => navigate('/farmer/innovations')}
              icon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-lg"
            >
              Open Innovations Suite
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/farmer/crop-scanner')}
              className="w-full sm:w-auto border-white/80 text-white hover:bg-white hover:text-primary-dark"
            >
              Launch AI Crop Lab
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgriOSShowcase;
