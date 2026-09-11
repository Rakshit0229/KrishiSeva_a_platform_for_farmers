import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, ChevronDown, ChevronUp, AlertCircle, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { QRTicket } from '../../components/domain/QRTicket';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const res = await apiClient.get('/bookings');
      setBookings(res.data || []);
      if (res.data.length > 0) {
        setExpandedBookingId(res.data[0].id);
      }
    } catch {
      // ignore
    }
  }

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      await apiClient.delete(`/bookings/${bookingToCancel.id}`, {
        data: { cancellation_reason: cancellationReason || 'Cancelled by farmer' },
      });
      toast.success('Booking cancelled successfully');
      setBookingToCancel(null);
      setCancellationReason('');
      loadBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return b.status === 'confirmed' || b.status === 'arrived' || b.status === 'in_service';
    }
    if (activeTab === 'past') {
      return b.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'no_show';
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Your Mandi Appointments</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">My Bookings & Passes</h1>
        </div>
        <Link to="/farmer/book-slot">
          <Button variant="primary" size="sm" icon={<Calendar className="w-4 h-4" />}>
            Book New Mandi Slot
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-farmborder/60 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Upcoming Appointments
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Procured & Completed
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'cancelled'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card-farm text-center p-12 space-y-3">
            <span className="text-4xl">🌾</span>
            <p className="text-sm font-bold text-text-primary dark:text-white">
              No {activeTab} bookings found
            </p>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              Schedule your arrival in advance to get a priority gate pass and skip long queues.
            </p>
            {activeTab !== 'upcoming' && (
              <Button variant="outline" size="sm" onClick={() => setActiveTab('upcoming')}>
                View Upcoming
              </Button>
            )}
          </div>
        ) : (
          filtered.map((b) => {
            const isExpanded = expandedBookingId === b.id;
            return (
              <div
                key={b.id}
                className="card-farm p-0 overflow-hidden border transition-all"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/40 dark:hover:bg-gray-800/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 dark:bg-gray-800 flex flex-col items-center justify-center border border-farmborder">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Token</span>
                      <span className="font-display text-xl font-extrabold text-primary dark:text-primary-light">
                        #{b.token_number || 47}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
                        {b.centre?.name || 'Amritsar Central Mandi'}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        🌾 {String(b.crop_type).toUpperCase()} · {b.expected_quantity_kg} kg · 📅 {b.slot?.slot_date || 'Today'} ({b.slot?.start_time || '09:00'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={b.status}>{b.status}</Badge>
                    <button className="p-1 text-text-muted rounded-full">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-6 border-t border-farmborder/60 bg-surface/50 dark:bg-gray-900/50 space-y-6 animate-in fade-in duration-150">
                    {/* Render Full Printable QR Pass */}
                    <div className="max-w-md mx-auto">
                      <QRTicket booking={b} />
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-farmborder/60">
                      <div className="text-xs text-text-muted">
                        Gate Entry Token: <strong className="font-mono">{b.qr_token}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeTab === 'upcoming' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setBookingToCancel(b)}
                          >
                            Cancel Appointment
                          </Button>
                        )}
                        <Link to="/farmer/grievances/new">
                          <Button variant="ghost" size="sm">
                            File Grievance
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Modal Confirmation */}
      <Modal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Confirm Booking Cancellation"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to cancel your slot for{' '}
            <strong>Token #{bookingToCancel?.token_number}</strong> at{' '}
            {bookingToCancel?.centre?.name}?
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Reason for Cancellation:
            </label>
            <input
              type="text"
              placeholder="e.g. Harvest delayed, weather issues"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="input-farm text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setBookingToCancel(null)}>
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancelBooking}
            >
              Yes, Cancel Slot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
