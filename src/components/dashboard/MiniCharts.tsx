import React from 'react';

/** Doiraviy progress rejim — bitta ulushni (0-100%) ko'rsatadi, markazida son bilan */
export const RingStat: React.FC<{
  percent: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}> = ({ percent, color, trackColor = '#e2e8f0', size = 44, strokeWidth = 6 }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${Math.round(clamped)}%`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-current"
        style={{ fontSize: size * 0.24, fontWeight: 800 }}
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
};

/** Bir necha kategoriyaning ustunli (bar) taqqoslashi — eng katta qiymat 100% balandlik bo'ladi */
export const MiniBars: React.FC<{
  segments: { value: number; color: string }[];
  height?: number;
  barWidth?: number;
  gap?: number;
}> = ({ segments, height = 36, barWidth = 7, gap = 3 }) => {
  const max = Math.max(1, ...segments.map(s => s.value));
  const width = segments.length * barWidth + (segments.length - 1) * gap;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden="true">
      {segments.map((s, i) => {
        const barHeight = Math.max(2, (s.value / max) * height);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={s.color}
          />
        );
      })}
    </svg>
  );
};

/** Ikki (yoki undan ko'p) ulushning gorizontal "stacked" tasviri — nisbatni ko'rsatadi */
export const StackedBar: React.FC<{
  segments: { value: number; color: string }[];
  height?: number;
}> = ({ segments, height = 8 }) => {
  const total = Math.max(1, segments.reduce((acc, s) => acc + s.value, 0));

  return (
    <div className="w-full flex rounded-full overflow-hidden bg-slate-100" style={{ height }}>
      {segments.map((s, i) => {
        const pct = (s.value / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={i}
            style={{ width: `${pct}%`, backgroundColor: s.color }}
            className={i > 0 ? 'ml-0.5' : ''}
          />
        );
      })}
    </div>
  );
};
