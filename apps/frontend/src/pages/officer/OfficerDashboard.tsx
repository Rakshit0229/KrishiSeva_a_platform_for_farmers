import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  Scale,
  Calendar,
  Radio,
  FileSpreadsheet,
  AlertOctagon,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const OfficerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalBooked: 62,
    arrived: 28,
    inService: 1,
    completed: 23,
    waiting: 4,
    totalProcuredKg: 11500,
    totalDisbursed: 278875,
  });
  const [currentlyServing, setCurrentlyServing] = useState<any>({
    token_number: 44,
    farmer_name: 'Gurpreet Singh',
    phone: '+919876543201',
    crop_type: 'wheat',
    quantity_kg: 500,
    id: 'queue-active-01',
  });
  const [queueList, setQueueList] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const centreId = '10000000-0000-0000-0000-000000000001';
        const res = await apiClient.get(`/centres/${centreId}/stats`);
        setStats(res.data || stats);
        const qRes = await apiClient.get(`/queue/${centreId}`);
        setQueueList(qRes.data || []);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleCallNext = async () => {
    toast.success('Calling Token #45 to Weighbridge Bay 1!');
  };

  const handleMarkDone = async () => {
    toast.success('Token #44 procurement completed!');
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold uppercase tracking-wider">
            Amritsar Central Mandi · Gate 1 & Weighbridge 1
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">
            Mandi Officer Control Center
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/officer/procurement/new">
            <Button variant="gold" size="sm" icon={<Scale className="w-4 h-4" />}>
              Record New Procurement
            </Button>
          </Link>
          <Link to="/officer/queue">
            <Button variant="primary" size="sm" icon={<Users className="w-4 h-4" />}>
              Gate Scanner & Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* TODAY'S THROUGHPUT STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-farm p-5 space-y-1">
          <span className="text-xs text-text-muted uppercase font-bold tracking-wider block">
            Total Booked Today
          </span>
          <div className="font-display text-3xl font-extrabold text-text-primary dark:text-white">
            {stats.totalBooked || 62}
          </div>
          <span className="text-xs text-text-muted">Slots Reserved</span>
        </div>

        <div className="card-farm p-5 space-y-1">
          <span className="text-xs text-text-muted uppercase font-bold tracking-wider block">
            Waiting in Queue
          </span>
          <div className="font-display text-3xl font-extrabold text-amber-600">
            {stats.waiting || 4}
          </div>
          <span className="text-xs text-text-muted">At Gate / Yard</span>
        </div>

        <div className="card-farm p-5 space-y-1">
          <span className="text-xs text-text-muted uppercase font-bold tracking-wider block">
            Weighed & Done
          </span>
          <div className="font-display text-3xl font-extrabold text-green-600">
            {stats.completed || 23}
          </div>
          <span className="text-xs text-text-muted">Direct Receipts Issued</span>
        </div>

        <div className="card-farm p-5 space-y-1">
          <span className="text-xs text-text-muted uppercase font-bold tracking-wider block">
            Grain Procured (Kg)
          </span>
          <div className="font-display text-3xl font-extrabold text-primary dark:text-primary-light">
            {(stats.totalProcuredKg || 11500).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-text-muted">115.0 Quintals</span>
        </div>
      </div>

      {/* CURRENTLY SERVING BANNER (Full width green card) */}
      <div className="rounded-3xl bg-primary text-white p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white/10 flex flex-col items-center justify-center border-2 border-white/20 shrink-0">
            <span className="text-[11px] uppercase tracking-widest text-gold-light font-bold">Current</span>
            <span className="font-display text-4xl font-black text-gold leading-none mt-1">
              #{currentlyServing.token_number}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-green-200 font-bold">
              Now on Electronic Weighbridge Bay 1
            </span>
            <h3 className="font-heading text-2xl font-bold">
              {currentlyServing.farmer_name}
            </h3>
            <p className="text-xs text-primary-pale">
              📞 {currentlyServing.phone} · 🌾 {String(currentlyServing.crop_type).toUpperCase()} · {currentlyServing.quantity_kg} kg
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleMarkDone}
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          >
            Mark Done
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleCallNext}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Call Next (#45)
          </Button>
        </div>
      </div>

      {/* LIVE QUEUE MINI TABLE */}
      <div className="card-farm space-y-4">
        <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
          <h3 className="font-heading font-bold text-base">Active Mandi Queue</h3>
          <Link to="/officer/queue" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">
            Open Full Gate Management →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder text-text-muted uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Token #</th>
                <th className="py-2.5 px-3">Farmer Name</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3">Expected Qty</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/40">
              {(queueList.slice(0, 5) || []).map((q: any) => (
                <tr key={q.id} className="hover:bg-surface-2/40">
                  <td className="py-3 px-3 font-display font-black text-sm text-primary dark:text-primary-light">
                    #{q.token_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-text-primary dark:text-white">
                    {q.farmer?.name || 'Farmer'}
                  </td>
                  <td className="py-3 px-3 capitalize">🌾 {q.booking?.crop_type || 'wheat'}</td>
                  <td className="py-3 px-3">{q.booking?.expected_quantity_kg || 500} kg</td>
                  <td className="py-3 px-3">
                    <Badge status={q.status}>{q.status}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link to="/officer/queue">
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
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

export default OfficerDashboard;
