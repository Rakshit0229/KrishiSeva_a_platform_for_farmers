import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldCheck, Plus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const FarmerGrievances: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [category, setCategory] = useState('payment_delay');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadGrievances();
  }, []);

  async function loadGrievances() {
    try {
      const res = await apiClient.get('/grievances');
      setGrievances(res.data || []);
      if (res.data.length > 0) setExpandedId(res.data[0].id);
    } catch {
      // fallback
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      toast.error('Please enter subject and description');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/grievances', { category, subject, description });
      toast.success('Grievance registered with 72-Hour Government SLA!');
      setIsNewModalOpen(false);
      setSubject('');
      setDescription('');
      loadGrievances();
    } catch {
      toast.error('Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Citizen Redressal</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            72-Hour SLA Grievance Portal
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Every complaint is tracked under a statutory 72-hour resolution SLA with automated escalation to DoCA headquarters.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          File New Grievance
        </Button>
      </div>

      {/* Grievance List */}
      <div className="space-y-4">
        {grievances.length === 0 ? (
          <div className="card-farm text-center p-12 space-y-3">
            <span className="text-4xl">🛡️</span>
            <p className="text-sm font-bold">No Active Disputes or Complaints</p>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              If you experience weighbridge calibration errors or DBT delays, report here for immediate redressal.
            </p>
          </div>
        ) : (
          grievances.map((g) => {
            const isExpanded = expandedId === g.id;
            return (
              <div key={g.id} className="card-farm p-0 overflow-hidden border">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : g.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Category: {g.category}
                      </span>
                      <Badge status={g.status}>{g.status}</Badge>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white">
                      {g.subject}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Filed: {new Date(g.created_at).toLocaleDateString()} · SLA Deadline: {new Date(g.sla_deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-green-700 dark:text-green-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 72h SLA Active
                    </span>
                    <button className="p-1 text-text-muted">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-farmborder/60 bg-surface/50 dark:bg-gray-900/50 space-y-3 text-xs">
                    <div>
                      <span className="text-text-muted font-bold block mb-1">Description:</span>
                      <p className="text-text-primary dark:text-gray-200 text-sm leading-relaxed">
                        {g.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-farmborder/40 flex items-center justify-between text-text-muted">
                      <span>Ticket Reference: <strong className="font-mono">{g.id}</strong></span>
                      <span className="text-primary font-semibold">Assigned Mandi Officer Rajesh Kumar</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Grievance Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="File New 72-Hour SLA Grievance"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Grievance Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-farm text-xs font-semibold"
            >
              <option value="payment_delay">Payment Delayed Beyond 72 Hours</option>
              <option value="weighbridge_calibration">Digital Weighbridge Discrepancy</option>
              <option value="queue_delay">Gate Queue & Staff Delay</option>
              <option value="quality_dispute">Grain Moisture / Grade Dispute</option>
              <option value="other">Other Inquiry</option>
            </select>
          </div>

          <Input
            label="Subject Summary"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Weighbridge reading differed by 20 kg"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details, vehicle number, or ticket number..."
              className="input-farm text-xs"
              required
            />
          </div>

          <div className="p-3 rounded-lg bg-gold-pale text-earth-brown text-xs border border-gold/40">
            ⚖️ Under Department of Consumer Affairs guidelines, your ticket will automatically escalate to the Ministry if not addressed within 72 hours.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Submit Grievance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmerGrievances;
