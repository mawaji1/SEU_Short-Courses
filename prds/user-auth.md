# PRD: User Authentication

## Introduction

Enable learners, instructors, and staff to create accounts and authenticate securely. This is a foundational capability that all other user-facing features depend on.

## Goals

- Primary: Secure user authentication with email/password
- Secondary: Role-based access for different user types
- Secondary: Account management (profile, password reset)

## User Stories

### US-001: User Database Schema
**Description:** As a developer, I want to create the user schema so that accounts can be stored.

**Acceptance Criteria:**
- [ ] User table with: id, email, password_hash, name_ar, name_en, role, phone, created_at, updated_at, email_verified
- [ ] Role enum: LEARNER, INSTRUCTOR, COORDINATOR, PROGRAM_MANAGER, FINANCE, ADMIN
- [ ] Unique constraint on email
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Registration Form
**Description:** As a visitor, I want to create an account so that I can enroll in courses.

**Acceptance Criteria:**
- [ ] Form with: email, password, confirm password, full name (AR), phone
- [ ] Password strength indicator
- [ ] Terms and conditions checkbox
- [ ] Validation errors displayed inline
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/register

---

### US-003: Email Validation
**Description:** As a system, I want to validate email format so that only valid emails are accepted.

**Acceptance Criteria:**
- [ ] Email format validation (RFC 5322)
- [ ] Check for existing email
- [ ] Error message for duplicate email
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Password Hashing
**Description:** As a developer, I want passwords hashed securely so that credentials are protected.

**Acceptance Criteria:**
- [ ] bcrypt or argon2 hashing implemented
- [ ] Salt rounds configured (minimum 10)
- [ ] Password never stored in plain text
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-005: Login Form
**Description:** As a user, I want to log in so that I can access my account.

**Acceptance Criteria:**
- [ ] Email and password fields
- [ ] "Remember me" checkbox
- [ ] Error message for invalid credentials (generic, not specific)
- [ ] Redirect to intended page after login
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/login

---

### US-006: JWT Session Management
**Description:** As a developer, I want stateless JWT sessions so that the app scales horizontally.

**Acceptance Criteria:**
- [ ] Access token (short-lived, 15 min)
- [ ] Refresh token (long-lived, 7 days)
- [ ] Tokens stored in httpOnly cookies
- [ ] Token refresh endpoint
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Logout
**Description:** As a user, I want to log out so that my session is terminated.

**Acceptance Criteria:**
- [ ] Logout button in header/menu
- [ ] Clears JWT cookies
- [ ] Redirects to home page
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000 (when logged in)

---

### US-008: Password Reset Request
**Description:** As a user, I want to request a password reset so that I can recover my account.

**Acceptance Criteria:**
- [ ] "Forgot password" link on login page
- [ ] Email input form
- [ ] Success message (always, even if email not found - security)
- [ ] Reset token generated and stored
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/forgot-password

---

### US-009: Password Reset Execution
**Description:** As a user, I want to set a new password via reset link so that I regain access.

**Acceptance Criteria:**
- [ ] Token validation (expiry check)
- [ ] New password + confirm password form
- [ ] Password updated in database
- [ ] Token invalidated after use
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/reset-password?token=xxx

---

### US-010: Email Verification
**Description:** As a system, I want to verify user emails so that accounts are legitimate.

**Acceptance Criteria:**
- [ ] Verification email sent on registration
- [ ] Verification link with token
- [ ] email_verified flag updated on click
- [ ] Resend verification option
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/verify-email?token=xxx

---

### US-011: User Profile Page
**Description:** As a user, I want to view and edit my profile so that my information is current.

**Acceptance Criteria:**
- [ ] Display name, email, phone
- [ ] Edit name and phone
- [ ] Change password section
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/profile

---

### US-012: Authentication Middleware
**Description:** As a developer, I want auth middleware so that protected routes are secured.

**Acceptance Criteria:**
- [ ] Middleware validates JWT on protected routes
- [ ] Returns 401 for unauthenticated requests
- [ ] Attaches user to request context
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-013: Role-Based Route Protection
**Description:** As a developer, I want role-based guards so that users only access permitted areas.

**Acceptance Criteria:**
- [ ] Route guard checks user role
- [ ] Returns 403 for unauthorized role
- [ ] Configurable per-route
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. Email/password authentication (no social auth for MVP)
2. Stateless JWT sessions
3. Role-based access control (RBAC)
4. Secure password storage
5. Email verification

## Non-Goals

- Social login (Google, etc.)
- Nafath integration (Phase 2+)
- Two-factor authentication (Phase 2+)

## Design Considerations

- Simple, clean login/register forms
- Arabic-first labels and messages
- Password visibility toggle
- Clear error messaging

## Technical Considerations

- JWT with httpOnly cookies
- bcrypt for password hashing
- Token refresh flow
- Rate limiting on auth endpoints

## Success Metrics

- Login success rate > 99%
- Password reset completion rate > 80%
- Zero password leaks

## Open Questions

- Should we require email verification before enrollment?
- Password complexity requirements?
