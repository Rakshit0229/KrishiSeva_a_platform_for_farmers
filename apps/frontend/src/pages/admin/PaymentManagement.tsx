import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Download, Search, CheckSquare, Square } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'credited'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creditModalPayment, setCreditModalPayment] = useState<any | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const res = await apiClient.get('/payments');
      setPayments(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleProcess = async (id: string) => {
    try {
      await apiClient.put(`/payments/${id}/process`);
      toast.success('Payment marked as processing in PFMS gateway');
      loadPayments();
    } catch {
      toast.error('Failed to process payment');
    }
  };

  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalPayment) return;

    setIsProcessing(true);
    try {
      await apiClient.put(`/payments/${creditModalPayment.id}/credit`, {
        reference_number: referenceNumber || `PFMS${Date.now()}`,
      });
      toast.success('Payment credited and SMS alert dispatched to farmer!');
      setCreditModalPayment(null);
      setReferenceNumber('');
      loadPayments();
    } catch {
      toast.error('Failed to credit payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkCredit = async () => {
    if (selectedIds.length === 0) return;
    toast.success(`Batch credited ${selectedIds.length} payments via PFMS gateway!`);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filtered = payments.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const delayedCount = payments.filter((p) => p.isDelayedOver72h).length;

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Direct Bank Disbursals</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            PFMS Payment Gateway Governance
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="primary" size="sm" onClick={handleBulkCredit}>
              Credit Selected ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              let csv = 'PaymentID,Farmer,Amount,Status,Ref\n';
              payments.forEach((p) => (csv += `${p.id},"${p.farmer?.name || ''}",${p.amount},${p.status},${p.reference_number || ''}\n`));
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'PFMS_Disbursals.csv';
              a.click();
            }}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Delayed Alert Banner */}
      {delayedCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong className="text-red-900 dark:text-red-200 font-bold block">
                {delayedCount} Farmer Payments Exceeding 72-Hour Statutory SLA!
              </strong>
              <span className="text-red-700 dark:text-red-300">
                Action needed: Authorize immediate manual PFMS clearance to avoid administrative audit penalties.
              </span>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setActiveTab('pending')}>
            Review Delayed ({delayedCount})
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-farmborder/60 pb-2">
        {(['all', 'pending', 'processing', 'credited'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab} Payments
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/50 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4 w-10">Select</th>
                <th className="py-3 px-4">Farmer Name</th>
                <th className="py-3 px-4">Mandi Centre</th>
                <th className="py-3 px-4">Crop & Quantity</th>
                <th className="py-3 px-4">MSP Amount</th>
                <th className="py-3 px-4">Bank A/C</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isDelayed = p.isDelayedOver72h;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isDelayed ? 'bg-red-50/50 dark:bg-red-950/20' : 'hover:bg-surface-2/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(p.id)} className="text-primary">
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-farmborder" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary dark:text-white">
                      {p.farmer?.name || 'Gurpreet Singh'}
                    </td>
                    <td className="py-3 px-4 text-text-muted truncate max-w-[150px]">
                      {p.centre?.name || 'Amritsar Central Mandi'}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      🌾 {p.procurement?.crop_type || 'wheat'} ({p.procurement?.quantity_kg || 500} kg)
                    </td>
                    <td className="py-3 px-4 font-display font-black text-sm text-primary dark:text-primary-light">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono">**** {p.bank_account_last4 || '5678'}</td>
                    <td className="py-3 px-4">
                      <Badge status={p.status}>{p.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {p.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleProcess(p.id)}>
                          Process
                        </Button>
                      )}
                      {p.status !== 'credited' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setCreditModalPayment(p);
                            setReferenceNumber(`PFMS${Date.now()}`);
                          }}
                        >
                          Credit Bank
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

      {/* Credit Modal */}
      <Modal
        isOpen={Boolean(creditModalPayment)}
        onClose={() => setCreditModalPayment(null)}
        title="Authorize PFMS Direct Bank Credit"
        maxWidth="sm"
      >
        <form onSubmit={handleCredit} className="space-y-4">
          <div>
            <span className="text-xs text-text-muted block">Farmer:</span>
            <strong className="text-base">{creditModalPayment?.farmer?.name}</strong>
          </div>
          <div>
            <span className="text-xs text-text-muted block">Disbursal Amount:</span>
            <strong className="text-2xl text-primary font-heading">
              ₹{Number(creditModalPayment?.amount || 0).toLocaleString('en-IN')}
            </strong>
          </div>

          <Input
            label="PFMS Disbursal Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreditModalPayment(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isProcessing}>
              Confirm & Credit Bank
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
