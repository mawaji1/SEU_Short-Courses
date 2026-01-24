# PRD: Certificates

## Introduction

Issue, store, and verify digital certificates for learners who complete programs. Maintain a registry of credentials for learners and organizations.

**Depends on:** `learner-experience`, `zoom-integration` (for completion data)

## Goals

- Primary: Automatic certificate issuance upon completion
- Primary: Digital certificate with verification
- Secondary: Override workflow for exceptions

## User Stories

### US-001: Certificate Template Schema
**Description:** As a developer, I want template schema so that certificate designs are stored.

**Acceptance Criteria:**
- [ ] CertificateTemplate table: id, name, html_template, program_id, is_default
- [ ] Template supports variables: {{name}}, {{program}}, {{date}}, {{verification_code}}
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Certificate Record Schema
**Description:** As a developer, I want certificate schema so that issued certs are tracked.

**Acceptance Criteria:**
- [ ] Certificate table: id, registration_id, template_id, verification_code, issued_at, revoked_at
- [ ] Unique verification code
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Check Certificate Eligibility
**Description:** As a system, I want to check eligibility so that only qualified learners get certified.

**Acceptance Criteria:**
- [ ] Calculate attendance percentage
- [ ] Compare to program threshold
- [ ] Return eligible/ineligible status
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Auto-Issue Certificate
**Description:** As a system, I want to auto-issue certificates so that learners get them immediately.

**Acceptance Criteria:**
- [ ] Triggered when cohort ends
- [ ] Check eligibility for each learner
- [ ] Generate certificate record
- [ ] Generate verification code
- [ ] Send notification
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-005: Generate Certificate PDF
**Description:** As a system, I want to generate PDFs so that learners can download.

**Acceptance Criteria:**
- [ ] Render HTML template with data
- [ ] Convert to PDF
- [ ] Include QR code for verification
- [ ] Store in object storage
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-006: Certificate Download
**Description:** As a learner, I want to download my certificate so that I have proof.

**Acceptance Criteria:**
- [ ] Download button on completed course
- [ ] Opens PDF in new tab
- [ ] Filename includes program name
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-007: Public Verification Page
**Description:** As a verifier, I want to verify certificates so that I can trust them.

**Acceptance Criteria:**
- [ ] Public page at /verify
- [ ] Input field for verification code
- [ ] Shows: learner name, program, issue date
- [ ] Shows "Invalid" for bad codes
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/verify

---

### US-008: Certificate Override Request
**Description:** As an instructor, I want to request override so that deserving learners get certified.

**Acceptance Criteria:**
- [ ] Request form with justification
- [ ] Creates approval request
- [ ] Links to learner and program
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-009: Approve Certificate Override
**Description:** As a program manager, I want to approve overrides so that exceptions are handled.

**Acceptance Criteria:**
- [ ] Override requests in approval queue
- [ ] Approve/reject with comments
- [ ] On approve: issue certificate
- [ ] Audit log entry
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/approvals

---

### US-010: Revoke Certificate
**Description:** As an admin, I want to revoke certificates so that invalid ones are invalidated.

**Acceptance Criteria:**
- [ ] Revoke button on certificate record
- [ ] Sets revoked_at timestamp
- [ ] Verification shows "Revoked"
- [ ] Reason logged
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/certificates

---

### US-011: Re-issue Certificate
**Description:** As an admin, I want to re-issue certificates so that errors can be fixed.

**Acceptance Criteria:**
- [ ] Re-issue button on certificate
- [ ] Creates new record with new code
- [ ] Previous one marked as superseded
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/certificates

---

## Functional Requirements

1. Automatic eligibility checking
2. PDF generation with templates
3. Public verification
4. Override workflow
5. Revocation capability

## Non-Goals

- Blockchain verification
- LinkedIn integration
- Badge systems

## Design Considerations

- Professional certificate design
- SEU branding
- QR code for mobile verification

## Technical Considerations

- HTML-to-PDF library (puppeteer, etc.)
- Object storage for PDFs
- Unique code generation

## Success Metrics

- Auto-issue success rate > 99%
- Verification lookup < 2 seconds
- PDF generation < 10 seconds

## Open Questions

- Certificate expiration?
- Multiple certificates per program?
