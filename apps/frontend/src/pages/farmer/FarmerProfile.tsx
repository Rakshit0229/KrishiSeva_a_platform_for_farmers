import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Building, CreditCard, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const FarmerProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || 'Gurpreet Singh',
    phone: user?.phone || '+919876543201',
    aadhaar_last4: '4321',
    land_area_acres: 12.5,
    village: 'Tarn Taran',
    district: 'Amritsar',
    state: 'Punjab',
    pincode: '143401',
    bank_name: 'Punjab National Bank',
    bank_account_last4: '5678',
    ifsc_code: 'PUNB0001234',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/farmers/profile');
        if (res.data?.profile) {
          setFormData((prev) => ({
            ...prev,
            ...res.data.profile,
            name: res.data.user?.name || prev.name,
            phone: res.data.user?.phone || prev.phone,
          }));
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/farmers/profile', formData);
      updateUser({ name: formData.name });
      toast.success('Profile updated successfully! DBT verification synced.');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="section-label">Farmer Identity</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Kisan Profile & Bank Account
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Accurate Aadhaar, IFSC, and land records ensure 100% automated 72-hour direct bank payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Personal Info */}
        <div className="card-farm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-primary-light border-b border-farmborder/50 pb-2">
            <User className="w-4 h-4" /> Personal Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name (as per Bank A/C)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Registered Mobile Phone"
              value={formData.phone}
              disabled
              helperText="Verified via OTP"
            />
            <Input
              label="Aadhaar Last 4 Digits"
              value={formData.aadhaar_last4}
              onChange={(e) => setFormData({ ...formData, aadhaar_last4: e.target.value })}
              maxLength={4}
              prefixText="XXXX-XXXX-"
              required
            />
            <Input
              label="Cultivable Land Area (Acres)"
              type="number"
              value={formData.land_area_acres}
              onChange={(e) => setFormData({ ...formData, land_area_acres: Number(e.target.value) })}
              suffixText="Acres"
              required
            />
          </div>
        </div>

        {/* Location & Farm Address */}
        <div className="card-farm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-primary-light border-b border-farmborder/50 pb-2">
            <MapPin className="w-4 h-4" /> Village & District Jurisdiction
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Gram Panchayat"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              required
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <Input
              label="Postal Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              maxLength={6}
              required
            />
          </div>
        </div>

        {/* Bank & DBT Settlement Details */}
        <div className="card-farm space-y-4 bg-primary-pale/30 dark:bg-primary-dark/20 border-primary/40">
          <div className="flex items-center gap-2 text-sm font-bold text-green-800 dark:text-green-300 border-b border-farmborder/50 pb-2">
            <CreditCard className="w-4 h-4" /> Direct Benefit Transfer (PFMS Bank Account)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Bank Name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="State Bank of India"
              required
            />
            <Input
              label="Account Last 4 Digits"
              value={formData.bank_account_last4}
              onChange={(e) => setFormData({ ...formData, bank_account_last4: e.target.value })}
              maxLength={4}
              placeholder="5678"
              required
            />
            <Input
              label="Bank IFSC Code"
              value={formData.ifsc_code}
              onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
              maxLength={11}
              placeholder="SBIN0001234"
              required
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Financial Management System (PFMS) Direct Routing Active</span>
          </div>
        </div>

        {/* Official Certifications & Government Documents */}
        <div className="card-farm space-y-3 bg-surface dark:bg-gray-800/80 border border-farmborder">
          <div className="flex items-center justify-between border-b border-farmborder/50 pb-2">
            <span className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
              📜 Official Documents & Certifications
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-pale text-earth-brown">
              Govt Certified
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Generate an official QR-stamped Farmer Income & Procurement Certificate verified by the Ministry of Consumer Affairs for bank loan subsidies and KCC schemes.
          </p>
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Generating official Farmer Income Certificate PDF...');
                window.open(`/api/pdf/income-certificate/${user?.id || '20000000-0000-0000-0000-000000000001'}`, '_blank');
              }}
              className="text-xs font-bold text-primary dark:text-primary-light border-primary/40 hover:bg-primary hover:text-white"
            >
              📥 Download Farmer Income Certificate (PDF)
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FarmerProfile;
