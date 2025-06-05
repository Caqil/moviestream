"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useMovies } from "@/hooks/use-movies";
import { useSearch } from "@/hooks/use-search";
import { MovieCard, MovieCardCompact, MovieCardList } from "./movie-card";
import { GenreFilter, GenreFilterDropdown } from "./genre-filter";
import { SearchBar } from "./search-bar";
import { Pagination, usePagination } from "@/components/common/pagination";
import {
  LoadingSpinner,
  MovieLoader,
  CardSkeletonLoader,
} from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconGrid3x3,
  IconList,
  IconFilter,
  IconSortDescending,
  IconSearch,
  IconRefresh,
  IconAlertTriangle,
  IconMovie,
  IconStar,
  IconClock,
  IconEye,
  IconCalendar,
  IconSettings,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Movie, MovieSearchFilters } from "@/types";
import ErrorBoundary from "../common/error-boundary";
import { Loader2Icon } from "lucide-react";

interface MovieGridProps {
  movies?: Movie[];
  className?: string;
  variant?: "grid" | "list" | "compact";
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  showSorting?: boolean;
  showViewToggle?: boolean;
  itemsPerPage?: number;
  enableInfiniteScroll?: boolean;
  onMovieClick?: (movie: Movie) => void;
  onMoviePlay?: (movie: Movie) => void;
  customFilters?: MovieSearchFilters;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;
}

type ViewMode = "grid" | "list" | "compact";
type SortOption = "releaseDate" | "rating" | "views" | "title" | "duration";
type SortOrder = "asc" | "desc";

const sortOptions = [
  { value: "releaseDate", label: "Release Date", icon: IconCalendar },
  { value: "rating", label: "Rating", icon: IconStar },
  { value: "views", label: "Popularity", icon: IconEye },
  { value: "title", label: "Title A-Z", icon: IconMovie },
  { value: "duration", label: "Duration", icon: IconClock },
];

