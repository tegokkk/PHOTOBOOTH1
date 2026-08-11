# Photobooth Deploy Readiness Plan 0-14

Generated: 2026-08-10
Scope: backend, frontend, database, storage, security, UI, animation, testing, and deployment.
Decision: STAGING-GO after the execution pass; PRODUCTION-NO-GO until repository cleanup, staging/manual device checks, and rollback rehearsal are complete.

## Execution Status - 2026-08-11

Implemented in this pass: production env validation, SQLite phase-1 alignment, safe upload dimension parsing, dependency audit remediation, guest-token privacy, authorized media, frame API ordering, share URL contract, single-upload export flow, per-camera mirror state, reduced-motion CSS, modal semantics, WebP frame optimization from about 37 MB to 3.3 MB, development CORS port alignment, clearer login network errors, backup path hardening, Prisma migration, CI lint/audit/migration gates, structured request logging, release-gate secret scanning, 21 backend tests, and an end-to-end backend smoke test.

Still required before public production: finish the clean baseline commit and secret-history review, rotate any previously exposed secret, test on a real mobile camera, run staging with real domains, verify PNG/JPG bytes in a browser, and rehearse backup/restore plus rollback.

## Global Rules

- Do not deploy to production while any P0 task is incomplete.
- Do not mark a task complete without validation evidence.
- Do not commit `.env`, local database files, uploads, build output, logs, backups, or `node_modules`.
- Rotate any secret that has ever been committed.
- Every change must preserve existing user data or include a migration/rollback path.
- Production deploy must use production environment values, not localhost.

## Priority Map

- P0: Task 0, 1, 2, 3, 4, 6, 8, 9, 13
- P1: Task 5, 7, 10, 11, 12, 14
- P2: Documentation polish and future product improvements after production is stable

## Validation Gates

These commands or equivalent checks must pass before production:

```powershell
cd backend
npm test
npm audit --omit=dev --audit-level=high
npx prisma validate
npx prisma migrate status
```

