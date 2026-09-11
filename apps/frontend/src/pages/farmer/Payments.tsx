import React, { useState, useEffect } from 'react';
import { CreditCard, Download, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalEarned: 48500, pendingAmount: 12125, creditedCount: 1 });
  const [activeFilter, setActiveFilter] = useState<'all' | 'credited' | 'pending'>('all');
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/payments');
        setPayments(res.data || []);
        const sumRes = await apiClient.get('/payments/summary');
        setSummary(sumRes.data || summary);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleDownloadReceipt = (procurementId: string) => {
    toast.success('Downloading official procurement receipt PDF...');
    window.open(`/api/pdf/procurement/${procurementId}`, '_blank');
  };

  const filtered = payments.filter((p) => {
    if (activeFilter === 'credited') return p.status === 'credited';
    if (activeFilter === 'pending') return p.status === 'pending' || p.status === 'processing';
    return true;
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="section-label">Financial Ledger</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Direct Bank Transfer (DBT) Payments
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Automated disbursements directly from the Ministry of Consumer Affairs to your registered bank account.
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earned */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-light">
            Total MSP Credited
          </span>
          <div className="font-heading text-3xl font-black">
            ₹{Number(summary.totalEarned || 48500).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-primary-pale flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% PFMS Disbursed
          </span>
        </div>

        {/* Pending */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Pending in Transit
          </span>
          <div className="font-heading text-3xl font-black">
            ₹{Number(summary.pendingAmount || 12125).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-amber-100 flex items-center gap-1">
            ⏱ Under 72-Hour Government SLA
          </span>
        </div>

        {/* Season Total */}
        <div className="p-6 rounded-2xl bg-dark text-white border border-gray-800 shadow-lg space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gold">
            Rabi Season 2026
          </span>
          <div className="font-heading text-3xl font-black text-white">
            ₹{Number((summary.totalEarned || 48500) + (summary.pendingAmount || 12125)).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400">Total Crop Sales</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-farmborder/60 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setActiveFilter('credited')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeFilter === 'credited'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Credited (Paid)
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Pending / Processing
        </button>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const isExpanded = expandedPaymentId === p.id;
          const isDelayedOver72h = p.isDelayedOver72h;

          return (
            <div
              key={p.id}
              className={`card-farm p-0 overflow-hidden border transition-all ${
                isDelayedOver72h ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20' : ''
              }`}
            >
              {/* Delayed Warning Banner */}
              {isDelayedOver72h && (
                <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    72-Hour SLA Exceeded! Direct PFMS escalation active.
                  </span>
                  <Link to="/farmer/grievances/new" className="underline hover:text-gold-light">
                    Raise Priority Dispute →
                  </Link>
                </div>
              )}

              {/* Main Summary Header */}
              <div
                onClick={() => setExpandedPaymentId(isExpanded ? null : p.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 dark:bg-gray-800 flex items-center justify-center text-xl">
                    🌾
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white capitalize">
                      {p.procurement?.crop_type || 'Wheat'} Sale Payment
                    </h3>
                    <p className="text-xs text-text-muted">
                      Date: {p.payment_date || p.procurement?.procurement_date || 'Today'} · A/C ending in {p.bank_account_last4 || '5678'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="font-heading text-xl font-extrabold text-primary dark:text-primary-light block">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                    <Badge status={p.status}>{p.status}</Badge>
                  </div>

                  <button className="p-1 text-text-muted rounded-full">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && (
                <div className="p-6 border-t border-farmborder/60 bg-surface/50 dark:bg-gray-900/50 space-y-4 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-text-muted block">Quantity Sold</span>
                      <strong className="text-text-primary dark:text-white text-sm">
                        {p.procurement?.quantity_kg || 500} kg
                      </strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">MSP Rate Applied</span>
                      <strong className="text-text-primary dark:text-white text-sm">
                        ₹{p.procurement?.msp_rate || 2425} / Quintal
                      </strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">Quality Grade</span>
                      <strong className="text-text-primary dark:text-white text-sm">
                        Grade {p.procurement?.quality_grade || 'A'} ({p.procurement?.moisture_level || 11.9}% moisture)
                      </strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">PFMS Reference</span>
                      <strong className="text-text-primary dark:text-white text-sm font-mono">
                        {p.reference_number || 'PFMS-GATEWAY-PENDING'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-farmborder/60">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Direct Benefit Transfer under Govt of India Guidelines</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const procId = p.procurement_id || p.id;
                          window.open(`/api/procurements/${procId}/j-form`, '_blank');
                        }}
                        icon={<Download className="w-3.5 h-3.5 text-primary" />}
                      >
                        Digital J-Form (ਜੇ-ਫਾਰਮ)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(p.procurement_id || p.id)}
                        icon={<Download className="w-3.5 h-3.5" />}
                      >
                        PDF Receipt
                      </Button>
                      <Link to="/farmer/grievances/new">
                        <Button variant="ghost" size="sm">
                          Raise Dispute
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Payments;
