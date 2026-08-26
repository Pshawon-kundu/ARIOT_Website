# CLOUDFLARE_R2.md — R2 Provisioning & Operation Guide

**Purpose**: How to provision, configure, and smoke-test the Cloudflare R2 storage used by the admin media upload pipeline (Step 2.4.4, STORAGE-1R / D-067). This is the operational companion to the code in `server/storage/`.

**Authority**: Decision D-067 (`docs/07_DECISIONS.md`) — Cloudflare R2 selected as the S3-compatible provider; bucket-per-environment; public delivery via custom domain with WAF default-deny. Decision D-068 (`docs/07_DECISIONS.md`, 2026-08-18) added a **media storage provider abstraction**: R2 is now the **opt-in** provider behind `MEDIA_STORAGE_PROVIDER=r2`; the working default is the **local filesystem provider** (`MEDIA_STORAGE_PROVIDER=local`, see `docs/LOCAL_MEDIA_STORAGE.md`). R2 requires the full `R2_*` + `MEDIA_UPLOAD_TOKEN_SECRET` env set or the app fails closed at boot. Verify R2 with the §5 smoke-test runbook before switching a production environment to R2.

> **Status (2026-08-18)**: Step 2.4.4 is ✅ Done on the **local** provider (238/239 tests pass, 1 opt-in R2 smoke skipped). R2 code/route/tests are retained and switchable; no R2 credentials exist in the local `.env`, so the live R2 smoke test has not run (I-027, R2-only).

---

## 1. Key Layout (canonical, enforced by `server/storage/upload-keys.ts`)

| Purpose | Key | Visibility |
|---|---|---|
| In-flight uploads (browser PUT target) | `tmp/uploads/{yyyy}/{mm}/{mediaAssetId}.{ext}` | Private (temporary) |
| Promoted permanent media | `public/products/{images\|videos}/{yyyy}/{mm}/{mediaAssetId}.{ext}` | Public (immutable, `Cache-Control: public, max-age=31536000, immutable`) |

