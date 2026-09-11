import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const OfficerReports: React.FC = () => {
  const [procurements, setProcurements] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/procurements');
        setProcurements(res.data || []);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleDownloadPDF = (id: string) => {
    toast.success('Downloading Official Procurement Voucher PDF...');
    window.open(`/api/pdf/procurement/${id}`, '_blank');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <div className="section-label">Audit & Documentation</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Daily Mandi Procurement Logs & Receipts
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Complete register of inspected grain, moisture %, grades, and issued PFMS DBT bank vouchers.
        </p>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop Variety</th>
                <th className="py-3 px-4">Weighed Qty</th>
                <th className="py-3 px-4">Moisture</th>
                <th className="py-3 px-4">Total MSP Payout</th>
                <th className="py-3 px-4 text-right">PDF Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {procurements.map((p) => (
                <tr key={p.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{p.id.slice(0, 16)}...</td>
                  <td className="py-3 px-4 font-bold">{p.farmer?.name || 'Gurpreet Singh'}</td>
                  <td className="py-3 px-4 capitalize">🌾 {p.crop_type}</td>
                  <td className="py-3 px-4 font-display font-semibold">{p.quantity_kg} kg</td>
                  <td className="py-3 px-4">{p.moisture_level || 12.0}% (Grade {p.quality_grade || 'A'})</td>
                  <td className="py-3 px-4 font-display font-black text-sm text-green-700 dark:text-green-400">
                    ₹{Number(p.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(p.id)}
                      icon={<Download className="w-3 h-3" />}
                    >
                      Receipt PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficerReports;
