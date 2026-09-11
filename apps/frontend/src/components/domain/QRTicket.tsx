import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Share2, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface QRTicketProps {
  booking: any;
  onClose?: () => void;
}

export const QRTicket: React.FC<QRTicketProps> = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `KrishiSeva Mandi Pass - Token #${booking.token_number}`,
        text: `My KrishiSeva procurement booking for ${booking.crop_type} at ${booking.centre?.name || 'Mandi'}. Token #${booking.token_number}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `KrishiSeva Pass: Token #${booking.token_number} | Mandi: ${booking.centre?.name} | Date: ${booking.slot?.slot_date} | Time: ${booking.slot?.start_time}`
      );
      toast.success('Pass details copied to clipboard!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden max-w-md mx-auto print:border-none print:shadow-none">
      {/* Ticket Header */}
      <div className="bg-primary text-white p-5 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-light/20 rounded-full blur-xl pointer-events-none" />
        <p className="text-xs uppercase tracking-widest text-gold-light font-bold mb-1">
          Government of India · DoCA
        </p>
        <h2 className="font-heading text-xl font-bold tracking-wide">
          KRISHISEVA MANDI PASS
        </h2>
        <p className="text-xs text-primary-pale mt-0.5">
          Priority Gate Entry & Electronic Weighbridge
        </p>
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-5">
        {/* Token Callout */}
        <div className="bg-surface dark:bg-gray-800 p-4 rounded-xl border border-farmborder/60 text-center relative">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Your Mandi Token
          </span>
          <div className="font-display text-5xl font-extrabold text-primary dark:text-primary-light my-1 tracking-tight">
            #{booking.token_number || 47}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary-dark dark:text-primary-light font-medium bg-primary-pale dark:bg-primary-dark/40 px-3 py-1 rounded-pill">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Confirmed & Verified
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-farmborder/50 shadow-inner">
          <QRCodeSVG
            value={booking.qr_token || `KRISHISEVA-${booking.id}`}
            size={180}
            fgColor="#1A4A22"
            level="H"
            includeMargin={true}
          />
          <p className="text-[11px] text-text-muted mt-2 font-mono uppercase tracking-wider">
            Token: {booking.qr_token || 'KS-2026-TOKEN'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm border-t border-b border-farmborder/60 py-3">
          <div>
            <span className="text-xs text-text-muted block">Farmer</span>
            <span className="font-semibold text-text-primary dark:text-white">
              {booking.farmer?.name || 'Gurpreet Singh'}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-muted block">Procurement Centre</span>
            <span className="font-semibold text-text-primary dark:text-white truncate block">
              {booking.centre?.name || 'Amritsar Central Mandi'}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-muted block">Crop & Expected Qty</span>
            <span className="font-semibold text-text-primary dark:text-white capitalize">
              🌾 {booking.crop_type} ({booking.expected_quantity_kg} kg)
            </span>
          </div>
          <div>
            <span className="text-xs text-text-muted block">Slot Date & Window</span>
            <span className="font-semibold text-text-primary dark:text-white">
              {booking.slot?.slot_date || 'Today'} · {booking.slot?.start_time || '09:00'}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gold-pale dark:bg-gray-800/60 p-3 rounded-lg border border-gold/40 text-xs text-earth-brown dark:text-gold-light space-y-1">
          <p className="font-semibold">⚠️ Instructions for Farmer:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
            <li>Arrive 15 minutes before your time slot.</li>
            <li>Scan this QR code at Gate 1 for vehicle barcode entry.</li>
            <li>Proceed directly to Digital Weighbridge Bay.</li>
          </ul>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print Pass
          </Button>
          <Button variant="primary" size="sm" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
            Share Pass
          </Button>
        </div>
      </div>
    </div>
  );
};
