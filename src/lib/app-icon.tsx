// Shared bullseye glyph used by every generated PWA icon (favicon, apple touch icon, and the
// manifest's 192/512/512-maskable PNGs) via next/og's ImageResponse, so they all render
// identically at every size instead of drifting out of sync as separate hand-tuned assets.
export function AppIconGlyph({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = size - padding * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2a78d6",
      }}
    >
      <svg width={inner} height={inner} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="9" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="white" strokeWidth="9" />
        <circle cx="50" cy="50" r="7" fill="white" />
      </svg>
    </div>
  );
}
