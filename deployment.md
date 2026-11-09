# Deployment & Operations Guide

## Aroha Travels – Kerala & South India Experiences Platform

This document provides instructions for deploying, configuring, and verifying the application in local, staging, and production environments.

---

## 1. Prerequisites

Before installing the application, ensure your environment meets these requirements:

- **Node.js**: v20.x, v22.x, or v24.x LTS (Recommended: Node.js 24.x)
- **Package Manager**: `npm` v10+ or `yarn` / `pnpm`
- **Database Engine**: PostgreSQL 15, 16, 17, or 18 (Local instance, Neon Serverless Postgres, or Supabase)
- **Operating System**: Linux (Ubuntu 22.04+), macOS, or Windows 11 / Server 2022

---

## 2. Environment Variables

Create a `.env` file in the project root based on `.env.example`.

### Required Variables
- `DATABASE_URL`: Connection URI for the PostgreSQL database (supports standard pooled or direct connection strings).
- `JWT_SECRET`: High-entropy secret key used for signing and verifying HTTP-only staff session tokens.
- `NEXT_PUBLIC_APP_URL`: Canonical public URL of the application (e.g. `http://localhost:3000` or `https://aroha-travels.com`).

### Optional Variables
- `GEMINI_API_KEY`: Google Gemini API key for structured LLM enquiry parsing. If omitted or rate-limited, the system automatically engages the built-in deterministic NLP rule-based engine without degrading functionality.

> [!NOTE]
> Never commit `.env` or production credentials to version control. The repository includes strict `.gitignore` rules preventing `.env*` leaks.

---

## 3. Local Installation & Setup

1. **Clone or Navigate to the Workspace Directory**:
   ```bash
   cd "Tour Operator"
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment File**:
   Copy `.env.example` to `.env` and configure your PostgreSQL database connection:
   ```bash
   cp .env.example .env
   ```

4. **Synchronize Database Schema**:
   Push the normalized Prisma schema to your PostgreSQL instance:
   ```bash
   npx prisma db push
   ```

5. **Seed Realistic Curated Data**:
   Populate the database with curated packages (Munnar-Alleppey Houseboat, Madurai Circuit, Wayanad Hideaway, Grand Kerala Odyssey), seasonal rate tiers, day-wise itineraries, hotels, staff accounts, and 8 realistic customer enquiries:
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Demo Login Credentials

The seed script creates the following pre-configured staff administrator account:

| Attribute | Value |
| :--- | :--- |
| **Role** | STAFF_ADMIN |
| **Email** | `admin@aroha.com` |
| **Password** | `ArohaAdmin2026!` |
| **Portal URL** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |

*(A 1-click "Auto-fill" button is also provided on the login page for rapid evaluation)*.

---

## 5. Automated Test Execution

The platform includes 16 automated unit and integration tests across 4 test suites verifying critical business logic:

1. **Authentication & Password Hashing** (Bcrypt 10 rounds, JWT signature verification)
2. **Access Control & Unauthorized Admin Access Rejection**
3. **Database Package CRUD & Relational Mapping**
4. **Seasonal Price Overlap Validation** (Validates dates and rejects colliding periods)
5. **Immutable Version History Creation** (Preserves historical snapshots upon package revision)
6. **Public Visibility Enforcement** (Draft packages strictly filtered from public catalog)
7. **Customer Enquiry Submission & Unique Numbering** (`ENQ-YYYY-XXX`)
8. **AI Extraction Schema Validation** (Zod runtime validation)
9. **Deterministic Package Recommendation Logic** (Calculates totals based on real DB tariffs, never hallucinating prices)
10. **AI Failure Fallback** (Graceful fallback to deterministic NLP extractor)

Run the test suite:
```bash
npx vitest run
```

---

## 6. Production Deployment

### Option A: Vercel (Recommended for Next.js App Router)
1. Push the repository to GitHub.
2. Link the repository in the Vercel Dashboard.
3. Add the environment variables:
   - `DATABASE_URL` (from Neon Serverless Postgres or Supabase)
   - `JWT_SECRET` (generate using `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` (your production domain)
   - `GEMINI_API_KEY` (optional)
4. Build command: `npx prisma generate && next build`
5. Deploy.

### Option B: Node.js Server / Docker / VPS
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production HTTP server:
   ```bash
   npm run start
   ```
3. Use a process supervisor like `pm2`:
   ```bash
   pm2 start npm --name "aroha-travels" -- start
   ```

---

## 7. Operational Troubleshooting

- **Database Connection Refused**: Verify that PostgreSQL is running and accepting TCP/IP connections on the configured port.
- **Prisma Client Out of Sync**: Run `npx prisma generate` whenever schema definitions are adjusted.
- **Port Conflicts**: Next.js defaults to port 3000; specify alternative ports using `PORT=3001 npm run dev`.

