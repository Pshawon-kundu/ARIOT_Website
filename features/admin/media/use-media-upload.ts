'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminMediaAssetDto } from '@/server/admin/products/get-product-media';

/**
 * Media upload orchestration (D-068) — provider-agnostic client half.
 *
 * The server resolves the active storage provider; this hook reads it once via
 * GET /api/admin/media/upload/mode and picks the matching transport:
 *
 *   - local: single multipart POST to /api/admin/media/uploads/local.
 *   - r2 (STORAGE-1R / D-067): initiate → presigned PUT → complete.
 *
 * Client-side pre-checks mirror the server media policy (mime + size); the
 * server re-validates authoritatively at upload time.
 *
 * Upload completion is separate from product attachment — the completed asset
 * is returned via `asset` so the caller can wire it into hero/gallery slots.
 *
 * Cancellation: the XHR exposes `xhr.abort()` via the ref. Duplicate-submit
 * guard: `phase` is checked at the start of `uploadFile`. Honest state: a
 * successful transport that fails finalization is reported as an error.
 */

/** Mirrors `APPROVED_IMAGE_MIMES` + `APPROVED_VIDEO_MIMES` in server policy. */
const APPROVED_UPLOAD_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
]);

/** Mirrors `MAX_IMAGE_SIZE_BYTES` / `MAX_VIDEO_SIZE_BYTES` in server policy. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

type UploadMode = 'local' | 'r2';

export type MediaUploadPhase =
  | 'idle'
  | 'initiating'
  | 'uploading'
  | 'completing'
  | 'done'
  | 'error';

interface MediaUploadState {
  phase: MediaUploadPhase;
  /** Upload progress percentage during the transport. */
  progress: number;
  error: string | null;
  asset: AdminMediaAssetDto | null;
  fileName: string | null;
  uploadFile: (file: File) => void;
  cancel: () => void;
  reset: () => void;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function useMediaUpload(): MediaUploadState {
  const [phase, setPhase] = useState<MediaUploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<AdminMediaAssetDto | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // XHR + cancellation
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  // Duplicate-submit guard: only one upload in flight at a time.
  const inflightRef = useRef(false);
  // Cached server-resolved provider mode.
  const modeRef = useRef<UploadMode | null>(null);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
      xhrRef.current = null;
    };
  }, []);

  const resolveMode = useCallback(async (): Promise<UploadMode | null> => {
    if (modeRef.current) return modeRef.current;
    try {
      const res = await fetch('/api/admin/media/upload/mode');
      const data = parseJson(await res.text()) as {
        ok?: boolean;
        provider?: string;
      };
      if (data?.ok && (data.provider === 'local' || data.provider === 'r2')) {
        modeRef.current = data.provider;
        return data.provider;
      }
    } catch {
      // Fall through to the unavailable state.
    }
    return null;
  }, []);

  /**
   * Shared XHR transport with progress + abort. Resolves `null` on network
   * error/abort, otherwise `{ status, data }`.
   */
  const xhrSend = useCallback(
    (opts: {
      method: string;
      url: string;
      body: XMLHttpRequestBodyInit | null;
      headers?: Record<string, string>;
    }): Promise<{ status: number; data: unknown } | null> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open(opts.method, opts.url);
        for (const [key, value] of Object.entries(opts.headers ?? {})) {
          xhr.setRequestHeader(key, value);
        }
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          xhrRef.current = null;
          resolve({ status: xhr.status, data: parseJson(xhr.responseText) });
        };
        xhr.onerror = () => {
          xhrRef.current = null;
          resolve(null);
        };
        xhr.onabort = () => {
          xhrRef.current = null;
          resolve(null);
        };
        xhr.send(opts.body);
      });
    },
    [],
  );

  const fail = useCallback((message: string) => {
    setPhase('error');
    setError(message);
  }, []);

  /** Local provider: single multipart POST (D-068). */
  const runLocalUpload = useCallback(
    async (file: File, kind: 'IMAGE' | 'VIDEO') => {
      setPhase('uploading');
      const form = new FormData();
      form.append('file', file);
      form.append('mimeType', file.type);
      form.append('kind', kind);
      const res = await xhrSend({
        method: 'POST',
        url: '/api/admin/media/uploads/local',
        body: form,
      });
      if (!res) {
        fail('Network error during upload. Please try again.');
        return;
      }
      const result = res.data as { ok?: boolean; asset?: AdminMediaAssetDto; message?: string };
      if (res.status >= 200 && res.status < 300 && result?.ok && result.asset) {
        setAsset(result.asset);
        setPhase('done');
        return;
      }
      fail(result?.message ?? `Storage rejected the upload (HTTP ${res.status}).`);
    },
    [xhrSend, fail],
  );

  /** R2 provider: initiate → presigned PUT → complete (STORAGE-1R / D-067). */
  const runR2Upload = useCallback(
    async (file: File, kind: 'IMAGE' | 'VIDEO') => {
      // 1) Initiate — server mints the completion token + presigned PUT.
      let initiate: {
        ok?: boolean;
        uploadUrl?: string;
        token?: string;
        message?: string;
      };
      try {
        const res = await fetch('/api/admin/media/upload/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            kind,
          }),
        });
        initiate = parseJson(await res.text()) as typeof initiate;
      } catch {
        fail('Could not reach the upload service. Please try again.');
        return;
      }

      if (!initiate?.ok || !initiate.uploadUrl || !initiate.token) {
        fail(initiate?.message ?? 'Upload could not be started.');
        return;
      }

      // 2) Upload — presigned PUT with the bound Content-Type header.
      setPhase('uploading');
      const put = await xhrSend({
        method: 'PUT',
        url: initiate.uploadUrl,
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!put || put.status < 200 || put.status >= 300) {
        fail(
          put
            ? `Storage rejected the upload (HTTP ${put.status}).`
            : 'Network error during upload.',
        );
        return;
      }

      // 3) Complete — strict contract: completionToken only.
      setPhase('completing');
      try {
        const res = await fetch('/api/admin/media/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completionToken: initiate.token }),
        });
        const result = parseJson(await res.text()) as {
          ok?: boolean;
          asset?: AdminMediaAssetDto;
          message?: string;
        };
        if (result?.ok && result.asset) {
          setAsset(result.asset);
          setPhase('done');
          return;
        }
        fail(result?.message ?? 'Upload could not be finalized.');
      } catch {
        fail('Upload could not be finalized. Please try again.');
      }
    },
    [xhrSend, fail],
  );

  const runUpload = useCallback(
    async (file: File, kind: 'IMAGE' | 'VIDEO') => {
      setPhase('initiating');
      setProgress(0);
      const mode = await resolveMode();
      if (!mode) {
        fail('Upload service is not available.');
        return;
      }
      if (mode === 'local') {
        await runLocalUpload(file, kind);
      } else {
        await runR2Upload(file, kind);
      }
    },
    [resolveMode, runLocalUpload, runR2Upload, fail],
  );

  const uploadFile = useCallback(
    (file: File) => {
      // Duplicate-submit guard — only one upload in flight at a time.
      if (inflightRef.current) {
        return;
      }
      setError(null);

      if (!APPROVED_UPLOAD_MIMES.has(file.type)) {
        fail('Unsupported file type. Use JPEG, PNG, WebP, AVIF, MP4, or WebM.');
        return;
      }
      const isVideo = file.type.startsWith('video/');
      const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > maxBytes) {
        fail(isVideo ? 'Video exceeds the 200 MB limit.' : 'Image exceeds the 10 MB limit.');
        return;
      }

      setFileName(file.name);
      inflightRef.current = true;
      void runUpload(file, isVideo ? 'VIDEO' : 'IMAGE').finally(() => {
        inflightRef.current = false;
      });
    },
    [runUpload, fail],
  );

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    inflightRef.current = false;
    setPhase('idle');
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setError(null);
    setAsset(null);
    setFileName(null);
  }, [cancel]);

  return { phase, progress, error, asset, fileName, uploadFile, cancel, reset };
}
