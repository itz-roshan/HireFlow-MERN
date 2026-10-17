# HireFlow Final QA

This release is built around the master requirements: human-readable validation, real MongoDB persistence, role-based access, profile/photo/resume management, jobs, applications, interviews, notifications, messaging, moderation, audit logs, responsive UI, and GitHub hygiene.

## Required local verification

```bash
npm install
npm run doctor:db
npm run db:indexes
npm run seed
npm run check
npm test
npm run build
npm run dev
```

## Two-pass QA

### Pass 1 — Functional
Register candidate → login → profile → photo → resume → search → save → apply → recruiter review → status change → notification → interview → message → report → admin resolution → audit log.

### Pass 2 — UX / Regression
Check all routes/forms/buttons/modals/uploads/role restrictions at 360, 390, 768, 1024, 1280, 1440 and 1920 widths. Confirm no horizontal overflow, vague validation, 404 assets, dead buttons, accidental data loss, or critical console errors.

## Verification honesty

Automated dependency installation and browser execution must be run on a machine with the npm registry/network available. This package contains static checks and tests, but a clean-machine pass is the final release gate.
