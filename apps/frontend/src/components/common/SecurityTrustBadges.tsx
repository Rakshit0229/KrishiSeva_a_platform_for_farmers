import React from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Building,
  Award,
  CreditCard,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const SecurityTrustBadges: React.FC = () => {
  return (
    <section className="py-12 bg-surface-2 dark:bg-gray-950 border-t border-farmborder/80 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Government Accreditations
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">
            Enterprise Security & Trust Accreditations
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            End-to-end cryptographic integrity certified by the Ministry of Electronics & IT and statutory banking authorities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Badge 1: SSL / TLS 1.3 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-text-primary dark:text-white">256-Bit TLS 1.3 SSL</h3>
            <p className="text-[11px] text-text-muted">Hardware-enforced encryption in transit with HSTS preload</p>
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full mt-auto">
              A+ Rating
            </span>
          </div>

          {/* Badge 2: PFMS DBT Gateway */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-text-primary dark:text-white">PFMS / NPCI DBT</h3>
            <p className="text-[11px] text-text-muted">Direct benefit transfer with zero middleman bank accounts</p>
            <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-auto">
              NPCI Certified
            </span>
          </div>

          {/* Badge 3: DPDP Act 2023 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-text-primary dark:text-white">DPDP Act 2023</h3>
            <p className="text-[11px] text-text-muted">Statutory privacy rights, strict consent, and 24-hr session purge</p>
            <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full mt-auto">
              Privacy Audited
            </span>
          </div>

          {/* Badge 4: STQC / MeitY */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-text-primary dark:text-white">STQC & CERT-In</h3>
            <p className="text-[11px] text-text-muted">Standardised Testing and Quality Certification compliance</p>
            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-auto">
              MeitY Verified
            </span>
          </div>

          {/* Badge 5: 72-Hour SLA */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder dark:border-gray-800 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-primary/50 transition-all col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-earth-brown dark:text-gold flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-text-primary dark:text-white">72h SLA Guarantee</h3>
            <p className="text-[11px] text-text-muted">Guaranteed payment transfer and grievance resolution window</p>
            <span className="text-[9px] font-bold text-gold-dark dark:text-gold bg-gold/15 px-2 py-0.5 rounded-full mt-auto">
              Farmer Promise
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
