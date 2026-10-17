# HireFlow QA Matrix

## Core roles
- Job seeker: register, login, profile, avatar, resume, search, save, apply, status/history, withdraw, interview, notifications, messages, password change/reset.
- Recruiter: register/company onboarding, recruiter profile/avatar, company logo, job create/edit/publish/hide/delete, applicant search/status pipeline, interviews, notifications, messages.
- Admin: overview, user block/unblock, company verification, job moderation, reports, audit logs, account settings.

## Data integrity
- User email: unique index.
- Company slug/owner: unique indexes.
- Application job + applicant: compound unique index prevents duplicate applications.
- Saved job user + job: compound unique index prevents duplicate saved records.
- Conversation participantKey: unique index prevents duplicate one-to-one conversations.
- Mongoose validators plus request-level Zod validation.
- Salary range and interview overlap rules enforced server-side.

## Security
- Passwords hashed with bcrypt.
- Access/refresh tokens are stored in HTTP-only cookies.
- Refresh token is stored as a hash in MongoDB.
- Blocked users are refused by API and Socket.IO authentication.
- Role middleware protects sensitive routes.
- Resume files are not publicly served; resume endpoints enforce access rules.
- Uploads use generated filenames, size limits, MIME allowlists and magic-number checks.
- Helmet, CORS, rate limits and JSON request limits are enabled.

## UX
- Responsive navigation and dashboards.
- User-friendly inline validation and server errors.
- Loading, empty and error states on key pages.
- Notification bell with unread count and realtime updates.
- Custom confirmation dialog instead of browser confirm dialogs.
- Reduced-motion fallback for decorative animations.
- Accessible labels for critical controls.

## Automation checks
`npm run check` performs the project-level static checks.
`node scripts/check-backend.mjs` validates all backend JS syntax and relative imports.
GitHub Actions runs install, checks, tests and the frontend production build.

## Environment verification limitation
This build environment does not have npm dependencies cached and registry access timed out, so dependency installation and the Vite production build could not be executed here. The source-level checks above passed; run `npm install`, `npm run check`, `npm test`, and `npm run build --workspace frontend` on the target machine/CI before deployment.
