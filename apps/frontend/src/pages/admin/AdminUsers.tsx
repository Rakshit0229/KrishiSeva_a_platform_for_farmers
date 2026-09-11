import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data || []);
    } catch {
      // fallback
    }
  }

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const nextRole = currentRole === 'farmer' ? 'officer' : 'farmer';
    try {
      await apiClient.put(`/users/${id}/role`, { role: nextRole });
      toast.success(`User role changed to ${nextRole}`);
      loadUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <div className="section-label">Identity Governance</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          User Accounts & Access Control
        </h1>
      </div>

      <div className="card-farm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-farmborder bg-surface-2/40 text-text-muted uppercase text-[10px]">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Village / District</th>
                <th className="py-3 px-4">DBT Bank A/C</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farmborder/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2/30">
                  <td className="py-3 px-4 font-bold text-text-primary dark:text-white">{u.name}</td>
                  <td className="py-3 px-4 font-mono">{u.phone}</td>
                  <td className="py-3 px-4 capitalize">
                    <Badge status={u.role === 'admin' ? 'gold' : u.role === 'officer' ? 'process' : 'success'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted">
                    {u.profile?.village ? `${u.profile.village}, ${u.profile.district}` : 'HQ Jurisdictional'}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {u.profile?.bank_account_last4 ? `**** ${u.profile.bank_account_last4}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleToggle(u.id, u.role)}
                      >
                        Toggle {u.role === 'farmer' ? 'Officer' : 'Farmer'}
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

export default AdminUsers;
