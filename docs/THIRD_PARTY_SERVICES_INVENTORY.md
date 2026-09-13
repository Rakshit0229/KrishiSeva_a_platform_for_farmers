# KrishiSeva Third-Party Vendor & Upstream Services Inventory
**Comprehensive Security Implications, SOC2/ISO Certifications & Risk Assessments**
*Document ID: KS-SEC-VENDORS-2026-V1*

---

## 1. Third-Party Vendor Assessment Matrix

| Vendor / Service Name | Role & Purpose | Data Shared | Security Certification / Status | Risk Level | Data Residency | Contingency / Fallback Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PFMS (Public Financial Management System)** | Direct Benefit Transfer (DBT) MSP disbursements directly to bank accounts | Beneficiary Name, Encrypted Bank Account, IFSC, Aadhaar Hash, Payment Amount | NIC / MeitY Certified, ISO 27001 | High (Financial) | India (MeitY Data Centres) | Offline batch processing queue + automatic retry schedule |
| **UIDAI (Unique Identification Authority of India)** | Farmer demographic e-KYC and identity verification | 12-digit Aadhaar (masked), OTP, Name, DOB | Statutory Body, ISO 27001, MeitY Empanelled | High (Identity) | India (UIDAI Data Centres) | DigiLocker document fallback or physical verification by Mandi Incharge |
| **AgriStack / PM-KISAN API** | Verification of farmer landholding records and crop sown data | Farmer ID, State, District, Khasra/Khatauni land parcel numbers | Ministry of Agriculture & Farmers Welfare, NIC Cloud | Medium | India (NIC Cloud) | State land portal integration (Bhulekh / Dharani / AnyRoR) |
| **IMD (India Meteorological Department)** | Hyperlocal weather forecasts and rainfall alerts for mandi operations | Mandi Lat/Long coordinates (no PII) | Open Government Data (OGD) Platform | Low | India | Cached 6-hour weather forecasts in Redis |
| **OpenStreetMap & Leaflet Tiles** | Interactive mandi geolocation map and driving directions for farmers | Centre Lat/Long coordinates (no PII) | Open Source / CDN | Low | Distributed CDN | Local fallback tiles cached in application static assets |
| **Govt DLT SMS Gateway (CDAC / NIC)** | Transactional SMS notifications (Tokens, Weighbridge Receipts, DBT updates) | Farmer Phone Number, Transaction Reference | TRAI DLT Compliant, ISO 27001 | Medium (Communication) | India | In-app notification center and WhatsApp notification fallback |

---

## 2. Supply Chain & Vendor Risk Review Lifecycle
1. **Annual Security Audits**: Third-party integrations are subjected to annual penetration tests and API contract audits.
2. **Zero Plaintext PII Sharing**: Sensitive financial parameters are never transmitted in clear text; all inter-service payloads are hashed or encrypted using authenticated AES-256-GCM / TLS 1.3.
3. **Strict Outbound Egress Rules**: Docker and Kubernetes network policies restrict outbound egress exclusively to authorized government gateway endpoints.
4. **Emergency Vendor Kill-Switch**: Each third-party integration is wrapped in a configurable circuit breaker allowing instant isolation in case of upstream compromise.
