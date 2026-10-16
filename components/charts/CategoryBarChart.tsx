'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, ArrowUpRight } from 'lucide-react';
import { CategoryMetric } from '../../lib/data/analyticsData';
import { formatNumber } from '../../lib/utils/formatters';

interface CategoryBarChartProps {
  categories: CategoryMetric[];
  title?: string;
  className?: string;
}

function computeDonutSlices(categories: CategoryMetric[], circumference: number) {
  const result = [];
  let sum = 0;
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const percent = cat.percentage;
    const arcLength = (percent / 100) * circumference;
    const strokeDasharray = `${Math.max(0, arcLength - 2)} ${circumference}`;
    const strokeDashoffset = -((sum / 100) * circumference);
    sum += percent;
    result.push({
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    });
  }
  return result;
}

export function CategoryBarChart({ categories, title, className = '' }: CategoryBarChartProps) {
  const totalViews = categories.reduce((sum, c) => sum + c.views, 0);
  const compactTotalViews = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : formatNumber(totalViews);
  const topCategory = categories.length > 0 ? [...categories].sort((a, b) => b.views - a.views)[0] : null;

  // SVG Donut chart calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const donutSlices = computeDonutSlices(categories, circumference);

  return (
    <div className={`bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs flex flex-col justify-between gap-4 ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between pb-1 border-b border-[#F6F1F8]">
          <div>
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-[#786F7D] mt-0.5">Proporsi penayangan berdasarkan genre</p>
          </div>
          <span className="text-[11px] font-bold text-[#4B0B7A] bg-[#F3E8FF] px-2.5 py-1 rounded-lg">
            {categories.length} Kategori
          </span>
        </div>
      )}

      {/* Visual Chart & Top Insights Section */}
      <div className="flex items-center gap-4 bg-[#FAF8FB] p-3 rounded-xl border border-[#EEE8F0]">
        {/* SVG Donut Chart with Center Label */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#EEE8F0"
              strokeWidth="12"
            />
            {/* Category Arcs */}
            {donutSlices.map((slice) => (
              <circle
                key={slice.slug}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth="12"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Donut Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-sm font-black text-[#24172B] leading-none tracking-tight">
              {compactTotalViews}
            </span>
            <span className="text-[9px] font-bold text-[#786F7D] uppercase tracking-wider mt-0.5">
              Views
            </span>
          </div>
        </div>

        {/* Highlights beside Donut */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="bg-white p-2.5 rounded-lg border border-[#EEE8F0] shadow-2xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#786F7D] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#E58A16]" /> Genre Terpopuler
            </div>
            <p className="text-xs font-black text-[#24172B] mt-0.5 truncate">
              {topCategory ? topCategory.name : 'Komedi'} ({topCategory?.percentage}%)
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-[#EEE8F0] shadow-2xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#786F7D] uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-[#21865B]" /> Total Penayangan
            </div>
            <p className="text-xs font-bold text-[#24172B] mt-0.5">
              {formatNumber(totalViews)} views
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Multi-Color Progress Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#786F7D]">
          <span>Distribusi Persentase</span>
          <span>100% Total</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#EEE8F0]">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.name}: ${cat.percentage}% (${formatNumber(cat.views)} views)`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="space-y-2.5">
        {categories.map((cat) => {
          return (
            <div key={cat.slug} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-[#24172B] truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-[#24172B]">{formatNumber(cat.views)} views</span>
                  <span className="text-[#786F7D] font-bold w-9 text-right">({cat.percentage}%)</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-95"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#F6F1F8] flex items-center justify-between text-xs text-[#786F7D]">
        <span>{categories.length} Kategori Terdaftar</span>
        <Link
          href="/admin/categories"
          className="text-[#4B0B7A] font-bold hover:underline inline-flex items-center gap-1"
        >
          Kelola Kategori <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
