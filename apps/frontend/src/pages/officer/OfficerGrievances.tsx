import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const OfficerGrievances: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);
  const [resolutionMessage, setResolutionMessage] = useState('');

  useEffect(() => {
    loadGrievances();
  }, []);

  async function loadGrievances() {
    try {
      const res = await apiClient.get('/grievances');
      setGrievances(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleResolve = async () => {
    if (!selectedGrievance) return;
    try {
      await apiClient.put(`/grievances/${selectedGrievance.id}/update`, {
        status: 'resolved',
        message: resolutionMessage || 'Investigated by Mandi Officer and reconciled with weighbridge log.',
      });
      toast.success('Grievance marked as resolved!');
      setSelectedGrievance(null);
      setResolutionMessage('');
      loadGrievances();
    } catch {
      toast.error('Failed to update grievance');
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await apiClient.put(`/grievances/${id}/escalate`);
      toast.success('Grievance escalated to DoCA Headquarters!');
      loadGrievances();
    } catch {
      toast.error('Failed to escalate');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <div className="section-label">Mandi Dispute Resolution</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          72-Hour SLA Mandi Grievance Inbox
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Complaints must be investigated and resolved within 72 hours under statutory DoCA guidelines.
        </p>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {grievances.map((g) => (
                <tr key={g.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{g.id.slice(0, 12)}...</td>
                  <td className="py-3 px-4 font-bold">{g.farmer?.name || 'Farmer'}</td>
                  <td className="py-3 px-4 font-semibold">{g.subject}</td>
                  <td className="py-3 px-4 text-text-muted capitalize">{g.category}</td>
                  <td className="py-3 px-4 text-amber-700 dark:text-amber-400 font-medium">
                    {new Date(g.sla_deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={g.status}>{g.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {g.status !== 'resolved' && (
                      <>
                        <Button variant="primary" size="sm" onClick={() => setSelectedGrievance(g)}>
                          Resolve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleEscalate(g.id)}>
                          Escalate
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={Boolean(selectedGrievance)}
        onClose={() => setSelectedGrievance(null)}
        title="Resolve Farmer Grievance"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-sm">{selectedGrievance?.subject}</h4>
            <p className="text-xs text-text-muted mt-1">{selectedGrievance?.description}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Official Resolution Note
            </label>
            <textarea
              rows={3}
              value={resolutionMessage}
              onChange={(e) => setResolutionMessage(e.target.value)}
              placeholder="State corrective actions taken, recalibration results, or payment reconciliation..."
              className="input-farm text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedGrievance(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResolve}>
              Mark as Resolved & Close SLA
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OfficerGrievances;
