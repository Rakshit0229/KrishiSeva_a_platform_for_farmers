import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const OfficerAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await apiClient.get('/announcements');
      setAnnouncements(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/announcements', { title, body });
      toast.success('Mandi announcement published to TV ticker & farmer apps!');
      setIsModalOpen(false);
      setTitle('');
      setBody('');
      loadAnnouncements();
    } catch {
      toast.error('Failed to create announcement');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Farmer Broadcasts</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Mandi Announcements & TV Ticker
          </h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Broadcast
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="card-farm space-y-2 border-l-4 border-l-gold">
            <h3 className="font-heading font-bold text-base text-text-primary dark:text-white">
              {a.title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">{a.body}</p>
            <span className="text-[10px] text-text-muted block">
              Published: {new Date(a.created_at).toLocaleDateString()} · Active on Mandi TV Display
            </span>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Mandi Broadcast"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weighbridge Bay 2 Calibration Completed"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-text-muted">
              Message Body (Shown on Live TV Ticker)
            </label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="State message clearly for all arriving farmers..."
              className="input-farm text-xs"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Broadcast Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OfficerAnnouncements;
