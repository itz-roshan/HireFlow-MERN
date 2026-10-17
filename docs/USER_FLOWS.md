# HireFlow User Flows

## Job Seeker
1. Register as Job Seeker.
2. Complete profile: photo, headline, skills, education, experience and social links.
3. Upload or replace a PDF resume.
4. Search jobs with keyword/location/type/work-mode filters.
5. Save roles for later.
6. Open a published job and apply once.
7. Track status and history from Applications.
8. Receive notification bell updates when a recruiter changes status or schedules an interview.
9. Confirm/cancel eligible interviews.
10. Message the recruiter in the private workspace.
11. Change password or use password reset flow.

## Recruiter
1. Register as Recruiter and optionally create a company during onboarding.
2. Complete recruiter account and photo.
3. Create/update company profile and logo.
4. Create a job with server-side validation.
5. Publish, hide or edit jobs.
6. Review applicants by role/status/search.
7. Open candidate profile and submitted resume.
8. Move an application through valid workflow states.
9. Schedule a future interview; overlapping active interviews are rejected.
10. Candidate receives an in-app notification.
11. Message the candidate privately.
12. Mark interview completed/cancelled where permitted.

## Admin
1. Sign in as Admin.
2. Review platform metrics.
3. Block/unblock users (admins cannot block another admin).
4. Verify companies.
5. Moderate job visibility.
6. Review and resolve reports.
7. Inspect audit logs for sensitive actions.

## Important business rules
- A blocked user cannot use protected APIs or Socket.IO.
- One candidate can submit at most one application per job.
- One candidate can save a job only once.
- Jobs with applications cannot be deleted by recruiters; they must be hidden.
- Online interviews require a meeting link.
- Interviews cannot be scheduled in the past or overlap an active interview for the same candidate/recruiter.
- Resume files are private and served only through authorization-checked endpoints.
