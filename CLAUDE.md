# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Project Status: PRE-LAUNCH DEVELOPMENT

**This project has NOT gone live yet.** We are in active development. This means:
- Breaking changes are acceptable if they improve the architecture
- Prefer doing things RIGHT over doing things FAST
- No legacy compatibility concerns - we can refactor freely
- Technical debt should be paid NOW, not deferred

## Project Overview

SEU Short Courses Platform - A comprehensive learning management platform for Saudi Electronic University's short courses. The platform handles the **complete learning lifecycle**: course catalog, registration, payments, **live training delivery via Zoom**, attendance tracking, and certificate management.

## 🎯 Design Principles: Don't Reinvent the Wheel

**BEFORE writing custom implementations for common problems, ALWAYS:**

1. **Search for established libraries** - If a well-maintained library exists, use it
2. **Check if a solution is already in the codebase** - Avoid duplication
3. **Ask if this is a solved problem** - Authentication, payments, email, file uploads, etc.

### Preferred Solutions (Use These, Don't Build Custom)

| Problem Domain | Preferred Solution | DON'T Build Custom |
|---------------|-------------------|-------------------|
| **Authentication** | Better Auth | ❌ Custom JWT/Passport |
| **Payments** | HyperPay SDK, Tabby SDK, Tamara SDK | ❌ Direct API calls |
| **Live Training** | Zoom Meeting SDK + API | ❌ Custom video solution |
| **Email** | Nodemailer + templates | ❌ Raw SMTP |
| **File uploads** | Multer + S3 SDK | ❌ Manual streams |
| **PDF generation** | PDFKit (already used) | ❌ HTML-to-PDF hacks |
| **Job queues** | Bull (already used) | ❌ setTimeout/setInterval |
| **Validation** | class-validator (backend), Zod (frontend) | ❌ Manual if/else |
| **Date handling** | date-fns or dayjs | ❌ Manual Date manipulation |
| **State management** | React Context + SWR | ❌ Custom global stores |
| **Forms** | React Hook Form + Zod | ❌ Manual onChange handlers |
| **UI Components** | shadcn/ui (already used) | ❌ Custom from scratch |

### When Custom Code IS Appropriate
- Business logic specific to SEU (registration rules, pricing, etc.)
- Domain models and database schema
- API endpoints and their handlers
- SEU-specific workflows (approval processes, cohort management)

### Red Flags - Stop and Reconsider
If you find yourself:
- Writing auth token management → Use Better Auth
- Implementing session handling → Use Better Auth
- Building a form validation system → Use Zod + React Hook Form
- Creating a state management solution → Use React Context + SWR
- Writing date formatting utilities → Use date-fns
- Building UI components from scratch → Check shadcn/ui first

## Architecture

**Monorepo Structure:**
- `backend/` - NestJS REST API (TypeScript)
- `frontend/` - Next.js 16 App Router (React 19, TypeScript)
- `video/` - Remotion video generation for certificates/promos
- `shared/` - Shared TypeScript types
- `design-system/` - Brand design guidelines
- `Planning/` - Architecture docs, PRDs, verification summaries

**Key Patterns:**
- API-First: All functionality via REST APIs
- Modular Monolith: Feature-based modules in backend
- Route Groups: Next.js `(learner)/` grouping for layout inheritance
- Session-based Auth: Better Auth with DB-backed sessions (post-migration)

## Development Commands

### Backend (from `backend/`)
```bash
npm run start:dev      # Dev server with hot reload
npm run build          # Production build
npm run lint           # ESLint with --fix
npm run format         # Prettier format
npm run test           # Jest unit tests
npm run test:watch     # Watch mode
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

### Database (from `backend/`)
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to DB (dev)
npm run db:migrate     # Create migration
npm run db:seed        # Seed sample data
```

### Frontend (from `frontend/`)
```bash
npm run dev            # Dev server (Turbopack)
npm run dev:webpack    # Dev server (Webpack)
npm run build          # Production build
npm run lint           # ESLint
```

### Video (from `video/`)
```bash
npm run studio         # Remotion interactive editor
npm run render         # Render to MP4
```

## Tech Stack

