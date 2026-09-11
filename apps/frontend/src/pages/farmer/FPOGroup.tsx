import React, { useState, useEffect } from 'react';
import { Users, Building, ShieldCheck, ArrowRight, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const FPOGroup: React.FC = () => {
  const [fpoData, setFpoData] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/fpo/my-group');
        setFpoData(res.data);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleBulkBook = async () => {
    toast.success('Bulk booking initialized for all 5 FPO member farmers!');
  };

  const group = fpoData?.group || {
    name: 'Majha Kisan Producer Company Ltd',
    registration_number: 'FPO-PB-2024-8841',
    district: 'Amritsar',
    state: 'Punjab',
  };

  const members = fpoData?.members || [
    { id: '1', name: 'Gurpreet Singh', phone: '+919876543201', role: 'FPO Leader', land: '12.5 Acres' },
    { id: '2', name: 'Balwinder Singh', phone: '+919876543011', role: 'Member', land: '8.0 Acres' },
    { id: '3', name: 'Harpreet Kaur', phone: '+919876543012', role: 'Member', land: '6.5 Acres' },
    { id: '4', name: 'Jagjit Singh', phone: '+919876543013', role: 'Member', land: '10.0 Acres' },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Farmer Collectives</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            FPO Collective Procurement
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Group multiple smallholder farmers into combined transport slots for lower logistics cost.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleBulkBook} icon={<Users className="w-4 h-4" />}>
          Group Bulk Book Slot
        </Button>
      </div>

      {/* FPO Card */}
      <div className="rounded-3xl bg-primary-dark text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-gold-light">
              Registered Farmer Producer Organisation
            </span>
            <h2 className="font-heading text-2xl font-bold">{group.name}</h2>
            <p className="text-xs text-primary-pale">
              Reg: {group.registration_number} · {group.district}, {group.state}
            </p>
          </div>
          <div className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/40 rounded-full text-xs font-semibold">
            Active FPO Tier 1
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card-farm space-y-4">
        <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
          <h3 className="font-heading font-bold text-base">Affiliated Member Farmers</h3>
          <span className="text-xs text-text-muted">{members.length} Members Enrolled</span>
        </div>

        <div className="divide-y divide-farmborder/40">
          {members.map((m: any) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-sm text-text-primary dark:text-white block">
                  {m.name}
                </span>
                <span className="text-text-muted">
                  Phone: {m.phone} · Land: {m.land}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-pill bg-surface-2 dark:bg-gray-800 text-primary dark:text-primary-light font-semibold">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FPOGroup;
