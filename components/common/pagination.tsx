"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showPageSize?: boolean;
  showPageInfo?: boolean;
  showJumpTo?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  variant?: "default" | "simple" | "compact";
  disabled?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  showPageSize = true,
  showPageInfo = true,
  showJumpTo = false,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  variant = "default",
  disabled = false,
}: PaginationProps) {
  const { page, limit, total, pages, hasNext, hasPrev } = pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages && !disabled) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    if (onLimitChange && !disabled) {
      onLimitChange(parseInt(newLimit));
    }
  };

  const generatePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < pages - 1) {
      rangeWithDots.push("...", pages);
    } else {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  const pageNumbers = pages > 1 ? generatePageNumbers() : [];

  const currentLimit = limit || 10; // Provide default value

  if (variant === "simple") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPrev || disabled}
          >
            <IconChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNext || disabled}
          >
            Next
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {showPageInfo && (
          <div className="text-sm text-muted-foreground">
            Page {page} of {pages} ({total} items)
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrev || disabled}
        >
          <IconChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          {page} / {pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNext || disabled}
        >
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main pagination controls */}
      <div className="flex items-center justify-center space-x-1">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={page === 1 || disabled}
          className="hidden sm:flex"
        >
          <IconChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrev || disabled}
        >
          <IconChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <Button key={index} variant="ghost" size="sm" disabled>
                  <IconDots className="h-4 w-4" />
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum as number)}
                disabled={disabled}
                className="min-w-[2.5rem]"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNext || disabled}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <IconChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pages)}
          disabled={page === pages || disabled}
          className="hidden sm:flex"
        >
          <IconChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Additional controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        {/* Page info */}
        {showPageInfo && (
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} results
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Jump to page */}
          {showJumpTo && pages > 10 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Go to:</span>
              <Input
                type="number"
                min={1}
                max={pages}
                placeholder="Page"
                className="w-20 h-8"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = parseInt(
                      (e.target as HTMLInputElement).value
                    );
                    if (value >= 1 && value <= pages) {
                      handlePageChange(value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Page size selector */}
          {showPageSize && onLimitChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={limit.toString()}
                onValueChange={handleLimitChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing pagination state
export function usePagination(initialPage = 1, initialLimit = 10, total = 0) {
  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);

  const pages = Math.ceil(total / limit);
  const hasNext = page < pages;
  const hasPrev = page > 1;

  const pagination: PaginationData = {
    page,
    limit,
    total,
    pages,
    hasNext,
    hasPrev,
  };

  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = React.useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const reset = React.useCallback(() => {
    setPage(1);
  }, []);

  return {
    pagination,
    handlePageChange,
    handleLimitChange,
    reset,
    setPage,
    setLimit,
  };
}

// Specialized pagination components for different use cases
export function TablePagination({
  pagination,
  onPageChange,
  onLimitChange,
  className,
  disabled,
}: Pick<
  PaginationProps,
  "pagination" | "onPageChange" | "onLimitChange" | "className" | "disabled"
>) {
  return (
    <Pagination
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      showPageSize={true}
      showPageInfo={true}
      showJumpTo={false}
      variant="default"
      className={className}
      disabled={disabled}
    />
  );
}

export function MovieGridPagination({
  pagination,
  onPageChange,
  className,
  disabled,
}: Pick<
  PaginationProps,
  "pagination" | "onPageChange" | "className" | "disabled"
>) {
  return (
    <Pagination
      pagination={pagination}
      onPageChange={onPageChange}
      showPageSize={false}
      showPageInfo={true}
      showJumpTo={true}
      variant="default"
      className={className}
      disabled={disabled}
    />
  );
}

export function MobilePagination({
  pagination,
  onPageChange,
  className,
  disabled,
}: Pick<
  PaginationProps,
  "pagination" | "onPageChange" | "className" | "disabled"
>) {
  return (
    <Pagination
      pagination={pagination}
      onPageChange={onPageChange}
      showPageSize={false}
      showPageInfo={false}
      showJumpTo={false}
      variant="simple"
      className={className}
      disabled={disabled}
    />
  );
}

// Utility functions for pagination
export const PaginationUtils = {
  calculateOffset: (page: number, limit: number) => (page - 1) * limit,

  calculatePage: (offset: number, limit: number) =>
    Math.floor(offset / limit) + 1,

  createPaginationData: (
    page: number,
    limit: number,
    total: number
  ): PaginationData => {
    const pages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  },

  getPageRange: (page: number, limit: number, total: number) => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return { start, end };
  },
};
