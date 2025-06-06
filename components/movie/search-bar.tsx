// components/movie/search-bar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconSearch,
  IconClock,
  IconTrendingUp,
  IconX,
  IconLoader,
  IconMovie,
  IconStar,
  IconCalendar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: "default" | "compact" | "navbar";
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  className,
  placeholder = "Search movies and shows...",
  variant = "default",
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const {
    results,
    suggestions,
    recentSearches,
    isLoading,
    search,
    searchSuggestions,
    addToRecentSearches,
    clearRecentSearches,
  } = useSearch();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      searchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, searchSuggestions]);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    addToRecentSearches(searchQuery);
    setIsOpen(false);
    setQuery("");

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const allItems = [
      ...suggestions,
      ...(recentSearches.length > 0 ? recentSearches : []),
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          handleSearch(allItems[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (variant === "compact") {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10"
            autoFocus={autoFocus}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "pl-10 pr-10",
              variant === "navbar" && "bg-background/50 border-muted"
            )}
            autoFocus={autoFocus}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
          {isLoading && (
            <IconLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg">
            <div className="max-h-96 overflow-y-auto">
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                    <IconSearch className="h-4 w-4" />
                    Suggestions
                  </div>
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <button
                      key={suggestion}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm hover:bg-muted transition-colors",
                        selectedIndex === index && "bg-muted"
                      )}
                      onClick={() => handleSearch(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <IconMovie className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && suggestions.length === 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <IconClock className="h-4 w-4" />
                      Recent Searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={search}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm hover:bg-muted transition-colors",
                        selectedIndex === suggestions.length + index &&
                          "bg-muted"
                      )}
                      onClick={() => handleSearch(search)}
                    >
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Movie Results */}
              {results.length > 0 && (
                <div className="p-2">
                  <Separator className="mb-2" />
                  <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                    <IconMovie className="h-4 w-4" />
                    Movies
                  </div>
                  {results.slice(0, 5).map((movie) => (
                    <button
                      key={movie._id}
                      className="w-full text-left px-3 py-2 rounded-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/movies/${movie._id}`);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {movie.title}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {new Date(movie.releaseDate).getFullYear()}
                            </span>
                            <div className="flex items-center gap-1">
                              <IconStar className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{movie.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        {movie.isPremium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {query &&
                suggestions.length === 0 &&
                results.length === 0 &&
                recentSearches.length === 0 &&
                !isLoading && (
                  <div className="p-4 text-center text-muted-foreground">
                    <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-sm">Try searching for something else</p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </Popover>
  );
}

// Navbar-specific search component
export function NavbarSearchBar({ className }: { className?: string }) {
  return (
    <SearchBar
      variant="navbar"
      placeholder="Search movies..."
      className={cn("w-64", className)}
    />
  );
}

// Page-specific search component
export function PageSearchBar({ className }: { className?: string }) {
  return (
    <SearchBar
      variant="default"
      placeholder="Search for movies, shows, actors..."
      className={cn("max-w-2xl", className)}
      autoFocus
    />
  );
}
