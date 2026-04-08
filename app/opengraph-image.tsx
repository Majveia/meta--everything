import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'meta//everything — The void generates. Everything recurses.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -40,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(191,90,60,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#BF5A3C" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="5" fill="#BF5A3C" />
            <line x1="16" y1="2" x2="16" y2="30" stroke="#BF5A3C" strokeWidth="0.75" opacity="0.4" />
            <line x1="2" y1="16" x2="30" y2="16" stroke="#BF5A3C" strokeWidth="0.75" opacity="0.4" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 400,
            color: '#E8E0D4',
            letterSpacing: '-0.03em',
            fontFamily: 'Georgia, serif',
          }}
        >
          meta//everything
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 18,
            color: '#6B6560',
            marginTop: 16,
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          The void generates. Everything recurses.
        </div>

        {/* Platform dots */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 40,
          }}
        >
          {[
            { color: '#9146FF', label: 'Twitch' },
            { color: '#FF0000', label: 'YouTube' },
            { color: '#8B8580', label: 'X' },
            { color: '#E8A849', label: 'Substack' },
            { color: '#53FC18', label: 'Kick' },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p.color,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
