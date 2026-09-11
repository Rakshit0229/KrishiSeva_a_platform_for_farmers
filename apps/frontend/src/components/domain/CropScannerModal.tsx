import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface CropScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropType?: string;
  onScanComplete?: (result: any) => void;
}

export const CropScannerModal: React.FC<CropScannerModalProps> = ({
  isOpen,
  onClose,
  cropType = 'wheat',
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const [selectedCrop, setSelectedCrop] = useState(cropType || 'wheat');

  const cropSamples: Record<string, { label: string; image: string }> = {
    wheat: {
      label: 'Wheat (गेहूं)',
      image: '/images/crops/wheat.jpg',
    },
    paddy: {
      label: 'Paddy (धान)',
      image: '/images/crops/paddy.jpg',
    },
    mustard: {
      label: 'Mustard (सरसों)',
      image: '/images/crops/mustard.jpg',
    },
    maize: {
      label: 'Maize (मक्का)',
      image: '/images/crops/maize.jpg',
    },
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Simulate 1.8s image processing / computer vision latency
      await new Promise((r) => setTimeout(r, 1800));

      const res = await apiClient.post('/assessment', { crop_type: selectedCrop });
      setScanResult(res.data);
      if (onScanComplete) onScanComplete(res.data);
      toast.success('Crop Pre-Scanner assessment completed!');
    } catch (err: any) {
      toast.error('Scan simulation error. Try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Crop Quality Pre-Scanner" maxWidth="md">
      <div className="space-y-4">
        {/* Crop Variety Selector */}
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
            Select Crop Sample:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(cropSamples).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedCrop(key);
                  setScanResult(null);
                }}
                className={`p-1.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedCrop === key
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-farmborder hover:border-gray-400 text-text-muted'
                }`}
              >
                <img src={item.image} alt={item.label} className="w-8 h-8 rounded-lg object-cover" />
                <span className="truncate max-w-full text-[10px]">{key.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Camera Viewfinder with Real Grain Photo */}
        <div className="relative aspect-video w-full rounded-2xl bg-dark overflow-hidden border-2 border-primary/40 shadow-inner flex flex-col items-center justify-center text-white">
          {/* Grain photo backdrop */}
          <img
            src={cropSamples[selectedCrop]?.image || cropSamples.wheat.image}
            alt="Grain Sample"
            className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Grid lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Target Reticle in Center */}
          <div className="absolute inset-0 m-auto w-28 h-28 border-2 border-dashed border-gold/70 rounded-2xl pointer-events-none" />

          {/* Viewfinder Target */}
          <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center space-y-2">
            {isScanning ? (
              <div className="space-y-2">
                <div className="relative w-14 h-14 mx-auto">
                  <div className="w-14 h-14 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-gold animate-pulse" />
                </div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-gold-light animate-pulse font-bold">
                  Analyzing Spectrometry & Moisture...
                </p>
              </div>
            ) : scanResult ? (
              <div className="space-y-1 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <p className="text-xs font-bold text-green-400">Sample Analyzed Successfully</p>
                <p className="text-[11px] text-gray-300">Confidence Score: {scanResult.confidence_score}%</p>
              </div>
            ) : (
              <div className="space-y-1 bg-black/50 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 max-w-xs">
                <Camera className="w-8 h-8 text-gold mx-auto animate-float-gentle" />
                <p className="text-xs font-bold text-white">Grain Positioned in Viewfinder</p>
                <p className="text-[10px] text-gray-300">
                  Natural daylight lighting detected. Ready for moisture & grade assessment.
                </p>
              </div>
            )}
          </div>

          {/* Scanner laser beam when active */}
          {isScanning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_#22c55e] animate-bounce" />
          )}
        </div>

        {/* Scan Results Display */}
        {scanResult && (
          <div className="p-4 rounded-xl border border-farmborder/60 bg-surface dark:bg-gray-800 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Estimated Moisture:
              </span>
              <span className="text-xl font-display font-extrabold text-primary dark:text-primary-light">
                {scanResult.estimated_moisture}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Assigned Grade:
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 font-bold rounded-pill text-xs">
                Grade {scanResult.quality_grade} (FAQ Compliant)
              </span>
            </div>

            <div className="pt-2 border-t border-farmborder/40 text-xs text-text-primary dark:text-gray-200 flex items-start gap-2">
              {scanResult.faq_compliant ? (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <p>{scanResult.recommendation}</p>
            </div>
          </div>
        )}

        {/* Scan Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartScan}
            isLoading={isScanning}
            icon={scanResult ? <RefreshCw className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          >
            {scanResult ? 'Rescan Sample' : 'Start Camera Scan'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
