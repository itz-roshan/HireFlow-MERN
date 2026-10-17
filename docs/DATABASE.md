# HireFlow Database Design

HireFlow uses MongoDB + Mongoose. Field validation is defined in Mongoose models/validators and important identity/relationship rules are backed by unique indexes. MongoDB documents can additionally be protected with collection-level JSON Schema validation for deployments where direct database writes are possible.

## Collections

- `users` — identity, roles, account status, profile, avatar and current resume metadata.
- `companies` — recruiter-owned company identity, slug, logo and verification state.
- `jobs` — searchable job content, compensation, skills, publishing state and ownership.
- `applications` — candidate/job relationship, submitted resume snapshot, status and history.
- `savedjobs` — candidate saved-job relationship.
- `interviews` — scheduled interview details and status.
- `notifications` — durable per-user updates and unread state.
- `conversations` — two-person conversation identity.
- `messages` — durable chat messages.
- `reports` — moderation reports.
- `auditlogs` — sensitive platform actions.

## Database-level uniqueness

- `users.email` is unique.
- `companies.slug` is unique.
- `companies.owner` is unique in this MVP.
- `applications(job, applicant)` is unique.
- `savedjobs(user, job)` is unique.
- `conversations.participantKey` is unique.

MongoDB unique indexes enforce uniqueness at the database level; they are not a substitute for normal input validation. Compound unique indexes are useful for relationships such as one application per candidate per job. citeturn266712search0turn266712search3

## Query indexes

Indexes support recruiter job lists, job discovery, application lists, saved jobs, unread notifications, message ordering and interview overlap queries. Add indexes when they correspond to real query patterns; every index also has write/storage cost. MongoDB recommends aligning indexes with query patterns. citeturn266712search0

## Validation

Validation happens before persistence with Zod at request boundaries and Mongoose field/document validation at the model layer. For deployments that permit direct MongoDB writers, MongoDB collection schema validation can provide an additional database-side guard against wrong data types or shapes. citeturn266712search1turn266712search2

## Resume versioning

An application copies the candidate's current `resumeUrl` into the application document. When a candidate replaces their profile resume, HireFlow keeps any old resume file still referenced by an application, so recruiters can continue to access the document that was actually submitted for that application.

## Resume access

Resume PDFs are not exposed through the public image/static upload directory. They are served through authenticated API endpoints that check whether the requester is the candidate, an authorized recruiter for that application, or an admin.

## File safety

Uploads use allowlists, size limits, application-generated filenames and file-signature checks. This follows OWASP file-upload guidance; for production, use dedicated object storage and consider malware scanning. citeturn266712search4
