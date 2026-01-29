# Website Audit Report & Fixes Plan

**Audit Date:** 2026-01-29
**Tool:** SquirrelScan v0.0.25
**Target:** http://localhost:3000 (SEU Short Courses Frontend)
**Pages Crawled:** 15
**Overall Score:** 27/100 (Grade F)

---

## Executive Summary

The SEU Short Courses platform has significant issues in accessibility, SEO, and crawlability that need to be addressed before launch. The good news: mobile, images, internationalization, and URL structure are excellent.

### Score Breakdown

| Category | Score | Priority |
|----------|-------|----------|
| Crawlability | 30 | 🔴 Critical |
| Security | 37 | 🔴 Critical |
| Accessibility | 59 | 🔴 Critical |
| Links | 67 | 🟡 High |
| Core SEO | 67 | 🟡 High |
| Content | 72 | 🟡 High |
| Legal Compliance | 79 | 🟡 High |
| E-E-A-T | 92 | 🟢 Low |
| Performance | 94 | 🟢 Low |
| Internationalization | 100 | ✅ Complete |
| Images | 100 | ✅ Complete |
| Mobile | 100 | ✅ Complete |
| Social Media | 100 | ✅ Complete |
| URL Structure | 100 | ✅ Complete |

---

## Phase 1: Critical Fixes (Crawlability & Links)

### 1.1 Missing Pages (8 Broken Links)

These links exist in the UI but return 404:

| Missing Page | Linked From | Fix Strategy |
|--------------|-------------|--------------|
| `/trainers` | Homepage, Programs | Create instructor listing page |
| `/about` | Homepage, Programs | Create about page |
| `/support` | Homepage, Programs (footer) | Create support/help page |
| `/faq` | Homepage, Programs | Create FAQ page |
| `/contact` | Homepage, Programs | Create contact page |
| `/auth/register` | Homepage, Programs | Fix link to `/register` |
| `/terms` | Homepage, Register, Programs | Create terms of service page |
| `/privacy` | Homepage, Register, Programs | Create privacy policy page |

**Implementation Tasks:**

```
□ 1.1.1 Fix /auth/register → /register link in Header/Footer components
□ 1.1.2 Create /about page with SEU information
□ 1.1.3 Create /trainers page (list instructors from API)
□ 1.1.4 Create /contact page with contact form
□ 1.1.5 Create /support page with help resources
□ 1.1.6 Create /faq page with common questions
□ 1.1.7 Create /terms page with terms of service
□ 1.1.8 Create /privacy page with privacy policy
```

### 1.2 Crawlability Files

| Issue | Impact | Fix |
|-------|--------|-----|
| No `robots.txt` | Search engines can't understand crawl rules | Create `public/robots.txt` |
| No `sitemap.xml` | Search engines can't discover all pages | Generate dynamic sitemap |

**Implementation Tasks:**

```
□ 1.2.1 Create frontend/public/robots.txt
□ 1.2.2 Create dynamic sitemap at /sitemap.xml using next-sitemap or app router
□ 1.2.3 Add sitemap reference to robots.txt
```

**robots.txt content:**
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /certificates
Disallow: /api/

Sitemap: https://shortcourses.seu.edu.sa/sitemap.xml
```

---

## Phase 2: Accessibility Fixes (A11y)

### 2.1 Form Labels (10 inputs without labels)

| Page | Input | Current State | Fix |
|------|-------|---------------|-----|
| `/` (Homepage) | Search input | `<input type="text">` | Add `<label>` or `aria-label` |
| `/login` | Email | No label | Add `<label htmlFor="email">` |
| `/login` | Password | No label | Add `<label htmlFor="password">` |
| `/register` | firstName | No label | Add label |
| `/register` | lastName | No label | Add label |
| `/register` | email | No label | Add label |
| `/register` | phone | No label | Add label |
| `/register` | password | No label | Add label |
| `/register` | confirmPassword | No label | Add label |
| `/forgot-password` | Email | No label | Add label |

**Implementation Tasks:**

```
□ 2.1.1 Add labels to LoginForm component
□ 2.1.2 Add labels to RegisterForm component
□ 2.1.3 Add labels to ForgotPasswordForm component
□ 2.1.4 Add aria-label to homepage search input
```

**Example Fix (LoginForm):**
```tsx
// Before
<input type="email" name="email" placeholder="البريد الإلكتروني" />

