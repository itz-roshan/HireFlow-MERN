# HireFlow — MERN Recruitment Platform

HireFlow is a production-style MERN recruitment platform designed as a realistic portfolio/MVP application. It connects job seekers, recruiters and administrators through a clear hiring workflow instead of a single-page CRUD demo.

## What is included

### Job seeker workspace
- Registration/login with role-based access
- Password reset request + reset-token flow (development token is logged server-side)
- Personal profile with headline, bio, phone, location and social links
- Profile photo upload/change
- PDF resume upload/replace
- Skills, education and experience management
- Profile completion indicator
- Job discovery, keyword search, location, job type and work-mode filters
- Pagination and shareable URL search state
- Save/unsave jobs
- Apply once per job with resume, cover letter, expected salary and notice period
- Application status and history
- Withdraw open applications
- Interview calendar cards and status updates
- Notification center + bell with unread counter + realtime updates
- Persistent recruiter/candidate messaging with Socket.IO, active-user checks and private conversation authorization

### Recruiter workspace
- Recruiter registration with company onboarding
- Personal recruiter account/profile + profile photo
- Company profile with description, website, location and logo upload/change
- Job creation/editing with validation
- Publish/hide job workflow
- Safe delete policy: roles with applications can be hidden rather than deleted
- Applicant pipeline with search and status filters
- Candidate detail view with resume/social links
- Shortlist/reject/review/interview/offer/hire workflow
- Interview scheduler with overlap detection
- Notifications when candidates apply, change status or message
- Real-time candidate communication
- Recruiter dashboard metrics

### Admin workspace
- Platform overview
- User moderation: block/unblock
- Company verification workflow
- Job visibility moderation
- Report review and status workflow
- Audit log history of sensitive platform actions
- Admin account/profile

## Architecture

```text
Browser
  ↓
React SPA
  ↓ Axios / HTTP-only cookies
Express API
  ↓
Controllers → Services → Mongoose Models
  ↓
MongoDB

Realtime:
React Socket.IO client ↔ Socket.IO server ↔ MongoDB messages/notifications

Uploads:
Browser → Multer validation + file signature checks → local /uploads (development)
```

## Folder structure

```text
HireFlow-MERN/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       │   ├── applications/
│       │   ├── chat/
│       │   ├── common/
│       │   ├── dashboard/
│       │   ├── jobs/
│       │   ├── layout/
│       │   ├── notifications/
│       │   ├── profile/
│       │   ├── recruiter/
│       │   └── ui/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── misc/
│       │   ├── public/
│       │   └── recruiter/
│       ├── styles/
│       └── utils/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
├── docs/
├── scripts/
├── .github/workflows/ci.yml
├── docker-compose.yml
└── package.json
```

## Database design

MongoDB collections/models cover users, companies, jobs, applications, interviews, notifications, saved jobs, conversations, messages, reports and audit logs. Mongoose creates indexes for frequent lookup patterns and unique constraints protect identities such as email, saved-job pairs, conversations and job+applicant applications. MongoDB documents support unique indexes as database-level constraints; Mongoose's `unique` option builds that index but is not itself a validator. See the official MongoDB and Mongoose docs in the project notes.

Application lifecycle:

```text
APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED → HIRED
                              ↘ REJECTED
```

Every recruiter status change is also written to the embedded application history so the candidate can see the journey.

## File upload safety

Development uploads are stored under `backend/uploads/` with server-generated filenames. Resume/avatar/logo uploads have file-size limits, MIME allow-lists and file-signature checks. The repository ignores uploaded binaries so personal files are not committed to Git.

For public production deployment, move uploads to S3/Cloudinary (or equivalent object storage) and put them behind authenticated/controlled access where appropriate.

## Local setup

### Prerequisites
- Node.js 24 LTS (or Node.js 22 LTS)
- Git
- MongoDB via Docker, local MongoDB Community, or MongoDB Atlas

### 1. Start MongoDB

Docker is optional. With Docker:

```bash
docker compose up -d mongo
```

Or run MongoDB locally / use MongoDB Atlas and set `backend/.env` → `MONGODB_URI`. Then verify:

```bash
npm run doctor:db
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure backend

Copy:

```text
backend/.env.example → backend/.env
```

Default local values point to:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/hireflow
CLIENT_URL=http://localhost:5173
```

### 4. Configure frontend

Copy:

```text
frontend/.env.example → frontend/.env
```

Default:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Seed demo data

```bash
npm run seed
```

### 6. Ensure database indexes

```bash
npm run db:indexes
```

### 7. Start the app

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
Health: http://localhost:5000/api/health
Mongo Express (when started): http://localhost:8081

## Demo accounts

```text
Admin
admin@hireflow.local
Admin@12345

Recruiter
recruiter@hireflow.local
Recruiter@12345

Job seeker
user@hireflow.local
User@12345
```

These are for local development only. Change/remove them before public deployment.

## GitHub checklist

Before pushing:

```bash
npm run check
npm run build --workspace frontend
```

Then verify:
- `.env` files are not staged
- backend/uploads files are not staged
- node_modules is not staged
- GitHub Actions is green
- demo passwords are changed for any shared environment

## Final verification note

The repository includes static checks and a GitHub Actions workflow. In this build environment, dependency installation could not complete because the npm registry request timed out, so a local Vite production build was not executed here. The final archive is not presented as having a verified production build when it was not run. Run the verification commands above after installation on your machine or rely on the included GitHub Actions CI.

## Production hardening before a real public launch

- HTTPS and a production domain
- Managed MongoDB + backups
- S3/Cloudinary for uploads
- Real email provider for verification/password reset
- Automated unit/integration/E2E tests
- Monitoring/logging/alerts
- CSRF strategy appropriate to the deployment model
- Security review and dependency updates
- Data retention/privacy policy and user consent flows
- CDN/cache strategy where useful

## Design notes

The UI uses Plus Jakarta Sans for display text and DM Sans for body copy with a local CSS design system. Decorative motion uses CSS only and respects `prefers-reduced-motion`. Buttons, forms, cards, dashboards and notifications have hover/focus states, loading/empty/error handling and mobile layouts.

## Recheck commands
```bash
npm run dry-run
npm run doctor:db
npm run db:indexes
npm run seed
npm run smoke
npm run build
npm test
```

`npm run smoke` performs a runtime API smoke test against a seeded local environment. It must be run with the backend started and MongoDB available.

## Troubleshooting and verification
See `docs/RUN-AND-DRY-RUN.md` for the exact clean-install, MongoDB, seed, smoke-test and release-verification sequence.
