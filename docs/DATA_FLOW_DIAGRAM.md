# KrishiSeva Comprehensive Data Flow & Trust Architecture (DFD)
**Level 0 to Level 2 Data Flow Architecture & Trust Boundaries**
*Document ID: KS-ARCH-DFD-2026-V1*

---

## 1. High-Level Data Flow (Level 0 Context Diagram)

`
       [ Farmer / Mandi Officer / Public ]
                      |
                      |  HTTPS / TLS 1.3 (TCP 443)
                      v
         [ Cloudflare DDoS & WAF Shield ]
                      |
                      |  Strict Origin Pull
                      v
            [ Nginx Reverse Proxy ]
         (CORS, CSP, Rate Limiting, ModSecurity)
                      |
                      |  Reverse Proxy Forward
                      v
         [ KrishiSeva Node.js API Gateway ]
  (Auth, CSRF, Input Validation, Role Guards, SQL Check)
         /            |             \
        /             |              \
       v              v               v
 [ PostgreSQL DB ] [ Redis Cache ] [ AI Inference / Guardrails ]
 (AES-256-GCM      (Session Cache) (Field Advisory Engine)
  Field Encryption)
       |
       |  Encrypted Micro-Tunnel
       v
 [ National Govt Gateways ]
 (PFMS DBT, UIDAI Aadhaar, AgriStack, SMS DLT)
`

---

## 2. Detailed Data Flow & Security Controls (Level 1 DFD)

### Process 1: Farmer Authentication & Consent Intake
1. **Input**: Farmer submits phone number, password/OTP, and explicit statutory consent (	erms_accepted: true, privacy_policy_version: "2026.1").
2. **Transport**: Transmitted over TLS 1.3 encrypted tunnel.
3. **Gateway Inspection**:
   - ipFirewall: Checks IP against rate limits and known malicious subnets.
   - detectSqlInjection: Scans input strings against SQLi patterns.
   - uthRateLimiter: Enforces maximum 5 attempts per 15-minute window.
4. **Processing**:
   - Password verified using Bcrypt (cost factor 12).
   - Informed consent record stamped with client IP, user agent, and timestamp.
   - Signed JWT generated with 15-minute expiration and RTR refresh token.
5. **Storage**: User and consent stored with timestamp in user_consents repository.

### Process 2: Digital Weighbridge & Grain Moisture Inspection
1. **Input**: Gross weight, Tare weight, and moisture sensor reading transmitted from Mandi IoT weighbridge.
2. **Authentication**: Weighbridge terminal authenticated via cryptographically hashed X-Weighbridge-Key.
3. **Data Protection**:
   - Quality inspection recorded with tamper-proof SHA-256 hash.
   - Moisture values checked against Fair Average Quality (FAQ) norms (e.g. Wheat <= 12%).
4. **Output**: Instant electronic J-Form generated with verifiable digital QR code.

### Process 3: Direct Benefit Transfer (DBT) MSP Disbursement
1. **Trigger**: Mandi Officer finalizes procurement receipt.
2. **Encryption Boundary**:
   - Bank Account and IFSC retrieved from PostgreSQL.
   - Decrypted in-memory using AES-256-GCM with authenticated tags.
   - Immediate redaction from application log streams.
3. **Transmission**: Pushed over mTLS tunnel to Public Financial Management System (PFMS).
4. **Audit Trail**: Action logged in immutable udit_logs as PAYMENT_DBT_DISPATCHED.

---

## 3. Trust Boundaries & Cryptographic Enclaves

| Boundary ID | Source Entity | Target Entity | Protocol | Security Controls Applied |
| :--- | :--- | :--- | :--- | :--- |
| **TB-01** | Public Internet (Farmer Browser / App) | Cloudflare / Nginx WAF | HTTPS / TLS 1.3 | WAF rules, DDoS mitigation, CSP, HSTS |
| **TB-02** | Nginx Reverse Proxy | Express API Engine | Internal HTTP | Network isolation (db_net), loopback binding |
| **TB-03** | Express API Engine | PostgreSQL 16 Database | TCP 5432 + TLS | AES-256-GCM field encryption, 10s statement timeout |
| **TB-04** | Express API Engine | Redis Cluster | TCP 6379 (AUTH) | In-memory token store, automatic TTL expiration |
| **TB-05** | Express API Engine | External Gateways (PFMS, UIDAI) | mTLS / HTTPS | Strict IP whitelisting, payload signature verification |
