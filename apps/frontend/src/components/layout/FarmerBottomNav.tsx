import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarPlus, Ticket, CreditCard, User } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const FarmerBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/farmer/dashboard', label: t('welcome', 'Home'), icon: Home },
    { to: '/farmer/book-slot', label: t('book_slot', 'Book'), icon: CalendarPlus },
    { to: '/farmer/bookings', label: t('my_bookings', 'Bookings'), icon: Ticket },
    { to: '/farmer/payments', label: t('payments', 'Payments'), icon: CreditCard },
    { to: '/farmer/profile', label: t('profile', 'Profile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-farmborder/80 dark:border-gray-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive
                    ? 'text-primary dark:text-primary-light font-bold scale-105'
                    : 'text-text-muted dark:text-gray-400 hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
