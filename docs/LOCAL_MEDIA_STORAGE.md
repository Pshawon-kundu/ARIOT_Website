# LOCAL_MEDIA_STORAGE.md — Local Media Provider Runbook

**Purpose**: How the **local filesystem media provider** works, how to configure and operate it, how to serve delivered media in production, how to back it up, and how to migrate to Cloudflare R2 later.

**Authority**: Decision D-068 (`docs/07_DECISIONS.md`, 2026-08-18) — media storage provider abstraction with `local` as the working default; R2 retained as the opt-in alternative (`docs/CLOUDFLARE_R2.md`).

> **Status (2026-08-18)**: The local provider is the working default in this repo (`MEDIA_STORAGE_PROVIDER=local`). Step 2.4.4 is ✅ Done; 238/239 node:test pass (1 opt-in R2 smoke skipped); `tsc`/`eslint`/`next build` green.

---

## 1. Environment contract

All three variables are optional at the base env layer (`server/env.ts`) and validated by Zod.

| Variable | Type | Default / Notes |
|---|---|---|
| `MEDIA_STORAGE_PROVIDER` | `'local' \| 'r2'` | Unset → `local` in development; **fail-closed in production** (app refuses to boot without an explicit value). Unknown value → fail-closed. `r2` requires the full `R2_*` + `MEDIA_UPLOAD_TOKEN_SECRET` set or the app fails closed. |
| `MEDIA_LOCAL_ROOT` | absolute path | Default `resolve(process.cwd(), '..', 'ariot-media-dev')`. **Production must set it explicitly.** Must be absolute; must not contain `..` segments; must not live inside the Next.js `public/` directory (enforced by `assertSafeLocalRoot`). |
| `MEDIA_PUBLIC_BASE_URL` | URL | Optional. When set, local public-URL generation prefers `<base>/media/<path>`; otherwise it emits site-relative `/media/<path>`. |

`.env.example` documents all three. Never commit a real `MEDIA_LOCAL_ROOT` that points at a production volume.

---

## 2. Storage layout

Provider-neutral keys (the same layout as R2, enforced by `server/storage/upload-keys.ts`):

```
<MEDIA_LOCAL_ROOT>/
  tmp/uploads/{yyyy}/{mm}/{id}.{ext}        # in-flight uploads, never served
  public/products/{images|videos}/{yyyy}/{mm}/{id}.{ext}   # promoted, immutable
```

- Keys are built exclusively from server-generated components (`newMediaAssetId()`, approved-MIME extension, UTC date parts). Absolute filesystem paths are never persisted — `MediaAsset.storageKey` holds the provider-neutral key.
- Approved MIME types (`server/admin/media/media-policy.ts`): images `image/jpeg|png|webp|avif` (≤ 10 MB), videos `video/mp4|webm` (≤ 200 MB). Documents, firmware, 3D models, and private files remain deferred (D-067).
- The upload pipeline (`localUploadFromForm` in `server/storage/local-upload.ts`) mirrors the R2 flow: RBAC gate → strict Zod form contract → MIME/kind agreement → size caps → temp write (exclusive create) → real file-signature verification → atomic promote → size re-stat → `persistCompletedAsset` → compensation cleanup of owned temp/public keys on failure.

---

## 3. Admin upload (client)

The client never picks the provider:

1. `GET /api/admin/media/upload/mode` → `{ provider: 'local' }` (server-resolved, `media.write`).
2. `useMediaUpload` (provider-agnostic, `features/admin/media/use-media-upload.ts`) then POSTs a multipart form (`file`, `mimeType`, `kind`) to `POST /api/admin/media/uploads/local` with progress + abort support.
3. Health check: `GET /api/admin/media/storage/health` (admin-gated) → `checkHealth` verifies the root is writable.

---

## 4. Public delivery

**Development / self-hosted**: the app itself serves public media via `app/media/[...segments]/route.ts` — Node runtime, active only while the provider is `LocalMediaStorageProvider`; reconstructs the `public/{...}` key, supports GET + HEAD, Range requests (`206`, `416`; max served range 10 MiB), and sends `Cache-Control: public, max-age=31536000, immutable`. `tmp/` is unreachable; there is no directory listing; `MEDIA_LOCAL_ROOT` is never leaked.

