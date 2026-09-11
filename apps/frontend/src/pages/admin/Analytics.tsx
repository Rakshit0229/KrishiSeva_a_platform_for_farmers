import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Building2,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';

export const Analytics: React.FC = () => {
  const [delayedPayments, setDelayedPayments] = useState<any[]>([]);
  const [grievanceStats, setGrievanceStats] = useState<any>({ overdue: 1, open: 2 });

  useEffect(() => {
    async function load() {
      try {
        const pRes = await apiClient.get('/payments/pending');
        setDelayedPayments(pRes.data || []);
        const gRes = await apiClient.get('/grievances/stats');
        setGrievanceStats(gRes.data || { overdue: 1, open: 2 });
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  // District Procurement Bar Chart Data
  const districtData = [
    { district: 'Amritsar', wheat: 4200, paddy: 2800 },
    { district: 'Ludhiana', wheat: 5800, paddy: 3400 },
    { district: 'Hisar', wheat: 3900, mustard: 2100 },
    { district: 'Patiala', wheat: 4600, paddy: 3100 },
    { district: 'Bhatinda', wheat: 5100, cotton: 2400 },
  ];

  // Crop Distribution Donut Data
  const cropData = [
    { name: 'Wheat', value: 52, color: '#2A6B35' },
    { name: 'Paddy', value: 28, color: '#D4A017' },
    { name: 'Mustard', value: 12, color: '#E67E22' },
    { name: 'Maize', value: 8, color: '#8B6040' },
  ];

  // Daily Booking Trends
  const trendData = [
    { day: 'Mon', bookings: 240 },
    { day: 'Tue', bookings: 380 },
    { day: 'Wed', bookings: 420 },
    { day: 'Thu', bookings: 310 },
    { day: 'Fri', bookings: 490 },
    { day: 'Sat', bookings: 210 },
    { day: 'Sun', bookings: 120 },
  ];

  // Wait Time by Day of Week
  const waitTimeData = [
    { day: 'Mon', waitMinutes: 18 },
    { day: 'Tue', waitMinutes: 28 },
    { day: 'Wed', waitMinutes: 32 },
    { day: 'Thu', waitMinutes: 22 },
    { day: 'Fri', waitMinutes: 45 },
    { day: 'Sat', waitMinutes: 15 },
    { day: 'Sun', waitMinutes: 10 },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <div className="section-label">Executive Intelligence</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          National Procurement Analytics & SLA Dashboard
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Ministry of Consumer Affairs, Food & Public Distribution — Mandi throughput, DBT disbursals, and SLA surveillance.
        </p>
      </div>

      {/* SLA RED ALERT BANNERS */}
      {(delayedPayments.length > 0 || grievanceStats.overdue > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong className="text-red-900 dark:text-red-200 font-bold block">
                  {delayedPayments.length || 1} Payment(s) Exceeded 72-Hour Statutory SLA!
                </strong>
                <span className="text-red-700 dark:text-red-300">PFMS reconciliation review required immediately.</span>
              </div>
            </div>
            <Badge variant="error">High Priority</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="text-amber-900 dark:text-amber-200 font-bold block">
                  {grievanceStats.overdue || 1} Citizen Grievance Approaching SLA Limit
                </strong>
                <span className="text-amber-700 dark:text-amber-300">Escalated to Central Cell for resolution.</span>
              </div>
            </div>
            <Badge variant="pending">SLA Escalated</Badge>
          </div>
        </div>
      )}

      {/* 4 NATIONAL OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-farm p-5 space-y-1 border-l-4 border-l-primary">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
            Farmers Registered
          </span>
          <div className="font-display text-3xl font-extrabold text-primary dark:text-primary-light">
            5,48,210
          </div>
          <span className="text-[11px] text-green-700 font-semibold">↑ +14.2% this season</span>
        </div>

        <div className="card-farm p-5 space-y-1 border-l-4 border-l-gold">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
            Active APMC Mandis
          </span>
          <div className="font-display text-3xl font-extrabold text-gold">
            512
          </div>
          <span className="text-[11px] text-text-muted">100% IoT Scale Enabled</span>
        </div>

        <div className="card-farm p-5 space-y-1 border-l-4 border-l-green-600">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
            MSP Disbursed (Week)
          </span>
          <div className="font-display text-3xl font-extrabold text-text-primary dark:text-white">
            ₹48.6 Cr
          </div>
          <span className="text-[11px] text-green-700 font-semibold">Direct PFMS Transfer</span>
        </div>

        <div className="card-farm p-5 space-y-1 border-l-4 border-l-amber-500">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">
            Avg Mandi Queue Wait
          </span>
          <div className="font-display text-3xl font-extrabold text-amber-600">
            22.4 Min
          </div>
          <span className="text-[11px] text-text-muted">Down from 12 hours</span>
        </div>
      </div>

      {/* CHARTS GRID (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: District Procurement */}
        <div className="card-farm space-y-4">
          <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
            <h3 className="font-heading font-bold text-base">Procurement by District (Quintals)</h3>
            <span className="text-xs text-text-muted">Last 30 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="wheat" name="Wheat (qtl)" fill="#2A6B35" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paddy" name="Paddy (qtl)" fill="#D4A017" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Crop Distribution Donut */}
        <div className="card-farm space-y-4">
          <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
            <h3 className="font-heading font-bold text-base">Grain Ingestion Share (%)</h3>
            <span className="text-xs text-text-muted">Total 2.4M Metric Tonnes</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cropData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Booking Trends */}
        <div className="card-farm space-y-4">
          <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
            <h3 className="font-heading font-bold text-base">Daily Slot Ingestion Volume</h3>
            <span className="text-xs text-text-muted">Peak Friday</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#2A6B35" strokeWidth={3} dot={{ fill: '#D4A017', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Mandi Wait Time by Day */}
        <div className="card-farm space-y-4">
          <div className="flex items-center justify-between border-b border-farmborder/50 pb-3">
            <h3 className="font-heading font-bold text-base">Average Wait Time by Day (Minutes)</h3>
            <span className="text-xs text-text-muted">Target &lt; 30 Mins</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="waitMinutes" name="Wait (mins)" fill="#E67E22" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
