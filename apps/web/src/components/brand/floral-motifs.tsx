/**
 * Iraqi / regional–inspired floral botanical linework (interpretive).
 * Hand-drawn, imperfect, textile-adjacent — not clip-art or literal heritage claims.
 * Used only through DecorativeMotif; always aria-hidden at the parent.
 */

/** Small stylized bloom — slightly asymmetric petals */
export function FloralBloom({
  cx,
  cy,
  scale = 1,
}: {
  cx: number;
  cy: number;
  scale?: number;
}) {
  const s = scale;
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${s})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 -7.2 C2.2 -5.4 2.6 -2.8 1.4 -0.6 C0.4 -2.2 -0.8 -2.4 -1.6 -0.8 C-2.8 -2.9 -2.2 -5.6 0 -7.2Z" />
      <path d="M5.8 -3.2 C5.2 -0.6 3.2 1.2 0.8 1.6 C2.4 0.4 2.8 -0.8 1.6 -2.2 C3.4 -3.6 5.1 -3.9 5.8 -3.2Z" />
      <path d="M4.6 4.8 C2.1 5.4 0.2 4.2 -0.6 2.2 C0.8 3.2 2 3.1 3.1 2.1 C4.6 3.2 5.4 4.1 4.6 4.8Z" />
      <path d="M-4.8 4.6 C-5.6 2.4 -4.4 0.4 -2.2 -0.4 C-3.4 1 -3.2 2.2 -2.1 3.2 C-3.4 4.5 -4.4 5.2 -4.8 4.6Z" />
      <path d="M-6.1 -2.6 C-4.2 -4.4 -1.8 -4.2 -0.4 -2.4 C-1.8 -3.2 -3 -2.9 -3.8 -1.6 C-5.2 -2.4 -6 -2.2 -6.1 -2.6Z" />
      <circle cx="0" cy="0" r="1.35" fill="currentColor" opacity="0.55" />
    </g>
  );
}

export function FloralLeaf({
  cx,
  cy,
  rotate = 0,
  scale = 1,
}: {
  cx: number;
  cy: number;
  rotate?: number;
  scale?: number;
}) {
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 8 C-3.5 4 -4 -1 -1.5 -6 C0.5 -9 2.5 -6.5 2  -2 C1.6 1.5 1.2 5 0 8Z" />
      <path d="M0 7 C0.2 3 0.4 -1 0.6 -4.5" opacity="0.55" />
    </g>
  );
}

export function FloralDividerSvg() {
  return (
    <svg
      viewBox="0 0 240 28"
      className="h-6 w-full max-w-sm"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <line
        x1="12"
        y1="14"
        x2="78"
        y2="14"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <FloralLeaf cx={88} cy={14} rotate={-55} scale={0.72} />
      <FloralBloom cx={112} cy={14} scale={0.95} />
      <FloralLeaf cx={136} cy={14} rotate={125} scale={0.72} />
      <rect
        x="148"
        y="13"
        width="12"
        height="2"
        fill="var(--color-brand-secondary)"
        opacity="0.85"
      />
      <line
        x1="164"
        y1="14"
        x2="228"
        y2="14"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}

export function FloralBorderSvg() {
  const blooms = [20, 56, 92, 128, 164, 200, 228];
  return (
    <svg
      viewBox="0 0 248 16"
      className="h-3.5 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="0"
        y1="8"
        x2="248"
        y2="8"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.28"
      />
      {blooms.map((x, i) =>
        i % 2 === 0 ? (
          <FloralBloom key={x} cx={x} cy={8} scale={0.42} />
        ) : (
          <FloralLeaf key={x} cx={x} cy={8} rotate={i % 4 === 1 ? 40 : -40} scale={0.5} />
        ),
      )}
    </svg>
  );
}

export function FloralCornerSvg() {
  return (
    <svg viewBox="0 0 48 48" className="size-full" aria-hidden>
      <path
        d="M4 28 C4 12 12 4 28 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <FloralBloom cx={18} cy={18} scale={0.85} />
      <FloralLeaf cx={32} cy={12} rotate={-20} scale={0.65} />
      <FloralLeaf cx={12} cy={32} rotate={70} scale={0.6} />
    </svg>
  );
}

export function FloralCardAccentSvg() {
  return (
    <svg viewBox="0 0 28 28" className="size-full" aria-hidden>
      <FloralBloom cx={14} cy={14} scale={0.7} />
    </svg>
  );
}

/** Vertical botanical strip — crop at section edges */
export function FloralSideSvg() {
  return (
    <svg
      viewBox="0 0 64 280"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        d="M34 8 C30 48 38 72 28 110 C22 138 40 160 32 198 C26 228 36 250 30 272"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <FloralLeaf cx={26} cy={42} rotate={-25} scale={0.9} />
      <FloralBloom cx={38} cy={88} scale={0.85} />
      <FloralLeaf cx={22} cy={128} rotate={35} scale={0.8} />
      <FloralBloom cx={40} cy={168} scale={0.75} />
      <FloralLeaf cx={24} cy={210} rotate={-15} scale={0.85} />
      <FloralBloom cx={36} cy={248} scale={0.7} />
    </svg>
  );
}

/** Soft scattered field — low opacity atmospheric layer */
export function FloralFieldSvg() {
  const blooms = [
    { x: 36, y: 40, s: 1.1 },
    { x: 120, y: 28, s: 0.8 },
    { x: 180, y: 72, s: 1 },
    { x: 64, y: 110, s: 0.9 },
    { x: 148, y: 130, s: 1.05 },
    { x: 40, y: 180, s: 0.75 },
    { x: 110, y: 200, s: 0.95 },
    { x: 172, y: 168, s: 0.7 },
    { x: 88, y: 68, s: 0.65 },
  ];
  const leaves = [
    { x: 52, y: 70, r: 20, s: 0.9 },
    { x: 160, y: 48, r: -35, s: 0.85 },
    { x: 96, y: 150, r: 50, s: 0.8 },
    { x: 28, y: 140, r: -10, s: 0.75 },
    { x: 190, y: 120, r: 15, s: 0.7 },
  ];

  return (
    <svg
      viewBox="0 0 220 240"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {blooms.map((b) => (
        <FloralBloom key={`${b.x}-${b.y}`} cx={b.x} cy={b.y} scale={b.s} />
      ))}
      {leaves.map((l) => (
        <FloralLeaf
          key={`${l.x}-${l.y}`}
          cx={l.x}
          cy={l.y}
          rotate={l.r}
          scale={l.s}
        />
      ))}
      <circle
        cx="200"
        cy="36"
        r="2.2"
        fill="var(--color-brand-primary)"
        opacity="0.35"
      />
    </svg>
  );
}
