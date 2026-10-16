'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-[#EEE8F0] bg-white rounded-b-2xl">
      <div className="flex items-center gap-3 text-xs text-[#786F7D]">
        <span>
          Menampilkan <strong className="text-[#24172B]">{startItem}</strong> - <strong className="text-[#24172B]">{endItem}</strong> dari <strong className="text-[#24172B]">{totalItems}</strong> data
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Baris:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-lg px-2 py-1 text-xs text-[#24172B] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4B0B7A]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#EEE8F0] text-[#786F7D] hover:text-[#24172B] hover:bg-[#F8F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-[#786F7D]">
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'bg-[#4B0B7A] text-white shadow-xs'
                  : 'text-[#24172B] hover:bg-[#F6F1F8] border border-transparent'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#EEE8F0] text-[#786F7D] hover:text-[#24172B] hover:bg-[#F8F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
