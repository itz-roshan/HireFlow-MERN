# HireFlow Architecture

Browser -> React SPA -> Axios REST API -> Express -> Controllers -> Mongoose -> MongoDB

Realtime path: React Socket.IO client -> Socket.IO server -> MongoDB message persistence

Roles:
- JOB_SEEKER: profile, resume, search, save, apply, interviews, messages
- RECRUITER: company, job CRUD, applicants, interviews, messages
- ADMIN: users, jobs, reports, audit logs

Request flow: Route -> auth/role middleware -> controller -> model/service -> response.
