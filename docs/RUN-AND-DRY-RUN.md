# HireFlow Run & Dry-Run Guide

## 1. Install

Use Node 24.21.0 LTS or Node 22 LTS. The repository pins 24.21.0 in `.nvmrc`.

```powershell
npm install
```

If npm reports a missing MongoDB helper dependency, do a clean install rather than copying random packages into `node_modules`:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force backend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache verify
npm install
```

## 2. Configure

Copy:

```text
backend/.env.example -> backend/.env
frontend/.env.example -> frontend/.env
```

## 3. Database

Option A, Docker:

```powershell
docker compose up -d mongo
```

Option B, local MongoDB:

Set `MONGODB_URI` to the local MongoDB URI.

Option C, Atlas:

Set `MONGODB_URI` to the Atlas connection string.

## 4. Dry run

```powershell
npm run dry-run
```

This verifies source structure, imports, backend syntax, CSS escape characters, browser dialog usage, and dependency baseline.

## 5. Database doctor

```powershell
npm run doctor:db
```

Expected:

```text
MongoDB connection: PASS
```

## 6. Indexes and seed

```powershell
npm run db:indexes
npm run seed
```

The development seed is repeatable and clears seeded collections first, including categories and skills that use unique indexes.

## 7. Start application

```powershell
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`
Mongo Express (when enabled): `http://localhost:8081`

## 8. Runtime smoke test

With the backend and MongoDB running:

```powershell
npm run smoke
```

The smoke test exercises API health, database health, job search, candidate login, save job, application creation, recruiter fetch, status change, interview creation, candidate interview fetch, and admin fetch.

## 9. Release gate

```powershell
npm test
npm run build
```

Do not treat the project as production-verified until these runtime checks pass on a clean checkout.
