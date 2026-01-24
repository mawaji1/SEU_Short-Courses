# PRD: Reporting

## Introduction

Provide operational, financial, and strategic insights through dashboards and reports.

**Depends on:** All other PRDs (data sources)

## Goals

- Primary: Operational visibility (enrollments, attendance)
- Primary: Financial reporting (revenue, refunds)
- Secondary: Export capabilities

## User Stories

### US-001: Dashboard Layout
**Description:** As a developer, I want dashboard layout so that reports are organized.

**Acceptance Criteria:**
- [ ] Admin dashboard with widget grid
- [ ] Role-based visibility
- [ ] Responsive layout
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/dashboard

---

### US-002: Enrollment Summary Widget
**Description:** As an Operations Coordinator, I want enrollment summary so that I track registrations.

**Acceptance Criteria:**
- [ ] Total enrollments count
- [ ] This week/month comparison
- [ ] Trend indicator
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/dashboard

---

### US-003: Revenue Summary Widget
**Description:** As a Finance user, I want revenue summary so that I track income.

**Acceptance Criteria:**
- [ ] Total revenue this month
- [ ] Comparison to last month
- [ ] YTD total
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/dashboard

---

### US-004: Capacity Utilization Widget
**Description:** As an Operations Coordinator, I want capacity view so that I manage demand.

**Acceptance Criteria:**
- [ ] Upcoming cohorts with fill rate
- [ ] Color-coded bars
- [ ] Link to cohort detail
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/dashboard

---

### US-005: Enrollment Report
**Description:** As an Operations Coordinator, I want enrollment report so that I analyze registrations.

**Acceptance Criteria:**
- [ ] Filter by date range, program, cohort
- [ ] Table with: learner, program, date, status
- [ ] Totals and counts
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/enrollments

---

### US-006: Attendance Report
**Description:** As an Operations Coordinator, I want attendance report so that I track participation.

**Acceptance Criteria:**
- [ ] Filter by cohort, date range
- [ ] Table with: learner, sessions attended, percentage
- [ ] Average attendance rate
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/attendance

---

### US-007: Revenue Report
**Description:** As a Finance user, I want revenue report so that I track income.

**Acceptance Criteria:**
- [ ] Filter by date range, program
- [ ] Breakdown by payment method
- [ ] Gross, refunds, net totals
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/revenue

---

### US-008: Refund Report
**Description:** As a Finance user, I want refund report so that I track returns.

**Acceptance Criteria:**
- [ ] Filter by date range, status
- [ ] Table with: learner, amount, reason, status
- [ ] Total refunded
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/refunds

---

### US-009: B2B Utilization Report
**Description:** As an Operations Coordinator, I want B2B report so that I track corporate usage.

**Acceptance Criteria:**
- [ ] Filter by organization
- [ ] Seats purchased vs used
- [ ] Completion rates
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/b2b

---

### US-010: Export to CSV
**Description:** As a user, I want to export reports so that I can analyze offline.

**Acceptance Criteria:**
- [ ] Export button on all reports
- [ ] Downloads CSV with current filters
- [ ] Includes headers
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/reports/*

---

### US-011: Export to Excel
**Description:** As a user, I want Excel export so that I have formatted data.

**Acceptance Criteria:**
- [ ] Export button option for Excel
- [ ] Downloads XLSX file
- [ ] Formatted headers and columns
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. Dashboard with key metrics
2. Operational reports (enrollments, attendance)
3. Financial reports (revenue, refunds)
4. B2B utilization reports
5. Export capabilities

## Non-Goals

- Real-time streaming dashboards
- Custom report builder
- Scheduled report delivery

## Design Considerations

- Clean, scannable tables
- Clear filter controls
- Print-friendly layouts

## Technical Considerations

- Efficient aggregation queries
- Report caching for performance
- CSV/Excel generation libraries

## Success Metrics

- Report load time < 3 seconds
- Export < 10 seconds for large datasets
- Dashboard refresh < 2 seconds

## Open Questions

- Report retention period?
- Scheduled email reports needed?