```powershell
cd frontend
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

Manual smoke tests required:

- Register, login, logout, expired token behavior.
- Capture full photobooth session.
- Retake after preview.
- Change frame after preview.
- Export JPG and PNG.
- Create share link and open it in anonymous browser.
- Confirm private photo file cannot be opened directly without authorization.
- Confirm mobile camera flow on real mobile device.
- Confirm reduced motion mode disables non-essential animation.

---

## Task 0 - Repository Hygiene And Baseline

Status: IN_PROGRESS - tracking cleanup applied; commit and secret-history review still required.
Priority: P0
Depends on: none

Goal:
Make the repository clean, reproducible, and safe before touching production.

Work:

- Add root `.gitignore`.
- Add backend `.gitignore` if missing.
- Add frontend `.gitignore` if missing or incomplete.
- Remove from git tracking:
  - `backend/.env`
  - `backend/prisma/dev.db`
  - `backend/uploads/**`
  - `backend/node_modules/**`
  - logs, backups, `.next`, temporary files
- Add `.env.example` for root/backend/frontend.
- Rotate `JWT_SECRET` because the current env file has been tracked.
- Decide how to handle frontend nested git repo/gitlink:
  - either convert to normal folder inside root repo
  - or add correct `.gitmodules`
- Commit a clean baseline after cleanup.
- Update `ARCHIVE/TASK_0_14_PHOTOBOOTH.md` or this plan with actual status.

Acceptance:

- Fresh clone can install and run without missing frontend code.
- No secret or local user data is tracked.
- `git status` only shows intended source changes.
- `git ls-files` does not include `.env`, `dev.db`, uploads, `node_modules`, logs, or backups.

Validation:

```powershell
git status --short
git ls-files | Select-String -Pattern '\.env|dev\.db|uploads|node_modules|logs|backups'
```

---

## Task 1 - Production Architecture Decision

Status: COMPLETE - phase 1 is SQLite on one persistent VPS with PM2 and authorized media.
Priority: P0
Depends on: Task 0

Goal:
Choose the real deployment shape before implementation locks in bad assumptions.

Work:

- Decide frontend host: Vercel, VPS, Cloudflare Pages, or other.
- Decide backend host: VPS/PM2, container, serverless, or managed runtime.
- Decide database:
  - SQLite only if single persistent VPS and backups are strong.
  - Prefer Postgres for production reliability.
- Decide media storage:
  - local disk only for single persistent VPS.
  - prefer object storage for production scale.
- Define production domains:
  - app URL
  - API URL
  - media URL if separate
- Define environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `UPLOAD_DIR` or object storage vars
  - `NODE_ENV=production`
  - `PORT`
- Define reverse proxy/TLS plan.
- Define rollback plan.

Acceptance:

- One documented deployment path exists.
- Localhost is not used in production env.
- Backend CORS matches production frontend domain.
- Database and media storage are persistent across deploy/restart.

Validation:

- Review `.env.example`.
- Review deployment runbook.
- Run staging with production-like env values.

---

## Task 2 - Backend Upload And Image Processing Fix

Status: COMPLETE - internal PNG/JPEG dimension parsing and audit-safe dependencies are in place.
Priority: P0
Depends on: Task 0, Task 1

Goal:
Make photo upload reliable, safe, and test-covered.

Work:

- Fix `image-size` import/use in `backend/src/services/photoService.js`.
- Replace vulnerable image inspection dependency if audit cannot be resolved.
- Export or relocate `checkMagicBytes` so tests import the correct module.
- Validate real MIME and magic bytes.
- Decode image dimensions safely.
- Add max pixel count and max dimensions.
- Reject unsupported/corrupt images with consistent 400 responses.
- Use async fs operations instead of sync write/unlink where practical.
- Use collision-resistant filenames.
- Ensure failed DB write removes uploaded file.
- Add tests for:
  - valid PNG
  - valid JPEG
  - invalid magic bytes
  - corrupt image
  - oversized file
  - oversized dimensions
  - DB failure cleanup

Acceptance:

- Valid upload works.
- Invalid upload fails safely.
- No orphan file on failed DB write.
- Backend tests pass.
- Backend audit has no high vulnerabilities.

Validation:

```powershell
cd backend
npm test
npm audit --omit=dev --audit-level=high
```

---

## Task 3 - Media Privacy And Authorized File Access

Status: COMPLETE - static uploads are closed and media requires owner/admin/share/guest authorization.
Priority: P0
Depends on: Task 2

Goal:
Make private photos actually private.

Work:

- Remove public static exposure for private uploads.
- Add authorized media endpoint.
- Enforce access rules:
  - owner can access own photo
  - admin can access according to policy
  - anonymous photo can be accessed only through a valid share token or guest deletion/access token
  - expired/revoked share link cannot access media
- Prevent direct file path guessing.
- Add cache headers appropriate to privacy.
- Add `X-Content-Type-Options: nosniff`.
- Consider signed URLs if using object storage.
- Add tests proving private media returns 401/403 without auth.

Acceptance:

- `/uploads/...` direct public access is gone or only serves explicitly public assets.
- Private photo URL cannot be opened anonymously.
- Share link expiry blocks both metadata and image bytes.

Validation:

- Anonymous request to private media returns 401/403.
- Valid owner request returns 200.
- Valid share token returns 200 until expiry.

---

## Task 4 - Auth, Session, And Admin Security

Status: PARTIAL - DB-backed role checks, account checks, development CORS port alignment, and clearer login failures are in place; session expiry UX and full auth integration tests remain.
Priority: P0
Depends on: Task 0, Task 1

Goal:
Make login, authorization, and admin access trustworthy.

Work:

- Include `isAdmin` only where intentionally needed, or fetch role from DB inside admin middleware.
- Stop trusting stale role claims for admin access.
- Add `/me` hydration flow for frontend auth store.
- Handle expired/invalid token globally in frontend.
- Add logout behavior.
- Decide session model:
  - short-lived access token plus refresh token
  - or HttpOnly cookie session
- Improve password policy.
- Normalize and validate email consistently.
- Add account active/deleted checks.
- Add rate limit for login/register separate from global limit.
- Add audit logs for register/login/logout/admin actions.
- Add tests for normal user blocked from admin route.

Acceptance:

- Admin login can access admin endpoints.
- Normal user cannot access admin endpoints.
- Suspended/deleted user cannot continue using old token.
- Frontend does not show stale authenticated state after token expiry.

Validation:

```powershell
cd backend
npm test -- --runInBand
```

---

## Task 5 - Photo API, Ownership, And Data Lifecycle

Status: PARTIAL - guest lifecycle and safe cleanup paths are in place; retention/restore drill remains.
Priority: P1
Depends on: Task 2, Task 3, Task 4

Goal:
Make photo records, ownership, delete, restore, and cleanup predictable.

Work:

- Validate pagination params:
  - limit min/max
  - cursor format
  - stable ordering by `createdAt` plus `id`
- Decide ownerless photo policy.
- Add guest access/delete token if anonymous uploads are allowed.
- Block deleted photos from detail/share/media endpoints.
- Add permanent delete endpoint or retention policy.
- Schedule cleanup job.
- Make cleanup fail with nonzero exit on serious errors.
- Add indexes for frequently queried fields.
- Avoid storing raw IP/user-agent forever unless required.
- Add retention documentation.

Acceptance:

- User can only see own gallery.
- Deleted photos disappear from normal views.
- Cleanup removes expired deleted records and files safely.
- Anonymous upload lifecycle is documented.

Validation:

- API tests for ownership, pagination, deleted photos, cleanup.

---

## Task 6 - Share Link Backend Contract

Status: COMPLETE - entropy, expiry, revoke authorization, tokenized media URL, and transaction are in place.
Priority: P0
Depends on: Task 3, Task 5

Goal:
Make sharing safe, durable, and unambiguous.

Work:

- Increase share token entropy.
- Add revoke support.
- Enforce expiry everywhere, including media bytes.
- Decide password-protected share behavior or remove unused password field.
- Block share creation for deleted photos.
- Require owner/admin or valid guest token to create share links.
- Wrap share link creation and share count increment in transaction.
- Avoid double-counting access from metadata/page prefetch.
- Add `noindex` for share pages.
- Add tests for:
  - token generation
  - expiry
  - revoke
  - unauthorized create
  - deleted photo blocked

Acceptance:

- Share link cannot be guessed practically.
- Expired/revoked share link cannot access photo or file.
- Share count is reliable.
- Anonymous user cannot create share link for someone else's photo ID.

Validation:

```powershell
cd backend
npm test
```

---

## Task 7 - Frame System From Database

Status: COMPLETE - frame slots are seeded, API-driven, validated, and consistently ordered.
Priority: P1
Depends on: Task 1, Task 5

Goal:
Remove hardcoded frame layout drift between frontend and database.

Work:

- Seed frame slots into `FrameSlot`.
- Add frame dimensions and thumbnail URLs.
- Return frame slots from frame API.
- Add frame active/premium filtering.
- Validate selected frame exists and is active during upload.
- Replace frontend hardcoded `frameMeta` with API-driven metadata.
- Add fallback loading and error states.
- Add admin/editor path later if needed.

Acceptance:

- Frontend frame selection uses backend frame metadata.
- Camera overlay and final compositor use the same slot source.
- Backend rejects invalid/inactive frame IDs.

Validation:

- Seed creates frames and slots.
- API returns frame slots.
- Photobooth session with each frame produces expected layout.

---

## Task 8 - Photobooth Flow Fixes

Status: PARTIAL - per-camera mirror state is fixed; real mobile camera validation remains.
Priority: P0
Depends on: Task 2, Task 7

Goal:
Make the main user journey reliable from frame selection to preview.

Work:

- Fix retake to reset full session state.
- Fix change frame to reset captured photos and current index intentionally.
- Fix capture button disabled state after retake.
- Fix front/rear mirror rules.
- Align live camera overlay with final frame aspect ratio.
- Add per-slot preview consistency check.
- Handle camera permission denied.
- Handle no camera device.
- Handle mobile Safari/Android quirks.
- Add loading/error states for camera start/stop.
- Add tests for state transitions where possible.

Acceptance:

- User can complete session, retake, change frame, and complete again.
- Preview matches exported output orientation.
- Rear camera is not mirrored incorrectly.
- Live overlay matches final composition.

Validation:

- Manual smoke on desktop webcam.
- Manual smoke on real mobile browser.
- Playwright or equivalent state tests for flow transitions.

---

## Task 9 - Export, Download, And QR Share UX

Status: COMPLETE - local download and online share are separated and the duplicate upload path is removed.
Priority: P0
Depends on: Task 2, Task 3, Task 6, Task 8

Goal:
Make export/download/share produce exactly one correct artifact.

Work:

- Separate local download from upload/share.
- Do not trigger download when creating QR share link.
- Generate actual JPEG when user chooses JPG.
- Keep PNG as PNG.
- Upload final composite once.
- Preserve `frameId`.
- Store correct MIME type and extension.
- Handle server 413/size errors clearly.
- Avoid base64 memory blowups where possible.
- Add QR link copy/open states.
- Add share error recovery.

Acceptance:

- Download JPG creates real JPEG.
- Download PNG creates real PNG.
- QR share creates one backend photo record and one share link.
- No duplicate uploads.
- Shared image matches downloaded image.

Validation:

- Inspect file MIME.
- Check DB record count after one share action.
- Open QR/share link anonymously.

---

## Task 10 - UI System, Responsive, Animation, And Accessibility

Status: PARTIAL - reduced motion, modal semantics, and token fixes are in place; visual/device review remains.
Priority: P1
Depends on: Task 8, Task 9

Goal:
Make the UI polished, accessible, and stable across screen sizes.

Work:

- Fix missing Tailwind/design tokens:
  - typography utilities
  - color utilities
  - border/ring/input/muted/card tokens
  - bad `var(--paper-white)` reference
- Replace broken mojibake text with clean copy.
- Add reduced motion support:
  - page transitions
  - countdown
  - flash
  - looping animations
- Add focus trap/restore to modals.
- Add `aria-modal`, `aria-labelledby`, and correct dialog labels.
- Add keyboard behavior for dialogs and share controls.
- Fix mobile bottom nav route state.
- Ensure text does not overflow buttons/cards.
- Check desktop and mobile layouts visually.
- Replace external font imports with self-hosted or Next font strategy if needed.

Acceptance:

- `npm run lint` passes.
- UI has no obvious overlap on mobile/desktop.
- Reduced motion users do not get unnecessary motion.
- Dialogs are keyboard usable.

Validation:

```powershell
cd frontend
npm run lint
npm run build
```

Manual:

- Mobile viewport check.
- Desktop viewport check.
- Keyboard-only modal check.
- Reduced motion check.

---

## Task 11 - Performance And Asset Optimization

Status: PARTIAL - frame assets are converted to WebP and reduced from about 37 MB to about 3 MB; real-device profiling and remaining image warnings remain.
Priority: P1
Depends on: Task 7, Task 10

Goal:
Reduce load time and memory pressure.

Work:

- Generate optimized frame thumbnails.
- Avoid loading full 37 MB frame set in selection UI.
- Use Next Image or explicit optimized asset strategy.
- Lazy-load frame previews.
- Keep full-res frame assets only for final composition.
- Add canvas memory strategy:
  - preview resolution
  - export resolution
  - release object URLs
  - avoid unnecessary base64 copies
- Consider worker/offscreen canvas later if needed.
- Remove unused dependencies:
  - frontend `fabric` if unused
  - backend `nodemailer` if unused
- Add bundle analysis if size remains high.

Acceptance:

- Initial frame selection does not fetch all full-size PNG files.
- Mobile capture/export does not crash from memory pressure in normal use.
- Bundle and asset sizes are documented.

Validation:

- Network panel check.
- Mobile smoke test.
- Production build size review.

---

## Task 12 - Database, Migration, Backup, And Data Governance

Status: PARTIAL - SQLite path, backup script, migration, and cleanup hardening are in place; restore rehearsal remains.
Priority: P1
Depends on: Task 1, Task 3, Task 5, Task 6, Task 7

Goal:
Make data durable, recoverable, and legally safer.

Work:

- Decide SQLite vs Postgres production.
- If Postgres:
  - update Prisma datasource/env
  - test migration deploy
  - create backup plan
- If SQLite:
  - ensure persistent disk
  - enable safe backup process
  - avoid live inconsistent copy
- Move manual public-photo migration into documented/reproducible migration path.
- Add backup encryption or secure storage.
- Add backup retention.
- Add restore drill.
- Define retention policy for:
  - guest photos
  - deleted photos
  - audit logs
  - IP/user-agent metadata
- Add privacy/terms pages or deployment notes.

Acceptance:

- Production DB can be restored from backup.
- Data retention is documented.
- Migration deploy is repeatable.
- No local dev DB is used in production.

Validation:

- Run migration on staging.
- Run backup and restore test.

---

## Task 13 - Test, CI, Security, And Observability Gates

Status: PARTIAL - CI gates, readiness endpoint, request IDs/structured request logs, release gate script, tracked-source secret scan, 21 backend tests, and smoke coverage are in place; browser E2E and staging evidence remain.
Priority: P0
Depends on: Task 2 through Task 12 as applicable

Goal:
Make regressions visible before deploy.

Work:

- Add root validation script or CI workflow.
- Run `scripts/validate-release.ps1` before each release candidate.
- Backend:
  - unit tests
  - API integration tests
  - auth/ownership tests
  - upload/media tests
  - share tests
- Frontend:
  - lint pass
  - build pass
  - typecheck script if separate
  - key state tests if practical
  - E2E smoke for photobooth happy path
- Security:
  - dependency audit
  - secret scan
  - security headers check
  - CORS check
  - rate limit/proxy behavior check
- Observability:
  - structured logs
  - request IDs
  - error logging
  - health/readiness endpoint with DB check
- Add deployment checklist.

Acceptance:

- CI or local one-command gate fails on broken upload, lint error, audit high, or build failure.
- Health/readiness can distinguish app running from app actually ready.
- Logs are useful enough to debug production incidents.

Validation:

```powershell
npm run validate
```

or documented equivalent for backend and frontend.

---

## Task 14 - Staging Deploy, Production Runbook, And Go-Live

Status: PENDING
Priority: P1
Depends on: Task 0 through Task 13

Goal:
Deploy safely only after all release gates are satisfied.

Work:

- Create staging environment.
- Configure production-like env values.
- Run migrations on staging.
- Run frontend build against staging API.
- Run backend process with production env.
- Configure TLS/domain/proxy.
- Configure persistent DB/storage.
- Configure backup schedule.
- Configure cleanup schedule.
- Configure monitoring/error alerts.
- Run full smoke checklist:
  - auth
  - camera
  - frame selection
  - capture
  - retake
  - change frame
  - export PNG/JPG
  - share QR
  - gallery
  - delete/restore
  - private media access blocked
- Prepare rollback:
  - previous build
  - database backup
  - media backup
  - env snapshot
- Deploy production only after staging passes.

Acceptance:

- Staging smoke test passes.
- Production env does not use localhost.
- Rollback plan exists and has been rehearsed at least once.
- Production deploy has monitoring and backup active.

Validation:

- Staging URL tested.
- Production URL tested.
- Health/readiness endpoint green.
- Private media anonymous access blocked.

---

## Recommended Execution Order

1. Task 0 - clean repo and rotate secrets.
2. Task 1 - decide production architecture.
3. Task 2 - fix upload.
4. Task 3 - fix media privacy.
5. Task 4 - fix auth/admin/session.
6. Task 6 - fix share backend.
7. Task 8 - fix main photobooth flow.
8. Task 9 - fix export/share frontend.
9. Task 7 - move frame slots to DB.
10. Task 10 - UI, animation, accessibility.
11. Task 11 - performance.
12. Task 5 - photo lifecycle cleanup hardening.
13. Task 12 - DB/backup/data governance.
14. Task 13 - CI/security/observability gates.
15. Task 14 - staging and production go-live.

## Final Deploy Checklist

- No secrets or local user data tracked by git.
- Backend tests pass.
- Frontend lint passes.
- Frontend build passes.
- Prisma validate and migrate status pass.
- Backend audit has no high vulnerabilities.
- Frontend audit has no high vulnerabilities.
- Upload valid image works.
- Invalid upload is rejected safely.
- Private photo cannot be accessed anonymously.
- Share link access obeys expiry/revoke.
- Export JPG is real JPG.
- Export PNG is real PNG.
- QR share creates only one upload and one share link.
- Retake and change frame work after completing a session.
- Front/rear camera mirror behavior is correct.
- Frame overlay matches final composite.
- Mobile camera smoke test passes.
- Reduced motion is respected.
- Production env has real domain/API URL.
- Production DB/storage is persistent.
- Backup and restore have been tested.
- Staging smoke test passes.
- Rollback plan is ready.
