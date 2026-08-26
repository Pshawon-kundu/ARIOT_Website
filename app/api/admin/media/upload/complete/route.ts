import { NextResponse } from 'next/server';
import { completeUpload } from '@/server/storage/storage-service';

/**
 * POST /api/admin/media/upload/complete
 *
 * Step 3 of the R2 upload flow (STORAGE-1R / D-067). Authorization (media.write
 * AND the same user who initiated) is enforced inside completeUpload. Verifies
 * the uploaded object, promotes it to the immutable public key, and persists
 * MediaAsset + AuditLog in one transaction.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await completeUpload(body);
    const status = result.ok
      ? 200
      : result.type === 'forbidden'
        ? 403
        : result.type === 'conflict'
          ? 409
          : result.type === 'not_found'
            ? 404
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
