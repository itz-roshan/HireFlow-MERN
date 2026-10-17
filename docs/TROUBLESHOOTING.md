# Troubleshooting

## Docker
Docker is optional. You can use local MongoDB or MongoDB Atlas. If Docker reports `Virtualization support not detected`, do not block development on Docker; run MongoDB locally or use Atlas and set `MONGODB_URI`.

## MongoDB unavailable
Run:

```bash
npm run doctor:db
```

Expected: `MongoDB connection: PASS`.

## Validation
HireFlow returns `code` and `fieldErrors`. The UI should show the exact reason near the affected field, not only `Validation failed`.

## Vite dependency scan
If Vite reports a syntax location, open the reported file/line. JSX numeric attributes should be written as `{6}` or quoted (`"6"`), never raw `=6`.

## Port conflicts
Frontend: 5173
Backend: 5000
MongoDB: 27017
Mongo Express: 8081 (optional).
