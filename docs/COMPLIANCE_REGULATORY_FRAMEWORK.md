# KrishiSeva Compliance & Regulatory Framework
**Applicable Legal & Statutory Standards for Agricultural Procurement Platform**
*Last Updated: September 2026 | Document ID: KS-COMP-2026-V1*

---

## 1. Executive Summary & Purpose
KrishiSeva operates as a high-security National Agricultural Procurement and Minimum Support Price (MSP) disbursement engine. Because it processes Indian farmer identities, land records, banking information (PFMS), and digital weighbridge transactions, KrishiSeva is classified as a **Significant Data Fiduciary (SDF)** under Indian law and adheres to strict cross-jurisdictional privacy and security directives.

---

## 2. Applicable Statutory & Regulatory Regimes

| Regulation / Statute | Jurisdiction | Applicability & Scope | Implementation in KrishiSeva |
| :--- | :--- | :--- | :--- |
| **Digital Personal Data Protection (DPDP) Act, 2023** | India (National) | Primary statutory compliance governing collection, processing, and retention of digital personal data. | • Notice & explicit consent before collection
• Purpose limitation & storage limitation
• Data Principal rights (Access, Erasure, Correction)
• Designated Data Protection Officer (DPO)
• Field-level AES-256-GCM encryption |
| **Aadhaar Act, 2016 & UIDAI Regulations** | India (National) | Governing collection, verification, and masking of 12-digit Aadhaar numbers. | • Zero plain-text Aadhaar storage in database
• Strict PII masking displaying only last 4 digits (XXXXXXXX1234)
• Cryptographic hashing with HMAC-SHA256 for duplicate detection |
| **Information Technology Act, 2000 & IT Rules, 2021** | India (National) | Intermediary guidelines, cybersecurity incident reporting (CERT-In within 6 hours), and encryption standards. | • Immutable audit logging for security events
• End-to-end TLS 1.3 encryption
• CERT-In incident escalation SLA runbooks |
| **General Data Protection Regulation (GDPR)** | Global / EU Benchmark | Benchmark standards for data minimization, privacy-by-design, and cross-border security controls. | • Strict data minimization (only collecting fields required for mandi procurement)
• Right to be forgotten automated purge routines
• Breach notification procedures within 72 hours |
| **California Consumer Privacy Act (CCPA / CPRA)** | International Benchmark | Privacy transparency, non-discrimination, and 'Do Not Sell or Share My Personal Info'. | • Zero data monetization or third-party ad sharing
• Dedicated Data Privacy Rights portal |
| **PFMS & RBI Cyber Security Framework** | India (Banking) | Direct Benefit Transfer (DBT) and direct bank account transfers for MSP payments. | • Strict parameterization for all payment endpoints
• Dual-authorization for MSP funds release
• Reconciliation audit trail with cryptographic signatures |

---

## 3. Data Classification Matrix

| Data Category | Examples | Sensitivity Level | Encryption at Rest | Encryption in Transit | Access Controls |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Personally Identifiable Information (PII)** | Farmer Name, Phone Number, Father's Name, Village Address | High | AES-256-GCM (Ciphertext) | TLS 1.3 / HTTPS | Role-Based Access Control (RBAC) + Audit Logging |
| **Sensitive Financial Data** | Bank Account Number, IFSC Code, PFMS Transaction IDs | Critical | AES-256-GCM with separate key derivation | TLS 1.3 / HTTPS | Restricted to Payment Officer / Farmer self-view with audit |
| **Government Identity** | Aadhaar Number, Land Ownership Khasra/Khatauni IDs | Critical | Masked (XXXX-XXXX-1234) + Encrypted | TLS 1.3 / HTTPS | UIDAI e-KYC compliant tokenization |
| **Agricultural Operational Data** | Crop Type, Moisture %, Bag Count, Gross/Tare Weight | Medium | Standard encrypted tablespace | TLS 1.3 / HTTPS | Mandi Weighbridge Operator, Centre Incharge, Farmer |
| **Public Reference Data** | MSP Rates, Mandi Geolocation, Operating Hours | Low (Public) | Standard tablespace | TLS 1.3 / HTTPS | Publicly readable |

---

## 4. Statutory Consent & Data Principal Rights Lifecycle
Under Section 6 of the DPDP Act 2023:
1. **Notice & Consent**: Every farmer is presented with clear, multilingual notice specifying exactly why data is collected (Mandi slot reservation, DBT payment credit).
2. **Right to Withdraw Consent**: Farmers can revoke consent at any time via POST /api/v1/auth/consent/withdraw, which triggers automatic session invalidation and data anonymization flags.
3. **Right to Correction**: Seamless self-service update of contact information and banking details with Aadhaar OTP re-verification.
4. **Right to Grievance Redressal**: Statutory DPO contact embedded in all portal footers with a 48-hour response SLA.