// After
<div>
  <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
  <input id="email" type="email" name="email" placeholder="البريد الإلكتروني" />
</div>
```

### 2.2 Button Accessibility (2 buttons without names)

| Page | Button | Issue | Fix |
|------|--------|-------|-----|
| Homepage | Mobile menu toggle | No accessible name | Add `aria-label="فتح القائمة"` |
| Programs | Mobile menu toggle | No accessible name | Add `aria-label="فتح القائمة"` |

**Implementation Tasks:**

```
□ 2.2.1 Add aria-label to mobile menu button in Header component
```

### 2.3 Link Accessibility (1 link without text)

| Page | Link | Issue | Fix |
|------|------|-------|-----|
| Homepage, Programs | Twitter icon | Empty anchor text | Add `aria-label="تويتر"` or sr-only text |

**Implementation Tasks:**

```
□ 2.3.1 Add aria-label to social media icon links in Footer
```

### 2.4 Landmark Regions (5 pages missing main)

| Page | Issue | Fix |
|------|-------|-----|
| `/login` | No `<main>` landmark | Wrap content in `<main>` |
| `/register` | No `<main>` landmark | Wrap content in `<main>` |
| `/dashboard` | No `<main>` landmark | Wrap content in `<main>` |
| `/certificates` | No `<main>` landmark | Wrap content in `<main>` |
| `/forgot-password` | No `<main>` landmark | Wrap content in `<main>` |

**Implementation Tasks:**

```
□ 2.4.1 Add <main> element to auth layout
□ 2.4.2 Add <main> element to learner layout (LearnerShell)
□ 2.4.3 Verify all page layouts have proper landmarks (header, main, footer)
```

---

## Phase 3: SEO Fixes

### 3.1 Missing H1 Tags (3 pages)

| Page | Current State | Fix |
|------|---------------|-----|
| `/programs` | No H1 | Add `<h1>البرامج التدريبية</h1>` |
| `/dashboard` | No H1 | Add `<h1>لوحة التحكم</h1>` |
| `/certificates` | No H1 | Add `<h1>شهاداتي</h1>` |

**Implementation Tasks:**

```
□ 3.1.1 Add H1 to Programs page
□ 3.1.2 Add H1 to Dashboard page
□ 3.1.3 Add H1 to Certificates page
□ 3.1.4 Audit all pages for proper heading hierarchy (h1 → h2 → h3)
```

### 3.2 Duplicate/Generic Titles (All 7 pages have same title)

Current: All pages use "التعليم التنفيذي - الجامعة السعودية الإلكترونية"

| Page | Recommended Title |
|------|-------------------|
| `/` | التعليم التنفيذي - الجامعة السعودية الإلكترونية |
| `/programs` | البرامج التدريبية \| التعليم التنفيذي - SEU |
| `/login` | تسجيل الدخول \| التعليم التنفيذي - SEU |
| `/register` | إنشاء حساب جديد \| التعليم التنفيذي - SEU |
| `/dashboard` | لوحة التحكم \| التعليم التنفيذي - SEU |
| `/certificates` | شهاداتي \| التعليم التنفيذي - SEU |
| `/forgot-password` | استعادة كلمة المرور \| التعليم التنفيذي - SEU |

**Implementation Tasks:**

```
□ 3.2.1 Update metadata in each page.tsx using Next.js generateMetadata
□ 3.2.2 Create shared metadata utility for consistent branding
```

**Example:**
```tsx
// frontend/src/app/(public)/programs/page.tsx
export const metadata: Metadata = {
  title: 'البرامج التدريبية | التعليم التنفيذي - SEU',
  description: 'استعرض جميع البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية في مجالات الأمن السيبراني والذكاء الاصطناعي وإدارة المشاريع.',
};
```

### 3.3 Meta Descriptions (Too short - 117 chars, need 120-160)

Current description on all pages:
> "برامج التعليم التنفيذي والتطوير المهني المعتمدة من الجامعة السعودية الإلكترونية"

| Page | Recommended Description (Arabic) |
|------|----------------------------------|
| `/` | برامج التعليم التنفيذي والتطوير المهني المعتمدة من الجامعة السعودية الإلكترونية. دورات في الأمن السيبراني، الذكاء الاصطناعي، وإدارة المشاريع. |
| `/programs` | استعرض البرامج التدريبية المعتمدة من SEU. دورات احترافية في التقنية والإدارة والقيادة مع شهادات معتمدة ومدربين خبراء. |
| `/login` | سجل دخولك إلى منصة التعليم التنفيذي بالجامعة السعودية الإلكترونية للوصول إلى برامجك التدريبية وشهاداتك. |
| `/register` | أنشئ حسابك في منصة التعليم التنفيذي SEU وابدأ رحلتك في التطوير المهني مع برامج معتمدة ومدربين خبراء. |

**Implementation Tasks:**

```
□ 3.3.1 Update meta descriptions for each page (120-160 chars)
□ 3.3.2 Ensure descriptions are unique per page
□ 3.3.3 Include relevant keywords naturally
```

### 3.4 Canonical URLs (Missing on all pages)

**Implementation Tasks:**

```
□ 3.4.1 Add canonical URLs using Next.js metadata
```

**Example:**
```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://shortcourses.seu.edu.sa/programs',
  },
};
```

### 3.5 Open Graph Tags (Missing on all pages)

**Implementation Tasks:**

```
□ 3.5.1 Add Open Graph tags to all pages
□ 3.5.2 Create OG image for social sharing
```

**Example:**
```tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'البرامج التدريبية | التعليم التنفيذي',
    description: 'استعرض البرامج التدريبية المعتمدة من SEU',
    url: 'https://shortcourses.seu.edu.sa/programs',
    siteName: 'التعليم التنفيذي - SEU',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'التعليم التنفيذي - الجامعة السعودية الإلكترونية',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'البرامج التدريبية | التعليم التنفيذي',
    description: 'استعرض البرامج التدريبية المعتمدة من SEU',
    images: ['/og-image.png'],
  },
};
```

---

## Phase 4: Content & Legal

### 4.1 Thin Content (Most pages have <300 words)

| Page | Word Count | Target | Strategy |
|------|------------|--------|----------|
| `/` | 260 | 500+ | Add more descriptive content, testimonials |
| `/login` | 35 | 100+ | Add welcome message, benefits |
| `/register` | 41 | 150+ | Add registration benefits, trust signals |
| `/programs` | 31 | 300+ | Add intro text, category descriptions |
| `/dashboard` | 2 | 100+ | Add welcome message, quick stats text |
| `/certificates` | 30 | 100+ | Add explanatory text |
| `/forgot-password` | N/A | 100+ | Add helpful instructions |

**Implementation Tasks:**

```
□ 4.1.1 Add introductory content to Programs page
□ 4.1.2 Add welcome/instructional text to auth pages
□ 4.1.3 Add descriptive content to Dashboard
□ 4.1.4 Add explanatory text to Certificates page
```

### 4.2 Privacy Policy Link (Missing from 4 pages)

| Page | Has Privacy Link |
|------|------------------|
| `/` | ✅ (in footer) |
| `/programs` | ✅ (in footer) |
| `/register` | ✅ (in form) |
| `/login` | ❌ |
| `/dashboard` | ❌ |
| `/certificates` | ❌ |
| `/forgot-password` | ❌ |

**Implementation Tasks:**

```
□ 4.2.1 Ensure footer with privacy link is on all pages
□ 4.2.2 Add privacy link to auth pages if no footer
```

---

## Phase 5: Performance & Security

### 5.1 Lazy Loading Above-Fold Images

The SEU logo is lazy-loaded but appears above the fold.

**Implementation Tasks:**

```
□ 5.1.1 Add priority prop to header logo Image component
```

**Fix:**
```tsx
// Before
<Image src="/images/seu-header-logo.svg" alt="SEU" loading="lazy" />