**Production behind Nginx** (recommended — bypass the app for media): alias the promoted `public/` tree and delegate immutable caching + range handling to Nginx:

```nginx
# /etc/nginx/sites-available/ariot (snippet)
# Server the promoted media tree directly; the app route app/media/[...segments]
# remains as the fallback for environments without this location.
location ^~ /media/ {
    alias /var/lib/ariot/media/public/;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}
```

> **Documentation only.** Do NOT deploy this snippet as part of the ARIOT repository — it belongs in your VPS/container Nginx config during the production deployment step.

Notes:
- `alias` must point at the `public/` directory *inside* `MEDIA_LOCAL_ROOT` (the `public/` prefix is already consumed by the `/media/` URL path). Do not alias `MEDIA_LOCAL_ROOT` itself — that would expose `tmp/`.
- Images/videos are immutable after promote, so a long cache is safe; if you ever replace an asset, use a new `id` (new URL), never overwrite in place.
- If you use `MEDIA_PUBLIC_BASE_URL`, point it at the Nginx/CDN origin (e.g. `https://media.ariot.tech`) so stored URLs are absolute and CDN-ready.

---

## 5. Backup / restore

The local provider makes backups a two-part job:

1. **Database** — `pg_dump` of the main DB (MediaAsset/ProductImage/ProductVideo and audit rows), exactly as before.
2. **Media tree** — the promoted files under `<MEDIA_LOCAL_ROOT>/public/`. Copy them off-server (rsync/rclone/object-storage upload) on the same cadence as the DB dump.

Restore = restore the DB, then restore the `public/` tree into the same `<MEDIA_LOCAL_ROOT>` (keys are content-addressed by id, so URLs stay valid).

`tmp/uploads/` is disposable and must NOT be backed up.

---

## 6. Migrating to Cloudflare R2

When R2 credentials exist, the provider can be switched without a schema change:

1. Provision R2 per `docs/CLOUDFLARE_R2.md` §2 and set `MEDIA_STORAGE_PROVIDER=r2` + the `R2_*` + `MEDIA_UPLOAD_TOKEN_SECRET` vars.
2. **This document intentionally ships no migration script.** The R2 migration is a separate, operator-approved task: copy `<MEDIA_LOCAL_ROOT>/public/` objects into the bucket's `public/products/...` prefixes (key-for-key), then backfill `MediaAsset.cdnUrl` for the affected rows if the R2 custom domain should become canonical.
3. Verify with the opt-in smoke test (`tests/media-upload-r2.smoke.test.ts`, §5 runbook in `docs/CLOUDFLARE_R2.md`) before cutting over.
4. Keep both providers' files available during the transition window so existing URLs keep resolving; the local delivery route simply stops matching once the provider is `r2`.

---

## 7. File map (new in D-068)

| Path | Purpose |
|---|---|
| `server/storage/media-storage-provider.ts` | `MediaStorageProvider` interface + `MediaStorageProviderName` |
| `server/storage/media-storage-config.ts` | `LocalMediaConfig`, `getLocalMediaConfig`, `assertSafeLocalRoot` |
| `server/storage/local-storage-fs.ts` | `resolveKeyPath`, `writeTempFile`, `promoteToPublic`, `deleteOwnedKey`, `statPublicKey`, `isRootWritable` |
| `server/storage/local-media-storage.ts` | `LocalMediaStorageProvider` |
| `server/storage/r2-media-storage.ts` | `R2MediaStorageProvider` (opt-in) |
| `server/storage/get-media-storage-provider.ts` | `resolveProviderName`, `getMediaStorageProvider`, test reset |
| `server/storage/media-file-verification.ts` | `verifyUploadedBuffer` (file-signature check) |
| `server/storage/local-upload.ts` | `localUploadFromForm` (multipart pipeline) |
| `app/api/admin/media/uploads/local/route.ts` | Local upload route |
| `app/api/admin/media/upload/mode/route.ts` | Server-resolved provider mode |
| `app/api/admin/media/storage/health/route.ts` | Provider health |
| `app/media/[...segments]/route.ts` | Public delivery route (local provider only) |
