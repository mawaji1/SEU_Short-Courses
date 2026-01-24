# Implementation Guidelines for SEU Short Courses Platform

**Version**: 1.0  
**Date**: 2026-01-24  
**Derived From**: Agent Skills Analysis

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Security Best Practices](#security-best-practices)
4. [Database & Schema Design](#database--schema-design)
5. [Frontend Development](#frontend-development)
6. [Performance Optimization](#performance-optimization)
7. [PRD Implementation Workflow](#prd-implementation-workflow)
8. [Quality Checklist](#quality-checklist)

---

## Core Principles

### 1. Dynamic Configuration Over Hardcoding

**Universal Rule**: Build systems that adapt to change, not systems that require code changes to adapt.

**Never hardcode**:
- Business rules (pricing, limits, eligibility criteria)
- External integration configurations (payment providers, LMS settings)
- Feature flags or toggles
- Content/copy that may change
- Data that varies by context (user, location, environment)

**Always use**:
- Database tables for business rules
- Configuration files for environment-specific settings
- Feature flag systems for toggleable functionality
- CMS or i18n systems for content
- External API calls for provider-specific data

**Example**:
```typescript
// ❌ Bad - Hardcoded
const installments = provider === 'TABBY' ? 4 : 3;

// ✅ Good - Dynamic
const installments = await provider.getInstallmentOptions();
```

### 2. Progressive Disclosure

Keep implementations lean by loading only what's needed when it's needed:

- **Metadata first**: Load minimal info to decide if something is relevant
- **Details on demand**: Load full content only when triggered
- **Lazy loading**: Defer heavy resources until actually required

### 3. Conciseness & Clarity

- Default assumption: The next developer is smart
- Only document what's non-obvious
- Prefer examples over verbose explanations
- Challenge every line: "Does this justify its existence?"

---

## Architecture & Design Patterns

### 1. Monorepo Structure (Turborepo)

**Current Setup**:
```
SEU_ShorCourses/
├── backend/          # NestJS API
├── frontend/         # Next.js App
├── packages/         # Shared libraries (if needed)
└── turbo.json        # Build orchestration
```

**Key Practices**:
- Keep backend and frontend as separate apps
- Share types via generated files, not direct imports
- Use Turborepo for parallel builds and caching
- Maintain clear boundaries between apps

### 2. Backend Architecture (NestJS)

**Module Organization**:
```
backend/src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── programs/          # Course catalog
│   ├── registrations/     # Enrollment logic
│   ├── payments/          # Payment processing
│   └── notifications/     # Email/SMS
├── common/                # Shared utilities
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
└── config/                # Configuration
```

**Best Practices**:
- One module per domain/feature
- Use DTOs for all inputs/outputs
- Implement guards for authentication/authorization
- Use interceptors for logging/transformation
- Keep controllers thin, business logic in services

### 3. Frontend Architecture (Next.js 14+ App Router)

**Directory Structure**:
```
frontend/src/
├── app/                   # App Router pages
│   ├── (public)/         # Public routes
│   ├── (authenticated)/  # Protected routes
│   └── api/              # API routes (if needed)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Headers, footers
│   └── features/         # Feature-specific components
├── contexts/             # React contexts
├── services/             # API clients
├── lib/                  # Utilities
└── styles/               # Global styles
```

**Best Practices**:
- Use Server Components by default
- Add 'use client' only when necessary
- Implement proper loading and error states
- Use Suspense boundaries strategically
- Minimize client-side JavaScript

---

## Security Best Practices

### 1. Authentication & Session Management

**From better-auth-best-practices**:

✅ **DO**:
- Store tokens in **HttpOnly cookies** (server-set)
- Use secure cookies in production (`secure: true`)
- Implement proper CSRF protection
- Set appropriate cookie expiry (15min access, 7-30 days refresh)
- Use `sameSite: 'lax'` or `'strict'`

❌ **DON'T**:
- Store tokens in localStorage or sessionStorage
- Set cookies via `document.cookie` (client-side)
- Disable CSRF checks without good reason
- Use overly long token expiry times

**Implementation**:
```typescript
// Backend - Set cookies
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Frontend - Automatic with credentials
fetch('/api/endpoint', {
  credentials: 'include', // Sends cookies automatically
});
```

### 2. Rate Limiting

**Critical for**:
- Login endpoints (prevent brute force)
- Registration endpoints (prevent spam)
- Password reset (prevent enumeration)
- API endpoints (prevent abuse)

**Implementation**:
```typescript
// NestJS with Throttler
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  // 5 requests per 60 seconds
}
```

### 3. Row-Level Security (RLS)

**From supabase-postgres-best-practices**:

- Enable RLS on all multi-tenant tables
- Create policies for each role
- Index columns used in RLS policies
- Test policies thoroughly

**Example**:
```sql
-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their registrations
CREATE POLICY user_registrations ON registrations
  FOR SELECT
  USING (user_id = auth.uid());
```

### 4. Input Validation

- Use DTOs with class-validator decorators
- Validate all inputs at API boundaries
- Sanitize user-generated content
- Use parameterized queries (Prisma handles this)

---

## Database & Schema Design

### 1. Indexing Strategy

**From supabase-postgres-best-practices**:

**Always index**:
- Foreign key columns
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses

**Index types**:
- **B-tree** (default): Equality, ranges, sorting
- **GIN**: JSONB, arrays, full-text search
- **BRIN**: Time-series data (large tables)
- **Partial**: Filtered queries (e.g., `WHERE deleted_at IS NULL`)

**Example**:
```sql
-- Foreign key
CREATE INDEX registrations_user_id_idx ON registrations (user_id);

-- Composite (equality first, range last)
CREATE INDEX orders_status_created_idx ON orders (status, created_at);

-- Partial (only active records)
CREATE INDEX users_active_email_idx ON users (email)
WHERE deleted_at IS NULL;

-- Covering (include non-searchable columns)
CREATE INDEX users_email_idx ON users (email)
INCLUDE (first_name, last_name);
```

### 2. Data Types

**Choose appropriate types**:
- `SERIAL` or `UUID` for IDs (prefer UUID for distributed systems)
- `TIMESTAMP WITH TIME ZONE` for dates
- `DECIMAL(10,2)` for money
- `VARCHAR(n)` with limits, not unlimited TEXT
- `JSONB` for flexible data (not JSON)
- `ENUM` for fixed sets of values

### 3. Naming Conventions

- Use lowercase with underscores: `user_id`, `created_at`
- Plural table names: `users`, `registrations`
- Singular model names in Prisma: `User`, `Registration`
- Prefix indexes: `tablename_column_idx`

### 4. Connection Management

**Critical settings**:
```ini
# Database
max_connections = 100  # Based on available RAM
idle_in_transaction_session_timeout = 30s
idle_session_timeout = 10min

# Connection pooling (PgBouncer/Prisma)
connection_limit = 10  # Per instance
pool_timeout = 10
```

---

## Frontend Development

### 1. Design Principles

**From frontend-design**:

**DO**:
- Choose a **bold aesthetic direction** (minimal, maximalist, retro, etc.)
- Use distinctive, characterful fonts (avoid Inter, Roboto, Arial)
- Create cohesive color schemes with CSS variables
- Add meaningful animations and micro-interactions
- Use unexpected layouts and spatial composition
- Create atmosphere with backgrounds, textures, gradients

**DON'T**:
- Use generic AI aesthetics (purple gradients, system fonts)
- Create cookie-cutter designs
- Use the same design patterns across all pages
- Rely on predictable layouts

**Typography**:
```css
/* ❌ Generic */
font-family: Inter, system-ui, sans-serif;

/* ✅ Distinctive */
font-family: 'Geist', 'Space Grotesk', 'Outfit', sans-serif;
```

### 2. Performance Optimization

**From vercel-react-best-practices**:

#### Eliminate Waterfalls (CRITICAL)

```typescript
// ❌ Sequential - 3 round trips
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// ✅ Parallel - 1 round trip
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

#### Bundle Size Optimization (CRITICAL)

```typescript
// ❌ Barrel imports (loads entire library)
import { Button } from '@/components';

// ✅ Direct imports
import { Button } from '@/components/ui/button';

// ❌ Heavy component in initial bundle
import Chart from 'chart.js';

// ✅ Dynamic import
const Chart = dynamic(() => import('chart.js'), { ssr: false });
```

#### Server Components (HIGH)

```tsx
// ✅ Server Component (default)
async function Page() {
  const data = await fetchData(); // Runs on server
  return <Display data={data} />;
}

// ✅ Client Component (only when needed)
'use client';
function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

#### Re-render Optimization (MEDIUM)

```typescript
// ❌ Unnecessary re-renders
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount(c => c + 1);
  return <Child onClick={handleClick} />; // Re-creates function
}

// ✅ Stable callback
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => setCount(c => c + 1), []);
  return <Child onClick={handleClick} />;
}
```

### 3. Accessibility

- Use semantic HTML
- Add proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

---

## Performance Optimization

### 1. Query Optimization

**Use EXPLAIN ANALYZE**:
```sql
EXPLAIN ANALYZE
SELECT * FROM registrations
WHERE user_id = '123' AND status = 'confirmed';
```

**Look for**:
- Sequential scans (add indexes)
- High cost estimates
- Slow execution times

### 2. Caching Strategy

**Levels**:
1. **Browser cache**: Static assets (images, fonts, CSS)
2. **CDN cache**: Public pages, API responses
3. **Application cache**: React.cache(), LRU cache
4. **Database cache**: Query results, computed values

**Implementation**:
```typescript
// React.cache() for per-request deduplication
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

// LRU cache for cross-request caching
import LRU from 'lru-cache';

const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 });

export async function getProgram(id: string) {
  const cached = cache.get(id);
  if (cached) return cached;
  
  const program = await db.program.findUnique({ where: { id } });
  cache.set(id, program);
  return program;
}
```

### 3. N+1 Query Prevention

```typescript
// ❌ N+1 queries
const users = await db.user.findMany();
for (const user of users) {
  const registrations = await db.registration.findMany({
    where: { userId: user.id }
  });
}

// ✅ Single query with include
const users = await db.user.findMany({
  include: { registrations: true }
});
```

---

## PRD Implementation Workflow

### Phase 1: Planning & Analysis

1. **Read the PRD JSON thoroughly**
   - Understand all user stories
   - Note dependencies
   - Identify critical paths

2. **Review existing verification notes**
   - Check what's already implemented
   - Identify gaps and issues
   - Understand previous decisions

3. **Create implementation plan**
   - Break down into logical steps
   - Identify database changes needed
   - Plan API endpoints
   - Design UI components
   - Estimate complexity

4. **Update plan using `update_plan` tool**

### Phase 2: Database & Schema

1. **Design schema changes**
   - Add new tables/columns
   - Create indexes
   - Define relationships
   - Set up RLS policies (if using Supabase)

2. **Create migration**
   ```bash
   cd backend
   npx prisma migrate dev --name feature-name
   ```

3. **Verify migration**
   - Check generated SQL
   - Test locally
   - Ensure no data loss

### Phase 3: Backend Implementation

1. **Create/update DTOs**
   - Input validation
   - Output serialization
   - Type safety

2. **Implement services**
   - Business logic
   - Database operations
   - Error handling
   - Logging

3. **Create controllers**
   - Route handlers
   - Guards/decorators
   - Response formatting

4. **Add tests** (if time permits)
   - Unit tests for services
   - Integration tests for endpoints

### Phase 4: Frontend Implementation

1. **Create API client functions**
   - Type-safe wrappers
   - Error handling
   - Loading states

2. **Build UI components**
   - Follow design guidelines
   - Implement accessibility
   - Add animations
   - Handle edge cases

3. **Implement pages/routes**
   - Server components where possible
   - Client components for interactivity
   - Proper loading/error states
   - SEO optimization

4. **Test user flows**
   - Happy path
   - Error scenarios
   - Edge cases

### Phase 5: Integration & Testing

1. **Test end-to-end flows**
   - Register → Login → Use feature
   - Verify all acceptance criteria
   - Check error handling

2. **Performance testing**
   - Check query performance
   - Verify no N+1 queries
   - Test with realistic data volumes

3. **Security review**
   - Authentication working
   - Authorization correct
   - Input validation present
   - No sensitive data leaks

### Phase 6: Documentation & Handoff

1. **Update PRD JSON**
   - Mark completed stories
   - Add implementation notes
   - Document any deviations
   - Update verification summary

2. **Update plan status**
   - Mark all steps completed
   - Note any blockers
   - Document next steps

---

## Quality Checklist

### Security ✓

- [ ] Tokens in HttpOnly cookies (not localStorage)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with DTOs
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection enabled
- [ ] Proper authorization checks
- [ ] Sensitive data not logged

### Performance ✓

- [ ] Indexes on foreign keys
- [ ] Indexes on WHERE/JOIN columns
- [ ] No N+1 queries
- [ ] Parallel data fetching where possible
- [ ] Proper caching strategy
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented

### Code Quality ✓

- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Consistent naming conventions
- [ ] No hardcoded values (use config/DB)
- [ ] Reusable components
- [ ] DRY principle followed
- [ ] Comments only where necessary

### User Experience ✓

- [ ] Loading states for async operations
- [ ] Error messages user-friendly
- [ ] Success feedback provided
- [ ] Responsive design
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] RTL support (Arabic)
- [ ] Proper validation messages

### Testing ✓

- [ ] Manual testing completed
- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Cross-browser tested (if applicable)
- [ ] Mobile tested (if applicable)

---

## Next PRD Selection Criteria

When choosing the next PRD to implement:

1. **Check dependencies**: Implement prerequisites first
2. **Consider complexity**: Mix complex and simple features
3. **User value**: Prioritize high-impact features
4. **Risk**: Address risky/uncertain features early
5. **Team capacity**: Match complexity to available time

**Recommended order** (based on dependencies):
1. ✅ User Authentication (completed)
2. Catalog Management (foundation for everything)
3. Registration B2C (core user flow)
4. Payments (enables revenue)
5. Cohort Operations (scheduling)
6. Learner Experience (student portal)
7. Instructor Portal (teacher tools)
8. Communications (notifications)
9. Certificates (completion)
10. Registration B2B (corporate)
11. Reporting (analytics)
12. Admin Governance (management)
13. Approval Workflows (advanced)
14. Zoom Integration (optional)

---

## Key Takeaways

1. **Dynamic over static**: Never hardcode business rules
2. **Security first**: HttpOnly cookies, rate limiting, validation
3. **Performance matters**: Index everything, eliminate waterfalls
4. **Design intentionally**: Bold aesthetics, not generic AI slop
5. **Test thoroughly**: All acceptance criteria must pass
6. **Document clearly**: Update PRDs, keep plans current
7. **Think ahead**: Design for scale and change

---

**Remember**: The goal is to build a production-ready platform that is secure, performant, maintainable, and delightful to use.
