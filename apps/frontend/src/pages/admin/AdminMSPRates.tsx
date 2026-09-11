import React, { useState, useEffect } from 'react';
import { TrendingUp, Edit3, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const AdminMSPRates: React.FC = () => {
  const [rates, setRates] = useState<any[]>([]);

  useEffect(() => {
    loadRates();
  }, []);

  async function loadRates() {
    try {
      const res = await apiClient.get('/msp/rates');
      setRates(res.data || []);
    } catch {
      // fallback
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <div className="section-label">Price Policy</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Minimum Support Price (MSP) Rate Governance
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Statutory rates approved by the Cabinet Committee on Economic Affairs (CCEA). Used for automated weighbridge voucher calculation.
        </p>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Crop Commodity</th>
                <th className="py-3 px-4">Season / Crop Year</th>
                <th className="py-3 px-4">Current MSP Rate</th>
                <th className="py-3 px-4">Previous Year</th>
                <th className="py-3 px-4">YoY Increase</th>
                <th className="py-3 px-4">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {rates.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-bold text-text-primary dark:text-white capitalize">
                    🌾 {r.crop_type}
                  </td>
                  <td className="py-3 px-4 uppercase text-text-muted">{r.season} {r.year}</td>
                  <td className="py-3 px-4 font-display font-black text-sm text-primary dark:text-primary-light">
                    ₹{Number(r.rate_per_quintal).toLocaleString('en-IN')} / qtl
                  </td>
                  <td className="py-3 px-4 text-text-muted">₹{r.previous_year_rate}</td>
                  <td className="py-3 px-4 text-green-700 font-bold">+{r.yoy_change_pct}%</td>
                  <td className="py-3 px-4 text-text-muted">{r.effective_from}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMSPRates;
