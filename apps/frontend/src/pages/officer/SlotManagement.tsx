import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Lock, Unlock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const SlotManagement: React.FC = () => {
  const [centreId] = useState('10000000-0000-0000-0000-000000000001');
  const [slots, setSlots] = useState<any[]>([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [centreId]);

  async function loadSlots() {
    try {
      const res = await apiClient.get(`/slots?centre_id=${centreId}`);
      setSlots(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleToggleBlock = async (slotId: string) => {
    try {
      await apiClient.put(`/slots/${slotId}/block`, { reason: 'Emergency calibration' });
      toast.success('Slot block state toggled');
      loadSlots();
    } catch {
      toast.error('Failed to toggle block');
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await apiClient.post('/slots/generate', {
        centre_id: centreId,
        start_date: startDate,
        end_date: endDate,
        max_capacity: maxCapacity,
      });
      toast.success('Slots generated successfully for next week!');
      setIsGenerateModalOpen(false);
      loadSlots();
    } catch {
      toast.error('Failed to generate slots');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Capacity Planning</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Mandi Slot Capacity & Schedule
          </h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsGenerateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Batch Generate Slots
        </Button>
      </div>

      {/* Slots Table */}
      <div className="card-farm p-0 overflow-hidden">
        <div className="p-4 border-b border-farmborder">
          <h3 className="font-heading font-bold text-sm">Configured Arrival Windows</h3>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-surface-2 dark:bg-gray-800 z-10">
              <tr className="border-b border-farmborder text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Booked / Capacity</th>
                <th className="py-3 px-4">Congestion</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-surface-2/40">
                  <td className="py-3 px-4 font-bold">{s.slot_date}</td>
                  <td className="py-3 px-4">{s.start_time} - {s.end_time}</td>
                  <td className="py-3 px-4 font-display font-semibold">
                    {s.booked_count} / {s.max_capacity}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={s.congestion === 'peak' ? 'error' : 'success'}>
                      {s.congestion}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {s.is_blocked ? (
                      <span className="text-red-600 font-bold">Blocked</span>
                    ) : (
                      <span className="text-green-600 font-bold">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant={s.is_blocked ? 'outline' : 'danger'}
                      size="sm"
                      onClick={() => handleToggleBlock(s.id)}
                    >
                      {s.is_blocked ? 'Unblock' : 'Block Slot'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Slots Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Batch Generate Mandi Slots"
        maxWidth="sm"
      >
        <form onSubmit={handleGenerateSlots} className="space-y-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <Input
            label="Hourly Slot Capacity (Vehicles)"
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isGenerating}>
              Generate Slots
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SlotManagement;
