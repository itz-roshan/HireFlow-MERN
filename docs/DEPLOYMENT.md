# HireFlow Deployment Checklist

## Local
```bash
docker compose up -d mongo
npm install
# copy backend/.env.example -> backend/.env
# copy frontend/.env.example -> frontend/.env
npm run seed
npm run db:indexes
npm run check
npm test
npm run build --workspace frontend
npm run dev
```

## GitHub
Before pushing, verify that `.env`, `node_modules/`, `dist/`, coverage and uploaded binaries are ignored. The repository includes a CI workflow that installs dependencies, runs static checks/tests and builds the frontend.

## Production
- Use HTTPS/TLS and a real domain.
- Use managed MongoDB with backups.
- Use S3/Cloudinary/object storage for resumes and media.
- Configure a real email provider for verification and password reset.
- Set strong random JWT/refresh secrets.
- Use secure cookie settings appropriate to the deployment domain and HTTPS.
- Add monitoring, logs and alerts.
- Add unit/integration/E2E tests and a security review.
- Add privacy/retention/consent policy and data deletion processes.
- Never expose secrets in Vite `VITE_*` variables; those are browser-visible.