**Backend:** NestJS 11, Prisma 6, PostgreSQL, Bull (Redis queues), class-validator
**Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui (Radix), Framer Motion, SWR, next-intl
**Authentication:** Better Auth (migration pending)
**Payments:** HyperPay (cards), Tabby/Tamara (BNPL)
**Live Training:** Zoom Meeting SDK + API
**Email:** TBD (pending decision D-I10)

### 🔄 Pending Migrations & Implementation Status

> Before working on any feature, verify it aligns with the decision log: `Planning/docs/decision-log.md`

| Component | Status | Notes |
|-----------|--------|-------|
| **Blackboard** | ✅ DELETED | Code removed 2026-01-28 (D-I03) |
| **Moyasar** | ✅ DELETED | Code removed 2026-01-28 (D-I01) |
| **HyperPay** | 🟡 PENDING | Card payments - needs implementation |
| **Zoom** | 🟡 PENDING | Live training - needs implementation |
| **Authentication** | 🟡 PENDING | Better Auth migration planned (D-T08) |

**Key Scope Changes (per decision-log.md dated 2026-01-23):**
- ✅ Blackboard integration REMOVED - Code deleted, learning delivery is now in-platform via Zoom
- ✅ Moyasar REMOVED - Code deleted, card payments moving to HyperPay
- 🟡 Zoom PENDING - Live training sessions (D-I04, D-I05)
- ✅ B2B Coordinator Portal moved to MVP (D-S06)

## Code Conventions

### Backend Module Structure
Each feature lives in `backend/src/modules/{feature}/`:
- `*.controller.ts` - Route handlers (thin, validation only)
- `*.service.ts` - Business logic
- `*.dto.ts` - Input/output validation with class-validator
- `*.module.ts` - NestJS module definition

### Frontend Component Organization
- `src/app/` - Next.js App Router pages
- `src/app/(learner)/` - Learner portal routes (shared LearnerShell layout)
- `src/components/ui/` - shadcn/ui base components
- `src/components/{feature}/` - Feature-specific components
- `src/services/` - API client functions
- `src/lib/` - Utilities

### Database
- Prisma schema at `backend/prisma/schema.prisma`
- Use `@relation()` with explicit cascade rules
- All timestamps auto-managed via `createdAt`/`updatedAt`
- Enums for status fields (UserRole, RegistrationStatus, PaymentStatus)

## Design System

**Layered approach:**
1. Platforms Code (Saudi National Design System) - UX/accessibility foundation
2. SEU Brand - Colors, typography, visual identity
3. Platform-specific - Training-focused flows

**Rules:**
- RTL-first (Arabic primary), use CSS logical properties
- Never override accessibility standards for branding
- Use semantic tokens, not raw color values

## Key Integrations

**Zoom (Live Training):** Meeting SDK for embedded sessions, API for scheduling, webhooks for attendance
**HyperPay (Payments):** Card payments with webhooks for confirmation
**Tabby/Tamara (BNPL):** Buy-now-pay-later with redirect flow
**Notifications:** Multi-channel (email, SMS) via Bull queues with retry logic

> ⚠️ **Note:** Blackboard integration was REMOVED from scope. Do NOT implement Blackboard features.

## Environment Variables

Backend requires: `DATABASE_URL`, `FRONTEND_URL`, `REDIS_HOST/PORT`
Auth (Better Auth): `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
Payment keys: `HYPERPAY_*`, `TABBY_*`, `TAMARA_*`
Zoom: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`
Frontend requires: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ZOOM_SDK_KEY`

## Testing

- Backend unit tests: `*.spec.ts` files alongside source
- Backend E2E tests: `test/*.e2e-spec.ts`
- Test with realistic data volumes to catch N+1 queries

## 🧠 Decision-Making Guidelines

### When to Question Existing Code
Since we're pre-launch, existing code is NOT sacred. Question it when:
- It implements something a library could handle better
- It has known bugs or security issues
- It duplicates functionality available elsewhere
- It's overly complex for what it does

### Before Adding New Features
1. **Check Planning docs** - Is this in scope? See `Planning/docs/BRD.md`
2. **Check for libraries** - Is there a well-maintained solution?
3. **Check existing code** - Is this already implemented somewhere?
4. **Consider maintenance** - Will this be easy to maintain long-term?

### Architecture Decisions Log
Major decisions should be documented in `Planning/docs/decision-log.md`:
- What was decided
- Why (alternatives considered)
- When it can be revisited