export function MovieGrid({
  movies: propMovies,
  className,
  variant = "grid",
  showFilters = true,
  showSearch = true,
  showPagination = true,
  showSorting = true,
  showViewToggle = true,
  itemsPerPage = 20,
  enableInfiniteScroll = false,
  onMovieClick,
  onMoviePlay,
  customFilters = {},
  emptyState,
  loadingState,
  errorState,
}: MovieGridProps) {
  const { movies, fetchMovies, isLoading, error } = useMovies();
  const {
    search,
    results: searchResults,
    isLoading: isSearching,
  } = useSearch();

  const [viewMode, setViewMode] = useState<ViewMode>(variant);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("releaseDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filters, setFilters] = useState<MovieSearchFilters>({
    ...customFilters,
    sortBy,
    sortOrder,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { pagination, handlePageChange, handleLimitChange } = usePagination(
    1,
    itemsPerPage,
    0
  );

  // Use provided movies or fetch them
  const displayMovies = propMovies || movies;
  const isLoadingData = isLoading || isSearching;

  // Apply client-side filtering and sorting if no server-side data
  const filteredAndSortedMovies = useMemo(() => {
    let result =
      searchQuery && searchResults.length > 0 ? searchResults : displayMovies;

    // Apply genre filter
    if (selectedGenres.length > 0) {
      result = result.filter((movie) =>
        movie.genres.some((genreId) =>
          selectedGenres.includes(genreId.toString())
        )
      );
    }

    // Apply other filters
    if (filters.year) {
      result = result.filter(
        (movie) => new Date(movie.releaseDate).getFullYear() === filters.year
      );
    }

    if (filters.rating) {
      result = result.filter((movie) => movie.rating >= filters.rating!);
    }

    if (filters.isPremium !== undefined) {
      result = result.filter((movie) => movie.isPremium === filters.isPremium);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "releaseDate":
          aValue = new Date(a.releaseDate).getTime();
          bValue = new Date(b.releaseDate).getTime();
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return result;
  }, [
    displayMovies,
    searchResults,
    searchQuery,
    selectedGenres,
    filters,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedMovies = showPagination
    ? filteredAndSortedMovies.slice(startIndex, endIndex)
    : filteredAndSortedMovies;

  const totalMovies = filteredAndSortedMovies.length;
  const paginationData = {
    ...pagination,
    total: totalMovies,
    pages: Math.ceil(totalMovies / pagination.limit),
    hasNext: endIndex < totalMovies,
    hasPrev: pagination.page > 1,
  };

  // Fetch movies when component mounts or filters change
  useEffect(() => {
    if (!propMovies) {
      const searchFilters: MovieSearchFilters = {
        ...filters,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        query: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchQuery) {
        search({ query: searchQuery, ...searchFilters });
      } else {
        fetchMovies(searchFilters);
      }
    }
  }, [
    propMovies,
    selectedGenres,
    searchQuery,
    pagination.page,
    pagination.limit,
    sortBy,
    sortOrder,
    filters,
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handlePageChange(1); // Reset to first page on new search
  };

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
    handlePageChange(1); // Reset to first page on filter change
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    handlePageChange(1); // Reset to first page on filter change
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    handlePageChange(1); // Reset to first page on sort change
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSearchQuery("");
    setFilters({});
    handlePageChange(1);
  };

  const getActiveFilterCount = () => {
    let count = selectedGenres.length;
    if (searchQuery) count++;
    if (filters.year) count++;
    if (filters.rating) count++;
    if (filters.isPremium !== undefined) count++;
    return count;
  };

  // Loading state
  if (isLoadingData && !displayMovies.length) {
    return (
      loadingState || (
        <div className={cn("space-y-6", className)}>
          {showFilters && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
          )}
          <CardSkeletonLoader count={12} />
        </div>
      )
    );
  }

  // Error state
  if (error && !displayMovies.length) {
    return (
      errorState || (
        <div className={cn("text-center py-12", className)}>
          <Alert variant="destructive" className="max-w-md mx-auto">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )
    );
  }

  // Empty state
  if (!isLoadingData && paginatedMovies.length === 0) {
    return (
      emptyState || (
        <div className={cn("text-center py-12 space-y-4", className)}>
          <div className="mx-auto mb-6 p-4 bg-muted rounded-full w-fit">
            <IconMovie className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {searchQuery || getActiveFilterCount() > 0
                ? "No movies found"
                : "No movies available"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || getActiveFilterCount() > 0
                ? "Try adjusting your search criteria or filters"
                : "Movies will appear here when they are added"}
            </p>
          </div>
          {(searchQuery || getActiveFilterCount() > 0) && (
            <Button variant="outline" onClick={clearAllFilters}>
              <IconX className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )
    );
  }

  return (
    <ErrorBoundary>
      <div className={cn("space-y-6", className)}>
        {/* Header with Search and Filters */}
        {(showSearch || showFilters || showSorting || showViewToggle) && (
          <div className="space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <SearchBar
                onSearch={handleSearch}
                initialValue={searchQuery}
                placeholder="Search movies..."
                className="max-w-md"
              />
            )}

            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {/* Genre Filter */}
                {showFilters && (
                  <GenreFilterDropdown
                    selectedGenres={selectedGenres}
                    onGenreChange={handleGenreChange}
                    onFilterChange={handleFilterChange}
                  />
                )}

                {/* Sort Dropdown */}
                {showSorting && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <IconSortDescending className="h-4 w-4 mr-2" />
                        Sort by{" "}
                        {sortOptions.find((opt) => opt.value === sortBy)?.label}
                        <IconChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() =>
                            handleSortChange(option.value as SortOption)
                          }
                        >
                          <option.icon className="h-4 w-4 mr-2" />
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                      >
                        <IconSortDescending
                          className={cn(
                            "h-4 w-4 mr-2",
                            sortOrder === "asc" && "rotate-180"
                          )}
                        />
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Active Filters */}
                {getActiveFilterCount() > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getActiveFilterCount()} filter
                      {getActiveFilterCount() !== 1 ? "s" : ""} active
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* View Toggle and Results Count */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {totalMovies} movie{totalMovies !== 1 ? "s" : ""}
                  {showPagination && (
                    <>
                      {" "}
                      • Page {pagination.page} of {paginationData.pages}
                    </>
                  )}
                </div>

                {showViewToggle && (
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <IconGrid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <IconList className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Movies Grid/List */}
        <div className="relative">
          {isLoadingData && (
            <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center">
              <LoadingSpinner size="lg" label="Loading movies..." />
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {paginatedMovies.map((movie, index) => (
                <MovieCard
                  key={movie._id.toString()}
                  movie={movie}
                  priority={index < 6} // Prioritize first 6 images for LCP
                  onPlay={onMoviePlay}
                  onClick={() => onMovieClick?.(movie)}
                />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-4">
              {paginatedMovies.map((movie) => (
                <MovieCardList
                  key={movie._id.toString()}
                  movie={movie}
                  onPlay={onMoviePlay}
                  onClick={() => onMovieClick?.(movie)}
                />
              ))}
            </div>
          )}

          {viewMode === "compact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedMovies.map((movie) => (
                <MovieCardCompact
                  key={movie._id.toString()}
                  movie={movie}
                  onPlay={onMoviePlay}
                  onClick={() => onMovieClick?.(movie)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {showPagination &&
          !enableInfiniteScroll &&
          totalMovies > pagination.limit && (
            <Pagination
              pagination={paginationData}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              showPageInfo={true}
              showPageSize={true}
              className="justify-center"
            />
          )}

        {/* Infinite Scroll Trigger */}
        {enableInfiniteScroll && paginationData.hasNext && (
          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={isLoadingData}
            >
              {isLoadingData ? (
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconRefresh className="h-4 w-4 mr-2" />
              )}
              Load More Movies
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Specialized variants
export function FeaturedMoviesGrid({
  movies,
  className,
  ...props
}: Omit<MovieGridProps, "showFilters" | "showSearch" | "showPagination">) {
  return (
    <MovieGrid
      movies={movies}
      className={className}
      showFilters={false}
      showSearch={false}
      showPagination={false}
      itemsPerPage={12}
      {...props}
    />
  );
}

export function CompactMovieGrid({
  movies,
  className,
  ...props
}: Omit<MovieGridProps, "variant" | "showViewToggle">) {
  return (
    <MovieGrid
      movies={movies}
      className={className}
      variant="compact"
      showViewToggle={false}
      itemsPerPage={15}
      {...props}
    />
  );
}

export function SearchResultsGrid({
  movies,
  searchQuery,
  className,
  ...props
}: MovieGridProps & { searchQuery?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {searchQuery && (
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            Search results for "{searchQuery}"
          </h2>
          <Badge variant="outline">
            {movies?.length || 0} result{movies?.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      <MovieGrid
        movies={movies}
        showSearch={false}
        itemsPerPage={24}
        {...props}
      />
    </div>
  );
}
