'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Language } from '@/lib/translations';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  lang: Language;
}

function getPaginationRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const delta = 1;

  pages.push(1);

  const left = current - delta;
  const right = current + delta;

  if (left > 2) {
    pages.push('...');
  } else if (left === 2) {
    pages.push(2);
  }

  const start = Math.max(2, left);
  const end = Math.min(total - 1, right);
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (right < total - 1) {
    pages.push('...');
  } else if (right === total - 1) {
    if (!pages.includes(total - 1)) pages.push(total - 1);
  }

  if (!pages.includes(total)) pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  lang,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPaginationRange(currentPage, totalPages);

  const labels = {
    ja: {
      info: `全 ${totalItems} 件中 ${start}〜${end} 件を表示`,
      first: '最初',
      prev: '前へ',
      next: '次へ',
      last: '最後',
    },
    zh: {
      info: `共 ${totalItems} 项，第 ${start}–${end} 项`,
      first: '首页',
      prev: '上页',
      next: '下页',
      last: '末页',
    },
    ko: {
      info: `총 ${totalItems}개 중 ${start}〜${end}개`,
      first: '처음',
      prev: '이전',
      next: '다음',
      last: '마지막',
    },
    en: {
      info: `${start}–${end} of ${totalItems}`,
      first: 'First',
      prev: 'Prev',
      next: 'Next',
      last: 'Last',
    },
  };

  const l = labels[lang] || labels.en;

  return (
    <nav aria-label="Pagination" className="kaminari-pagination">
      {/* ページ情報 */}
      <div className="pagination-info">{l.info}</div>

      {/* コントロール: 一体型ボタングループ */}
      <div className="pagination-controls">

        {/* First */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title={l.first}
          className="pagination-btn pagination-nav-btn"
          aria-label={l.first}
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title={l.prev}
          className="pagination-btn pagination-nav-btn"
          aria-label={l.prev}
        >
          <ChevronLeft size={15} />
          <span className="pagination-text-label">{l.prev}</span>
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                …
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => !isActive && onPageChange(p)}
              aria-current={isActive ? 'page' : undefined}
              className={`pagination-btn pagination-num-btn${isActive ? ' active' : ''}`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title={l.next}
          className="pagination-btn pagination-nav-btn"
          aria-label={l.next}
        >
          <span className="pagination-text-label">{l.next}</span>
          <ChevronRight size={15} />
        </button>

        {/* Last */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title={l.last}
          className="pagination-btn pagination-nav-btn"
          aria-label={l.last}
        >
          <ChevronsRight size={15} />
        </button>

      </div>
    </nav>
  );
}
