import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link } from 'react-router-dom';

interface CropRate {
  crop: string;
  name: string;
  rate: number;
  yoy: number;
  icon: string;
  image: string;
}

const CROPS: CropRate[] = [
  { crop: 'wheat', name: 'Wheat (गेहूं)', rate: 2425, yoy: 6.6, icon: '🌾', image: '/images/crops/wheat.jpg' },
  { crop: 'paddy', name: 'Paddy (धान)', rate: 2300, yoy: 5.4, icon: '🌾', image: '/images/crops/paddy.jpg' },
  { crop: 'maize', name: 'Maize (मक्का)', rate: 2090, yoy: 6.5, icon: '🌽', image: '/images/crops/maize.jpg' },
  { crop: 'mustard', name: 'Mustard (सरसों)', rate: 5950, yoy: 5.3, icon: '🌻', image: '/images/crops/mustard.jpg' },
  { crop: 'gram', name: 'Gram (चना)', rate: 5650, yoy: 3.9, icon: '🌱', image: '/images/crops/chickpea.jpg' },
  { crop: 'soybean', name: 'Soybean (सोयाबीन)', rate: 4892, yoy: 6.3, icon: '🌿', image: '/images/crops/soybean.jpg' },
  { crop: 'cotton', name: 'Cotton (कपास)', rate: 7121, yoy: 7.5, icon: '☁️', image: '/images/crops/cotton.jpg' },
  { crop: 'groundnut', name: 'Groundnut (मूंगफली)', rate: 6783, yoy: 6.4, icon: '🥜', image: '/images/crops/groundnut.jpg' },
  { crop: 'barley', name: 'Barley (जौ)', rate: 1980, yoy: 7.0, icon: '🌾', image: '/images/crops/barley.jpg' },
  { crop: 'sunflower', name: 'Sunflower (सूरजमुखी)', rate: 7280, yoy: 7.7, icon: '🌻', image: '/images/crops/sunflower.jpg' },
];

export const MSPCalculator: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<CropRate>(CROPS[0]);
  const [traderOffer, setTraderOffer] = useState<number | ''>(2100);
  const [quantityKg, setQuantityKg] = useState<number | ''>(1000);

  const quintals = Number(quantityKg || 0) / 100;
  const mspTotal = quintals * selectedCrop.rate;
  const traderTotal = quintals * Number(traderOffer || 0);
  const diffPerQuintal = selectedCrop.rate - Number(traderOffer || 0);
  const totalSaved = mspTotal - traderTotal;
  const isLoss = totalSaved > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-farmborder dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary-dark text-white p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 text-gold-light text-xs font-bold uppercase tracking-widest mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Middleman Exploitation Shield</span>
        </div>
        <h2 className="font-heading text-2xl font-bold">
          Are You Being Cheated on MSP?
        </h2>
        <p className="text-sm text-primary-pale mt-1">
          Compare your trader/arthiya offer directly against the official Government Minimum Support Price.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Crop Selection Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Select Your Crop:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CROPS.map((c) => {
              const isSelected = selectedCrop.crop === c.crop;
              return (
                <button
                  key={c.crop}
                  type="button"
                  onClick={() => setSelectedCrop(c)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-md scale-102 ring-2 ring-primary/20'
                      : 'bg-surface hover:bg-surface-2 border-farmborder text-text-primary dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <img src={c.image} alt={c.name} className="w-6 h-6 rounded-md object-cover" />
                  <span className="truncate">{c.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Crop Official MSP Card */}
        <div className="p-4 bg-gold-pale dark:bg-gray-800/80 rounded-xl border border-gold/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={selectedCrop.image}
              alt={selectedCrop.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-gold shadow-sm shrink-0"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-brown dark:text-gold-light">
                Official Government MSP (2025–26) · {selectedCrop.name}
              </span>
              <div className="font-heading text-2xl font-extrabold text-text-primary dark:text-white mt-0.5">
                ₹{selectedCrop.rate.toLocaleString('en-IN')}{' '}
                <span className="text-sm font-normal text-text-muted">/ Quintal (100 kg)</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/50 px-3 py-1.5 rounded-pill">
            <TrendingUp className="w-3.5 h-3.5" /> +{selectedCrop.yoy}% over last year
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Trader / Middleman Offer (₹ / Quintal)"
            type="number"
            value={traderOffer}
            onChange={(e) => setTraderOffer(e.target.value === '' ? '' : Number(e.target.value))}
            prefixText="₹"
            placeholder="e.g. 2100"
          />
          <Input
            label="Total Grain Quantity (Kg)"
            type="number"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
            suffixText="Kg"
            placeholder="e.g. 1000"
          />
        </div>

        {/* Calculation Result */}
        {quantityKg && traderOffer && (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLoss
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
                : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {isLoss ? (
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-1" />
              )}
              <div className="space-y-1 w-full">
                <h4 className="font-heading text-lg font-bold text-text-primary dark:text-white">
                  {isLoss
                    ? `⚠️ You are being offered ₹${diffPerQuintal.toLocaleString('en-IN')} BELOW MSP per quintal!`
                    : '🎉 This trader offer meets or exceeds the government MSP.'}
                </h4>

                {isLoss && (
                  <p className="text-sm text-text-primary dark:text-gray-300">
                    On your <span className="font-semibold">{quantityKg} kg</span> ({quintals} quintals) crop, you stand to lose{' '}
                    <span className="font-bold text-red-600 text-lg">
                      ₹{totalSaved.toLocaleString('en-IN')}
                    </span>{' '}
                    to the middleman!
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-3 text-xs border-t border-farmborder/40 mt-2">
                  <div>
                    <span className="text-text-muted block">Direct Mandi Payout:</span>
                    <span className="font-bold text-primary dark:text-primary-light text-base">
                      ₹{mspTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Trader's Offer Total:</span>
                    <span className="font-bold text-text-primary dark:text-gray-300 text-base">
                      ₹{traderTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isLoss && (
              <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-900 flex justify-end">
                <Link to="/farmer/book-slot">
                  <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Save ₹{totalSaved.toLocaleString('en-IN')} — Book Mandi Slot Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
