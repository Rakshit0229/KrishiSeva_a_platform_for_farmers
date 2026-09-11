import React from 'react';
import { MapPin, Clock, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface CentreCardProps {
  centre: any;
  featured?: boolean;
}

export const CentreCard: React.FC<CentreCardProps> = ({ centre, featured = false }) => {
  const loadPct = centre.load_pct ?? 60;
  const loadColor = loadPct > 80 ? 'bg-red-600' : loadPct > 55 ? 'bg-amber-500' : 'bg-primary';

  const getCentreImage = (name: string = '') => {
    const n = name.toLowerCase();
    if (n.includes('amritsar')) return '/images/crops/wheat.jpg';
    if (n.includes('ludhiana')) return '/images/crops/paddy.jpg';
    if (n.includes('hisar')) return '/images/crops/mustard.jpg';
    return '/images/crops/wheat.jpg';
  };

  return (
    <div
      className={`card-farm p-0 overflow-hidden relative flex flex-col justify-between group rounded-3xl transition-all duration-300 ${
        featured ? 'border-2 border-primary shadow-xl ring-2 ring-primary/20 scale-[1.01]' : 'hover:shadow-xl hover:border-primary/50'
      }`}
    >
      {/* Mandi Photo Banner */}
      <div className="h-40 w-full overflow-hidden relative">
        <img
          src={getCentreImage(centre.name)}
          alt={centre.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/25 shadow-sm">
            🏛️ APMC Mandi
          </span>
        </div>
        {featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-gold to-amber-500 text-text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            ⭐ Featured Centre
          </div>
        )}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
          <span className="text-xs font-bold text-gold-light uppercase tracking-wider drop-shadow-sm">
            {centre.district}, {centre.state}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{centre.avg_rating || 4.8}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Centre Name */}
          <div className="mb-3">
            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white mt-0.5">
              {centre.name}
            </h3>
          </div>

        {/* Address */}
        <p className="text-xs text-text-muted flex items-center gap-1.5 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span className="truncate">{centre.address}</span>
        </p>

        {/* Capacity / Load Bar */}
        <div className="space-y-1.5 mb-4 bg-surface dark:bg-gray-800/60 p-3 rounded-xl border border-farmborder/50">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-text-muted">Today's Slot Load:</span>
            <span className="font-bold text-text-primary dark:text-gray-200">
              {centre.today_booked_slots || 54} / {centre.today_max_slots || centre.daily_slot_capacity || 80} booked
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${loadColor}`}
              style={{ width: `${Math.min(100, loadPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              Est. Wait: <strong className="text-text-primary dark:text-gray-200">~{centre.estimated_wait_minutes || 25} min</strong>
            </span>
            <Badge status={centre.congestion || 'low'}>{centre.congestion || 'Normal'}</Badge>
          </div>
        </div>

        {/* Accepted Crops */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(centre.crops_accepted || ['wheat', 'paddy']).map((crop: string) => (
            <span
              key={crop}
              className="text-[11px] font-semibold capitalize px-2 py-0.5 rounded-pill bg-surface-2 dark:bg-gray-800 text-text-muted border border-farmborder/50"
            >
              🌾 {crop}
            </span>
          ))}
        </div>
      </div>

        {/* Bottom CTA */}
        <div className="pt-3 border-t border-farmborder/60 flex items-center justify-between">
          <span className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Digital Weighbridge
          </span>
          <Link to={`/farmer/book-slot?centreId=${centre.id}`}>
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Book Slot
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
