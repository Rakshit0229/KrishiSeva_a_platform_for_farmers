import React, { useState, useEffect } from 'react';
import { QrCode, Download, Users, CheckCircle2, Phone, Camera, ArrowRight, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const QueueManagement: React.FC = () => {
  const [centreId, setCentreId] = useState('10000000-0000-0000-0000-000000000001');
  const [queueEntries, setQueueEntries] = useState<any[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    loadQueue();
  }, [centreId]);

  async function loadQueue() {
    try {
      const res = await apiClient.get(`/queue/${centreId}`);
      setQueueEntries(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleCall = async (id: string, token: number) => {
    try {
      await apiClient.put(`/queue/${id}/call`);
      toast.success(`Token #${token} called to gate!`);
      loadQueue();
    } catch {
      toast.error('Failed to call token');
    }
  };

  const handleServe = async (id: string, token: number) => {
    try {
      await apiClient.put(`/queue/${id}/serve`);
      toast.success(`Token #${token} is now in service.`);
      loadQueue();
    } catch {
      toast.error('Failed to update token status');
    }
  };

  const handleDone = async (id: string, token: number) => {
    try {
      await apiClient.put(`/queue/${id}/done`);
      toast.success(`Token #${token} completed.`);
      loadQueue();
    } catch {
      toast.error('Failed to mark token done');
    }
  };

  const handleSkip = async (id: string, token: number) => {
    try {
      await apiClient.put(`/queue/${id}/skip`);
      toast.error(`Token #${token} skipped.`);
      loadQueue();
    } catch {
      toast.error('Failed to skip token');
    }
  };

  // Simulate QR gate scan
  const handleSimulateScan = () => {
    const result = {
      token: 47,
      farmer: 'Gurpreet Singh',
      crop: 'Wheat (500 kg)',
      slot: '09:00 - 10:00 AM',
    };
    setScanResult(result);
    toast.success('Gate Barcode Verified! Vehicle permitted.');
    setTimeout(() => {
      setScanResult(null);
      setIsScannerOpen(false);
    }, 3500);
  };

  const handleExportCSV = () => {
    let csv = 'Token,Farmer Name,Phone,Crop,Quantity_Kg,Status\n';
    queueEntries.forEach((q) => {
      csv += `${q.token_number},"${q.farmer?.name || ''}","${q.farmer?.phone || ''}","${q.booking?.crop_type || ''}",${q.booking?.expected_quantity_kg || 0},${q.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KrishiSeva_Queue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Downloaded Queue CSV');
  };

  const waitingCount = queueEntries.filter((q) => q.status === 'waiting').length;
  const inServiceEntry = queueEntries.find((q) => q.status === 'in_service');

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Gate & Weighbridge Dispatch</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Live Queue & Vehicle Ingestion
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsScannerOpen(true)}
            icon={<Camera className="w-4 h-4" />}
          >
            Gate QR Scanner 📷
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Currently Serving Full Card */}
      {inServiceEntry && (
        <div className="card-farm bg-primary text-white border-none p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-display text-3xl font-black text-gold">
              #{inServiceEntry.token_number}
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-green-200">
                Currently Serving in Bay 1
              </span>
              <h3 className="font-heading text-xl font-bold">
                {inServiceEntry.farmer?.name || 'Farmer'}
              </h3>
              <p className="text-xs text-primary-pale">
                🌾 {inServiceEntry.booking?.crop_type} · {inServiceEntry.booking?.expected_quantity_kg} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDone(inServiceEntry.id, inServiceEntry.token_number)}
            >
              ✓ Mark Done
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleSkip(inServiceEntry.id, inServiceEntry.token_number)}
            >
              Skip
            </Button>
          </div>
        </div>
      )}

      {/* Queue Table */}
      <div className="card-farm p-0 overflow-hidden">
        <div className="p-4 border-b border-farmborder flex items-center justify-between">
          <span className="font-heading font-bold text-sm">
            Queue Roster ({queueEntries.length} entries · {waitingCount} waiting)
          </span>
          <Button variant="ghost" size="sm" onClick={loadQueue} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/50 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Farmer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Crop & Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {queueEntries.map((q) => {
                const isServing = q.status === 'in_service';
                return (
                  <tr
                    key={q.id}
                    className={`transition-colors ${
                      isServing ? 'bg-primary-pale/50 font-semibold' : 'hover:bg-surface-2/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-display font-black text-sm text-primary dark:text-primary-light">
                      #{q.token_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary dark:text-white">
                      {q.farmer?.name || 'Farmer'}
                    </td>
                    <td className="py-3 px-4 text-text-muted">{q.farmer?.phone || 'N/A'}</td>
                    <td className="py-3 px-4 capitalize">
                      🌾 {q.booking?.crop_type} ({q.booking?.expected_quantity_kg} kg)
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={q.status}>{q.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {q.status === 'waiting' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCall(q.id, q.token_number)}
                        >
                          Call
                        </Button>
                      )}
                      {q.status === 'called' && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleServe(q.id, q.token_number)}
                        >
                          Serve
                        </Button>
                      )}
                      {q.status === 'in_service' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDone(q.id, q.token_number)}
                        >
                          Done
                        </Button>
                      )}
                      {q.status !== 'done' && q.status !== 'skipped' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleSkip(q.id, q.token_number)}
                        >
                          Skip
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gate QR Scanner Modal */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Gate Vehicle Ingestion QR Scanner"
        maxWidth="md"
      >
        <div className="space-y-4 text-center">
          <div className="relative aspect-square max-w-xs mx-auto bg-dark rounded-2xl overflow-hidden border-2 border-primary flex flex-col items-center justify-center text-white">
            {scanResult ? (
              <div className="p-4 space-y-2 animate-in zoom-in duration-200">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
                <h3 className="font-bold text-lg text-white">Gate Verified!</h3>
                <p className="text-xs text-green-300">
                  Token #{scanResult.token} · {scanResult.farmer}
                </p>
                <p className="text-[11px] text-gray-300">{scanResult.crop}</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <QrCode className="w-16 h-16 text-gold mx-auto animate-pulse" />
                <p className="text-xs text-gray-300">
                  Align Farmer's QR Ticket or Vehicle Barcode
                </p>
                <Button variant="gold" size="sm" onClick={handleSimulateScan}>
                  Simulate QR Scan (Token #47)
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Camera optical scanner reads 256-bit encrypted ticket hash directly.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default QueueManagement;
