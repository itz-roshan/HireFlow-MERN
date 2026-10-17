# HireFlow Final Recheck

## What was rechecked
- Backend JS syntax
- Frontend local import references
- Browser prompt/alert/confirm usage
- Literal escaped newline characters in CSS
- Seed repeatability for unique category/skill indexes
- Database doctor and index commands
- Port 5000 conflict messaging
- Report target type consistency
- Candidate resume seed for application smoke tests
- Required module directories
- Docker Compose syntax

## Local verification gate
Run from the repository root:

```bash
npm install
npm run dry-run
npm run doctor:db
npm run db:indexes
npm run seed
npm run smoke
npm run build
npm test
```

`npm run smoke` expects the backend to be running on `http://localhost:5000` and tests the seeded candidate/recruiter/admin workflow.

## Honest verification note
The source-level and repository checks can be executed offline. A true database/API/browser production check requires MongoDB plus installed npm dependencies on the target machine (or CI). The release status must remain PARTIALLY VERIFIED until those runtime checks pass on a clean checkout.
