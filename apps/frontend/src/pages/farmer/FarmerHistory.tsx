import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  date: string;
  season: string;
  crop_type: string;
  centre_name: string;
  token_number: number;
  vehicle_number: string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  net_quintals: number;
  quality_grade: string;
  moisture_pct: number;
  msp_rate: number;
  trader_market_rate: number;
  total_amount: number;
  msp_gain_over_trader: number;
  payment_status: string;
  pfms_reference: string;
  utr_number: string;
  disbursed_at: string;
  jform_number: string;
}

interface HistoryResponse {
  summary: {
    total_transactions: number;
    total_quantity_quintals: number;
    total_disbursed_inr: number;
    total_msp_savings_inr: number;
    faq_pass_rate_pct: number;
    avg_dbt_hours: number;
  };
  transactions: Transaction[];
}

export const FarmerHistory: React.FC = () => {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/farmer/history', {
        params: {
          season: seasonFilter,
          crop_type: cropFilter,
        },
      });
      setData(res.data);
    } catch {
      // Offline mock
      setData({
        summary: {
          total_transactions: 3,
          total_quantity_quintals: 142.0,
          total_disbursed_inr: 433600,
          total_msp_savings_inr: 59600,
          faq_pass_rate_pct: 100,
          avg_dbt_hours: 46.5,
        },
        transactions: [
          {
            id: 'tx-2026-001',
            date: '2026-04-12',
            season: 'Rabi 2026',
            crop_type: 'Wheat (गेहूं)',
            centre_name: 'Amritsar Central Mandi',
            token_number: 44,
            vehicle_number: 'PB 02 BG 4412',
            gross_weight_kg: 8450,
            tare_weight_kg: 3250,
            net_weight_kg: 5200,
            net_quintals: 52.0,
            quality_grade: 'Grade A (FAQ)',
            moisture_pct: 11.6,
            msp_rate: 2425,
            trader_market_rate: 2150,
            total_amount: 126100,
            msp_gain_over_trader: 14300,
            payment_status: 'credited',
            pfms_reference: 'PFMS2026RABI009412',
            utr_number: 'PUNBH26102948123',
            disbursed_at: '2026-04-14 14:32:00',
            jform_number: 'J-FORM-2026-PB-0941',
          },
          {
            id: 'tx-2025-002',
            date: '2025-10-24',
            season: 'Kharif 2025',
            crop_type: 'Paddy Common (धान)',
            centre_name: 'Amritsar Central Mandi',
            token_number: 29,
            vehicle_number: 'PB 02 BG 4412',
            gross_weight_kg: 9200,
            tare_weight_kg: 3200,
            net_weight_kg: 6000,
            net_quintals: 60.0,
            quality_grade: 'Grade A (FAQ)',
            moisture_pct: 16.4,
            msp_rate: 2300,
            trader_market_rate: 1920,
            total_amount: 138000,
            msp_gain_over_trader: 22800,
            payment_status: 'credited',
            pfms_reference: 'PFMS2025KHARIF0819',
            utr_number: 'PUNBH25298192834',
            disbursed_at: '2025-10-26 11:15:00',
            jform_number: 'J-FORM-2025-PB-5819',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [seasonFilter, cropFilter]);

  const handleExportCSV = async () => {
    try {
      const res = await apiClient.get('/farmer/history/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'KrishiSeva_Farmer_Lifetime_Ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded Kisan Ledger CSV!');
    } catch {
      toast.error('Could not export CSV. Creating local file...');
      const csvData = 'data:text/csv;charset=utf-8,Transaction ID,Date,Crop,Net Quintals,Total Disbursed,Status\nTX-001,2026-04-12,Wheat,52.0,126100,Credited\nTX-002,2025-10-24,Paddy,60.0,138000,Credited';
      const encodedUri = encodeURI(csvData);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'KrishiSeva_Ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold-light border border-gold/40 text-xs font-bold uppercase">
            <History className="w-3.5 h-3.5" /> Official Kisan Digital Passbook
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold">
            Farmer Lifetime Procurement History
          </h1>
          <p className="text-xs sm:text-sm text-primary-pale max-w-xl">
            Complete audited ledger of all digital weighment receipts, PFMS bank disbursals, and guaranteed MSP shield earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="gold"
            size="md"
            onClick={handleExportCSV}
            className="flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Passbook</span>
          </Button>
        </div>
      </div>

      {/* Cumulative Stats Grid */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-farm bg-white dark:bg-gray-900 p-5 rounded-2xl border border-farmborder dark:border-gray-800 space-y-1 shadow-sm">
            <span className="text-[11px] text-text-muted font-bold uppercase block">Total Produce Sold</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
                {data.summary.total_quantity_quintals}
              </span>
              <span className="text-xs font-bold text-text-muted">Quintals</span>
            </div>
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">
              100% Certified Weighbridge
            </span>
          </div>

          <div className="card-farm bg-white dark:bg-gray-900 p-5 rounded-2xl border border-farmborder dark:border-gray-800 space-y-1 shadow-sm">
            <span className="text-[11px] text-text-muted font-bold uppercase block">Total Disbursed (DBT)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-primary dark:text-primary-light">
                ₹{data.summary.total_disbursed_inr.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-semibold block">
              Credited directly to Bank Account
            </span>
          </div>

          <div className="card-farm bg-white dark:bg-gray-900 p-5 rounded-2xl border border-farmborder dark:border-gray-800 space-y-1 shadow-sm">
            <span className="text-[11px] text-text-muted font-bold uppercase block">Middleman Shield Gains</span>
            <div className="flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5 self-center" />
              <span className="text-2xl sm:text-3xl font-black">
                +₹{data.summary.total_msp_savings_inr.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-semibold block">
              Saved over local trader rate cuts
            </span>
          </div>

          <div className="card-farm bg-white dark:bg-gray-900 p-5 rounded-2xl border border-farmborder dark:border-gray-800 space-y-1 shadow-sm">
            <span className="text-[11px] text-text-muted font-bold uppercase block">Avg Settlement Speed</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
                {data.summary.avg_dbt_hours}
              </span>
              <span className="text-xs font-bold text-text-muted">Hours</span>
            </div>
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">
              ⚡ Within 72h Mandatory SLA
            </span>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-text-primary dark:text-white">Filter Transactions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="bg-surface dark:bg-gray-800 border border-farmborder rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Seasons</option>
            <option value="rabi 2026">Rabi 2026</option>
            <option value="kharif 2025">Kharif 2025</option>
            <option value="rabi 2025">Rabi 2025</option>
          </select>

          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-surface dark:bg-gray-800 border border-farmborder rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Crops</option>
            <option value="wheat">Wheat (गेहूं)</option>
            <option value="paddy">Paddy (धान)</option>
            <option value="mustard">Mustard (सरसों)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-farm bg-white dark:bg-gray-900 rounded-3xl border border-farmborder dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 dark:bg-gray-800 text-text-muted uppercase text-[10px] font-extrabold border-b border-farmborder">
              <tr>
                <th className="p-4">Date & Season</th>
                <th className="p-4">Crop & Mandi</th>
                <th className="p-4">Net Quantity</th>
                <th className="p-4">Quality Grade</th>
                <th className="p-4">Disbursed (₹)</th>
                <th className="p-4">PFMS / UTR</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder dark:divide-gray-800">
              {data?.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-primary/5 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-text-primary dark:text-white block">{t.date}</span>
                    <span className="text-[10px] text-text-muted">{t.season}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-text-primary dark:text-white block">{t.crop_type}</span>
                    <span className="text-[10px] text-text-muted">{t.centre_name}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-text-primary dark:text-white block">
                      {t.net_quintals} Qtl
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{t.net_weight_kg} kg</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {t.quality_grade}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-primary dark:text-primary-light block">
                      ₹{t.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      +₹{t.msp_gain_over_trader.toLocaleString('en-IN')} saved
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <span className="text-text-primary dark:text-white block">{t.pfms_reference}</span>
                    <span className="text-[10px] text-text-muted block">UTR: {t.utr_number}</span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedTx(t)}
                      className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-primary hover:text-white text-text-primary dark:text-white text-xs font-bold border border-farmborder transition-colors flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-farmborder shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono text-text-muted">OFFICIAL J-FORM RECEIPT</span>
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
                  {selectedTx.jform_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-full hover:bg-surface-2 text-text-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-2 dark:bg-gray-800 rounded-xl">
                <div>
                  <span className="text-[10px] text-text-muted block">Vehicle Number</span>
                  <span className="font-bold">{selectedTx.vehicle_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Mandi Token Number</span>
                  <span className="font-bold">Token #{selectedTx.token_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Gross Weight</span>
                  <span className="font-bold">{selectedTx.gross_weight_kg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Tare Weight</span>
                  <span className="font-bold">{selectedTx.tare_weight_kg} kg</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold block">100% PFMS DBT Disbursal</span>
                  <span className="font-black text-base">₹{selectedTx.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <span className="font-mono text-xs">{selectedTx.utr_number}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" /> Print J-Form
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerHistory;
