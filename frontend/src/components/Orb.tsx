export function Orb({ size = 28 }: { size?: number }) {
  return (
    <span
      className="orb"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
