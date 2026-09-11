import React, { useState, useEffect } from 'react';
import { Radio, Bell, Camera, Phone, MapPin, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CropScannerModal } from '../../components/domain/CropScannerModal';
import { QRTicket } from '../../components/domain/QRTicket';
import { Modal } from '../../components/ui/Modal';
import { useSSEQueue } from '../../hooks/useSSEQueue';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const QueueStatus: React.FC = () => {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [queueDetails, setQueueDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTokenCalledFlash, setIsTokenCalledFlash] = useState(false);

  // Load farmer's active booking
  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/bookings?status=confirmed');
        if (res.data.length > 0) {
          const b = res.data[0];
          setActiveBooking(b);
          // Fetch queue position
          const qRes = await apiClient.get(`/queue/position/${b.id}`);
          setQueueDetails(qRes.data);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Connect SSE for active centre
  const { snapshot, isConnected, lastCalledEvent } = useSSEQueue(activeBooking?.centre_id);

  // Play audio chime and trigger green flash when called
  useEffect(() => {
    if (
      lastCalledEvent &&
      activeBooking &&
      lastCalledEvent.tokenNumber === activeBooking.token_number
    ) {
      triggerCalledAlert();
    }
  }, [lastCalledEvent, activeBooking]);

  const triggerCalledAlert = () => {
    setIsTokenCalledFlash(true);
    // Play Web Audio API Chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // AudioContext unavailable
    }

    toast.success('🔔 YOUR TOKEN HAS BEEN CALLED! Proceed to Gate 1 immediately.', { duration: 6000 });
    setTimeout(() => setIsTokenCalledFlash(false), 5000);
  };

  // Sync SSE position
  const currentlyServing = snapshot?.currentlyServing ?? queueDetails?.currentlyServing ?? 44;
  const myToken = activeBooking?.token_number ?? 47;
  const aheadCount = Math.max(0, myToken - currentlyServing);
  const estimatedWait = aheadCount * 10 + 5;
  const isMyTurn = myToken === currentlyServing;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-muted">Connecting to Mandi Live Queue...</p>
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary-pale text-primary mx-auto flex items-center justify-center text-3xl">
          🌾
        </div>
        <h2 className="font-heading text-2xl font-bold">No Active Queue Token</h2>
        <p className="text-xs text-text-muted">
          You do not have an active booking in the mandi queue for today. Book an arrival slot to skip long gate queues.
        </p>
        <Link to="/farmer/book-slot">
          <Button variant="primary" size="md">
            Book a Mandi Slot Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[85vh] transition-colors duration-500 p-4 lg:p-8 ${
        isTokenCalledFlash ? 'bg-green-600' : ''
      }`}
    >
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Token Called Banner Alert */}
        {(isMyTurn || isTokenCalledFlash) && (
          <div className="p-4 bg-green-500 text-white rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <Bell className="w-6 h-6 animate-spin" />
              <div>
                <h3 className="font-bold text-base">🔔 YOUR TOKEN IS BEING CALLED!</h3>
                <p className="text-xs opacity-90">Please proceed directly to Weighbridge Bay 1.</p>
              </div>
            </div>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              icon={<QrCode className="w-4 h-4" />}
            >
              Show Gate QR
            </Button>
          </div>
        )}

        {/* Top Centre & SSE Status */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider">
              {activeBooking.centre?.district || 'Amritsar'}, Punjab
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              {activeBooking.centre?.name || 'Amritsar Central Mandi'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-farmborder text-xs font-bold">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-amber-500'}`} />
            <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-amber-600'}>
              {isConnected ? 'Live Queue Feed' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* MAIN DISPLAY CARD (Pattern B / Agrile TV aesthetic) */}
        <div className="rounded-3xl bg-primary-dark text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/20 text-center space-y-6">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-light/20 rounded-full blur-2xl pointer-events-none" />

          {/* Token Callout */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
              Your Mandi Token
            </span>
            <div className="font-display text-7xl sm:text-8xl font-black text-gold tracking-tight drop-shadow-md">
              #{myToken}
            </div>
            <p className="text-xs text-primary-pale uppercase font-semibold tracking-wider">
              🌾 {activeBooking.crop_type} · {activeBooking.expected_quantity_kg} kg
            </p>
          </div>

          {/* Position and Wait Breakdown */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Position</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-white">
                {aheadCount === 0 ? 'Now!' : `${aheadCount + 1}th`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Now Serving</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-gold-light">
                #{currentlyServing}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Est. Wait</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-green-400">
                ~{estimatedWait}m
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-[11px] text-primary-pale">
              <span>Queue progress</span>
              <span>{Math.max(10, Math.min(100, 100 - aheadCount * 20))}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(10, Math.min(100, 100 - aheadCount * 20))}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/40 hover:bg-white hover:text-primary-dark text-xs"
              onClick={() => setIsQrModalOpen(true)}
              icon={<QrCode className="w-3.5 h-3.5" />}
            >
              Gate QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/40 hover:bg-white hover:text-primary-dark text-xs"
              onClick={() => window.open(`https://maps.google.com/?q=${activeBooking.centre?.lat || 31.6},${activeBooking.centre?.lng || 74.8}`, '_blank')}
              icon={<MapPin className="w-3.5 h-3.5" />}
            >
              Directions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/40 hover:bg-white hover:text-primary-dark text-xs"
              onClick={() => window.open(`tel:${activeBooking.centre?.contact_phone || '+919812345001'}`)}
              icon={<Phone className="w-3.5 h-3.5" />}
            >
              Call Mandi
            </Button>
          </div>
        </div>

        {/* CROP QUALITY PRE-SCANNER CARD */}
        <div className="card-farm flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-pale text-primary flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-text-primary dark:text-white">
                Check Crop Quality Before Arrival
              </h4>
              <p className="text-xs text-text-muted">
                Run our AI camera spectrometry scan to test moisture & FAQ grade before unloading.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsScannerOpen(true)}>
            Scan Grain Now
          </Button>
        </div>

        {/* MINI QUEUE SEQUENCE LIST */}
        <div className="card-farm space-y-3">
          <h4 className="font-heading font-bold text-sm text-text-primary dark:text-white">
            Tokens Near Yours
          </h4>
          <div className="space-y-2">
            {[myToken - 2, myToken - 1, myToken, myToken + 1, myToken + 2].map((token) => {
              const isMine = token === myToken;
              const isServing = token === currentlyServing;
              const isPast = token < currentlyServing;

              return (
                <div
                  key={token}
                  className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                    isMine
                      ? 'bg-primary-pale/60 dark:bg-primary-dark/40 border-2 border-primary font-bold'
                      : 'bg-surface dark:bg-gray-800/60 border border-farmborder/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-black text-sm">#{token}</span>
                    {isMine && <span className="text-[10px] text-primary uppercase font-bold">(Your Token)</span>}
                  </div>

                  <div>
                    {isServing ? (
                      <Badge variant="process">Now In Service</Badge>
                    ) : isPast ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="pending">Waiting</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Ticket Modal */}
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="Gate QR Pass"
          maxWidth="md"
        >
          <QRTicket booking={activeBooking} />
        </Modal>

        {/* AI Crop Scanner Modal */}
        <CropScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          cropType={activeBooking.crop_type}
        />
      </div>
    </div>
  );
};

export default QueueStatus;
