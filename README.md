# BhoomiSetu (भूमि सेतु)
### Real-Time National Land Acquisition & Management System

> **Statutory Compliance**: The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (**RFCTLARR Act, 2013**).  
> **Nodal Agency**: Department of Land Resources (DoLR), Ministry of Rural Development, Government of India.

---

## 1. Overview & Problem Statement

**BhoomiSetu** is a unified digital platform built to digitize and monitor the end-to-end land acquisition lifecycle in India—from project proposal inception and joint cadastral surveys to Section 11 gazette notifications, Section 19 declarations, Section 23/31 compensation awards, PFMS Direct Benefit Transfer (DBT) disbursements, Section 38 land possession, and Rehabilitation & Resettlement (R&R) monitoring.

The system connects:
- **Central Ministries** (MoRTH, Ministry of Railways, MoHUA, DPIIT, Ministry of Jal Shakti)
- **State Governments** (Revenue & Disaster Management Departments)
- **District Authorities** (District Collectors, Competent Authorities & SLAOs)
- **Project Implementing Agencies (PIAs)** (NHAI, DFCCIL, NICDC, Maharail)
- **Field Surveyors & Kanungos**
- **Displaced / Affected Families & Citizens**

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                            BhumiSetu Web Client                                   |
|  React 19 + Tailwind CSS + MapLibre GL GIS + Lucide Icons + Recharts              |
|  - Role-Based Dynamic UI & Quick Stakeholder Switching                            |
|  - Real-Time GIS Parcel Polygon & Alignment Visualizer                            |
|  - Dynamic National / State / District Aggregated Metric Cards                    |
|  - Proposal Submission & Digital Scrutiny Stepper                                 |
|  - Statutory 100% Solatium Calculator & PFMS DBT Disbursement Trigger             |
|  - R&R Register, Grievance Redressal, Awards & SHA-256 Document Hub               |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ RESTful JSON APIs (/api/v1/*)
                                         ▼
+-----------------------------------------------------------------------------------+
|                             Express.js API Gateway                                |
|  - Helmet & CORS Headers, Rate Limiting, Zod Request Validation                   |
|  - JWT Authentication & Role-Based Access Control (RBAC)                          |
|  - Centralized Error Handling & Structured Audit Logging Service                  |
|  - File Upload Handler (Multer with local disk storage + S3 abstraction)          |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ Prisma ORM Client
                                         ▼
+-----------------------------------------------------------------------------------+
|                             Relational Database                                   |
|  Prisma Engine with Normalized Schema & Strategic B-Tree Indexes:                 |
|  - Users, Roles, Permissions, Sessions                                            |
|  - Projects, Milestones, Land Parcels, GeoJSON Coordinates                        |
|  - Workflows, State Transitions, Approvals, Digital Signatures                    |
|  - Awards (Sec 23/31), Compensation Records, PFMS DBT Disbursements               |
|  - Rehabilitation & Resettlement (R&R) Families & Statutory Entitlements          |
|  - Documents, Versions, SHA-256 Tamper-Evident Checksums                          |
|  - Grievances, SLA Escalations, Audit Logs, In-App Alerts                         |
|  (Dev: SQLite zero-config / Prod: PostgreSQL connection pool)                     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, MapLibre GL, Lucide React, Recharts, Motion.
- **Backend**: Node.js (v20+ / v26+), Express.js, TypeScript, TSX.
- **Database & ORM**: Prisma ORM with SQLite for instant zero-dependency local development and switchable PostgreSQL configuration for enterprise cloud deployment.
- **Security & RBAC**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), Security Headers (`helmet`), CORS (`cors`), Rate Limiting (`express-rate-limit`), Input Validation (`zod`).
- **File Management**: Multer with SHA-256 cryptographic checksum calculation and safe local storage fallback.
- **GIS / Mapping**: MapLibre GL with OpenStreetMap raster tiles, GeoJSON FeatureCollection delivery, and custom styling for statutory boundary demarcations.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Stakeholder Role | Access Level & Permitted Actions |
| :--- | :--- |
| **`SUPER_ADMIN`** | Full national administrative access; user provisioning; audit log inspection; global system configuration. |
| **`CENTRAL_MINISTRY`** | Project proposal drafting & submission; national corridor progress monitoring; budgetary tracking. |
| **`STATE_GOVERNMENT`** | State-level proposal approvals; Section 11 gazette notification clearance; inter-district review. |
| **`DISTRICT_AUTHORITY`** (LAO / Collector) | Digital scrutiny; Section 19 declaration; Section 23/31 award inquiry; PFMS DBT disbursement execution. |
| **`PIA`** (NHAI, Railways) | Alignment corridor tracking; SIA study submission; contractor coordination; document upload. |
| **`FIELD_OFFICER`** | Ground cadastral parcel survey; joint demarcation verification; grievance ground inspection. |
| **`VIEWER`** | Public transparency portal; citizen tracking of notifications, awards, and aggregated national KPIs. |

---

## 5. Pre-Seeded Demonstration Accounts

All accounts are pre-seeded with the default credential: `Bhoomi@2026`

| Role | Official Email | Designation / Department | Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@bhumisetu.gov.in` | Joint Secretary & Mission Director, DoLR | National |
| **Central Ministry** | `morth@nic.in` | Chief Engineer, MoRTH | National (Highways) |
| **Central Ministry** | `railways@nic.in` | Executive Director (Infra), Ministry of Railways | National (Railways) |
| **State Government** | `state.mh@nic.in` | Principal Secretary (Revenue), Maharashtra | Maharashtra |
| **State Government** | `state.hr@nic.in` | Director of Land Records, Haryana | Haryana |
| **District LAO** | `lao.nuh@nic.in` | District Land Acquisition Officer, Nuh | Nuh, Haryana |
| **District LAO** | `lao.pune@nic.in` | Competent Authority & SLAO, Pune | Pune, Maharashtra |
| **PIA Representative** | `pia.nhai@nic.in` | Project Director, PIU Gurugram, NHAI | Haryana Corridor |
| **Field Officer** | `field.surveyor@nic.in` | Lead Revenue Surveyor / Kanungo | Tauru Tehsil, Nuh |
| **Public Viewer** | `viewer@bhumisetu.gov.in` | Citizen Transparency Portal User | Public |

*(You can also use the **"Quick Role Switch"** in the top navigation bar to test each persona with a single click.)*

---

## 6. Complete REST API Reference

All versioned APIs are mounted under `/api/v1/*`.

### Authentication & Users
- `POST /api/v1/auth/login`: Authenticate with email and password; returns JWT token and user profile.
- `POST /api/v1/auth/register`: Register new government officer account.
- `GET /api/v1/auth/me`: Inspect active authenticated user session.
- `POST /api/v1/auth/change-password`: Update account password.
- `GET /api/v1/auth/users`: List all registered system users (restricted to `SUPER_ADMIN`).
- `POST /api/v1/auth/logout`: Invalidate session and write audit log.

### Projects & Statutory Workflow
- `GET /api/v1/projects`: List projects with filters (`state`, `district`, `ministry`, `category`, `status`, `search`).
- `GET /api/v1/projects/:id`: Get single project with milestones, parcels, awards, and workflow history.
- `POST /api/v1/projects`: Submit new project proposal with automated RFCTLARR predictive delay risk score.
- `POST /api/v1/projects/:id/workflow`: Advance statutory workflow status (`SUBMIT`, `SCRUTINIZE`, `APPROVE`, `REJECT`, `NOTIFY`, `AWARD`, `DISBURSE`, `POSSESS`, `CLOSE`).

### GIS & Land Parcels
- `GET /api/v1/parcels`: GeoJSON FeatureCollection stream filtered by state, district, or project ID for MapLibre GL.
- `GET /api/v1/parcels/list`: Tabular list of land parcels with ownership and acquisition status.
- `GET /api/v1/parcels/:idOrUlpin`: Single parcel lookup by 14-digit ULPIN or internal UUID.
- `POST /api/v1/parcels`: Register new land parcel and coordinates.

### Compensation & Direct Benefit Transfer
- `GET /api/v1/compensation`: List all compensation records with 100% solatium calculation.
- `GET /api/v1/compensation/:id`: Single compensation record.
- `POST /api/v1/compensation`: Create compensation assessment under Section 26-30.
- `POST /api/v1/compensation/:id/disburse`: Execute PFMS Direct Benefit Transfer (DBT) disbursement.

### Rehabilitation & Resettlement (R&R)
- `GET /api/v1/rnr`: List affected and displaced families with statutory entitlements (housing, employment, annuity).
- `POST /api/v1/rnr`: Register new affected family case.
- `PUT /api/v1/rnr/:id/status`: Update entitlement settlement status (`Pending`, `In Progress`, `Settled`).

### Documents & Digital Signatures
- `GET /api/v1/documents`: List gazette notices, SIA reports, and survey maps.
- `POST /api/v1/documents`: Upload document with automatic cryptographic SHA-256 checksum generation.
- `GET /api/v1/documents/:id/download`: Securely download document or statutory gazette PDF stream.
- `PUT /api/v1/documents/:id/verify`: Toggle digital verification status.

### Awards (Sec 23/31)
- `GET /api/v1/awards`: List compensation and R&R awards.
- `POST /api/v1/awards`: Draft new statutory award.
- `POST /api/v1/awards/:id/publish`: Formally publish award.

### Citizen Grievances
- `GET /api/v1/grievances`: List citizen grievances with tracking ID and priority filter.
- `POST /api/v1/grievances`: Register citizen grievance with auto-generated tracking ID.
- `PUT /api/v1/grievances/:id/status`: Update status (`Open` -> `In Progress` -> `Resolved`) with inquiry remarks.

### National Dashboard & MIS Reports
- `GET /api/v1/dashboard/kpis`: Real-time aggregated metrics (Area Notified, Area Acquired, Comp Assessed, Comp Disbursed, Families Affected, Families Settled) with dynamic state/district filtering.
- `GET /api/v1/dashboard/summary`: High, medium, and low delay risk breakdown and state distributions.
- `GET /api/v1/reports`: List generated MIS reports.
- `GET /api/v1/reports/export`: Dynamic live CSV data export (`type=projects` or `type=compensation`).
- `POST /api/v1/reports/generate`: Generate customized statutory progress report.

### Audit & Alerts
- `GET /api/v1/alerts`: Real-time SLA breach, Section 24(2) lapse risk, and approval alerts.
- `POST /api/v1/alerts/:id/read`: Mark alert as read.
- `GET /api/v1/audit`: Inspect immutable administrative audit trail (restricted to `SUPER_ADMIN`).
- `GET /health`: Health-check endpoint verifying uptime and live database connectivity.

---

## 7. Local Setup & Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Database & Push Schema
```bash
npm run db:push
```
*(Creates the local SQLite database `dev.db` with normalized relational tables and indexes).*

### Step 3: Populate Realistic Seed Data
```bash
npm run db:seed
```
*(Populates 10 users, 5 major national projects, GIS coordinates, compensation records, awards, documents, and grievances).*

### Step 4: Run Automated Verification Tests
```bash
npm test
```
*(Executes 23 automated tests across health, auth, projects, GIS, compensation, R&R, documents, reports, and audit trails).*

### Step 5: Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 8. Production Deployment Guide

### Building for Production
```bash
npm run build
```
This produces:
1. Minified and code-split frontend assets in `dist/` with PWA service worker.
2. Standalone compiled Node.js backend bundle in `dist/server.cjs`.

### Running in Production
```bash
npm start
```

### Production Environment Variables (`.env`)
```ini
NODE_ENV=production
PORT=3000

# Production PostgreSQL Connection (AWS RDS, Supabase, Neon, Cloud SQL)
DATABASE_URL="postgresql://bhumisetu_user:secure_password@db-host.internal:5432/bhumisetu?schema=public"

# Cryptographic JWT Secret (256-bit random string)
JWT_SECRET="e9f1a8c2d3b4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c"
JWT_EXPIRES_IN="24h"

# Application Base URL
FRONTEND_URL="https://bhumisetu.gov.in"
API_PREFIX="/api/v1"

# Document Storage Driver (local or s3)
STORAGE_DRIVER="s3"
S3_BUCKET="bhumisetu-production-docs"
S3_REGION="ap-south-1"
S3_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
S3_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# Optional GIS Map Provider
MAP_API_KEY=""
```

### Switching from SQLite to PostgreSQL in Production
To switch from SQLite to PostgreSQL for high-concurrency national deployments:
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Run migration:
   ```bash
   npx prisma migrate deploy
   ```

---

## 9. External Government Systems Integration

The platform includes clean, configurable adapter interfaces under `src/server/routes/integrations.ts` for future government interoperability:

1. **State Land Records RoR Gateways (Bhulekh / Bhoomi / Dharani)**:
   - Endpoint: `GET /api/v1/integrations/verify-ulpin/:ulpin`
   - Validates the 14-digit Unique Land Parcel Identification Number against state registries.
   - Configurable via `LAND_RECORDS_API_URL`.
2. **PFMS Direct Benefit Transfer (DBT)**:
   - Automated electronic escrow transfer directly to beneficiary bank accounts under Section 77.
   - Configurable via `PFMS_API_URL` and `PFMS_CLIENT_ID`.
3. **NIC Bhunaksha / Survey of India Cadastral GIS**:
   - WMS/WFS map streaming adapter for cadastral village boundary overlays.
   - Configurable via `BHUNAKSHA_WMS_URL`.

---

## 10. License & Attribution
Designed for digital public infrastructure in land governance under Apache License 2.0.
