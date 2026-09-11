import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  LineChart,
  Activity,
  History,
  Send,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const links = [
    { to: '/admin/analytics', label: 'National Analytics', icon: BarChart3 },
    { to: '/admin/payments', label: 'DBT Payment Disbursals', icon: CreditCard },
    { to: '/admin/centres', label: 'Procurement Mandis', icon: Building2 },
    { to: '/admin/users', label: 'Farmers & Officers', icon: Users },
    { to: '/admin/msp-rates', label: 'MSP Rates Governance', icon: TrendingUp },
    { to: '/admin/grievances', label: '72h SLA Grievance Cell', icon: AlertTriangle },
    { to: '/admin/forecast', label: 'Demand Forecasting (AI)', icon: LineChart },
    { to: '/admin/system', label: 'Platform Health', icon: Activity },
    { to: '/admin/audit', label: 'Audit Trail Logs', icon: History },
    { to: '/admin/bulk-sms', label: 'Broadcast Bulk SMS', icon: Send },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-farmborder/60 dark:border-gray-800 flex flex-col shrink-0 min-h-screen">
      {/* Header Branding */}
      <div className="p-5 border-b border-farmborder/60 dark:border-gray-800 bg-surface dark:bg-gray-900">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏛️</span>
          <div>
            <h2 className="font-heading font-bold text-sm text-text-primary dark:text-white">
              DoCA HQ Portal
            </h2>
            <span className="text-[11px] text-text-muted">Ministry of Consumer Affairs</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:bg-surface-2 dark:hover:bg-gray-800 text-text-primary dark:text-gray-300'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
