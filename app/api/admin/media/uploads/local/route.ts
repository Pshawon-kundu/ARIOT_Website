import { NextResponse } from 'next/server';
import { localUploadFromForm } from '@/server/storage/local-upload';
import { MAX_VIDEO_SIZE_BYTES } from '@/server/admin/media/media-policy';

/**
 * POST /api/admin/media/uploads/local
 *
 * Local-provider upload route (D-068): single multipart request. Authorization
 * (media.write) and the entire pipeline (temp write → signature verify →
 * atomic promote → verify → transactional persist) run inside
 * `localUploadFromForm`; this handler stays a thin dispatcher.
 */
export const runtime = 'nodejs';

/** Multipart overhead slack for fields/boundaries above the largest file. */
const FORM_OVERHEAD_BYTES = 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Pre-parse DoS guard: reject oversized bodies from the Content-Length
    // header before multipart parsing buffers anything. The per-kind size cap
    // is re-checked authoritatively inside localUploadFromForm.
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_VIDEO_SIZE_BYTES + FORM_OVERHEAD_BYTES
    ) {
      return NextResponse.json(
        { ok: false, type: 'validation', message: 'Request body exceeds the video size limit.' },
        { status: 413 },
      );
    }

    const form = await request.formData();
    const result = await localUploadFromForm(form, request);
    const status = result.ok
      ? 200
      : result.type === 'forbidden'
        ? 403
        : result.type === 'conflict'
          ? 409
          : result.type === 'not_configured'
            ? 503
            : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { ok: false, type: 'error', message: 'Internal server error.' },
      { status: 500 },
    );
  }
}
