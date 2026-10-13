# CGL Operations & CMS Control Hub

A centralized enterprise administration portal designed for **Creative Geotechnical Laboratories (CGL)** management, engineering dispatchers, and content controllers.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, this system manages the entire operational lifecycle of the public platform — from procurement quote triage and real-time project updates to laboratory equipment fleet tracking and corporate settings.

---

## Functional Scope & Operational Modules

### 1. RFQ & Procurement Inquiries (`/dashboard/rfqs`)
- Real-time stream of inbound engineering requests from contractors and developers.
- Structured breakdown of borehole quantities, soil testing criteria, site coordinates, and attached tender documents.
- Multi-state workflow management (`New`, `Under Review`, `Quoted`, `Archived`).

### 2. Engineering Projects & Case Studies (`/dashboard/projects`)
- Bilingual project creation and curation (Arabic & English).
- Geotagging, client attribution, contract scope, and testing evidence imagery.
- Multi-image gallery uploads powered by Cloudflare R2 object storage.

### 3. Equipment & Laboratory Fleet (`/dashboard/equipment`)
- Comprehensive registry of drilling rigs, static/dynamic pile load testing equipment, and NDT apparatus.
- Detailed technical specification parameters, calibration records, and operational statuses.

### 4. Technical Publications & Articles (`/dashboard/news`)
- Publishing portal for geotechnical insights, SBC compliance updates, and field innovations.
- Bilingual rich text editing, publication date scheduling, and featured status toggles.

### 5. Services & Hero Media Suite (`/dashboard/services` & `/dashboard/hero`)
- Full control over active service offerings, icons, and descriptions.
- Dynamic hero carousel manager with display order sorting and background media optimization.

### 6. Corporate Configuration & Theme Control (`/dashboard/settings`)
- Synchronization of official phone numbers, WhatsApp dispatch lines, email addresses, and headquarters coordinates.
- **Light Mode Availability Switch**: Administrator-controlled toggle governing whether the public website allows visitors to switch to the Sokari light theme or locks to the Obsidian dark theme.

### 7. User Access & Role-Based Control (`/dashboard/users`)
- Administration user provisioning and credential revocation.
- Enforced session lifecycle monitoring.

---

## Security Architecture

- **Session Hardening & Auto-Logout**: Strict **2-hour session inactivity timeout** policy. When the session expires, administrative tokens are invalidated, requiring credential re-entry to prevent unauthorized workstation hijacking.
- **Protected Edge Routing**: Next.js proxy middleware intercepting unauthenticated access attempts and redirecting to `/login` with clean query return state.
- **Privileged Firestore Operations**: Server-side mutation routes isolated via `firebaseAdmin.ts` service accounts, ensuring public clients cannot bypass validation rules.
- **Payload Sanitization & Size Constraints**: Cloudflare R2 presigned upload validation restricting file types (JPEG, PNG, WebP) and maximum payload limits.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.3+](https://nextjs.org/) (App Router, Server Actions, API Routes) |
| **Runtime & Language** | [React 19](https://react.dev/), [TypeScript 5+](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with Custom Admin Palette |
| **Database & Identity** | [Google Cloud Firestore](https://firebase.google.com/), Firebase Authentication |
| **Media Pipeline** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) / AWS S3 SDK v3 |
| **Icons & Indicators** | [Lucide React](https://lucide.dev/) |

---

## Directory Architecture

```text
cgl-admin/
├── public/
│   ├── assets/              # Administrative branding and status markers
│   └── favicon.ico          # Dashboard favicons
├── src/
│   ├── app/
│   │   ├── api/             # Secure RESTful mutation endpoints
│   │   │   ├── auth/        # Login verification, session issuance, and revocation
│   │   │   ├── equipment/   # Fleet CRUD handlers
│   │   │   ├── hero/        # Slide sequencing handlers
│   │   │   ├── news/        # Publication CRUD handlers
│   │   │   ├── partners/    # Commercial partner handlers
│   │   │   ├── projects/    # Case study portfolio handlers
│   │   │   ├── rfqs/        # Quotation status state machine
│   │   │   ├── services/    # Service offering handlers
│   │   │   ├── settings/    # Global corporate information & theme toggle
│   │   │   └── upload/      # Cloudflare R2 direct stream uploader
│   │   ├── dashboard/       # Administrative views
│   │   │   ├── equipment/   # Fleet catalog management
│   │   │   ├── hero/        # Hero slider sequence management
│   │   │   ├── news/        # News publication management
│   │   │   ├── partners/    # Strategic partner logo ticker management
│   │   │   ├── projects/    # Civil projects management
│   │   │   ├── rfqs/        # Inbound RFQ pipeline & detail views
│   │   │   ├── services/    # Engineering service offerings
│   │   │   ├── settings/    # Organization details & light-mode switch
│   │   │   ├── users/       # Administrative user credentials
│   │   │   ├── layout.tsx   # Authenticated sidebar navigation & session monitor
│   │   │   └── page.tsx     # Operations overview & metrics analytics
│   │   ├── login/           # Protected authentication gate
│   │   ├── globals.css      # Admin design tokens and reset rules
│   │   └── layout.tsx       # Root document shell
│   ├── components/          # Reusable dashboard widgets, tables, and modal drawers
│   └── lib/
│       ├── firebase.ts      # Client Firebase instance
│       ├── firebaseAdmin.ts # Privileged Firestore Admin instance
│       ├── r2.ts            # S3/R2 direct upload and presigned URL client
│       └── types.ts         # Shared TypeScript interfaces & payload models
├── next.config.mjs          # Remote image hosts & API proxy configuration
├── tailwind.config.ts       # Utility classes and admin color scales
└── tsconfig.json            # Path alias configurations (@/*)
```

---

## Environment Configuration

Create a `.env.local` file in the project root containing the following parameters:

```bash
# Firebase Client (Authentication & Dashboard UI)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK (Privileged Backend Operations)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudflare R2 Storage (Asset Uploads)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="cgl-media"
R2_PUBLIC_URL="https://media.creativegeotechnical.com.sa"

# Public Website Revalidation Bridge
REVALIDATE_SECRET="your-revalidate-token"
NEXT_PUBLIC_SITE_URL="https://creativegeotechnical.com.sa"
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm` (v10+) or `pnpm`

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev -- -p 3001
```
Navigate to [http://localhost:3001](http://localhost:3001) (or your designated port).

### 4. Production Build & Execution
```bash
npm run build
npm run start -- -p 3001
```

---

## Operational Runbook & Maintenance

1. **New Administrator Setup**: Navigate to `/dashboard/users`, supply the authorized email address and role, and generate credentials.
2. **Media Purge & Storage Audits**: Assets uploaded to Cloudflare R2 are persisted under immutable UUID identifiers. Ensure deleted records are decoupled from public collections.
3. **Cache Synchronization**: Changes committed to Services, Projects, or Settings automatically dispatch on-demand revalidation signals to the public platform.

---

## License & Credits

Internal proprietary software of **Creative Geotechnical Laboratories (CGL)**.  
All rights reserved.

**Developed by EIRA SOLUTIONS**
