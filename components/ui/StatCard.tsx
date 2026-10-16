'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs periode lalu',
  icon,
  iconBg = 'bg-[#F6F1F8]',
  iconColor = 'text-[#4B0B7A]',
  subtitle,
  badge,
  className = '',
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isZero = change !== undefined && change === 0;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-[#EEE8F0] shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#786F7D] uppercase tracking-wider">{title}</span>
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg} ${iconColor}`}>
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#24172B] tracking-tight">{value}</span>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFD52E] text-[#21052F] rounded-md">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#F6F1F8] flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md ${
                isPositive
                  ? 'bg-[#EAF8F1] text-[#21865B]'
                  : isNegative
                  ? 'bg-[#FEECEF] text-[#D94152]'
                  : 'bg-[#F8F7FA] text-[#786F7D]'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
              {isZero && <Minus className="w-3.5 h-3.5" />}
              {Math.abs(change)}%
            </span>
            <span className="text-[#786F7D] font-normal">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-[#786F7D]">{subtitle}</span>
        ) : (
          <span className="text-[#786F7D]">Data Simulasi HUMORA</span>
        )}
      </div>
    </div>
  );
}