// After
<Image src="/images/seu-header-logo.svg" alt="SEU" priority />
```

### 5.2 Slow TTFB on /register (1656ms)

This is a local dev issue, likely due to Turbopack compilation. Monitor in production.

**Implementation Tasks:**

```
□ 5.2.1 Monitor TTFB in production environment
□ 5.2.2 Optimize if >500ms in production
```

### 5.3 Security Headers (X-Frame-Options)

**Implementation Tasks:**

```
□ 5.3.1 Add security headers in next.config.js
```

**Example:**
```js
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 5.4 Form CAPTCHA (Forgot Password)

**Implementation Tasks:**

```
□ 5.4.1 Add CAPTCHA to forgot-password form (consider reCAPTCHA v3)
□ 5.4.2 Add rate limiting on backend (already have via Better Auth)
```

---

## Phase 6: Internal Linking

### 6.1 Dead-End Pages (No outgoing links)

| Page | Issue | Fix |
|------|-------|-----|
| `/dashboard` | No internal links | Add links to programs, certificates |
| `/certificates` | No internal links | Add links to programs, dashboard |

**Implementation Tasks:**

```
□ 6.1.1 Add navigation/quick links to Dashboard
□ 6.1.2 Add "browse programs" link to Certificates page
□ 6.1.3 Ensure all pages have path back to main content
```

