import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ currentPage, hasNext, hasPrevious, onPageChange }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="relative inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="relative ml-3 inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-secondary ring-1 ring-inset ring-border hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 hover:text-primary"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-border focus:outline-offset-0">
              Página {currentPage}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-secondary ring-1 ring-inset ring-border hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 hover:text-primary"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}