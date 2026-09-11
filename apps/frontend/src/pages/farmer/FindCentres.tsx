import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Compass } from 'lucide-react';
import { CentreCard } from '../../components/domain/CentreCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';

export const FindCentres: React.FC = () => {
  const [centres, setCentres] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/centres');
        setCentres(res.data || []);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const filtered = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'all' || c.state.toLowerCase() === selectedState.toLowerCase();
    const matchesCrop =
      selectedCrop === 'all' ||
      c.crops_accepted.some((crop: string) => crop.toLowerCase() === selectedCrop.toLowerCase());
    return matchesSearch && matchesState && matchesCrop;
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-label">Procurement Centres</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Find Procurement Mandis
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Check live queue length, electronic weighbridge status, and reserve your arrival window.
          </p>
        </div>
        <Link to="/farmer/map">
          <Button variant="outline" size="sm" icon={<Compass className="w-4 h-4 text-primary" />}>
            View on GIS Heatmap
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-farmborder/80 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by mandi name or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-farm pl-9 text-xs"
          />
        </div>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="input-farm text-xs font-semibold capitalize"
        >
          <option value="all">All States</option>
          <option value="punjab">Punjab</option>
          <option value="haryana">Haryana</option>
          <option value="bihar">Bihar</option>
        </select>

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="input-farm text-xs font-semibold capitalize"
        >
          <option value="all">All Crops</option>
          <option value="wheat">🌾 Wheat</option>
          <option value="paddy">🌾 Paddy</option>
          <option value="maize">🌽 Maize</option>
          <option value="mustard">🌻 Mustard</option>
        </select>
      </div>

      {/* Grid of Centre Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c, idx) => (
          <CentreCard key={c.id} centre={c} featured={idx === 0} />
        ))}
      </div>
    </div>
  );
};

export default FindCentres;
