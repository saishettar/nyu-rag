// Mounted once at the app root. Defines the SVG filter every `.glass-surface`
// / `.glass-accent` element references via `backdrop-filter: url(#liquid-glass-lens)`
// to bend the blurred backdrop like light refracting through curved glass.
export function LiquidGlassDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
      <filter id="liquid-glass-lens" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
