# HireFlow API Map

Base URL: `/api`

## Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- GET `/auth/me`
- POST `/auth/refresh`
- POST `/auth/logout`

## Profile
- GET `/profile`
- PATCH `/profile`
- POST `/profile/resume`

## Public platform stats
- GET `/public/stats`

## Public discovery
- GET `/jobs`
- GET `/jobs/featured`
- GET `/jobs/:id`
- GET `/companies`
- GET `/companies/:id/jobs`

## Recruiter
- GET `/companies/mine`
- PUT `/companies/mine`
- GET `/jobs/mine`
- POST `/jobs`
- PUT `/jobs/:id`
- DELETE `/jobs/:id`
- GET `/applications/recruiter`
- PATCH `/applications/:id/status`
- POST `/interviews`

## Job seeker
- POST `/applications`
- GET `/applications/mine`
- PATCH `/applications/:id/withdraw`
- GET `/saved-jobs`
- POST `/saved-jobs/:jobId`
- DELETE `/saved-jobs/:jobId`

## Communication
- GET `/notifications`
- PATCH `/notifications/read-all`
- PATCH `/notifications/:id/read`
- GET `/messages/conversations`
- POST `/messages/conversations`
- GET `/messages/conversations/:id`
- Socket.IO event: `conversation:join`
- Socket.IO event: `message:send`
- Socket.IO event: `message:new`

## Trust / moderation
- POST `/reports`
- PATCH `/reports/:id`
- GET `/admin/overview`
- GET `/admin/users`
- PATCH `/admin/users/:id/toggle`
- GET `/admin/jobs`
- PATCH `/admin/jobs/:id/toggle`
- GET `/admin/reports`
- GET `/admin/audit-logs`

All protected routes use the HTTP-only access cookie and role middleware where applicable.

## Profile & media

`GET /api/profile`
`PATCH /api/profile`
`POST /api/profile/avatar` (multipart field: `avatar`)
`POST /api/profile/resume` (multipart field: `resume`, PDF only)

## Notifications

`GET /api/notifications`
`PATCH /api/notifications/:id/read`
`PATCH /api/notifications/read-all`


## Protected resumes

- GET `/files/resume/me` — authenticated candidate resume view.
- GET `/files/application-resume/:id` — access-controlled submitted-resume view for the candidate, the recruiter who owns the application job, or an admin.

Resume binaries are not exposed through `/uploads/resumes` as public static files.
