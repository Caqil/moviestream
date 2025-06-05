"use client";

import React, { useState, useEffect } from "react";
import { useMovies } from "@/hooks/use-movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  IconFilter,
  IconX,
  IconChevronDown,
  IconRefresh,
  IconStar,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Genre } from "@/types";

interface GenreFilterProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  onFilterChange?: (filters: MovieFilters) => void;
  className?: string;
  variant?: "default" | "compact" | "dropdown";
  showClearAll?: boolean;
  showAdvanced?: boolean;
  maxVisible?: number;
}

interface MovieFilters {
  genres: string[];
  year?: number;
  rating?: number;
  duration?: [number, number];
  quality?: string;
  isPremium?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const ratingOptions = [
  { value: 9, label: "9+ Excellent" },
  { value: 8, label: "8+ Very Good" },
  { value: 7, label: "7+ Good" },
  { value: 6, label: "6+ Above Average" },
  { value: 5, label: "5+ Average" },
];

const qualityOptions = [
  { value: "4k", label: "4K Ultra HD" },
  { value: "1080p", label: "Full HD (1080p)" },
  { value: "720p", label: "HD (720p)" },
  { value: "auto", label: "Auto Quality" },
];

const sortOptions = [
  { value: "releaseDate", label: "Release Date" },
  { value: "rating", label: "Rating" },
  { value: "views", label: "Popularity" },
  { value: "title", label: "Title" },
  { value: "duration", label: "Duration" },
];

export function GenreFilter({
  selectedGenres,
  onGenreChange,
  onFilterChange,
  className,
  variant = "default",
  showClearAll = true,
  showAdvanced = false,
  maxVisible = 8,
}: GenreFilterProps) {
  const { genres, isLoading, error } = useMovies();
  const [filters, setFilters] = useState<MovieFilters>({
    genres: selectedGenres,
  });
  const [showAll, setShowAll] = useState(false);

  const displayGenres = showAll ? genres : genres.slice(0, maxVisible);
  const hasMore = genres.length > maxVisible;

  const updateFilters = (newFilters: Partial<MovieFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleGenreToggle = (genreId: string) => {
    const newGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    onGenreChange(newGenres);
    updateFilters({ genres: newGenres });
  };

  const handleClearAll = () => {
    onGenreChange([]);
    setFilters({ genres: [] });
    onFilterChange?.({ genres: [] });
  };

  const getActiveFiltersCount = () => {
    let count = selectedGenres.length;
    if (filters.year) count++;
    if (filters.rating) count++;
    if (filters.quality) count++;
    if (filters.isPremium !== undefined) count++;
    return count;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-destructive mb-2">Failed to load genres</p>
        <Button variant="outline" size="sm">
          <IconRefresh className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Select
          value={selectedGenres[0] || "all"}
          onValueChange={(value: string) =>
            value === "all" ? onGenreChange([]) : onGenreChange([value])
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem
                key={genre._id.toString()}
                value={genre._id.toString()}
              >
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGenres.length > 0 && showClearAll && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <IconFilter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
            <IconChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Genres</h4>
              <div className="grid grid-cols-2 gap-2">
                {genres.slice(0, 8).map((genre) => (
                  <Button
                    key={genre._id.toString()}
                    variant={
                      selectedGenres.includes(genre._id.toString())
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleGenreToggle(genre._id.toString())}
                    className="justify-start h-8"
                  >
                    {genre.name}
                  </Button>
                ))}
              </div>
            </div>

            {showAdvanced && (
              <>
                <DropdownMenuSeparator />
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Release Year</label>
                    <Select
                      value={filters.year?.toString() || ""}
                      onValueChange={(value: string) =>
                        updateFilters({
                          year: value ? parseInt(value) : undefined,
                        })
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any year</SelectItem>
                        {years.slice(0, 20).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Min Rating</label>
                    <Select
                      value={filters.rating?.toString() || ""}
                      onValueChange={(value: string) =>
                        updateFilters({
                          rating: value ? parseFloat(value) : undefined,
                        })
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any rating</SelectItem>
                        {ratingOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            <div className="flex items-center">
                              <IconStar className="h-3 w-3 mr-1" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Quality</label>
                    <Select
                      value={filters.quality || ""}
                      onValueChange={(value: any) =>
                        updateFilters({ quality: value || undefined })
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Any quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any quality</SelectItem>
                        {qualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DropdownMenuSeparator />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    Clear All
                  </Button>
                  <Button size="sm">Apply Filters</Button>
                </div>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Genres</h3>
          {selectedGenres.length > 0 && (
            <Badge variant="secondary">{selectedGenres.length} selected</Badge>
          )}
        </div>

        {selectedGenres.length > 0 && showClearAll && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <IconX className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayGenres.map((genre) => {
            const isSelected = selectedGenres.includes(genre._id.toString());
            return (
              <Button
                key={genre._id.toString()}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenreToggle(genre._id.toString())}
                className="h-8"
              >
                {genre.name}
                {isSelected && <IconX className="h-3 w-3 ml-1" />}
              </Button>
            );
          })}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-muted-foreground"
          >
            {showAll ? "Show Less" : `Show ${genres.length - maxVisible} More`}
            <IconChevronDown
              className={cn(
                "h-4 w-4 ml-1 transition-transform",
                showAll && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium flex items-center">
              <IconCalendar className="h-4 w-4 mr-1" />
              Year
            </label>
            <Select
              value={filters.year?.toString() || ""}
              onValueChange={(value: string) =>
                updateFilters({ year: value ? parseInt(value) : undefined })
              }
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any year</SelectItem>
                {years.slice(0, 20).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center">
              <IconStar className="h-4 w-4 mr-1" />
              Rating
            </label>
            <Select
              value={filters.rating?.toString() || ""}
              onValueChange={(value: string) =>
                updateFilters({ rating: value ? parseFloat(value) : undefined })
              }
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any rating</SelectItem>
                {ratingOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Quality</label>
            <Select
              value={filters.quality || ""}
              onValueChange={(value: any) =>
                updateFilters({ quality: value || undefined })
              }
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any quality</SelectItem>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filters.sortBy || ""}
              onValueChange={(value: any) =>
                updateFilters({ sortBy: value || undefined })
              }
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized variants
export function GenreFilterCompact({
  selectedGenres,
  onGenreChange,
  className,
}: Pick<GenreFilterProps, "selectedGenres" | "onGenreChange" | "className">) {
  return (
    <GenreFilter
      selectedGenres={selectedGenres}
      onGenreChange={onGenreChange}
      variant="compact"
      className={className}
    />
  );
}

export function GenreFilterDropdown({
  selectedGenres,
  onGenreChange,
  onFilterChange,
  className,
}: Pick<
  GenreFilterProps,
  "selectedGenres" | "onGenreChange" | "onFilterChange" | "className"
>) {
  return (
    <GenreFilter
      selectedGenres={selectedGenres}
      onGenreChange={onGenreChange}
      onFilterChange={onFilterChange}
      variant="dropdown"
      showAdvanced={true}
      className={className}
    />
  );
}

export function GenreFilterSidebar({
  selectedGenres,
  onGenreChange,
  onFilterChange,
  className,
}: Pick<
  GenreFilterProps,
  "selectedGenres" | "onGenreChange" | "onFilterChange" | "className"
>) {
  return (
    <ScrollArea className={cn("h-96", className)}>
      <GenreFilter
        selectedGenres={selectedGenres}
        onGenreChange={onGenreChange}
        onFilterChange={onFilterChange}
        variant="default"
        showAdvanced={true}
        maxVisible={50}
      />
    </ScrollArea>
  );
}
