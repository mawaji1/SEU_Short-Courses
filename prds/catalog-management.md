# PRD: Catalog Management

## Introduction

Enable the creation, management, and presentation of short courses and training programs. This is the digital storefront for SEU's short program offerings, allowing Program Managers to create and publish courses that learners can discover.

## Goals

- Primary: Enable Program Managers to create and publish course offerings
- Secondary: Provide SEO-friendly public catalog for learner discovery
- Secondary: Support multilingual content (Arabic/English)

## User Stories

### US-001: Create Program Schema
**Description:** As a developer, I want to create the database schema for programs so that program data can be stored.

**Acceptance Criteria:**
- [ ] Program table with fields: id, title_ar, title_en, description_ar, description_en, outcomes, duration, format, price, early_bird_price, corporate_price, status, created_at, updated_at
- [ ] ProgramModule table for curriculum structure
- [ ] ProgramInstructor junction table
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Create Program Admin Form
**Description:** As a Program Manager, I want a form to create new programs so that I can add offerings to the catalog.

**Acceptance Criteria:**
- [ ] Form with fields: title (AR/EN), description (AR/EN), outcomes, duration, format
- [ ] Rich text editor for descriptions
- [ ] Form validation for required fields
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/new

---

### US-003: Set Program Pricing
**Description:** As a Program Manager, I want to set pricing tiers so that different rates apply for individuals and corporates.

**Acceptance Criteria:**
- [ ] Price input for regular, early-bird, and corporate rates
- [ ] Currency displayed as SAR
- [ ] Validation for positive numbers
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/new

---

### US-004: Assign Instructor to Program
**Description:** As a Program Manager, I want to assign instructors to a program so that learners know who will teach.

**Acceptance Criteria:**
- [ ] Instructor selector dropdown (searchable)
- [ ] Multiple instructors can be assigned
- [ ] Instructor profile preview shown
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/[id]/instructors

---

### US-005: Define Curriculum Structure
**Description:** As a Program Manager, I want to define modules and sessions so that the curriculum is clear.

**Acceptance Criteria:**
- [ ] Add/remove/reorder modules
- [ ] Each module has title (AR/EN) and duration
- [ ] Sessions can be added within modules
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/[id]/curriculum

---

### US-006: Set Certificate Eligibility Criteria
**Description:** As a Program Manager, I want to define certificate eligibility so that completion rules are clear.

**Acceptance Criteria:**
- [ ] Attendance threshold percentage input (e.g., 80%)
- [ ] Toggle for certificate enabled/disabled
- [ ] Saved with program
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/[id]/settings

---

### US-007: Program Status Lifecycle
**Description:** As a Program Manager, I want to publish/unpublish programs so that I control catalog visibility.

**Acceptance Criteria:**
- [ ] Status dropdown: Draft, Published, Archived
- [ ] Only Published programs appear in public catalog
- [ ] Confirmation modal for status changes
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs

---

### US-008: Clone Existing Program
**Description:** As a Program Manager, I want to clone a program so that I can create variations quickly.

**Acceptance Criteria:**
- [ ] Clone button on program detail page
- [ ] Creates copy with "(Copy)" appended to title
- [ ] New program starts in Draft status
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/programs/[id]

---

### US-009: Public Catalog Page
**Description:** As a learner, I want to browse the catalog so that I can discover available programs.

**Acceptance Criteria:**
- [ ] Grid/list view of published programs
- [ ] Program card shows: title, brief description, price, duration
- [ ] Responsive layout (mobile-friendly)
- [ ] Arabic RTL layout when AR selected
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/programs

---

### US-010: Program Detail Page
**Description:** As a learner, I want to view program details so that I can decide whether to enroll.

**Acceptance Criteria:**
- [ ] Full description, outcomes, curriculum structure
- [ ] Instructor profiles displayed
- [ ] Price and available cohorts shown
- [ ] "Enroll Now" CTA button
- [ ] SEO meta tags (title, description)
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/programs/[slug]

---

### US-011: Catalog Search and Filter
**Description:** As a learner, I want to search and filter programs so that I can find relevant offerings.

**Acceptance Criteria:**
- [ ] Search by title/description
- [ ] Filter by format (online/hybrid)
- [ ] Filter by price range
- [ ] Results update without page reload
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/programs

---

## Functional Requirements

1. Programs support bilingual content (Arabic primary, English secondary)
2. SEO-friendly URLs with slugs
3. UTM parameter tracking for campaigns
4. Program lifecycle: Draft → Published → Archived
5. Multiple pricing tiers per program

## Non-Goals

- Video content hosting (external tools)
- Complex prerequisite chains
- Automated content translation

## Design Considerations

- Arabic RTL as primary layout
- Card-based catalog grid
- Rich text editor for descriptions
- Mobile-responsive design

## Technical Considerations

- PostgreSQL for data storage
- Full-text search for catalog
- ISR/SSR for SEO pages
- Image optimization for program thumbnails

## Success Metrics

- Program creation time < 10 minutes
- Catalog page load < 2 seconds
- Search returns results in < 500ms

## Open Questions

- Should programs have categories/tags for filtering?
- Maximum number of modules per program?
