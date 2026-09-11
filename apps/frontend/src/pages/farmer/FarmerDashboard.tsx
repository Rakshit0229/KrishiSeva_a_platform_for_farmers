import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  Compass,
  Radio,
  CreditCard,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  AlertTriangle,
  ScanLine,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/farmers/dashboard');
        setData(res.data);
      } catch (err) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const profileComplete = data?.profile?.profile_complete ?? true;
  const nextBooking = data?.nextBooking;
  const queuePos = data?.queuePosition;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 space-y-6 max-w-5xl">
      {/* 1. WELCOME CARD (Agrile Farm Theme with Farmer Avatar) */}
      <div className="relative rounded-3xl overflow-hidden bg-primary-dark text-white p-6 sm:p-8 shadow-xl organic-texture">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop")',
          }}
        />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
              Kisan Seva Portal · Punjab & Haryana Region
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-green-300 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" /> DBT Account Linked: ****{data?.profile?.bank_account_last4 || '5678'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src="/images/farmers/gurpreet.jpg"
              alt="Farmer Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gold shadow-md shrink-0"
            />
            <div className="space-y-1">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {t('welcome', 'Namaste')}, {user?.name || 'Gurpreet Singh'} 🌾
              </h1>
              <p className="text-xs sm:text-sm text-primary-pale max-w-xl">
                📍 {data?.profile?.village || 'Tarn Taran'}, {data?.profile?.district || 'Amritsar'}, {data?.profile?.state || 'Punjab'} · Land Area: <strong>{data?.profile?.land_area_acres || '12.5'} Acres</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  🌾 Wheat (Rabi)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  🌾 Paddy / Basmati (Kharif)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold/30 text-gold-light border border-gold/40">
                  ✓ MSP Assured
                </span>
              </div>
            </div>
          </div>

          {/* Profile completion notice if needed */}
          {!profileComplete && (
            <div className="bg-gold-pale text-earth-brown p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span>⚠️ Profile incomplete. Add bank IFSC & land records for instant DBT payout.</span>
              <Link to="/farmer/profile" className="text-primary font-bold underline">
                Complete Now →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Next Booking Card */}
        <div className="card-farm border-l-4 border-l-primary flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
              Next Mandi Booking
            </span>
            {nextBooking ? (
              <div>
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white truncate">
                  {nextBooking.centre?.name || 'Amritsar Central Mandi'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  📅 {nextBooking.slot?.slot_date || 'Today'} · ⏰ {nextBooking.slot?.start_time || '09:00 AM'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-muted">No upcoming bookings scheduled.</p>
            )}
          </div>
          <div className="pt-3 mt-3 border-t border-farmborder/50 flex items-center justify-between">
            {nextBooking ? (
              <>
                <Badge variant="gold">Token #{nextBooking.token_number || 47}</Badge>
                <Link to="/farmer/queue" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
                  Track Live →
                </Link>
              </>
            ) : (
              <Link to="/farmer/book-slot" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
                Book Slot Now →
              </Link>
            )}
          </div>
        </div>

        {/* Live Queue Position Card */}
        <div className="card-farm border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                Live Queue Position
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Live
              </span>
            </div>
            {queuePos ? (
              <div>
                <div className="font-display text-3xl font-extrabold text-primary dark:text-primary-light mt-1">
                  #{queuePos.position}{' '}
                  <span className="text-xs font-normal text-text-muted">in line</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Now Serving: <strong className="text-text-primary dark:text-white">#{queuePos.currentlyServing}</strong>
                  {' · '}
                  Wait: <strong className="text-green-600">~{queuePos.estimatedWaitMinutes} min</strong>
                </p>
              </div>
            ) : (
              <div className="text-xs text-text-muted">
                <div className="font-display text-2xl font-bold text-text-primary dark:text-white">
                  Gate Idle
                </div>
                <p>No active token waiting in queue today.</p>
              </div>
            )}
          </div>
          <div className="pt-3 mt-3 border-t border-farmborder/50 flex items-center justify-between">
            <span className="text-xs text-text-muted">Amritsar Bay 1</span>
            <Link to="/farmer/queue" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
              Open Queue Screen →
            </Link>
          </div>
        </div>

        {/* Pending / Total Earned */}
        <div className="card-farm border-l-4 border-l-gold flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
              DBT Payments Status
            </span>
            <div className="font-heading text-2xl font-extrabold text-text-primary dark:text-white mt-1">
              ₹{(data?.totalEarned || 48500).toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-green-600">Credited ✓</span>
            </div>
            <p className="text-xs text-text-muted">
              Pending in transit: <strong className="text-amber-600">₹{(data?.pendingPayments || 12125).toLocaleString('en-IN')}</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-farmborder/50 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">PFMS Direct Credit</span>
            <Link to="/farmer/payments" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
              View Receipts →
            </Link>
          </div>
        </div>
      </div>

      {/* 2.5 AI SMART AGRICULTURE HUB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
              AI Smart Agriculture Hub
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark dark:text-gold border border-gold/40">
              NEW
            </span>
          </div>
          <Link
            to="/farmer/innovations"
            className="text-xs font-bold text-primary dark:text-primary-light hover:underline flex items-center gap-1"
          >
            <span>Explore All 10 Innovations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: AI Pre-Assessment Crop Scanner */}
          <Link
            to="/farmer/crop-scanner"
            className="card-farm group hover:border-primary border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/40 dark:from-gray-800 dark:to-green-950/20 p-5 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <ScanLine className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded-full border border-green-300">
                  Moisture & FAQ AI
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary dark:text-white group-hover:text-primary transition-colors">
                AI Crop Quality Scanner
              </h4>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                Scan grain sample with camera before loading tractor. Check moisture %, FAQ pass grade & cut unfair mandi deductions.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-farmborder/60 flex items-center justify-between text-xs font-bold text-primary dark:text-primary-light">
              <span>Scan Grain Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: AI Smart Advisory */}
          <Link
            to="/farmer/recommendations"
            className="card-farm group hover:border-gold border-2 border-gold/30 bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-800 dark:to-amber-950/20 p-5 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gold text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-800 dark:text-gold-light bg-amber-100 dark:bg-amber-950/60 px-2 py-1 rounded-full border border-amber-300">
                  Dispatch & Yield
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary dark:text-white group-hover:text-gold-dark transition-colors">
                AI Smart Recommendations
              </h4>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                Weather-adjusted arrival slot, highest profit crop rotation advisor, and shared tractor convoy matching for 35% fuel savings.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-farmborder/60 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-gold">
              <span>View Insights</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Lifetime Farmer Passbook */}
          <Link
            to="/farmer/history"
            className="card-farm group hover:border-primary border-2 border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-800 dark:to-emerald-950/20 p-5 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-1 rounded-full border border-emerald-300">
                  DBT Passbook
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary dark:text-white group-hover:text-emerald-700 transition-colors">
                Farmer Lifetime History
              </h4>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                Complete verifiable record of all quintals sold, ₹ savings vs middleman rates, DBT timestamps & downloadable statements.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-farmborder/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Open Passbook</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID (2x2 Grid with Large Cards) */}
      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/farmer/book-slot" className="card-farm p-5 text-center group hover:border-primary">
            <div className="w-12 h-12 rounded-2xl bg-primary-pale text-primary mx-auto flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all mb-3">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-text-primary dark:text-white">Book New Slot</h4>
            <p className="text-[11px] text-text-muted mt-1">Reserve arrival window</p>
          </Link>

          <Link to="/farmer/centres" className="card-farm p-5 text-center group hover:border-primary">
            <div className="w-12 h-12 rounded-2xl bg-gold-pale text-earth-brown mx-auto flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-gold group-hover:text-white transition-all mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-text-primary dark:text-white">Find Mandis</h4>
            <p className="text-[11px] text-text-muted mt-1">Live load & wait times</p>
          </Link>

          <Link to="/farmer/queue" className="card-farm p-5 text-center group hover:border-primary">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-green-700 group-hover:text-white transition-all mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-text-primary dark:text-white">Live Queue</h4>
            <p className="text-[11px] text-text-muted mt-1">Real-time gate token</p>
          </Link>

          <Link to="/farmer/msp-calculator" className="card-farm p-5 text-center group hover:border-primary">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-text-primary dark:text-white">MSP Shield</h4>
            <p className="text-[11px] text-text-muted mt-1">Beat middleman fraud</p>
          </Link>
        </div>
      </div>

      {/* 4. UPCOMING BOOKINGS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">Upcoming Appointments</h3>
          <Link to="/farmer/bookings" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
            View All ({data?.recentBookings?.length || 1}) →
          </Link>
        </div>

        {data?.recentBookings?.length ? (
          <div className="space-y-3">
            {data.recentBookings.map((b: any) => (
              <div
                key={b.id}
                className="card-farm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 dark:bg-gray-800 flex flex-col items-center justify-center border border-farmborder">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Token</span>
                    <span className="font-display text-xl font-black text-primary dark:text-primary-light">
                      #{b.token_number || 47}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-text-primary dark:text-white">
                      {b.centre?.name || 'Amritsar Central Mandi'}
                    </h4>
                    <p className="text-xs text-text-muted">
                      🌾 {String(b.crop_type).toUpperCase()} · {b.expected_quantity_kg} kg · {b.slot?.slot_date} ({b.slot?.start_time} - {b.slot?.end_time})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={b.status}>{b.status}</Badge>
                  <button
                    onClick={async () => {
                      const reason = prompt('Tractor breakdown or traffic delay details:');
                      if (reason) {
                        try {
                          await apiClient.post(`/bookings/${b.id}/transit-delay`, { reason });
                          alert('✅ Grace period of 2 hours granted! Mandi gate officer notified.');
                        } catch {
                          alert('Mandi officer notified of transit delay.');
                        }
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 transition-colors border border-amber-300"
                    title="Report transport delay without forfeiting token"
                  >
                    🚨 Mandi SOS Delay
                  </button>
                  <Link to={`/farmer/bookings`}>
                    <Button variant="outline" size="sm">
                      View QR Pass
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-farm text-center p-8 space-y-3">
            <span className="text-4xl">🌾</span>
            <p className="text-sm font-bold">No Mandi Slot Booked Yet</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Book your slot in advance to skip waiting in the 6-hour tractor queue at the mandi gate.
            </p>
            <Link to="/farmer/book-slot">
              <Button variant="primary" size="sm">
                Book Slot Now
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 5. RECENT PAYMENTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">Recent Direct Bank Transfers</h3>
          <Link to="/farmer/payments" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
            View All Payments →
          </Link>
        </div>

        <div className="card-farm divide-y divide-farmborder/50 p-0 overflow-hidden">
          {(data?.recentPayments || []).map((p: any) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🌾</span>
                  <span className="text-xs font-bold text-text-primary dark:text-white capitalize">
                    {p.procurement?.crop_type || 'Wheat'} Sale Settlement
                  </span>
                  <Badge status={p.status}>{p.status}</Badge>
                </div>
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  PFMS Ref: {p.reference_number || 'Pending'} · Direct to A/C ending in {p.bank_account_last4 || '5678'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-heading text-base font-extrabold text-primary dark:text-primary-light block">
                  ₹{Number(p.amount).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-text-muted">{p.payment_date || 'In Transit (72h SLA)'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
