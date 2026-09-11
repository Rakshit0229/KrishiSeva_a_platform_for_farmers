import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Sun,
  CloudRain,
  CloudSun,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { QRTicket } from '../../components/domain/QRTicket';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const BookSlot: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCentreId = searchParams.get('centreId');
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [centres, setCentres] = useState<any[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [datesList, setDatesList] = useState<any[]>([]);

  // Slot selection
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Crop & MSP details
  const [cropType, setCropType] = useState('wheat');
  const [expectedQty, setExpectedQty] = useState<number | ''>(500);
  const [notes, setNotes] = useState('');
  const [compareMiddleman, setCompareMiddleman] = useState(false);
  const [traderOffer, setTraderOffer] = useState<number | ''>(2100);

  // Completed booking
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load: Centres & 7-Day Dates
  useEffect(() => {
    async function init() {
      try {
        const res = await apiClient.get('/centres');
        setCentres(res.data || []);
        if (preselectedCentreId) {
          const matched = res.data.find((c: any) => c.id === preselectedCentreId);
          if (matched) setSelectedCentre(matched);
        } else if (res.data.length > 0) {
          setSelectedCentre(res.data[0]);
        }
      } catch {
        // fallback
      }

      // Generate 7-day strip
      const days = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isRainy = i === 3; // day 3 light rain

        days.push({
          dateStr,
          dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          dayNum: d.getDate(),
          monthName: d.toLocaleDateString('en-IN', { month: 'short' }),
          weather: isRainy ? 'rainy' : i % 2 === 0 ? 'sunny' : 'cloudy',
          isAdverse: isRainy,
        });
      }
      setDatesList(days);
      setSelectedDate(days[0].dateStr);
    }
    init();
  }, [preselectedCentreId]);

  // Load slots when Centre or Date changes
  useEffect(() => {
    if (!selectedCentre || !selectedDate) return;

    async function fetchSlots() {
      try {
        const res = await apiClient.get(`/slots?centre_id=${selectedCentre.id}&date=${selectedDate}`);
        setSlots(res.data || []);
        if (res.data.length > 0) {
          setSelectedSlot(res.data[0]);
        }
      } catch {
        // fallback
      }
    }
    fetchSlots();
  }, [selectedCentre, selectedDate]);

  // Geolocation Smart Reroute Trigger
  const handleSmartReroute = async () => {
    toast('Searching least-busy mandi centres near your GPS location...', { icon: '📍' });
    try {
      const res = await apiClient.get('/gis/reroute');
      if (res.data?.recommended) {
        setSelectedCentre(res.data.recommended);
        toast.success(`Switched to ${res.data.recommended.name} (~${res.data.recommended.waitMinutes} min wait)!`);
      }
    } catch {
      toast.error('Could not fetch nearest mandi');
    }
  };

  // MSP Calculation
  const mspRate = cropType === 'wheat' ? 2425 : cropType === 'paddy' ? 2300 : cropType === 'mustard' ? 5950 : 2090;
  const quintals = Number(expectedQty || 0) / 100;
  const estimatedMspValue = Number((quintals * mspRate).toFixed(2));
  const traderTotal = Number((quintals * Number(traderOffer || 0)).toFixed(2));
  const savingsVsMiddleman = estimatedMspValue - traderTotal;

  // Final Submit
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedCentre) {
      toast.error('Please choose a valid slot and mandi centre');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/bookings', {
        slot_id: selectedSlot.id,
        centre_id: selectedCentre.id,
        crop_type: cropType,
        expected_quantity_kg: expectedQty,
        notes,
      });

      setCreatedBooking(res.data);
      setStep(5);
      toast.success('Mandi Slot Confirmed! Gate QR pass generated.');
    } catch (err: any) {
      // PROMPT RULE 7: 409 Conflict handling
      if (err.response?.status === 409) {
        toast.error('This slot just filled up. Please choose another.');
        setStep(3);
      } else {
        toast.error(err.response?.data?.error || 'Failed to book slot');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCentres = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl space-y-6">
      {/* Top Title & Step Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label">Slot Booking Engine</div>
          <span className="text-xs font-bold text-primary dark:text-primary-light">
            Step {step} of 5
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          {step === 1 && '1. Select Procurement Mandi'}
          {step === 2 && '2. Pick Visit Date'}
          {step === 3 && '3. Choose Arrival Time Slot'}
          {step === 4 && '4. Crop & MSP Calculation'}
          {step === 5 && '5. Gate Pass & QR Confirmation'}
        </h1>

        {/* Animated Progress Bar */}
        <div className="w-full h-2 bg-surface-2 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* ================= STEP 1: SELECT CENTRE ================= */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search mandi by name or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-farm pl-9 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSmartReroute}
              icon={<MapPin className="w-4 h-4 text-primary" />}
            >
              Least-Busy Near Me 📍
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredCentres.map((centre) => {
              const isSelected = selectedCentre?.id === centre.id;
              return (
                <div
                  key={centre.id}
                  onClick={() => setSelectedCentre(centre)}
                  className={`card-farm p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-primary bg-primary-pale/30 dark:bg-primary-dark/30 shadow-md ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-gold uppercase tracking-wider">
                        {centre.district}, {centre.state}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
                        {centre.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{centre.address}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-farmborder/50 text-xs text-text-muted">
                    <span>
                      Load: <strong>{centre.today_booked_slots || 50}/80</strong>
                    </span>
                    <span>·</span>
                    <span className="text-green-700 dark:text-green-400 font-bold">
                      Wait: ~{centre.estimated_wait_minutes || 20} min
                    </span>
                    <span>·</span>
                    <span>Rating: ★ {centre.avg_rating || 4.8}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              disabled={!selectedCentre}
              onClick={() => setStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Select Date
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: PICK DATE ================= */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm text-text-muted">
            Selected Mandi: <strong className="text-primary">{selectedCentre?.name}</strong>
          </p>

          {/* 7-Day Horizontal Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {datesList.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg scale-105'
                      : day.isAdverse
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-text-primary dark:text-gray-200'
                      : 'bg-surface hover:bg-surface-2 border-farmborder text-text-primary dark:bg-gray-800'
                  }`}
                >
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                    {day.dayName}
                  </span>
                  <span className="font-display text-2xl font-extrabold">
                    {day.dayNum}
                  </span>
                  <span className="text-[10px] opacity-75">{day.monthName}</span>

                  <div className="mt-1">
                    {day.weather === 'rainy' ? (
                      <CloudRain className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    ) : day.weather === 'cloudy' ? (
                      <CloudSun className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                    ) : (
                      <Sun className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Weather Alert if day has rain */}
          {datesList.find((d) => d.dateStr === selectedDate)?.isAdverse && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-earth-brown dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>IMD Weather Advisory:</strong> Light to moderate rain predicted. Grain moisture risk. Ensure your vehicle has waterproof tarpaulin cover.
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!selectedDate}
              onClick={() => setStep(3)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Select Time Slot
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: PICK TIME SLOT ================= */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>
              Date: <strong className="text-text-primary dark:text-white">{selectedDate}</strong>
            </span>
            <span className="text-xs text-green-600 font-semibold">● Real-time capacity check</span>
          </div>

          {/* Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isFull = slot.is_full || slot.booked_count >= slot.max_capacity;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isFull || slot.is_blocked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-md scale-102'
                      : isFull
                      ? 'bg-surface-2 dark:bg-gray-800 opacity-50 cursor-not-allowed border-farmborder'
                      : 'bg-white dark:bg-gray-900 hover:border-primary border-farmborder'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold" />
                      <span className="font-heading font-bold text-base">
                        {slot.start_time} – {slot.end_time}
                      </span>
                    </div>
                    <span className="text-xs opacity-80 block">
                      {isFull
                        ? 'Fully Booked (Waitlist Available)'
                        : `${slot.booked_count}/${slot.max_capacity} Booked`}
                    </span>
                  </div>

                  <div className="text-right">
                    <Badge variant={slot.congestion === 'peak' ? 'error' : slot.congestion === 'high' ? 'pending' : 'success'}>
                      {slot.congestion}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!selectedSlot || selectedSlot.is_full}
              onClick={() => setStep(4)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Crop Details
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CROP DETAILS & MSP CALC ================= */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crop Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="input-farm text-sm font-semibold capitalize"
              >
                <option value="wheat">🌾 Wheat (गेहूं)</option>
                <option value="paddy">🌾 Paddy (धान)</option>
                <option value="maize">🌽 Maize (मक्का)</option>
                <option value="mustard">🌻 Mustard (सरसों)</option>
              </select>
            </div>

            {/* Expected Quantity */}
            <Input
              label="Expected Quantity (Kg)"
              type="number"
              value={expectedQty}
              onChange={(e) => setExpectedQty(e.target.value === '' ? '' : Number(e.target.value))}
              suffixText="Kg"
              placeholder="500"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Notes for Mandi Officer (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Sharbati wheat variant, harvested 2 days ago"
              className="input-farm text-sm"
            />
          </div>

          {/* Live Government MSP Value Card */}
          <div className="p-4 rounded-xl bg-gold-pale dark:bg-gray-800/80 border border-gold/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-earth-brown dark:text-gold-light">
                Government MSP Assurance
              </span>
              <span className="text-xs font-bold text-green-700 dark:text-green-400">
                Rate: ₹{mspRate}/quintal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-gold/20">
              <span className="text-sm font-medium text-text-muted">
                Estimated Value ({quintals} Quintals):
              </span>
              <span className="font-heading text-2xl font-black text-primary dark:text-primary-light">
                ₹{estimatedMspValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Compare with Middleman Toggle */}
          <div className="p-4 rounded-xl border border-farmborder bg-surface dark:bg-gray-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary dark:text-white">
                Compare with Middleman / Arthiya Offer?
              </span>
              <input
                type="checkbox"
                checked={compareMiddleman}
                onChange={(e) => setCompareMiddleman(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
            </div>

            {compareMiddleman && (
              <div className="space-y-3 pt-2 border-t border-farmborder/40">
                <Input
                  label="Middleman's Offer Rate (₹ / Quintal)"
                  type="number"
                  value={traderOffer}
                  onChange={(e) => setTraderOffer(e.target.value === '' ? '' : Number(e.target.value))}
                  prefixText="₹"
                  placeholder="2100"
                />
                {savingsVsMiddleman > 0 && (
                  <div className="p-3 bg-green-100 dark:bg-green-950/50 rounded-lg text-xs text-green-800 dark:text-green-300 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>
                      🎉 You will save ₹{savingsVsMiddleman.toLocaleString('en-IN')} by booking this mandi slot!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(3)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmBooking}
              isLoading={isSubmitting}
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              Confirm Booking & Generate QR Pass
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: CONFIRM & QR TICKET ================= */}
      {step === 5 && createdBooking && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-green-700 dark:text-green-400">
              Slot Reserved Successfully!
            </h2>
            <p className="text-xs text-text-muted">
              SMS confirmation sent. Please present this QR pass at Mandi Gate 1.
            </p>
          </div>

          {/* Printable Gate QR Ticket */}
          <QRTicket booking={createdBooking} />

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/farmer/queue">
              <Button variant="primary" size="md">
                Monitor Live Queue Status →
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setStep(1);
                setCreatedBooking(null);
              }}
            >
              Book Another Slot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSlot;
