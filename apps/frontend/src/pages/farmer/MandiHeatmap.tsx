import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock, ArrowRight, Compass, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Custom Marker Icons for Leaflet
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width:24px; height:24px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const MandiHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [rerouteSuggestion, setRerouteSuggestion] = useState<any | null>(null);
  const [centerPos, setCenterPos] = useState<[number, number]>([31.2, 75.3]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/gis/heatmap');
        setHeatmapData(res.data || []);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleLocateMe = async () => {
    toast('Detecting GPS location & computing least-congested mandi...', { icon: '📍' });
    try {
      const res = await apiClient.get('/gis/reroute');
      if (res.data?.recommended) {
        setRerouteSuggestion(res.data.recommended);
        setCenterPos([Number(res.data.recommended.lat), Number(res.data.recommended.lng)]);
        toast.success(`Optimal centre found: ${res.data.recommended.name}`);
      }
    } catch {
      toast.error('Could not locate nearest centre');
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full flex flex-col">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-xl border border-farmborder pointer-events-auto flex items-center gap-3">
          <span className="text-xl">🗺️</span>
          <div>
            <h1 className="font-heading font-bold text-sm text-text-primary dark:text-white leading-tight">
              GIS Mandi Congestion Heatmap
            </h1>
            <span className="text-[11px] text-text-muted">Real-time gate queues & traffic</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            onClick={handleLocateMe}
            icon={<Compass className="w-4 h-4" />}
          >
            Find Least-Busy Mandi 📍
          </Button>
        </div>
      </div>

      {/* Full-Screen Map */}
      <div className="flex-1 w-full h-full z-0">
        <MapContainer
          center={centerPos}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {heatmapData.map((c) => {
            const color =
              c.congestion === 'peak' ? '#DC2626' : c.congestion === 'high' ? '#EA580C' : '#16A34A';

            return (
              <React.Fragment key={c.id}>
                <Marker position={[c.lat, c.lng]} icon={createCustomIcon(color)}>
                  <Popup>
                    <div className="p-1 space-y-2 text-xs font-sans max-w-xs">
                      <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                      <p className="text-gray-600">
                        {c.district}, {c.state}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                        <span>Load: <strong>{c.load_pct}%</strong></span>
                        <span className="text-green-700 font-bold">~{c.estimated_wait_minutes} min wait</span>
                      </div>
                      <Link
                        to={`/farmer/book-slot?centreId=${c.id}`}
                        className="inline-block w-full text-center bg-primary text-white py-1.5 rounded-lg font-semibold hover:bg-primary-dark mt-2"
                      >
                        Book Here →
                      </Link>
                    </div>
                  </Popup>
                </Marker>

                {/* Radius halo */}
                <Circle
                  center={[c.lat, c.lng]}
                  radius={12000}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.15 }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Smart Reroute Slide-in Recommendation Card */}
      {rerouteSuggestion && (
        <div className="absolute bottom-20 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-[1000] bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-0.5 rounded-md">
                🌾 Smart Rerouting Advice
              </span>
              <h3 className="font-heading font-bold text-base text-text-primary dark:text-white">
                {rerouteSuggestion.name} has ~{rerouteSuggestion.waitMinutes} min less wait!
              </h3>
              <p className="text-xs text-text-muted">
                Distance: {rerouteSuggestion.distanceKm} km · Current Load: {rerouteSuggestion.loadPct}% (Low Congestion)
              </p>
            </div>
            <Link to={`/farmer/book-slot?centreId=${rerouteSuggestion.id}`}>
              <Button variant="primary" size="sm">
                Book There →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Legend Bottom Left */}
      <div className="absolute bottom-6 left-6 z-[999] bg-white/95 dark:bg-gray-900/95 backdrop-blur p-3 rounded-xl border border-farmborder text-xs shadow-md space-y-1.5 hidden sm:block">
        <span className="font-bold text-[10px] uppercase text-text-muted block">Mandi Congestion</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span>Low Load (&lt; 40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderate Load (40–70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Peak Rush (&gt; 70%)</span>
        </div>
      </div>
    </div>
  );
};

export default MandiHeatmap;
