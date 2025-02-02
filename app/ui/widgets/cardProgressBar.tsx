export function CardProgressBar({
  pct,
  idPrefix,
}: {
  pct: number;
  idPrefix: string;
}) {
  const maskId = `${idPrefix}-pct-clip`;
  return (
    <svg className="absolute left-0 top-0" width="100%" height="2px">
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width={`${pct}%`} fill="white" height="10" />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="10"
        fill={false ? '#e2e8f0' : '#d6bcfa'}
        rx="0.3rem"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
