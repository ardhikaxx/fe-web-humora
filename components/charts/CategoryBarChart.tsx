'use client';

import React from 'react';
import { CategoryMetric } from '../../lib/data/analyticsData';
import { formatNumber } from '../../lib/utils/formatters';

interface CategoryBarChartProps {
  categories: CategoryMetric[];
  title?: string;
  className?: string;
}

export function CategoryBarChart({ categories, title, className = '' }: CategoryBarChartProps) {
  const maxViews = Math.max(...categories.map((c) => c.views), 1);

  return (
    <div className={`bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">{title}</h3>
          <span className="text-xs text-[#786F7D]">Total Views Kategori</span>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((cat) => {
          const widthPercent = Math.max(8, (cat.views / maxViews) * 100);

          return (
            <div key={cat.slug} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-bold text-[#24172B]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#24172B]">{formatNumber(cat.views)} views</span>
                  <span className="text-[#786F7D] font-medium w-8 text-right">({cat.percentage}%)</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-[#F8F7FA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-95"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
