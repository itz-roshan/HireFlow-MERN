# HireFlow — Start Here

## 1) Verify Node

```bash
node -v
npm -v
```

Use Node 24 LTS or Node 22 LTS.

## 2) Choose MongoDB

### Option A — Docker

```bash
docker compose up -d mongo
```

### Option B — Local MongoDB Community

Start the MongoDB service and keep:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/hireflow
```

### Option C — MongoDB Atlas

Set `MONGODB_URI` to the Atlas connection string in `backend/.env`.

## 3) Configure env files

Copy:

```text
backend/.env.example → backend/.env
frontend/.env.example → frontend/.env
```

Never commit `.env`.

## 4) Install

From the project root:

```bash
npm install
```

## 5) Check MongoDB

```bash
npm run doctor:db
```

Expected:

```text
MongoDB connection: PASS
```

## 6) Create indexes and demo data

```bash
npm run db:indexes
npm run seed
```

## 7) Start HireFlow

```bash
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health
- DB health: http://localhost:5000/api/health/db
- Mongo Express (optional): http://localhost:8081

## 8) Demo accounts

```text
Admin
admin@hireflow.local / Admin@12345

Recruiter
recruiter@hireflow.local / Recruiter@12345

Job seeker
user@hireflow.local / User@12345
```

These are development-only credentials.

## 9) If Docker is unavailable

Do not change the application code. Use local MongoDB or MongoDB Atlas and update only `backend/.env`.

## 10) Final pre-GitHub check

```bash
npm run check
npm test
npm run build
```

Then confirm no `.env`, uploads, node_modules or personal files are staged.
