# HireFlow Final QA Report

## Static checks executed in the build environment

- Backend JavaScript syntax check: PASS
- Frontend local import scan: PASS
- CSS literal `\n` / `\t` scan: PASS
- Browser alert/confirm/prompt scan: PASS
- Required module/file structure: PASS
- Package JSON parsing: PASS
- Docker Compose file presence: PASS
- Seed source syntax: PASS
- ZIP integrity: PASS

## Known runtime requirement

A true runtime check needs npm dependencies and MongoDB on the target machine or CI. The repository includes `npm run smoke` for a seeded end-to-end API smoke test. It should be run only after the backend and MongoDB are started.

## Recheck sequence

```powershell
npm install
npm run dry-run
npm run doctor:db
npm run db:indexes
npm run seed
npm run dev
```

In a second terminal:

```powershell
npm run smoke
```

Then build and tests:

```powershell
npm run build
npm test
```

## Success criteria

The final release is **VERIFIED** only when the above runtime commands pass on a clean checkout. Until then, it is **PARTIALLY VERIFIED**, not production-certified.