- Keys are built exclusively from server-generated components (uuid `mediaAssetId`, ext from the approved-MIME map, UTC date parts). Strict parsers reject `..`, `//`, `\`, uppercase extensions, and out-of-range year/month before any S3 call.
- Approved MIME types (see `server/admin/media/media-policy.ts`): images `image/jpeg|png|webp|avif` (max 10 MB), videos `video/mp4|webm` (max 200 MB). Everything else (documents, firmware, 3D models, private files) is **deferred** and must not be uploaded.

## 2. Provisioning Checklist

1. **Create the bucket** — one bucket per environment, e.g. `ariot-media-dev`, `ariot-media-prod`. Leave the `r2.dev` subdomain **disabled** (D-067: production must not expose `r2.dev`).
2. **Create an API token** (R2 → Manage R2 API Tokens) with **Object Read & Write** scoped to the environment bucket. Grant "Admin" permission on that bucket (or at minimum the prefix space `*` — the app writes both `tmp/` and `public/`).
3. **Record credentials** — Cloudflare Account ID (dashboard URL, `xxxx.r2.cloudflarestorage.com`), Access Key ID, Secret Access Key.
4. **Attach a custom domain** (recommended for prod, e.g. `media.ariot.tech`) so public media is served through Cloudflare's edge with cache control.
5. **CORS** — the browser uploads directly to R2 with a presigned PUT. Configure a CORS rule for the bucket: allow the site origin(s), methods `PUT, GET, HEAD`, and headers `Content-Type, Content-Length, ETag, If-Match` (the completion flow sends `If-Match` on a ranged GET; the presigned PUT sends `Content-Type`). Expose `ETag`.
6. **WAF / access policy** (D-067, production):
   - Default-deny everything except `/public/*`.
   - Explicitly block `/tmp/*` and `/private/*` from anonymous reads (the temp prefix is only ever touched via presigned URLs).
   - Apply to the custom domain's Cloudflare WAF or, if using direct R2, rely on the bucket's "no public access" state plus presigned-only temp reads.
7. **Env vars** — see §3. Values go in `.env` (local/dev), the hosting platform's env store (preview/prod). Never commit real secrets.

## 3. Environment Variables (all in `server/env.ts`, Zod-validated)

| Variable | Required | Notes |
|---|---|---|
| `R2_ACCOUNT_ID` | dev+prod | Cloudflare account ID (endpoint host prefix). |
| `R2_ACCESS_KEY_ID` | dev+prod | API token access key id. |
| `R2_SECRET_ACCESS_KEY` | dev+prod | API token secret. |
| `R2_BUCKET_NAME` | dev+prod | e.g. `ariot-media-dev`. One bucket per env. |
| `R2_PUBLIC_BASE_URL` | prod (rec. dev) | e.g. `https://media.ariot.tech`. Unset → media URLs fall back to site-relative `/{storageKey}` paths. |
| `MEDIA_UPLOAD_TOKEN_SECRET` | dev+prod | HMAC-SHA256 secret, **min 32 chars**. Generate: `openssl rand -base64 32`. Never logged. |

**Partial-config rule**: if any `R2_*` var is present, the whole set must be present — partial config fails fast at boot. `R2_*` vars are optional at the base env layer (a static Phase 1 deploy has no storage); R2-backed server code must call `getR2Config()` / `getR2ConfigSafe()` and handle the unconfigured case (`null`) before any S3 call.

## 4. Upload Flow (what the smoke test exercises)

```
Browser ── POST /api/admin/media/upload/initiate  (media.write)
        ── 200: { uploadUrl (5-min presigned PUT, Content-Type bound),
                 tempKey, publicKey, mediaAssetId, token }
Browser ── PUT  {uploadUrl}  (raw bytes, signed Content-Type)
Browser ── POST /api/admin/media/upload/complete  (media.write + same user)
Server  ── verify token (HMAC, 15-min, jti) → validateTokenKeys
        ── HEAD temp (exact size + MIME + ETag)
        ── GET temp range 0..64KiB with If-Match → file-type signature check
        ── CopyObject → public immutable key (CacheControl REPLACE)
        ── HEAD public (reverify) → MediaAsset + AuditLog (one txn)
        ── 200: { asset }   (idempotent on replay of the same token)
```

## 5. Smoke-Test Runbook (blocks ✅ closure — see I-027)

Requirements: a dev-bucket provisioned per §2, all six env vars set, a seeded admin user with `media.write`, and a running dev server with a valid session.

### 5.1 Automated smoke test (preferred, 2026-08-17)

`tests/media-upload-r2.smoke.test.ts` runs the end-to-end pipeline (initiate → presigned PUT → complete → promote → persist → cleanup) against a real R2 dev bucket. It is **opt-in**: the suite returns "skipped" if any `R2_*` / `MEDIA_UPLOAD_TOKEN_SECRET` env var is missing, fails fast if config is partial, and explicitly refuses any bucket name that looks like production. To run it locally after provisioning:

```bash
export R2_ACCOUNT_ID=…
export R2_ACCESS_KEY_ID=…
export R2_SECRET_ACCESS_KEY=…
export R2_BUCKET_NAME=ariot-r2-dev        # must NOT contain 'prod', 'live', 'public'
export R2_ENDPOINT=…                      # optional (derived from ACCOUNT_ID otherwise)
export MEDIA_UPLOAD_TOKEN_SECRET=$(openssl rand -base64 32)
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
  --test tests/media-upload-r2.smoke.test.ts
```

The 12 PostgreSQL integration scenarios in `tests/upload-complete-integration.test.ts` (run with the disposable DB in §2.4) cover the same flows against a mock S3 client and always run on CI / pre-commit; the R2 smoke test is the final gate.

### 5.2 Manual runbook (UI walkthrough)

1. Sign in as admin; open `/admin/products/[id]/media` and confirm the upload control is enabled (not the disabled placeholder).
2. Initiate: capture the `initiate` response (network tab) — verify `uploadUrl` host is the R2 endpoint and `X-Amz-*` query params are present, and that the client **only** sent `{filename, mimeType, sizeBytes, kind}` (no `userId`/`mediaAssetId`).
3. Upload a small approved `image/jpeg` via the UI; confirm success and the media card appears in the gallery.
4. Verify the temp object is gone from `tmp/uploads/...` (CopyObject promote + best-effort cleanup) and the public object exists at `public/products/images/{yyyy}/{mm}/{id}.jpg` with `Cache-Control: public, max-age=31536000, immutable`.
5. Confirm the MediaAsset row + `MEDIA_ASSET_UPLOADED` AuditLog were created (DB) with the same `id` returned by initiate.
6. Replay the same completion token — expect the same asset (`created: false`, idempotency).
7. Negative checks: upload with a different user's token → 403; MIME `text/html` masked as `.jpg` → rejected at signature check; oversized file → 413/400; tampered token → 400.
8. Confirm `/tmp/*` is not anonymously readable and `/public/*` is (custom domain or `R2_PUBLIC_BASE_URL` + full key).

## 6. Operational Notes

- **No egress fees** — R2 is cost-predictable for the regional market; media can be cached long-term (immutable keys, one-year cache-control).
- **Object lifecycle**: temp objects not completed within 15 minutes are orphaned; add a bucket lifecycle rule to expire `tmp/` objects after 1 day.
- **MediaAsset.id is the idempotency boundary** — completion replay returns the same verified asset without duplicate rows.
- **Upload completion is separate from product attachment** — attaching a completed asset to a product uses the existing authorised mutations in `server/admin/products/update-product-media.ts`.
