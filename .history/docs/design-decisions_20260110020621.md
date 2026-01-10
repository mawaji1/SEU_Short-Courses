# Design System Decision Log

**Project:** SEU Short Courses Platform  
**Date:** January 10, 2026  
**Status:** Active Implementation

---

## Executive Summary

This document records the critical design system decision made during the implementation phase of the SEU Short Courses Platform, deviating from the original architectural plan due to technical constraints.

---

## Original Plan (Phase 0 & Design/Architecture Closure)

### Approved Design System Strategy

**Decision ID:** D-U06 (from Decision Log)  
**Date:** January 3, 2026  
**Status:** ~~Approved~~ → **Revised**

**Original Decision:**
- **Component Library:** `platformscode-new-react` (mandatory)
- **Rationale:** Official Saudi National Design System (Platforms Code) implementation
- **Approach:** SEU brand tokens applied via CSS variable overrides
- **Benefits:**
  - Full compliance with national digital standards
  - Pre-built accessible, RTL-ready components
  - Faster development (no need to build base components)
  - Government-grade consistency

**Reference Documents:**
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/docs/design-architecture-closure.md:24`
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/docs/decision-log.md:87`
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/architecture/technical-architecture.md:130-155`

---

## Revised Decision (Implementation Phase)

### Issue Encountered

**Date:** January 10, 2026  
**Issue:** Technical difficulties with `platformscode-new-react` library integration

**Specific Problems:**
- Library compatibility issues with Next.js 16.x
- Installation/dependency conflicts
- Documentation gaps or implementation complexity
- Time constraints vs. delivery timeline

### New Approach: Custom Design System

**Decision:** Proceed with custom Tailwind-based design system inspired by SEU brand and Platforms Code principles

**Implementation Details:**

| Aspect | Approach |
|--------|----------|
| **Framework** | Tailwind CSS with custom configuration |
| **Typography** | Tajawal font family (Arabic-first) |
| **RTL Support** | Native CSS `dir="rtl"` with logical properties |
| **Component Library** | Custom components built with Radix UI primitives |
| **Design Tokens** | Custom token system in `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/design-system/tokens.ts` |
| **Theme** | SEU brand colors and styling in `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/design-system/seu-theme.css` |
| **Accessibility** | Maintained through Radix UI and WCAG compliance |

**Key Files:**
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/design-system/tokens.ts`
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/design-system/seu-theme.css`
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/design-system/ThemeProvider.tsx`
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/tailwind.config.ts`

---

## Design Principles Maintained

Despite the deviation from `platformscode-new-react`, the following core principles from Phase 0 are **still enforced**:

### ✅ Preserved Requirements

1. **Arabic-First Design**
   - RTL layout by default
   - Tajawal font family (Arabic Google Font)
   - Arabic content prioritized

2. **SEU Brand Identity**
   - Official SEU color palette
   - Brand-consistent visual language
   - SEU logo and assets integration

3. **Accessibility (A11y)**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support (via Radix UI)

4. **Mobile Responsiveness**
   - Mobile-first approach
   - Responsive breakpoints
   - Touch-friendly interactions

5. **Modern UX Patterns**
   - Clean, professional interface
   - Consistent component behavior
   - Smooth animations (Framer Motion)

### ⚠️ Compromised Aspects

1. **National Design System Compliance**
   - Not using official Platforms Code components
   - Custom implementation may diverge from national standards
   - Risk: Inconsistency with other government platforms

2. **Component Reusability**
   - Building components from scratch
   - More development time required
   - Maintenance burden on team

---

## Reference Implementation: `aali-platform`

**Purpose:** Design exploration and reference  
**Status:** For reference only, will be deleted  
**Location:** `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/aali-platform`

The `aali-platform` folder contains a complete UI exploration that informed the custom design approach. Key learnings:

- Successful Arabic RTL implementation
- SEU brand color application
- Component structure and patterns
- User flow designs (registration, dashboard, etc.)

**Decision:** Use `aali-platform` as visual reference but implement in official `/frontend` folder with proper architecture.

---

## Current Implementation Status

### Design System Components

**Location:** `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/components/ui/`

**Implemented:**
- ✅ Button component with variants
- ✅ Layout components (Header, Footer)
- ✅ Theme provider and token system

**Pending:**
- ⏳ Form components (Input, Select, Checkbox, etc.)
- ⏳ Modal/Dialog components
- ⏳ Card components
- ⏳ Table components
- ⏳ Navigation components
- ⏳ Feedback components (Toast, Alert, etc.)

### Pages Implemented

**Public Pages:**
- ✅ Homepage (`@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/frontend/src/app/page.tsx`)
- ✅ Programs listing (scaffolded)
- ✅ Program detail (scaffolded)

**User Pages:**
- ⏳ Login/Register flows
- ⏳ Dashboard
- ⏳ Profile

**Admin Pages:**
- ⏳ Admin dashboard (structure exists)

---

## Risks & Mitigation

### Risk 1: Divergence from National Standards
**Impact:** Medium  
**Mitigation:**
- Document design decisions clearly
- Follow Platforms Code design principles even without the library
- Maintain accessibility standards
- Future migration path to `platformscode-new-react` if issues resolved

### Risk 2: Increased Development Time
**Impact:** Medium  
**Mitigation:**
- Use Radix UI for complex component logic
- Leverage Tailwind for rapid styling
- Reuse patterns from `aali-platform` reference

### Risk 3: Maintenance Burden
**Impact:** Low-Medium  
**Mitigation:**
- Well-documented component library
- Consistent design token system
- Component testing strategy

---

## Future Considerations

### Potential Migration Path

If `platformscode-new-react` issues are resolved in the future:

1. **Assessment Phase**
   - Re-evaluate library stability
   - Check Next.js compatibility
   - Review documentation improvements

2. **Migration Strategy**
   - Gradual component replacement
   - Maintain design token compatibility
   - Parallel implementation during transition

3. **Testing**
   - Visual regression testing
   - Accessibility audit
   - User acceptance testing

---

## Approval & Sign-off

| Role | Decision | Date | Notes |
|------|----------|------|-------|
| Development Team | Proceed with custom design | Jan 10, 2026 | Technical constraints |
| Product Owner | [Pending] | | Awaiting formal approval |
| Architecture Lead | [Pending] | | Deviation from approved architecture |

---

## Related Documents

- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/docs/BRD.md` - Business Requirements
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/docs/phase0-closure.md` - Phase 0 Closure
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/docs/design-architecture-closure.md` - Original Design Decision
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/docs/decision-log.md` - Full Decision Log
- `@/Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/Planning/architecture/design-system-tokens.md` - Token Strategy

---

**Last Updated:** January 10, 2026  
**Document Owner:** Development Team  
**Review Cycle:** Monthly or upon significant changes
