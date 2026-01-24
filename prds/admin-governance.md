# PRD: Admin Governance

## Introduction

Platform administration including user management, RBAC, audit logging, and system configuration.

**Depends on:** `user-auth`

## Goals

- Primary: User and role management
- Primary: Audit logging
- Secondary: System configuration

## User Stories

### US-001: Admin User List
**Description:** As an admin, I want to see all users so that I can manage them.

**Acceptance Criteria:**
- [ ] Paginated user list
- [ ] Search by name/email
- [ ] Filter by role, status
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/users

---

### US-002: Create Staff User
**Description:** As an admin, I want to create staff users so that they can access the system.

**Acceptance Criteria:**
- [ ] Form with: name, email, role, phone
- [ ] Send welcome email with temp password
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/users/new

---

### US-003: Edit User
**Description:** As an admin, I want to edit users so that info is current.

**Acceptance Criteria:**
- [ ] Edit name, phone, role
- [ ] Cannot edit own role
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/users/[id]

---

### US-004: Disable User
**Description:** As an admin, I want to disable users so that access is revoked.

**Acceptance Criteria:**
- [ ] Disable button with confirmation
- [ ] User cannot log in when disabled
- [ ] Can be re-enabled
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/users/[id]

---

### US-005: Role Permissions Matrix
**Description:** As a developer, I want permissions defined so that RBAC works.

**Acceptance Criteria:**
- [ ] Permissions enum defined
- [ ] Role to permission mapping
- [ ] Documented in code
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-006: Permission Check Middleware
**Description:** As a developer, I want permission middleware so that access is enforced.

**Acceptance Criteria:**
- [ ] Middleware checks user permissions
- [ ] Returns 403 for unauthorized
- [ ] Configurable per route
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Audit Log Schema
**Description:** As a developer, I want audit schema so that actions are tracked.

**Acceptance Criteria:**
- [ ] AuditLog table: id, user_id, action, entity_type, entity_id, data_json, ip_address, created_at
- [ ] Indexed for querying
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-008: Log Sensitive Actions
**Description:** As a system, I want to log actions so that there's accountability.

**Acceptance Criteria:**
- [ ] Log: user CRUD, role changes, approvals, refunds
- [ ] Include before/after for changes
- [ ] No sensitive data in logs
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-009: View Audit Logs
**Description:** As an admin, I want to view logs so that I can investigate.

**Acceptance Criteria:**
- [ ] Paginated log list
- [ ] Filter by user, action type, date
- [ ] Detail view for each entry
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/audit-logs

---

### US-010: System Settings Page
**Description:** As an admin, I want system settings so that I can configure.

**Acceptance Criteria:**
- [ ] Settings page with sections
- [ ] Save changes button
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/settings

---

### US-011: Payment Provider Settings
**Description:** As an admin, I want to configure payment settings.

**Acceptance Criteria:**
- [ ] Toggle providers on/off
- [ ] BNPL minimum amount
- [ ] Save triggers validation
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/settings/payments

---

### US-012: Email Template Management
**Description:** As an admin, I want to edit email templates so that communications are customized.

**Acceptance Criteria:**
- [ ] List of email templates
- [ ] Edit subject and body (AR/EN)
- [ ] Preview option
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/settings/emails

---

### US-013: Zoom Settings
**Description:** As an admin, I want Zoom settings so that integration is configured.

**Acceptance Criteria:**
- [ ] View license count
- [ ] Link to Zoom admin
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/settings/zoom

---

## Functional Requirements

1. User CRUD with role assignment
2. RBAC enforcement
3. Comprehensive audit logging
4. System configuration UI

## Non-Goals

- Fine-grained permission editor
- Custom role creation
- Data backup management

## Design Considerations

- Clear admin navigation
- Clean settings organization
- Searchable audit logs

## Technical Considerations

- Audit log indexing for performance
- Settings caching
- Permission caching

## Success Metrics

- User management action < 2 seconds
- Audit log query < 1 second
- Settings save < 1 second

## Open Questions

- Audit log retention period?
- Settings change approval needed?
