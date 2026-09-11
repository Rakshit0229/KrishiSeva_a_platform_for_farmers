import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const AdminCentres: React.FC = () => {
  const [centres, setCentres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Amritsar');
  const [stateName, setStateName] = useState('Punjab');
  const [capacity, setCapacity] = useState(80);
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadCentres();
  }, []);

  async function loadCentres() {
    try {
      const res = await apiClient.get('/centres');
      setCentres(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/centres', {
        name,
        district,
        state: stateName,
        daily_slot_capacity: capacity,
        address: address || `${name}, ${district}`,
      });
      toast.success('Procurement centre registered successfully!');
      setIsModalOpen(false);
      setName('');
      loadCentres();
    } catch {
      toast.error('Failed to create centre');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Infrastructure Directory</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Procurement Mandis & APMC Centres
          </h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Mandi Centre
        </Button>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Mandi Name</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Daily Slot Limit</th>
                <th className="py-3 px-4">Accepted Crops</th>
                <th className="py-3 px-4">Weighbridge Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {centres.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-bold text-text-primary dark:text-white">{c.name}</td>
                  <td className="py-3 px-4 text-text-muted">{c.district}, {c.state}</td>
                  <td className="py-3 px-4 font-display font-semibold">{c.daily_slot_capacity} vehicles/day</td>
                  <td className="py-3 px-4 capitalize">{(c.crops_accepted || ['wheat', 'paddy']).join(', ')}</td>
                  <td className="py-3 px-4 text-green-700 font-bold">Active & Calibrated</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register APMC Centre" maxWidth="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Mandi Centre Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="District" value={district} onChange={(e) => setDistrict(e.target.value)} required />
          <Input label="State" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
          <Input label="Daily Vehicle Capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Centre
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCentres;
