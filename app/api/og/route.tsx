import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const SITE_NAME = 'ARIOT';
const SITE_FULL_NAME = 'ARIOT — Autonomous Robotics and IoT';

const colors = {
  bg: '#08090B',
  bgRaised: '#0E1014',
  steel100: '#E4E8EE',
  steel200: '#C7CDD6',
  steel400: '#7C8593',
  steel600: '#3F4753',
  steel700: '#2A3038',
  cyan400: '#3DD8F7',
  cyan500: '#10B6D9',
};

const fonts = {
  display: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2',
  body: 'https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ90OmSqEpJpE.woff2',
};

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  return res.arrayBuffer();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'product':
      return colors.cyan400;
    case 'blog':
      return '#34D399';
    case 'solution':
      return '#F5B449';
    case 'support':
      return '#F26B6B';
    default:
      return colors.steel400;
  }
}

function getBadgeLabel(type: string): string {
  switch (type) {
    case 'product':
      return 'PRODUCT';
    case 'blog':
      return 'BLOG';
    case 'solution':
      return 'SOLUTION';
    case 'support':
      return 'SUPPORT';
    default:
      return '';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const title = searchParams.get('title') ?? SITE_FULL_NAME;
    const type = searchParams.get('type') ?? '';
    const badge = getBadgeLabel(type);
    const badgeColor = getBadgeColor(type);

    const [displayFont, bodyFont] = await Promise.all([
      loadFont(fonts.display),
      loadFont(fonts.body),
    ]);

    const truncatedTitle = title.length > 80 ? title.slice(0, 77) + '...' : title;

    return new ImageResponse(
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: colors.bg,
          padding: '60px',
          fontFamily: '"Inter"',
          color: colors.steel100,
        }}
      >
        {/* Top: Badge + site name */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${colors.cyan400}, ${colors.cyan500})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk"',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: colors.bg,
                }}
              >
                A
              </span>
            </div>
            <span
              style={{
                fontFamily: '"Space Grotesk"',
                fontSize: '18px',
                fontWeight: '600',
                color: colors.steel200,
                letterSpacing: '0.05em',
              }}
            >
              {SITE_NAME}
            </span>
          </div>
          {badge && (
            <div
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: `${badgeColor}20`,
                border: `1px solid ${badgeColor}40`,
                fontSize: '14px',
                fontWeight: '600',
                color: badgeColor,
                letterSpacing: '0.1em',
                fontFamily: '"Space Grotesk"',
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: '52px',
              fontWeight: '600',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              color: colors.steel100,
              margin: 0,
            }}
          >
            {escapeHtml(truncatedTitle)}
          </h1>
        </div>

        {/* Bottom: Separator + footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Cyan accent line */}
          <div
            style={{
              height: '2px',
              background: `linear-gradient(90deg, ${colors.cyan400}, transparent)`,
              borderRadius: '1px',
            }}
          />
          {/* Footer row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: colors.steel400,
                fontFamily: '"Inter"',
              }}
            >
              {SITE_FULL_NAME}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: colors.steel400,
                fontFamily: '"JetBrains Mono"',
              }}
            >
              ariot.tech
            </span>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Space Grotesk',
            data: displayFont,
            style: 'normal',
            weight: 600,
          },
          {
            name: 'Inter',
            data: bodyFont,
            style: 'normal',
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    console.error('OG image generation failed:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
