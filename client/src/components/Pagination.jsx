import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPages(current, total) {
  const pages = [];
  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }
  return pages;
}

export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (!total) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pages = getPages(page, totalPages);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Showing <strong>{start}–{end}</strong> of <strong>{total}</strong>
      </span>

      <div className="pagination-controls">
        <button
          type="button"
          className="page-arrow"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="page-numbers">
          {pages.map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className="page-gap">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`page-number ${item === page ? 'active' : ''}`}
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="page-arrow"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
