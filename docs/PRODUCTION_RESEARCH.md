# HireFlow Production-Style Research Notes

This project was reviewed against current official guidance and common production practices.

## React
- The app uses a single `createRoot` entry point and a top-level Error Boundary.
- The structure is modular by domain so features can be maintained independently.
- If route-level code splitting is added later, React's `lazy` + `Suspense` pattern is supported.

Reference:
https://react.dev/reference/react-dom/client/createRoot
https://react.dev/reference/react/lazy
https://react.dev/reference/react/Suspense

## Vite
- Frontend runtime configuration uses `import.meta.env` and `VITE_` variables only for non-secret browser configuration.
- Production build remains `vite build`.

Reference:
https://vite.dev/guide/env-and-mode
https://vite.dev/guide/build

## Express security
- Helmet, CORS, request size limits and rate limiting are enabled.
- HTTP-only cookies are used for access/refresh tokens.
- Sensitive production traffic should use HTTPS/TLS.

Reference:
https://expressjs.com/en/advanced/best-practice-security.html

## Upload safety
- Profile photos/company logos use allowlisted image types and generated filenames.
- Resumes use PDF allowlisting, file-size limits, generated filenames and PDF signature checks.
- Resumes are not publicly served; access is checked through authenticated endpoints.
- Production should move files to dedicated object storage and add malware/content scanning where appropriate.

Reference:
https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

## MongoDB / Mongoose
- Mongoose schemas define field-level constraints and compound indexes for relationship uniqueness and common query patterns.
- MongoDB unique indexes protect rules such as one application per candidate/job and one saved-job record per candidate/job.
- Production index creation should be managed deliberately rather than rebuilding indexes on every write-oriented startup.

Reference:
https://www.mongodb.com/docs/manual/tutorial/unique-indexes-schema-validation/
https://www.mongodb.com/docs/manual/data-modeling/schema-design-process/create-indexes/
https://mongoosejs.com/docs/guide.html
https://mongoosejs.com/docs/validation

## Important scope note
This repository is a strong portfolio/MVP foundation, not a claim of universal production readiness. Before a public launch, add managed MongoDB backups, HTTPS, real email delivery, object storage, malware scanning, automated integration/E2E tests, monitoring, privacy/retention controls and a security review.
