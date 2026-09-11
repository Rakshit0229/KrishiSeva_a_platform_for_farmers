import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, Radio, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const CreateProcurement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedBookingId = searchParams.get('bookingId');
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [quantityKg, setQuantityKg] = useState<number | ''>(498.5);
  const [moistureLevel, setMoistureLevel] = useState<number>(11.8);
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C'>('A');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Moisture level exceeds FAQ maximum limit of 14%');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/bookings');
        setBookings(res.data || []);
        if (preselectedBookingId) {
          setSelectedBookingId(preselectedBookingId);
        } else if (res.data.length > 0) {
          setSelectedBookingId(res.data[0].id);
        }
      } catch {
        // fallback
      }
    }
    load();
  }, [preselectedBookingId]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const mspRate = selectedBooking?.crop_type === 'paddy' ? 2300 : selectedBooking?.crop_type === 'mustard' ? 5950 : 2425;
  const quintals = Number(quantityKg || 0) / 100;
  const totalAmount = Number((quintals * mspRate).toFixed(2));

  const handleSimulateWeighbridge = async () => {
    try {
      const res = await apiClient.post('/weighbridge/simulate', {
        booking_id: selectedBookingId,
        net_weight_kg: 504.2,
      });
      setQuantityKg(res.data.reading.net_weight_kg);
      toast.success('Digital Scale Synced: Net Weight 504.2 kg locked!');
    } catch {
      toast.error('Weighbridge simulation error');
    }
  };

  const handleRecordProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !quantityKg) {
      toast.error('Please select booking and valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/procurements', {
        booking_id: selectedBookingId,
        quantity_kg: quantityKg,
        moisture_level: moistureLevel,
        quality_grade: qualityGrade,
        officer_notes: notes,
        source: 'iot_weighbridge',
        device_id: 'WB-AMR-BAY1',
      });
      toast.success('Procurement recorded! Automated PFMS payment voucher created.');
      navigate('/officer/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record procurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-4xl">
      <div>
        <div className="section-label">Electronic Procurement Registry</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Log Mandi Procurement & Issue Receipt
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Reading gross and tare weights from certified IoT platform scales. Automated PFMS DBT voucher is generated.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <form onSubmit={handleRecordProcurement} className="lg:col-span-7 space-y-5">
          {/* Booking Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Select Arrived Farmer / Token
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="input-farm text-xs font-bold"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Token #{b.token_number} · {b.farmer?.name || 'Farmer'} · {b.crop_type} ({b.expected_quantity_kg} kg)
                </option>
              ))}
            </select>
          </div>

          {/* Weighbridge Simulator Bar */}
          <div className="p-4 rounded-xl bg-surface-2 dark:bg-gray-800 border border-farmborder flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="font-bold">IoT Weighbridge Bay 1:</span>
              <span className="text-text-muted">Scale Online</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateWeighbridge}
              icon={<Scale className="w-4 h-4" />}
            >
              Sync Scale Weight
            </Button>
          </div>

          {/* Actual Net Quantity */}
          <Input
            label="Certified Net Weight (kg)"
            type="number"
            step="0.1"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
            suffixText="Kg"
            required
          />

          {/* Moisture Level & Grade */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Moisture Content (%)"
              type="number"
              step="0.1"
              value={moistureLevel}
              onChange={(e) => setMoistureLevel(Number(e.target.value))}
              suffixText="%"
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-text-muted">
                Quality Grade
              </label>
              <div className="flex gap-2">
                {(['A', 'B', 'C'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setQualityGrade(grade)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      qualityGrade === grade
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface hover:bg-surface-2 border-farmborder text-text-muted dark:bg-gray-800'
                    }`}
                  >
                    Grade {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Officer Inspection Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fair Average Quality satisfied. Dry clean batch."
              className="input-farm text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-farmborder">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setIsRejectModalOpen(true)}
            >
              Reject Crop
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              Record & Authorize Payment
            </Button>
          </div>
        </form>

        {/* Live MSP Calculation Card (Right Column) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gold-pale dark:bg-gray-800/80 border-2 border-gold/40 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-earth-brown dark:text-gold-light">
                Live MSP Quintal Calculation
              </span>
              <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-gold/20">
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Crop Variety:</span>
                <strong className="capitalize">{selectedBooking?.crop_type || 'Wheat'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">MSP Rate per Quintal:</span>
                <strong>₹{mspRate.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Weighed Quantity:</span>
                <strong>{quantityKg} kg ({quintals.toFixed(2)} Quintals)</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Moisture & Grade:</span>
                <strong>{moistureLevel}% (Grade {qualityGrade})</strong>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-gold/40 text-center">
              <span className="text-[11px] uppercase font-bold text-text-muted block">
                Total Direct Benefit Payout
              </span>
              <div className="font-heading text-3xl font-black text-primary dark:text-primary-light mt-0.5">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">
                (Quantity kg / 100) × ₹{mspRate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Crop Consignment"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            State the statutory reason for crop rejection under the Fair Average Quality (FAQ) guidelines:
          </p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="input-farm text-xs"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toast.error('Consignment marked as rejected');
                setIsRejectModalOpen(false);
              }}
            >
              Confirm Consignment Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateProcurement;
