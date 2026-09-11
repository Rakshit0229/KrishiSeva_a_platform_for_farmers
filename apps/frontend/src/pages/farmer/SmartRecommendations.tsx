import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  CloudSun,
  Sprout,
  Users,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Truck,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export const SmartRecommendations: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await apiClient.get(`/recommendations/farmer/${user?.id || 'demo'}`);
        setData(res.data);
      } catch {
        // Mock fallback
        setData({
          farmer_name: user?.name || 'Gurpreet Singh',
          district: 'Amritsar',
          state: 'Punjab',
          recommendations: {
            optimal_mandi_dispatch: {
              recommended_centre: 'Amritsar Central Mandi',
              best_day: 'Thursday, April 16, 2026',
              best_time_window: '09:30 AM – 11:30 AM',
              estimated_wait_minutes: 18,
              weather_rain_risk_pct: 8,
              reasoning: 'Morning arrival window avoids midday tractor lines. 100% covered shed operational with zero rain risk forecasted.',
              direct_slot_url: '/farmer/book-slot?centreId=10000000-0000-0000-0000-000000000001',
            },
            crop_rotation_maximizer: {
              current_crop: 'Wheat (गेहूं)',
              recommended_next_crop: 'Summer Moong / Green Gram (मूंग दाल)',
              season: 'Zaid 2026 (65-day crop)',
              projected_extra_income_acre: 18500,
              nitrogen_fixation_benefit: 'Restores ~38 kg atmospheric nitrogen per hectare, saving 1.5 bags of Urea in subsequent Paddy crop.',
              govt_seed_subsidy: '50% certified seed subsidy available at Block Agriculture Office.',
            },
            soil_nutrient_prescription: {
              land_area_acres: 12.5,
              recommended_nutrients: {
                urea_bags: 28,
                dap_bags: 12,
                mop_potash_bags: 6,
                zinc_sulphate_kg: 125,
              },
              organic_advisory: 'Incorporate paddy straw into soil with Super Seeder rather than burning. Apply 5 tons vermicompost to boost soil microbial carbon.',
            },
            logistics_pooling: {
              nearby_active_fpo: 'Majha Kisan Producer Group',
              available_trolley_convoys: 3,
              shared_transit_saving_pct: 42,
              contact_helpline: '1800-180-1551',
            },
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs text-text-muted font-medium">Synthesizing Agri AI Recommendations...</p>
      </div>
    );
  }

  const { recommendations } = data;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/25 text-gold-light border border-gold/40 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> AI Farm Decision Intelligence
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold">
            Smart Recommendations & Profit Maximizer
          </h1>
          <p className="text-xs sm:text-sm text-primary-pale max-w-xl">
            Personalized advisories combining real-time mandi queue telemetry, weather radar, soil nutrient balancing, and transport pooling.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20">
          <MapPin className="w-4 h-4 text-gold-light" />
          <div className="text-xs">
            <span className="block font-bold">{data.district}, {data.state}</span>
            <span className="text-[10px] text-white/70">12.5 Acres Active Farmland</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Smart Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Optimal Mandi Dispatch Window */}
        <div className="card-farm bg-white dark:bg-gray-900 p-6 rounded-3xl border border-farmborder dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-primary dark:text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Logistics Intelligence
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Low Rain Risk: {recommendations.optimal_mandi_dispatch.weather_rain_risk_pct}%
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
              Optimal Mandi Arrival Window
            </h3>

            <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Recommended Mandi:</span>
                <span className="font-bold">{recommendations.optimal_mandi_dispatch.recommended_centre}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Target Dispatch Date:</span>
                <span className="font-bold text-primary dark:text-primary-light">
                  {recommendations.optimal_mandi_dispatch.best_day}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Arrival Time Slot:</span>
                <span className="font-bold">{recommendations.optimal_mandi_dispatch.best_time_window}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Estimated Wait Time:</span>
                <span className="font-bold text-green-600">
                  ~{recommendations.optimal_mandi_dispatch.estimated_wait_minutes} Minutes
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              💡 {recommendations.optimal_mandi_dispatch.reasoning}
            </p>
          </div>

          <Link to={recommendations.optimal_mandi_dispatch.direct_slot_url}>
            <Button variant="primary" size="md" className="w-full justify-center shadow-md">
              <Calendar className="w-4 h-4 mr-2" /> Book Recommended Slot Now
            </Button>
          </Link>
        </div>

        {/* 2. Crop Rotation & Profit Maximizer */}
        <div className="card-farm bg-white dark:bg-gray-900 p-6 rounded-3xl border border-farmborder dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gold-dark dark:text-gold-light uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-4 h-4" /> Next Crop Advisory
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark">
                Zaid Season
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
              Crop Rotation & Profit Maximizer
            </h3>

            <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Current Crop:</span>
                <span className="font-bold">{recommendations.crop_rotation_maximizer.current_crop}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Recommended Crop:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {recommendations.crop_rotation_maximizer.recommended_next_crop}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Expected Extra Net Income:</span>
                <span className="font-black text-primary text-sm">
                  +₹{recommendations.crop_rotation_maximizer.projected_extra_income_acre.toLocaleString('en-IN')} / Acre
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              🌱 <strong>Soil Benefit:</strong> {recommendations.crop_rotation_maximizer.nitrogen_fixation_benefit}
            </p>
            <p className="text-[11px] text-primary dark:text-primary-light font-semibold">
              🏛️ {recommendations.crop_rotation_maximizer.govt_seed_subsidy}
            </p>
          </div>

          <Link to="/msp-calculator">
            <Button variant="outline" size="md" className="w-full justify-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Calculate Projected Margins
            </Button>
          </Link>
        </div>

        {/* 3. Soil Nutrient Prescription */}
        <div className="card-farm bg-white dark:bg-gray-900 p-6 rounded-3xl border border-farmborder dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4" /> Soil Health Balancing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                12.5 Acres Scale
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
              Targeted N-P-K Nutrient Plan
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-2xl border border-farmborder">
                <span className="text-[10px] text-text-muted font-bold block">Urea (Nitrogen)</span>
                <span className="text-xl font-black text-text-primary dark:text-white block">
                  {recommendations.soil_nutrient_prescription.recommended_nutrients.urea_bags} Bags
                </span>
              </div>
              <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-2xl border border-farmborder">
                <span className="text-[10px] text-text-muted font-bold block">DAP (Phosphorus)</span>
                <span className="text-xl font-black text-text-primary dark:text-white block">
                  {recommendations.soil_nutrient_prescription.recommended_nutrients.dap_bags} Bags
                </span>
              </div>
              <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-2xl border border-farmborder">
                <span className="text-[10px] text-text-muted font-bold block">MOP (Potash)</span>
                <span className="text-xl font-black text-text-primary dark:text-white block">
                  {recommendations.soil_nutrient_prescription.recommended_nutrients.mop_potash_bags} Bags
                </span>
              </div>
              <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-2xl border border-farmborder">
                <span className="text-[10px] text-text-muted font-bold block">Zinc Sulphate</span>
                <span className="text-xl font-black text-text-primary dark:text-white block">
                  {recommendations.soil_nutrient_prescription.recommended_nutrients.zinc_sulphate_kg} kg
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              ♻️ <strong>Ecological Advisory:</strong> {recommendations.soil_nutrient_prescription.organic_advisory}
            </p>
          </div>

          <Link to="/farmer/weather">
            <Button variant="outline" size="md" className="w-full justify-center">
              <CloudSun className="w-4 h-4 mr-2" /> Check Soil Irrigation Moisture
            </Button>
          </Link>
        </div>

        {/* 4. Trolley Logistics Pooling */}
        <div className="card-farm bg-white dark:bg-gray-900 p-6 rounded-3xl border border-farmborder dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Transit Cost Reduction
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Save 42% Fuel
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
              Shared FPO Trolley Convoys
            </h3>

            <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Nearest Active FPO:</span>
                <span className="font-bold">{recommendations.logistics_pooling.nearby_active_fpo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Scheduled Trolley Convoys:</span>
                <span className="font-bold">{recommendations.logistics_pooling.available_trolley_convoys} Departures</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Transit Cost Savings:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {recommendations.logistics_pooling.shared_transit_saving_pct}% Savings
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Small and marginal farmers can combine trolley loads to the central mandi, cutting individual diesel expenses by over 40% while booking a single joint convoy slot!
            </p>
          </div>

          <Link to="/farmer/fpo-group">
            <Button variant="primary" size="md" className="w-full justify-center shadow-md">
              <Users className="w-4 h-4 mr-2" /> Join FPO Joint Convoy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;
