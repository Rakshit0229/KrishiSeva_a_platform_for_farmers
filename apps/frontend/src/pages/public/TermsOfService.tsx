import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Scale,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building,
  UserCheck
} from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950 text-text-primary dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-light hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to KrishiSeva
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-gold/15 text-earth-brown dark:text-gold font-bold border border-gold/30">
            Official Government Terms · DoCA
          </span>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-gold-light" /> National MSP Terms & Service Level Agreement (SLA)
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold">
            Terms of Service & Farmer Protection Charter
          </h1>
          <p className="text-xs sm:text-sm text-primary-pale max-w-2xl leading-relaxed">
            Department of Consumer Affairs, Government of India. These terms govern your use of the KrishiSeva platform, guaranteed mandi slot allocations, digital weighbridge standards, and statutory 72-hour Direct Benefit Transfer (DBT) commitments.
          </p>
          <div className="pt-2 text-[11px] text-white/70">
            Effective Date: <strong>September 2026</strong> · Reg. No. DoCA/KS/2026/TOS-1
          </div>
        </div>

        {/* 1. ELIGIBILITY & REGISTRATION */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <UserCheck className="w-5 h-5" />
            <h2>1. Farmer Eligibility & Transparent Registration</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            KrishiSeva is a sovereign, non-profit digital public infrastructure provided to all agricultural producers, tenant farmers, and registered Farmer Producer Organisations (FPOs) across India:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-muted list-disc list-inside">
            <li><strong>Zero Cost of Access:</strong> No subscription, convenience charge, or commission may ever be levied on farmers for booking mandi slots or downloading procurement receipts.</li>
            <li><strong>Aadhaar e-KYC Verification:</strong> Verification is conducted strictly via OTP authentication or designated CSC biometric kiosks. Storing raw biometrics or 12-digit numbers is strictly prohibited by law.</li>
            <li><strong>FPO Collective Bookings:</strong> Registered FPOs are entitled to reserve convoy slots for aggregate harvests up to 500 Quintals per batch.</li>
          </ul>
        </div>

        {/* 2. GUARANTEED 72-HOUR DIRECT BENEFIT TRANSFER */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2>2. Statutory 72-Hour Payment Guarantee (PFMS DBT)</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Under the Department of Consumer Affairs Procurement SLA:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">Immediate Digital Procurement Certificate</span>
              <p className="text-text-muted">
                As soon as your produce passes electronic weighbridge and moisture checks, an immutable cryptographically sealed receipt is issued to your mobile phone.
              </p>
            </div>
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">Direct Bank Credit within 72 Hours</span>
              <p className="text-text-muted">
                Funds are disbursed directly via PFMS into your Aadhaar-linked bank account. If delayed beyond 72 hours, interest accrues at statutory RBI repo rates.
              </p>
            </div>
          </div>
        </div>

        {/* 3. WEIGHBRIDGE FAIRNESS & ANTI-TAMPERING */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Scale className="w-5 h-5 text-gold" />
            <h2>3. Certified Electronic Weighing & Fair Grading</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            All weighbridge telemetry is directly connected to state cloud servers via TLS 1.3 encrypted telemetry. Manual weigh slips or pencil alteration of moisture levels by middlemen constitutes a punishable offense under the Essential Commodities Act.
          </p>
        </div>

        {/* 4. DISPUTE RESOLUTION & GRIEVANCE REDRESSAL */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2>4. 72-Hour Grievance Redressal SLA</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Every ticket submitted via the <Link to="/help" className="text-primary font-semibold underline">Grievance Portal</Link> or the 24/7 Kisan Toll-Free Helpline (1800-180-1551) must be resolved by the designated APMC Nodal Officer within 72 hours.
          </p>
        </div>

        {/* Footer Contact */}
        <div className="p-6 rounded-3xl bg-surface-2 dark:bg-gray-900 border border-farmborder space-y-2 text-xs text-text-muted">
          <h3 className="font-bold text-sm text-text-primary dark:text-white">
            Statutory Legal Jurisdiction
          </h3>
          <p>
            These terms are governed by the laws of India and fall under the exclusive jurisdiction of the Courts of New Delhi.
          </p>
          <p className="text-[11px] text-gray-500">
            For inquiries regarding terms, contact legal@krishiseva.gov.in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
