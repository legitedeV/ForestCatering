'use client';

export default function GrainOverlay() {
  return (
    <div
      className="grain-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#grain-filter)',
          opacity: 0.06,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
