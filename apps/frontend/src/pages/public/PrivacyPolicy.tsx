import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Trash2,
  Clock,
  Building,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950 text-text-primary dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-light hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to KrishiSeva
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-light font-bold border border-primary/20">
            DPDP Act 2023 Compliant
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/25 border border-gold/40 text-gold-light text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Digital Personal Data Protection
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="text-xs sm:text-sm text-primary-pale max-w-2xl leading-relaxed">
            Department of Consumer Affairs, Government of India. This policy explains how we collect, protect, process, and retain personal data of farmers and officers under the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
          <div className="pt-2 text-[11px] text-white/70">
            Last Updated & Verified: <strong>September 2026</strong> · Version 2.4 (Enterprise Cryptographic Edition)
          </div>
        </div>

        {/* 1. PURPOSE SPECIFICATION & DATA MINIMIZATION */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Eye className="w-5 h-5" />
            <h2>1. Personal Data Collection & Purpose Limitation</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            In compliance with the principle of <strong>Data Minimization</strong>, KrishiSeva collects only the strictly necessary information required to schedule mandi intake, verify grain weight, and disburse MSP payments via direct bank transfer (PFMS DBT):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-surface-2 dark:bg-gray-800/60 border border-farmborder space-y-1.5">
              <span className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" /> Farmer Identity
              </span>
              <p className="text-xs text-text-muted">
                <strong>Collected:</strong> Full Name, Mobile Number, Village, District, State.
              </p>
              <p className="text-[11px] text-text-muted">
                <strong>Purpose:</strong> Issuing digital queue tokens, SMS alerts, and mandi entry authentication.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-2 dark:bg-gray-800/60 border border-farmborder space-y-1.5">
              <span className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary" /> Banking & PFMS DBT
              </span>
              <p className="text-xs text-text-muted">
                <strong>Collected:</strong> Bank Name, Account Last 4 Digits, IFSC Code.
              </p>
              <p className="text-[11px] text-text-muted">
                <strong>Purpose:</strong> Direct benefit transfer within 72 hours. Stored with <strong>AES-256-GCM</strong> encryption.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-2 dark:bg-gray-800/60 border border-farmborder space-y-1.5">
              <span className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Land & Crop Records
              </span>
              <p className="text-xs text-text-muted">
                <strong>Collected:</strong> Land area (acres), Crop species, Aadhaar Last 4 digits only.
              </p>
              <p className="text-[11px] text-text-muted">
                <strong>Note:</strong> We never store 12-digit Aadhaar numbers or biometric templates.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-2 dark:bg-gray-800/60 border border-farmborder space-y-1.5">
              <span className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" /> Weighbridge Telemetry
              </span>
              <p className="text-xs text-text-muted">
                <strong>Collected:</strong> Gross & tare weight, moisture %, token timestamp.
              </p>
              <p className="text-[11px] text-text-muted">
                <strong>Purpose:</strong> Cryptographically signed procurement receipts and grievance resolution.
              </p>
            </div>
          </div>
        </div>

        {/* 2. SECURITY SAFEGUARDS & ENCRYPTION */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Lock className="w-5 h-5" />
            <h2>2. Technical & Cryptographic Safeguards</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-text-muted">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Encryption at Rest (AES-256-GCM):</strong> Sensitive fields like bank accounts and IFSC codes are encrypted using authenticated hardware-grade AES-256 with distinct IVs per record.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Encryption in Transit (TLS 1.3 & HSTS):</strong> All communications are forced through TLS 1.3 with Strict-Transport-Security (max-age: 1 year, preload).
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Zero Password Exposure:</strong> Passwords are protected using Bcrypt with 12 salt rounds, combined with 5-attempt account lockout defenses.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Deep Antivirus & Magic Byte Scanning:</strong> Uploaded grain photography is scanned against malware signatures and verified with binary magic bytes.
              </p>
            </div>
          </div>
        </div>

        {/* 3. DATA RETENTION SCHEDULE */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clock className="w-5 h-5" />
            <h2>3. Automated Data Retention & Deletion Timetable</h2>
          </div>
          <p className="text-xs text-text-muted">
            Our automated data retention lifecycle engine purges expired data according to strict statutory retention schedules:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 dark:bg-gray-800 text-text-primary dark:text-white uppercase text-[10px] tracking-wider border-b border-farmborder">
                <tr>
                  <th className="py-2.5 px-3">Data Category</th>
                  <th className="py-2.5 px-3">Retention Period</th>
                  <th className="py-2.5 px-3">Action at Expiration</th>
                  <th className="py-2.5 px-3">Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-farmborder/60 text-text-muted">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-text-primary dark:text-white">Active Login Sessions</td>
                  <td className="py-2.5 px-3">24 Hours</td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Hard Purged</td>
                  <td className="py-2.5 px-3">Session Security</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-text-primary dark:text-white">Password Reset Tokens</td>
                  <td className="py-2.5 px-3">15 Minutes</td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Hard Purged</td>
                  <td className="py-2.5 px-3">OWASP Authentication</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-text-primary dark:text-white">Sensitive Action Confirmations</td>
                  <td className="py-2.5 px-3">5 Minutes</td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Hard Purged</td>
                  <td className="py-2.5 px-3">Replay Defense</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-text-primary dark:text-white">Procurement & DBT Invoices</td>
                  <td className="py-2.5 px-3">7 Years</td>
                  <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Archived for CAG Audit</td>
                  <td className="py-2.5 px-3">Public Finance Act</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-text-primary dark:text-white">Deactivated Accounts</td>
                  <td className="py-2.5 px-3">30 Days Grace</td>
                  <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">Anonymized (PII Redacted)</td>
                  <td className="py-2.5 px-3">DPDP Act Erasure</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FARMER RIGHTS (DATA PRINCIPAL RIGHTS) */}
        <div className="card-farm space-y-4 bg-white dark:bg-gray-900 border border-farmborder">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h2>4. Your Rights as a Data Principal (Farmer Rights)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">1. Right to Access & Transparency</span>
              <p className="text-text-muted">
                View your complete profile and inspect who has accessed your records at any time under <code>/farmer/access-logs</code>.
              </p>
            </div>
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">2. Right to Correction & Update</span>
              <p className="text-text-muted">
                Update bank accounts, land area, or contact phone numbers seamlessly via your Kisan Profile.
              </p>
            </div>
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">3. Right to Erasure (Account Deletion)</span>
              <p className="text-text-muted">
                Trigger irreversible account deactivation in your profile danger zone. Your PII is scrubbed and sessions terminated.
              </p>
            </div>
            <div className="p-3 bg-surface-2 dark:bg-gray-800 rounded-xl border border-farmborder space-y-1">
              <span className="font-bold text-text-primary dark:text-white block">4. Right to Grievance Redressal</span>
              <p className="text-text-muted">
                File data protection or procurement disputes with a guaranteed 72-hour maximum resolution SLA.
              </p>
            </div>
          </div>
        </div>

        {/* 5. GRIEVANCE & DPO CONTACT */}
        <div className="p-6 rounded-3xl bg-surface-2 dark:bg-gray-900 border border-farmborder space-y-2 text-xs text-text-muted">
          <h3 className="font-bold text-sm text-text-primary dark:text-white">
            Data Protection Officer (DPO) Contact Details
          </h3>
          <p>
            For inquiries, consent withdrawals, or privacy rights enforcement under the DPDP Act 2023, contact:
          </p>
          <div className="space-y-0.5 font-mono text-[11px] text-primary dark:text-primary-light">
            <p><strong>Grievance & Data Protection Officer:</strong> Sh. R. K. Verma, Dy. Secretary (IT & Security)</p>
            <p><strong>Department:</strong> Ministry of Consumer Affairs, Food & Public Distribution, New Delhi</p>
            <p><strong>Email:</strong> dpo-krishiseva@gov.in · <strong>National Kisan Helpline:</strong> 1800-180-1551</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
