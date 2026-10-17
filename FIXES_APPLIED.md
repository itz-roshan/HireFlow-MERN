# HireFlow fixes in this package

## What changed

1. **Messaging connection and delivery**
   - Vite now uses `localhost` to match the API, Socket.IO URL, and backend `CLIENT_URL`, keeping cookie authentication consistent.
   - Starting a conversation from a job page or applicant modal opens that specific conversation.
   - Messages are emitted to both participants' socket rooms, so a recipient can receive a new-message event even when they have not opened that conversation.
   - The Messages page reports when the realtime connection is offline.
   - Own-message alignment now compares normalized IDs from either `id` or `_id`; the current user's messages appear on the right and incoming messages stay on the left.

2. **Resume download**
   - The recruiter resume endpoint uses an attachment download response.
   - The applicant modal offers **Download resume** using the resume snapshot submitted with the application.

3. **Prevent duplicate applications**
   - Added `GET /api/applications/check/:jobId` for the signed-in job seeker.
   - The job details page checks whether the candidate already applied, disables another application, and links to application tracking.
   - The backend keeps its duplicate guard and now returns a conflict response if the unique database index catches a simultaneous duplicate submission.

4. **Admin application status override**
   - Added `GET /api/admin/applications` and `PATCH /api/admin/applications/:id/status`.
   - Added `/admin/applications` to the admin workspace.
   - Admins can change status to any supported application status, including changing an already-HIRED application. Each change is audited and sends notifications to the candidate and recruiter.

## Local development URL

Use **http://localhost:5173** consistently (not `127.0.0.1`) because the frontend API, socket URL, and backend cookie/CORS configuration are aligned to `localhost`.

After changing frontend/backend config or code, restart the dev servers. Ensure MongoDB is running before starting the backend.
