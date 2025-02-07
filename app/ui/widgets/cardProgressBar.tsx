export function CardProgressBar({
  pct,
  idPrefix,
  height,
}: {
  pct: number;
  idPrefix: string;
  height?: number;
}) {
  const maskId = `${idPrefix}-pct-clip`;
  const h = height ?? 2;
  return (
    <svg className="absolute bottom-0 left-0" width="100%" height={`${h}px`}>
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width={`${pct}%`} fill="white" height={h} />
        </mask>
      </defs>
      <rect
        x="0"
        y="-10"
        width="100%"
        height={`${h + 10}`}
        fill={'#d6bcfa'}
        rx="4"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
  //
  // light purple: '#d6bcfa'
  // light gray: e2e8f0
}
