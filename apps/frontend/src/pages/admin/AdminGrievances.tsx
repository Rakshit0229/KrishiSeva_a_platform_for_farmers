import React, { useState, useEffect } from 'react';
import { AlertOctagon, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const AdminGrievances: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ open: 2, escalated: 1, overdue: 1, resolved: 5 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await apiClient.get('/grievances');
      setGrievances(res.data || []);
      const sRes = await apiClient.get('/grievances/stats');
      setStats(sRes.data || stats);
    } catch {
      // fallback
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/grievances/${id}/update`, {
        status: 'resolved',
        message: 'Resolved directly by DoCA Central Grievance Appellate Authority.',
      });
      toast.success('Grievance resolved and farmer notified!');
      loadData();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <div className="section-label">Central Appellate Authority</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          National 72-Hour Grievance Redressal Cell
        </h1>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-farm p-4 space-y-1 border-l-4 border-l-amber-500">
          <span className="text-xs text-text-muted uppercase font-bold">Open Tickets</span>
          <div className="font-display text-2xl font-bold">{stats.open || 2}</div>
        </div>
        <div className="card-farm p-4 space-y-1 border-l-4 border-l-red-500">
          <span className="text-xs text-text-muted uppercase font-bold">SLA Escalated</span>
          <div className="font-display text-2xl font-bold text-red-600">{stats.escalated || 1}</div>
        </div>
        <div className="card-farm p-4 space-y-1 border-l-4 border-l-green-600">
          <span className="text-xs text-text-muted uppercase font-bold">Resolved within 72h</span>
          <div className="font-display text-2xl font-bold text-green-600">{stats.resolved || 5}</div>
        </div>
        <div className="card-farm p-4 space-y-1 border-l-4 border-l-primary">
          <span className="text-xs text-text-muted uppercase font-bold">Avg Resolution Time</span>
          <div className="font-display text-2xl font-bold text-primary">38.5 Hours</div>
        </div>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Centre</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {grievances.map((g) => (
                <tr key={g.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{g.id.slice(0, 12)}...</td>
                  <td className="py-3 px-4 font-bold">{g.farmer?.name || 'Farmer'}</td>
                  <td className="py-3 px-4 font-semibold">{g.subject}</td>
                  <td className="py-3 px-4 text-text-muted">{g.centre?.name || 'Mandi'}</td>
                  <td className="py-3 px-4 text-amber-700 font-medium">
                    {new Date(g.sla_deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={g.status}>{g.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {g.status !== 'resolved' && (
                      <Button variant="primary" size="sm" onClick={() => handleResolve(g.id)}>
                        Appellate Resolve
                      </Button>
                    )}
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

export default AdminGrievances;
