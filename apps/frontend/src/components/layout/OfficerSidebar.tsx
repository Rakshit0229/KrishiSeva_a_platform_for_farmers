import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scale,
  FileSpreadsheet,
  AlertOctagon,
  Megaphone,
  Radio,
} from 'lucide-react';

export const OfficerSidebar: React.FC = () => {
  const links = [
    { to: '/officer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/officer/queue', label: 'Live Queue & Gate', icon: Users },
    { to: '/officer/slots', label: 'Slot Schedule', icon: Calendar },
    { to: '/officer/procurement/new', label: 'Log Procurement', icon: Scale },
    { to: '/officer/weighbridge', label: 'Weighbridge IoT', icon: Radio },
    { to: '/officer/reports', label: 'Reports & Receipts', icon: FileSpreadsheet },
    { to: '/officer/grievances', label: 'Grievance SLA', icon: AlertOctagon },
    { to: '/officer/announcements', label: 'Broadcasts', icon: Megaphone },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-farmborder/60 dark:border-gray-800 flex flex-col shrink-0 min-h-screen">
      {/* Header Branding */}
      <div className="p-5 border-b border-farmborder/60 dark:border-gray-800 bg-surface dark:bg-gray-900">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">👮</span>
          <div>
            <h2 className="font-heading font-bold text-sm text-text-primary dark:text-white">
              Officer Portal
            </h2>
            <span className="text-[11px] text-text-muted">Mandi Operations & Gate</span>
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
