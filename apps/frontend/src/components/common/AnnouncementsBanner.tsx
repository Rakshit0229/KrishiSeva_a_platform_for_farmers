import React, { useState } from 'react';
import { ChevronRight, Bell, ExternalLink } from 'lucide-react';

interface Announcement {
  id: string;
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  summary: string;
  link?: string;
  isNew?: boolean;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    date: 'Sept 2026',
    tag: 'MSP Update',
    tagColor: 'bg-primary-pale text-primary dark:bg-primary-dark/40 dark:text-primary-light',
    title: 'Wheat MSP Revised to ₹2,425/Quintal for Rabi 2026-27',
    summary:
      'Cabinet Committee on Economic Affairs (CCEA) raises wheat MSP by ₹150 per quintal. All bookings updated automatically on KrishiSeva.',
    isNew: true,
  },
  {
    id: '2',
    date: 'Aug 2026',
    tag: 'System Update',
    tagColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    title: 'New Aadhaar e-KYC Fast Lane Now Live at 200+ Centres',
    summary:
      'Biometric-less OTP-based Aadhaar e-KYC now active. Farmers complete gate registration in under 60 seconds without fingerprint scanner.',
    isNew: true,
  },
  {
    id: '3',
    date: 'Aug 2026',
    tag: 'New Feature',
    tagColor: 'bg-gold-pale text-earth-brown dark:bg-gold/20 dark:text-gold',
    title: 'AI Crop Pre-Scanner Now Supports Maize & Chickpea',
    summary:
      'The AI Quality Lab can now detect moisture defects, fungal contamination, and grade quality for 8 major crops before mandi gate visit.',
  },
  {
    id: '4',
    date: 'Jul 2026',
    tag: 'Policy',
    tagColor: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    title: 'DPDP Act 2023 Compliance: KrishiSeva Data Privacy Updated',
    summary:
      'Full compliance with India\'s Digital Personal Data Protection Act 2023. Your farm data is encrypted and never shared with traders.',
  },
  {
    id: '5',
    date: 'Jul 2026',
    tag: 'Expansion',
    tagColor: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    title: '100 New Procurement Centres Added in Bihar & UP',
    summary:
      'KrishiSeva network expands to 600+ centres. New mandis added in Saharsa, Muzaffarpur, Varanasi, and Allahabad regions.',
  },
  {
    id: '6',
    date: 'Jun 2026',
    tag: 'Payment',
    tagColor: 'bg-primary-pale text-primary dark:bg-primary-dark/40 dark:text-primary-light',
    title: 'PFMS Payment Window Reduced from 72 to 48 Hours',
    summary:
      'Following RBI Fast-ACH integration, direct bank transfer timeline cut to 48 hours post-weighing for farmers with linked accounts.',
  },
];

export const AnnouncementsBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? ANNOUNCEMENTS : ANNOUNCEMENTS.slice(0, 3);

  return (
    <section className="py-14 bg-white dark:bg-gray-900 border-b border-farmborder/60 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary-pale dark:bg-primary-dark/20 px-3 py-1 rounded-full">
              <Bell className="w-3.5 h-3.5" />
              Government Announcements
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">
              Latest from{' '}
              <span className="text-primary underline decoration-gold decoration-4 underline-offset-4">
                Department of Consumer Affairs
              </span>
            </h2>
            <p className="text-sm text-text-muted">
              Policy updates, MSP revisions, and platform improvements — directly from Krishi Bhawan.
            </p>
          </div>
          <a
            href="https://consumeraffairs.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary dark:text-primary-light hover:underline shrink-0"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-farmborder dark:border-gray-700 bg-surface dark:bg-gray-800/60 hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              {/* New badge */}
              {item.isNew && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  New
                </span>
              )}

              {/* Tag + Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-[11px] text-text-muted font-medium">{item.date}</span>
              </div>

              {/* Title */}
              <h3 className="font-heading text-sm font-bold text-text-primary dark:text-white leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Summary */}
              <p className="text-[12px] text-text-muted dark:text-gray-400 leading-relaxed flex-1">
                {item.summary}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-farmborder/50 dark:border-gray-700">
                <span className="text-[10px] text-text-muted">Dept. of Consumer Affairs</span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </article>
          ))}
        </div>

        {/* Show more / less */}
        {ANNOUNCEMENTS.length > 3 && (
          <div className="text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/40 text-primary dark:text-primary-light font-bold text-sm hover:bg-primary-pale dark:hover:bg-primary-dark/20 transition-all"
            >
              {expanded ? 'Show Less' : `See All ${ANNOUNCEMENTS.length} Announcements`}
              <ChevronRight
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
