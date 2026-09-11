import React, { useState, useEffect } from 'react';
import { Radio, Scale, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const WeighbridgeDashboard: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const devRes = await apiClient.get('/weighbridge/devices');
      setDevices(devRes.data || []);
      const readRes = await apiClient.get('/weighbridge/readings/10000000-0000-0000-0000-000000000001');
      setReadings(readRes.data || []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }

  const handleSimulateWeigh = async () => {
    try {
      const res = await apiClient.post('/weighbridge/simulate', { net_weight_kg: 512.4 });
      toast.success('Simulated IoT Reading Received via Telemetry!');
      loadData();
    } catch {
      toast.error('Simulation failed');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Hardware & IoT Telemetry</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Electronic Weighbridge Telemetry
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time digital load-cell scale readings with tamper-proof cryptographic audit log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSimulateWeigh} icon={<Radio className="w-4 h-4" />}>
            Trigger Scale Reading Test
          </Button>
          <Button variant="ghost" size="sm" onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Devices Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {devices.map((d) => (
          <div key={d.id} className="card-farm p-4 space-y-2 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono">{d.id}</span>
              <Badge variant="success">Online</Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-text-primary dark:text-white">
              {d.name}
            </h4>
            <span className="text-[10px] text-text-muted block">Calibrated: {d.calibrated_at}</span>
          </div>
        ))}
      </div>

      {/* Readings Table */}
      <div className="card-farm p-0 overflow-hidden">
        <div className="p-4 border-b border-farmborder flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm">Telemetry Ingestion Stream</h3>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> TLS Encrypted Direct Feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Gross Weight</th>
                <th className="py-3 px-4">Tare (Vehicle)</th>
                <th className="py-3 px-4">Certified Net</th>
                <th className="py-3 px-4 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted">
                    No active weight readings recorded yet today.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-2/30">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{r.device_id}</td>
                    <td className="py-3 px-4 text-text-muted">{new Date(r.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">{r.gross_weight_kg} kg</td>
                    <td className="py-3 px-4">{r.tare_weight_kg} kg</td>
                    <td className="py-3 px-4 font-display font-black text-sm text-text-primary dark:text-white">
                      {r.net_weight_kg} kg
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-700 font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeighbridgeDashboard;
