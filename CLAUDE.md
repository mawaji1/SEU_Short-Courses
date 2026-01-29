# CLAUDE.md

## Project Status: Pre-Launch Development

This project has NOT gone live. Breaking changes are acceptable, technical debt should be paid now, and we can refactor freely.

**Primary Branch:** `dev`

## Project Overview

SEU Short Courses Platform - A learning management platform for Saudi Electronic University handling: course catalog, registration, payments, live Zoom training, attendance, and certificates.

## Architecture

**Monorepo:**
- `backend/` - NestJS REST API
- `frontend/` - Next.js 16 App Router (React 19)
- `video/` - Remotion video generation
- `shared/` - Shared TypeScript types
- `Planning/` - Architecture docs, PRDs

**Tech Stack:**
- Backend: NestJS 11, Prisma 6, PostgreSQL, Bull (Redis), class-validator
- Frontend: Next.js 16, React 19, Tailwind CSS, shadcn/ui, Framer Motion, SWR, next-intl
- Auth: Better Auth (session-based)
- Payments: HyperPay (cards), Tabby/Tamara (BNPL)
- Live Training: Zoom Meeting SDK + API

## Development Commands

```bash
# Backend (from backend/)
npm run start:dev      # Dev server
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run db:push        # Push schema to DB
npm run db:seed        # Seed sample data

# Frontend (from frontend/)
npm run dev            # Dev server (Turbopack)
npm run build          # Production build
```

## Code Conventions

**Backend modules** live in `backend/src/modules/{feature}/`:
- `*.controller.ts` - Route handlers (thin)
- `*.service.ts` - Business logic
- `*.dto.ts` - Validation with class-validator

**Frontend** organization:
- `src/app/(learner)/` - Learner portal (shared layout)
- `src/components/ui/` - shadcn/ui components
- `src/services/` - API client functions

**Database:** Prisma schema at `backend/prisma/schema.prisma`

**Design:** RTL-first (Arabic primary), use CSS logical properties

## Use Libraries, Not Custom Code

| Problem | Use This | Not Custom |
|---------|----------|------------|
| Auth | Better Auth | JWT/Passport |
| Payments | HyperPay/Tabby/Tamara SDKs | Direct API calls |
| Forms | React Hook Form + Zod | Manual handlers |
| UI Components | shadcn/ui | From scratch |
| Job queues | Bull | setTimeout |
| Dates | date-fns | Manual Date ops |
| Email | NotificationService (exists) | Raw SMTP |
| PDF | CertificateService (exists) | HTML-to-PDF |

## Implementation Status

| Component | Status |
|-----------|--------|
| Blackboard | REMOVED - not in scope |
| Moyasar | REMOVED - not in scope |
| Better Auth | Complete |
| HyperPay | Pending |
| Zoom | Pending |

See `Planning/docs/decision-log.md` for details.

## Quality Standards

### Before Writing Code
1. Check if backend infrastructure exists (`/backend/src/modules/`)
2. Check if a library solves this
3. Read existing code patterns first

### Before Committing
1. Search for all usages of changed code: `grep -r "changed_thing" --include="*.ts"`
2. Run the app and manually test
3. Run tests: `npm run test`

### Code Rules
- No `// TODO` or placeholder code - implement it or don't commit it
- No `setTimeout` to simulate APIs - use real implementations
- No `mailto:` for forms - use backend NotificationService
- Verify assumptions with `grep` and `git log`, don't guess

### Page Checklist
- Unique `<title>` under 60 chars
- Meta description 120-160 chars
- One H1 per page (visible in loading states too)
- Proper heading hierarchy (H1 → H2 → H3)
- Form labels with `htmlFor`, inputs with `id`
- Images with `alt` text

## Environment Variables

```
# Backend
DATABASE_URL, FRONTEND_URL, REDIS_HOST, REDIS_PORT
BETTER_AUTH_SECRET, BETTER_AUTH_URL
HYPERPAY_*, TABBY_*, TAMARA_*
ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_SDK_KEY, ZOOM_SDK_SECRET

# Frontend
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ZOOM_SDK_KEY
```
