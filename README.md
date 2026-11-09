# Aroha Travels – Kerala & South India Experiences Platform

> **"Discover South India, Beautifully."**
> Production-grade full-stack web application & bespoke content management system for luxury Kerala & South India tour operations.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Automated_Tests-6E9F18?logo=vitest)](https://vitest.dev/)

---

## 1. Overview & Problem Solved

Aroha Travels is a premium Kerala-based tour operator specializing in handcrafted holiday packages across Munnar tea highlands, Alleppey backwaters, Wayanad rainforests, and Tamil Nadu heritage temple circuits.

This platform solves five systemic bottlenecks of traditional travel operations:
1. **Dynamic Content & Package Management**: Non-technical staff can create, duplicate, edit, preview, and publish packages without code changes.
2. **Relational Seasonal Pricing**: Directly tracks contracted peak, monsoon, and shoulder tariffs with overlap validation, ensuring transparent pricing on twin-sharing basis with statutory GST details.
3. **Immutable Version Auditing**: Every package update snapshots the entire state with staff identity and timestamp, preventing accidental overwrites.
4. **CRM-Grade Enquiry Inbox**: Eliminates fragmented Excel sheets with real-time response time indicators, stage pipelines, and consultant assignments.
5. **Deterministic AI Enquiry Assistant**: Combines Gemini / Groq structured JSON extraction with deterministic database package matching against live inventory—**never inventing packages or prices**.

---

## 2. Key Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion |
| **Backend** | Next.js Server Actions, Route Handlers, Edge Middleware, Zod Validation |
| **Database** | PostgreSQL, Prisma ORM (Type-safe client, cascading relations, schema migrations) |
| **Authentication** | Secure HTTP-Only session cookies, JWT, Password hashing using Bcrypt (10 rounds) |
| **Role-Based Access** | `TRAVELLER` (public catalog & enquiry submission) vs `STAFF_ADMIN` (CMS, CRM, AI approval) |
| **AI Engine** | Gemini 1.5 Flash structured output + robust deterministic NLP fallback |
| **Testing** | Vitest 5 (16 automated unit & integration tests covering auth, DB CRUD, schemas, AI fallback) |

---

## 3. Brand Identity & Design System

- **Warm Ivory**: `#FAF9F6` (Canvas)
- **Deep Forest Green**: `#173D32` (Primary brand tone)
- **Muted Sage**: `#A9B8A2` (Subtle accents)
- **Charcoal**: `#252925` (High-contrast typography)
- **Sand**: `#E9E1D5` (Borders and dividers)
- **Gold Accent**: `#C5A059`
- **Typography**: Google Fonts Playfair Display (Headings) & DM Sans (Body / UI)

---

## 4. Application Routes

### Public Experience
- `/` – Cinematic editorial homepage (Hero, Curated Journeys, Geographic Highlights, Why Travel With Us, Verified Testimonials, Editorial Blog, Enquiry Desk)
- `/packages` – Interactive search, filter (destination, duration, budget tier), and sort (price, featured)
- `/packages/[slug]` – Full package itinerary, seasonal tariff breakdown, hotel details, inclusions/exclusions, gallery, map waypoint overview, and fixed mobile enquiry bar
- `/robots.txt` & `/sitemap.xml` – Dynamic SEO metadata and crawler directives

### Staff Operations CMS & CRM
- `/admin/login` – Secure staff authentication with 1-click demo login helper
- `/admin` – Real-time operations dashboard with live PostgreSQL metric counts, recent inquiries, and audit logs
- `/admin/packages` – High-density package inventory table (status filters, quick toggle, duplicate, archive/delete)
- `/admin/packages/new` – Full package creator with seasonal pricing and day-wise itinerary builders
- `/admin/packages/[id]/edit` – Package editor with live date overlap validation and version change logging
- `/admin/packages/[id]/preview` – Exact public layout preview for draft or published packages
- `/admin/enquiries` – CRM inbox with elapsed response time tracker, status pipelines, AI entity extraction editor, matched packages, and reply drafting
- `/admin/activity` – Immutable staff audit log
- `/admin/settings` – Tour operator registry, accreditation numbers, and DPDP compliance records

---

## 5. Getting Started (Quick Run)

### Prerequisites
- Node.js v20+ or v24+
- PostgreSQL instance running (local or Neon/Supabase)

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
cp .env.example .env

# 3. Synchronize database schema
npx prisma db push

# 4. Seed database with realistic packages, hotels, and 8 enquiries
npx tsx prisma/seed.ts

# 5. Run automated test suite
npm test

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin](http://localhost:3000/admin) for the staff portal.

### Demo Credentials
- **Email**: `admin@aroha.com`
- **Password**: `ArohaAdmin2026!`
