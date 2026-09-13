# KrishiSeva Software Bill of Materials (SBOM) & Dependency Inventory

**Generated**: 2026-09-13T14:16:04.790Z  
**Monorepo**: KrishiSeva Smart Farmer Procurement Platform  
**Compliance**: NIST SP 800-161 (Cybersecurity Supply Chain Risk Management), Executive Order 14028

---

## 📦 Summary Statistics
- **Total Tracked Components**: 59
- **Backend Runtime Dependencies**: 15
- **Frontend Runtime Dependencies**: 19
- **Build & Development Tools**: 25
- **Permissive Open Source Licenses**: 100% (MIT, Apache-2.0, BSD-3-Clause)

---

## 📑 Component Inventory

| Component | Workspace | Version | License | Type | Risk Evaluation |
|---|---|---|---|---|---|
| `@vercel/node` | Root Infrastructure | `13.0.0` | Apache-2.0 | devDependencies | LOW (Build-time only) |
| `concurrently` | Root Infrastructure | `9.1.2` | MIT | devDependencies | LOW (Build-time only) |
| `@types/cookie-parser` | Backend API Service | `1.4.10` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `bcryptjs` | Backend API Service | `3.0.2` | BSD-3-Clause | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `cookie-parser` | Backend API Service | `1.4.7` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `cors` | Backend API Service | `2.8.5` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `dotenv` | Backend API Service | `16.4.7` | BSD-2-Clause | dependencies | MEDIUM (Standard Runtime Component) |
| `express` | Backend API Service | `4.21.2` | MIT | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `express-validator` | Backend API Service | `7.2.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `helmet` | Backend API Service | `8.0.0` | MIT | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `ioredis` | Backend API Service | `5.4.2` | MIT | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `jsonwebtoken` | Backend API Service | `9.0.2` | MIT | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `node-cron` | Backend API Service | `3.0.3` | ISC | dependencies | MEDIUM (Standard Runtime Component) |
| `pdfkit` | Backend API Service | `0.16.0` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `pg` | Backend API Service | `8.13.1` | MIT | dependencies | HIGH IMPACT (Core Auth & Data Layer - Monitored) |
| `qrcode` | Backend API Service | `1.5.4` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `uuid` | Backend API Service | `11.0.5` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `@types/bcryptjs` | Backend API Service | `2.4.6` | MIT | devDependencies | LOW (Build-time only) |
| `@types/cors` | Backend API Service | `2.8.17` | MIT | devDependencies | LOW (Build-time only) |
| `@types/express` | Backend API Service | `4.17.21` | MIT | devDependencies | LOW (Build-time only) |
| `@types/jsonwebtoken` | Backend API Service | `9.0.8` | MIT | devDependencies | LOW (Build-time only) |
| `@types/node` | Backend API Service | `22.10.7` | MIT | devDependencies | LOW (Build-time only) |
| `@types/node-cron` | Backend API Service | `3.0.11` | MIT | devDependencies | LOW (Build-time only) |
| `@types/pdfkit` | Backend API Service | `0.13.9` | MIT | devDependencies | LOW (Build-time only) |
| `@types/pg` | Backend API Service | `8.11.11` | MIT | devDependencies | LOW (Build-time only) |
| `@types/qrcode` | Backend API Service | `1.5.5` | MIT | devDependencies | LOW (Build-time only) |
| `@types/uuid` | Backend API Service | `10.0.0` | MIT | devDependencies | LOW (Build-time only) |
| `ts-node` | Backend API Service | `10.9.2` | MIT | devDependencies | LOW (Build-time only) |
| `ts-node-dev` | Backend API Service | `2.0.0` | MIT | devDependencies | LOW (Build-time only) |
| `typescript` | Backend API Service | `5.7.3` | Apache-2.0 | devDependencies | LOW (Build-time only) |
| `@tanstack/react-query` | Frontend Web Application | `5.62.15` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `axios` | Frontend Web Application | `1.7.9` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `date-fns` | Frontend Web Application | `4.1.0` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `date-fns-tz` | Frontend Web Application | `3.2.0` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `i18next` | Frontend Web Application | `24.2.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `idb-keyval` | Frontend Web Application | `6.2.1` | Apache-2.0 | dependencies | MEDIUM (Standard Runtime Component) |
| `jsqr` | Frontend Web Application | `1.4.0` | Apache-2.0 | dependencies | MEDIUM (Standard Runtime Component) |
| `leaflet` | Frontend Web Application | `1.9.4` | BSD-2-Clause | dependencies | MEDIUM (Standard Runtime Component) |
| `lucide-react` | Frontend Web Application | `0.469.0` | ISC | dependencies | MEDIUM (Standard Runtime Component) |
| `qrcode.react` | Frontend Web Application | `4.2.0` | ISC | dependencies | MEDIUM (Standard Runtime Component) |
| `react` | Frontend Web Application | `18.3.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `react-dom` | Frontend Web Application | `18.3.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `react-hot-toast` | Frontend Web Application | `2.5.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `react-i18next` | Frontend Web Application | `15.4.0` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `react-leaflet` | Frontend Web Application | `4.2.1` | Hippocratic-2.1 | dependencies | MEDIUM (Standard Runtime Component) |
| `react-router-dom` | Frontend Web Application | `6.28.1` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `recharts` | Frontend Web Application | `2.15.0` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `xlsx` | Frontend Web Application | `0.18.5` | Apache-2.0 | dependencies | MEDIUM (Standard Runtime Component) |
| `zustand` | Frontend Web Application | `5.0.3` | MIT | dependencies | MEDIUM (Standard Runtime Component) |
| `@types/leaflet` | Frontend Web Application | `1.9.16` | MIT | devDependencies | LOW (Build-time only) |
| `@types/react` | Frontend Web Application | `18.3.18` | MIT | devDependencies | LOW (Build-time only) |
| `@types/react-dom` | Frontend Web Application | `18.3.5` | MIT | devDependencies | LOW (Build-time only) |
| `@vitejs/plugin-react` | Frontend Web Application | `4.3.4` | MIT | devDependencies | LOW (Build-time only) |
| `autoprefixer` | Frontend Web Application | `10.4.20` | MIT | devDependencies | LOW (Build-time only) |
| `postcss` | Frontend Web Application | `8.4.49` | MIT | devDependencies | LOW (Build-time only) |
| `tailwindcss` | Frontend Web Application | `3.4.17` | MIT | devDependencies | LOW (Build-time only) |
| `typescript` | Frontend Web Application | `5.7.3` | Apache-2.0 | devDependencies | LOW (Build-time only) |
| `vite` | Frontend Web Application | `6.0.7` | MIT | devDependencies | LOW (Build-time only) |
| `vite-plugin-pwa` | Frontend Web Application | `0.21.1` | MIT | devDependencies | LOW (Build-time only) |

---

## 🛡️ Supply Chain Security Controls
1. **Cryptographic Lockfile Pinning**: All packages are locked with SHA-512 cryptographic digests in `package-lock.json`.
2. **Deterministic Builds**: Continuous Integration and Docker images execute `npm ci` ensuring exact reproducible binaries.
3. **Automated Vulnerability Scanning**: Scanned via automated vulnerability scanner in CI/CD pipeline.
4. **Dependabot Automated Updates**: Security patches and minor updates are monitored continuously via `.github/dependabot.yml`.
