import { NextResponse } from 'next/server';
import { initiateUpload } from '@/server/storage/storage-service';

/**
 * POST /api/admin/media/upload/initiate
 *
 * Step 1 of the R2 upload flow (STORAGE-1R / D-067). Authorization (media.write)
 * is enforced inside initiateUpload. Returns a 5-minute presigned PUT bound to
 * the approved Content-Type, plus the HMAC completion token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await initiateUpload(body);
    const status = result.ok
      ? 200
      : result.type === 'forbidden'
        ? 403
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
