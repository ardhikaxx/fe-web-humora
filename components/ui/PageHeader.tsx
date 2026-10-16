'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[#786F7D] mb-2 font-medium" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-[#4B0B7A] transition-colors">
              Admin
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-[#B6ADC0]" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#4B0B7A] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#24172B] font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24172B] tracking-tight">{title}</h1>
          {badge}
        </div>

        {description && (
          <p className="mt-1 text-sm text-[#786F7D] max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
