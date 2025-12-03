import React from "react";

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  pageSize,
  onPageChange,
}) => {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    }
  }

  const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-gray-600">
        Menampilkan{" "}
        <span className="font-medium">
          {start}
        </span>{" "}
        -{" "}
        <span className="font-medium">
          {end}
        </span>{" "}
        dari{" "}
        <span className="font-medium">
          {total}
        </span>{" "}
        data
      </p>

      <div className="flex items-center justify-end space-x-1">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {uniquePages.map((p, idx) => {
          const prev = uniquePages[idx - 1];
          const showDots = prev && p - prev > 1;

          return (
            <React.Fragment key={p}>
              {showDots && (
                <span className="px-2 text-sm text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  p === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};


