import React from 'react';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface FeatureDetail {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badge: string;
  route: string;
  actionText: string;
  howItWorks: {
    overview: string;
    steps: { stepNumber: number; title: string; desc: string }[];
    realWorldBenefit: string;
    stats: { label: string; value: string }[];
  };
}

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureDetail | null;
  onUseFeature: (route: string) => void;
}

export const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({
  isOpen,
  onClose,
  feature,
  onUseFeature,
}) => {
  if (!feature) return null;

  const Icon = feature.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="space-y-6">
        {/* Header with Hero Banner */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-farmborder/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-pale dark:bg-primary-dark/40 flex items-center justify-center text-primary dark:text-primary-light shrink-0 shadow-sm border border-primary/20">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-pale text-earth-brown dark:bg-gold/20 dark:text-gold border border-gold/30">
                  {feature.badge}
                </span>
                <span className="text-[11px] text-text-muted font-semibold">Government Certified</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white">
                {feature.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Overview Description */}
        <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder space-y-1.5">
          <span className="text-[11px] text-primary dark:text-primary-light font-bold uppercase tracking-wider block">
            What is this feature?
          </span>
          <p className="text-xs sm:text-sm text-text-primary dark:text-gray-200 leading-relaxed font-medium">
            {feature.howItWorks.overview}
          </p>
        </div>

        {/* Step-by-Step "How It Works" */}
        <div className="space-y-3">
          <h4 className="font-heading text-sm sm:text-base font-bold text-text-primary dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold" /> Step-by-Step Workflow
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {feature.howItWorks.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 space-y-2 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary dark:text-primary-light font-display font-black text-xs flex items-center justify-center mb-2">
                    {step.stepNumber}
                  </div>
                  <h5 className="font-bold text-xs text-text-primary dark:text-white">
                    {step.title}
                  </h5>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-farmborder/40 text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified by System
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-World Ground Impact Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-700 dark:text-green-400" />
            <h4 className="font-bold text-xs text-green-900 dark:text-green-300 uppercase tracking-wide">
              Direct Farmer Benefit & Protection
            </h4>
          </div>
          <p className="text-xs text-green-950 dark:text-gray-200 leading-relaxed font-medium">
            {feature.howItWorks.realWorldBenefit}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {feature.howItWorks.stats.map((stat, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center"
            >
              <span className="text-[10px] text-text-muted font-bold block uppercase">{stat.label}</span>
              <span className="font-display text-lg font-black text-primary dark:text-primary-light block mt-0.5">
                {stat.value}
              </span>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-gold/15 border border-gold/30 text-center flex flex-col justify-center">
            <span className="text-[10px] text-earth-brown dark:text-gold uppercase font-bold">Audit Status</span>
            <span className="text-xs font-bold text-primary dark:text-primary-light mt-0.5">100% Transparent</span>
          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-4 border-t border-farmborder flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-farmborder hover:bg-surface-2 dark:hover:bg-gray-800 text-xs font-semibold text-text-muted transition-colors"
          >
            Close Details
          </button>

          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-bold shadow-lg flex items-center justify-center gap-2"
            onClick={() => {
              onClose();
              onUseFeature(feature.route);
            }}
          >
            <span>{feature.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeatureDetailModal;
