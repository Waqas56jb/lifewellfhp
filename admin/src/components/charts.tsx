type Point = { label: string; value: number };

function maxOf(values: number[]) {
  return Math.max(1, ...values);
}

export function AreaChart({ points, color = '#3e7fb1' }: { points: Point[]; color?: string }) {
  const width = 640;
  const height = 220;
  const pad = { t: 18, r: 12, b: 32, l: 8 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const values = points.map((p) => p.value);
  const max = maxOf(values);
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const coords = points.map((p, i) => {
    const x = pad.l + i * step;
    const y = pad.t + innerH - (p.value / max) * innerH;
    return `${x},${y}`;
  });
  const line = coords.join(' ');
  const area = `${pad.l},${pad.t + innerH} ${line} ${pad.l + (points.length - 1) * step},${pad.t + innerH}`;

  if (!points.length) {
    return <p className="chart-empty">No traffic yet. Charts fill in as visitors use the public site.</p>;
  }

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Traffic over time">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad.l}
          x2={width - pad.r}
          y1={pad.t + innerH * g}
          y2={pad.t + innerH * g}
          className="chart-grid"
        />
      ))}
      <polygon points={area} fill="url(#areaFill)" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const show = points.length < 10 || i % Math.ceil(points.length / 6) === 0 || i === points.length - 1;
        if (!show) return null;
        const x = pad.l + i * step;
        return (
          <text key={p.label} x={x} y={height - 8} textAnchor="middle" className="chart-axis">
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

export function BarList({ points, color = '#3e7fb1' }: { points: Point[]; color?: string }) {
  const max = maxOf(points.map((p) => p.value));
  if (!points.length) return <p className="chart-empty">Nothing to chart yet.</p>;

  return (
    <ul className="bar-list">
      {points.map((p) => (
        <li key={p.label}>
          <div className="bar-list-meta">
            <span>{p.label}</span>
            <strong>{p.value}</strong>
          </div>
          <div className="bar-track">
            <span style={{ width: `${Math.max(6, (p.value / max) * 100)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) return <p className="chart-empty">No device mix yet.</p>;

  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut-svg" role="img" aria-label="Device mix">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e8f0f7" strokeWidth="16" />
        {slices.map((s) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={s.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" className="donut-sub">
          visits
        </text>
      </svg>
      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <i style={{ background: s.color }} />
            {s.label}
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, color = '#3e7fb1' }: { values: number[]; color?: string }) {
  const width = 120;
  const height = 36;
  const max = maxOf(values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => `${i * step},${height - (v / max) * (height - 4) - 2}`).join(' ');
  if (!values.length) return null;
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
