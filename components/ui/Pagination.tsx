import { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
}: PaginationProps) {
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);

  // Generate page numbers to display
  useEffect(() => {
    const generatePageNumbers = () => {
      if (totalPages <= 7) {
        // If 7 or fewer pages, show all
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      // Always include first, last, and pages around current
      const pages: number[] = [];
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // First page
      pages.push(1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 indicates ellipsis
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 indicates second ellipsis
      }

      // Last page
      pages.push(totalPages);

      return pages;
    };

    setPageNumbers(generatePageNumbers());
  }, [currentPage, totalPages]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(Number(e.target.value));
      onPageChange(1); // Reset to first page when changing page size
    }
  };

  const startItem = Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-4">
        {onItemsPerPageChange && (
          <div className="flex items-center text-sm">
            <label htmlFor="pageSize" className="mr-2 text-gray-700">
              Show
            </label>
            <select
              id="pageSize"
              value={itemsPerPage}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="inline-flex rounded-md shadow-sm isolate">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber < 0) {
              // Render ellipsis
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === pageNumber
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
} 