### 6.2 Orphan Pages (Only 1 incoming link)

| Page | Incoming Links | Fix |
|------|----------------|-----|
| `/forgot-password` | 1 (from login) | Add to register page, help section |

**Implementation Tasks:**

```
□ 6.2.1 Add forgot-password link to register page
□ 6.2.2 Add to support/help pages when created
```

---

## Implementation Priority & Timeline

### Week 1: Critical (Blocks Launch)
- [ ] Phase 1.1: Fix broken links (create missing pages or fix URLs)
- [ ] Phase 1.2: Add robots.txt and sitemap.xml
- [ ] Phase 2.1-2.4: All accessibility fixes

### Week 2: High Priority (SEO Impact)
- [ ] Phase 3.1: Add H1 tags
- [ ] Phase 3.2: Unique page titles
- [ ] Phase 3.3: Meta descriptions
- [ ] Phase 3.4: Canonical URLs
- [ ] Phase 3.5: Open Graph tags

### Week 3: Medium Priority (Quality)
- [ ] Phase 4.1: Add content to thin pages
- [ ] Phase 4.2: Privacy links
- [ ] Phase 5.1: Fix lazy loading
- [ ] Phase 5.3: Security headers

### Week 4: Low Priority (Polish)
- [ ] Phase 5.4: CAPTCHA
- [ ] Phase 6: Internal linking improvements

---

## Files to Create/Modify

### New Files to Create
```
frontend/public/robots.txt
frontend/src/app/sitemap.ts (dynamic sitemap)
frontend/src/app/(public)/about/page.tsx
frontend/src/app/(public)/trainers/page.tsx
frontend/src/app/(public)/contact/page.tsx
frontend/src/app/(public)/support/page.tsx
frontend/src/app/(public)/faq/page.tsx
frontend/src/app/(public)/terms/page.tsx
frontend/src/app/(public)/privacy/page.tsx
frontend/public/og-image.png (social sharing image)
```

### Files to Modify
```
frontend/src/components/layout/Header.tsx (aria-labels, fix /auth/register link)
frontend/src/components/layout/Footer.tsx (aria-labels for social icons)
frontend/src/components/auth/LoginForm.tsx (form labels)
frontend/src/components/auth/RegisterForm.tsx (form labels)
frontend/src/components/auth/ForgotPasswordForm.tsx (form labels)
frontend/src/app/(public)/page.tsx (metadata)
frontend/src/app/(public)/programs/page.tsx (metadata, H1)
frontend/src/app/(auth)/login/page.tsx (metadata, main landmark)
frontend/src/app/(auth)/register/page.tsx (metadata, main landmark)
frontend/src/app/(learner)/dashboard/page.tsx (metadata, H1, main landmark)
frontend/src/app/(learner)/certificates/page.tsx (metadata, H1, main landmark)
frontend/next.config.js (security headers)
```

---

## Verification Checklist

After implementing all fixes, re-run the audit:

```bash
squirrel audit http://localhost:3000 --refresh --format llm
```

**Target Scores:**
- [ ] Overall: 80+ (Grade B or better)
- [ ] Accessibility: 90+
- [ ] Core SEO: 90+
- [ ] Crawlability: 90+
- [ ] Links: 90+
- [ ] Security: 70+ (full score requires HTTPS, which is production-only)

---

## Notes

### False Positives (Ignore)
- **"Leaked secrets" in security report** - These are minified React/Next.js function names that pattern-match to secret formats. Not actual secrets.
- **HTTPS warning** - Expected for localhost. Will pass in production with SSL.

### Production-Only Checks
- HTTPS enforcement
- Real TTFB performance
- CDN caching behavior
