'use client';

import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/utils/formatters';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  fullDate?: string;
}

interface InteractiveAreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  valueFormatter?: (val: number) => string;
  secondaryValueFormatter?: (val: number) => string;
}

export function InteractiveAreaChart({
  data,
  height = 280,
  primaryLabel = 'Views',
  secondaryLabel = 'Watch Time (Jam)',
  primaryColor = '#4B0B7A',
  secondaryColor = '#FFD52E',
  valueFormatter = formatNumber,
  secondaryValueFormatter = (v) => `${formatNumber(v)} jam`,
}: InteractiveAreaChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-[#786F7D]">
        Tidak ada data grafik
      </div>
    );
  }

  const width = 800;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value calculation with margin
  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const maxAxisValue = Math.ceil((maxValue * 1.15) / 500) * 500;

  // Compute points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxAxisValue) * chartHeight;
    return { x, y, data: d };
  });

  // Generate SVG path using cubic bezier smoothing
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Horizontal grid lines (4 lines)
  const gridLines = [0, 0.33, 0.66, 1].map((pct) => {
    const y = paddingTop + chartHeight * (1 - pct);
    const value = Math.round(maxAxisValue * pct);
    return { y, value };
  });

  // X-axis label indices (show ~6-7 labels evenly distributed)
  const step = Math.max(1, Math.floor(data.length / 6));
  const labelIndices = data
    .map((_, idx) => idx)
    .filter((idx) => idx % step === 0 || idx === data.length - 1);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setHoverIndex(null)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible font-sans"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
            <stop offset="90%" stopColor={primaryColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={gl.y}
              x2={width - paddingRight}
              y2={gl.y}
              stroke="#EEE8F0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={gl.y + 3}
              textAnchor="end"
              fill="#786F7D"
              fontSize="10"
              fontWeight="500"
            >
              {formatNumber(gl.value)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${gradientId})`} />

        {/* Main curve */}
        <path d={linePath} fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />

        {/* X Axis labels */}
        {labelIndices.map((idx) => {
          const pt = points[idx];
          if (!pt) return null;
          return (
            <text
              key={idx}
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              fill="#786F7D"
              fontSize="10"
              fontWeight="500"
            >
              {pt.data.label}
            </text>
          );
        })}

        {/* Interactive Hover Tracker Hairline and Circles */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={paddingTop + chartHeight}
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="6"
              fill={secondaryColor}
              stroke={primaryColor}
              strokeWidth="3"
            />
          </g>
        )}

        {/* Transparent hover capture zones */}
        {points.map((pt, index) => {
          const segWidth = chartWidth / data.length;
          return (
            <rect
              key={index}
              x={pt.x - segWidth / 2}
              y={paddingTop}
              width={segWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(index)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-[#24172B] text-white p-3 rounded-xl shadow-xl text-xs whitespace-nowrap border border-white/10"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
          }}
        >
          <div className="font-semibold text-white/90 border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
            <span>{activePoint.data.fullDate || activePoint.data.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-[#A39CA9]">{primaryLabel}:</span>
            <span className="font-bold text-white">{valueFormatter(activePoint.data.value)}</span>
          </div>

          {activePoint.data.secondaryValue !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-[#A39CA9]">{secondaryLabel}:</span>
              <span className="font-bold text-[#FFD52E]">
                {secondaryValueFormatter(activePoint.data.secondaryValue)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
