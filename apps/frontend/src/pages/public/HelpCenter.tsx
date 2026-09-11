import React, { useState } from 'react';
import { HelpCircle, Search, PhoneCall, ShieldAlert, FileText, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { KisanMitraModal } from '../../components/common/KisanMitraModal';

export const HelpCenter: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All FAQs' },
    { id: 'booking', label: 'Slot Booking' },
    { id: 'payment', label: 'Direct Bank Payment (DBT)' },
    { id: 'weighbridge', label: 'Electronic Weighbridge' },
    { id: 'grievance', label: '72h SLA Grievances' },
  ];

  const faqs = [
    {
      category: 'booking',
      q: 'How do I book a mandi slot in advance?',
      a: 'Open KrishiSeva → Click "Book Slot" → Choose your nearest procurement mandi centre → Select your preferred date and 1-hour time window → Enter crop quantity → Confirm to generate your digital QR token pass.',
    },
    {
      category: 'booking',
      q: 'Can I cancel or reschedule my booking?',
      a: 'Yes, go to "My Bookings" in the app, expand your upcoming booking, and click "Cancel Booking". The slot will immediately be re-allocated to the next farmer on the digital waitlist.',
    },
    {
      category: 'payment',
      q: 'How does KrishiSeva guarantee payment within 72 hours?',
      a: 'KrishiSeva is directly integrated with the Public Financial Management System (PFMS). When the officer records the digital weighbridge reading, an automated payment voucher is authorized and routed to your bank account via Direct Benefit Transfer.',
    },
    {
      category: 'payment',
      q: 'What if my payment is delayed beyond 72 hours?',
      a: 'Under the mandatory 72-hour SLA, any payment delayed past 72 hours is automatically flagged in red on the Ministry of Consumer Affairs dashboard and triggers immediate escalation to district auditors.',
    },
    {
      category: 'weighbridge',
      q: 'How does the IoT weighbridge eliminate tampering?',
      a: 'KrishiSeva uses certified electronic load-cell sensors that communicate gross and tare vehicle weights directly over tamper-proof encrypted TLS telemetry to the central database, eliminating manual pencil entries.',
    },
    {
      category: 'grievance',
      q: 'How do I file a grievance regarding mandi delays or staff?',
      a: 'Go to the Grievances section in the farmer menu, choose category (Weighbridge Issue, Payment Delay, Officer Misbehavior), write details, and submit. You receive a tracking ticket committed to 72-hour resolution.',
    },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="section-label">Help & Support</div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold">
          How Can We Help You, Kisan Mitra?
        </h1>
        <p className="text-sm text-text-muted max-w-lg mx-auto">
          Find answers regarding mandi slot appointments, PFMS bank disbursals, and digital weighbridge standards.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-2">
          <Input
            placeholder="Search FAQs, payments, weighbridge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefixText="🔍"
          />
        </div>
      </div>

      {/* AI Kisan Mitra Interactive Support Banner */}
      <div className="card-farm bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-6 rounded-3xl border-2 border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center text-gold-light border border-gold/40 text-2xl shrink-0">
            🌾
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/25 text-gold-light font-bold text-[10px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Farming & Mandi AI
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Have a Specific Farming or Mandi Question?
            </h3>
            <p className="text-xs text-primary-pale max-w-md">
              Ask AI Kisan Mitra about 2026 MSP rates, grain moisture FAQ limits, live queue wait times, or tractor delay protocols.
            </p>
          </div>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={() => setIsAiModalOpen(true)}
          className="shrink-0 flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Kisan Mitra</span>
        </Button>
      </div>

      {/* AI Kisan Mitra Interactive Modal */}
      <KisanMitraModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Categories Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface hover:bg-surface-2 border border-farmborder text-text-muted dark:bg-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-farmborder dark:border-gray-800 bg-white dark:bg-gray-800/80 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-text-primary dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-text-muted dark:text-gray-300 leading-relaxed border-t border-farmborder/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Contacts Card */}
      <div className="card-farm bg-primary-pale dark:bg-primary-dark/30 border-primary/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-primary-dark dark:text-white">
              Need Immediate Mandi Assistance?
            </h4>
            <p className="text-xs text-text-muted dark:text-gray-300">
              National Kisan Call Centre: <strong>1800-180-1551</strong> (Toll Free, 6 AM to 10 PM)
            </p>
          </div>
        </div>
        <Link to="/farmer/grievances/new">
          <Button variant="primary" size="sm">
            File 72h SLA Grievance →
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HelpCenter;
