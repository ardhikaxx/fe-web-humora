'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
    const strokeDasharray = `${Math.max(0, arcLength - 3)} ${circumference}`;
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

export function CategoryBarChart({
  categories,
  title = 'Distribusi Genre Tontonan',
  className = '',
}: CategoryBarChartProps) {
  const totalViews = categories.reduce((sum, c) => sum + c.views, 0);
  const compactTotalViews = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : formatNumber(totalViews);

  // SVG Donut calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const donutSlices = computeDonutSlices(categories, circumference);

  return (
    <div
      className={`bg-white p-5 sm:p-6 rounded-2xl border border-[#EEE8F0] shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F6F1F8]">
        <div>
          <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-[#786F7D] mt-0.5">Proporsi penayangan konten</p>
        </div>
        <span className="text-xs font-bold text-[#4B0B7A] bg-[#F6F1F8] px-2.5 py-1 rounded-lg">
          {categories.length} Genre
        </span>
      </div>

      {/* Modern Centered Donut Chart */}
      <div className="py-4 flex justify-center">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#F6F1F8"
              strokeWidth="11"
            />
            {/* Slices */}
            {donutSlices.map((slice) => (
              <circle
                key={slice.slug}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth="11"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            ))}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-[#24172B] tracking-tight leading-none">
              {compactTotalViews}
            </span>
            <span className="text-[10px] font-bold text-[#786F7D] uppercase tracking-wider mt-1">
              Total Views
            </span>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Category List */}
      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[#FAF8FB] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs font-semibold text-[#24172B] truncate">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-[#786F7D] font-medium">{formatNumber(cat.views)} views</span>
              <span className="text-xs font-bold text-[#24172B] w-8 text-right">{cat.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Footer Link */}
      <div className="pt-3 border-t border-[#F6F1F8] flex items-center justify-between text-xs text-[#786F7D]">
        <span>Total {formatNumber(totalViews)} Views</span>
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
