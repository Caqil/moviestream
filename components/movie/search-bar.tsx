"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconSearch,
  IconX,
  IconClock,
  IconTrendingUp,
  IconStar,
  IconCalendar,
  IconLoader,
  IconMovie,
  IconFilter,
  IconArrowRight,
  IconHistory,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Movie } from "@/types";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onResultSelect?: (movie: Movie) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "compact" | "hero";
  showSuggestions?: boolean;
  showRecent?: boolean;
  showTrending?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
  debounceMs?: number;
  maxResults?: number;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: "movie" | "genre" | "person";
  year?: number;
  rating?: number;
  poster?: string;
}

export function SearchBar({
  onSearch,
  onResultSelect,
  placeholder = "Search movies, genres, or people...",
  className,
  variant = "default",
  showSuggestions = true,
  showRecent = true,
  showTrending = true,
  autoFocus = false,
  initialValue = "",
  debounceMs = 300,
  maxResults = 8,
}: SearchBarProps) {
  const router = useRouter();
  const {
    search,
    searchSuggestions,
    results,
    recentSearches,
    getTrending,
    addToRecentSearches,
    clearRecentSearches,
    isLoading,
  } = useSearch();

  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load trending searches on mount
  useEffect(() => {
    if (showTrending) {
      getTrending().then(setTrending);
    }
  }, [showTrending, getTrending]);

  // Debounced search suggestions
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSuggestions(query).then(() => {
        // Transform search results to suggestions
        const movieSuggestions: SearchSuggestion[] = results
          .slice(0, maxResults)
          .map((movie) => ({
            id: movie._id.toString(),
            title: movie.title,
            type: "movie" as const,
            year: new Date(movie.releaseDate).getFullYear(),
            rating: movie.rating,
            poster: movie.poster,
          }));

        setSuggestions(movieSuggestions);
      });
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    query,
    showSuggestions,
    debounceMs,
    maxResults,
    searchSuggestions,
    results,
  ]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim() && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      addToRecentSearches(searchQuery);
      setIsOpen(false);

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    },
    [onSearch, router, addToRecentSearches]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      handleSuggestionSelect(suggestions[highlightedIndex]);
    } else {
      handleSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "movie") {
      if (onResultSelect) {
        // Find the full movie object
        const movie = results.find((m) => m._id.toString() === suggestion.id);
        if (movie) {
          onResultSelect(movie);
        }
      } else {
        router.push(`/movies/${suggestion.id}`);
      }
    } else {
      handleSearch(suggestion.title);
    }

    setIsOpen(false);
    setQuery(suggestion.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(
            prev + 1,
            suggestions.length + recentSearches.length + trending.length - 1
          )
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (variant === "hero") {
    return (
      <div className={cn("relative max-w-2xl mx-auto", className)}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              autoFocus={autoFocus}
              className="h-16 pl-14 pr-14 text-lg bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl rounded-2xl"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Hero Search Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border z-50 max-h-96 overflow-hidden">
            <ScrollArea className="max-h-96">
              <div className="p-4 space-y-4">
                {/* Search Results */}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground px-2">
                      Movies
                    </h4>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={cn(
                          "flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted",
                          highlightedIndex === index && "bg-muted"
                        )}
                      >
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                          <IconMovie className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {suggestion.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{suggestion.year}</span>
                            {suggestion.rating && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{suggestion.rating.toFixed(1)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {showRecent && recentSearches.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Recent Searches
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    {recentSearches.slice(0, 5).map((recent, index) => (
                      <div
                        key={recent}
                        onClick={() => handleSearch(recent)}
                        className={cn(
                          "flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted",
                          highlightedIndex === suggestions.length + index &&
                            "bg-muted"
                        )}
                      >
                        <IconHistory className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{recent}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trending */}
                {showTrending && trending.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground px-2">
                      Trending
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trending.slice(0, 6).map((trend) => (
                        <Badge
                          key={trend}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleSearch(trend)}
                        >
                          <IconTrendingUp className="h-3 w-3 mr-1" />
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start", className)}
          >
            <IconSearch className="h-4 w-4 mr-2" />
            {query || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={handleInputChange}
              autoFocus
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <IconLoader className="h-4 w-4 animate-spin" />
                </div>
              )}

              {suggestions.length > 0 && (
                <CommandGroup heading="Movies">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="flex items-center space-x-2"
                    >
                      <IconMovie className="h-4 w-4" />
                      <div className="flex-1">
                        <span>{suggestion.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {suggestion.year}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {recentSearches.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentSearches.slice(0, 3).map((recent) => (
                    <CommandItem
                      key={recent}
                      onSelect={() => handleSearch(recent)}
                    >
                      <IconClock className="h-4 w-4 mr-2" />
                      {recent}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            autoFocus={autoFocus}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (showSuggestions || showRecent || showTrending) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg shadow-lg border z-50 max-h-80 overflow-hidden">
          <ScrollArea className="max-h-80">
            <div className="p-2">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <IconLoader className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              {/* Search Results */}
              {suggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Movies
                    </h4>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-muted",
                        highlightedIndex === index && "bg-muted"
                      )}
                    >
                      <div className="w-8 h-10 bg-muted rounded flex items-center justify-center">
                        <IconMovie className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {suggestion.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <IconCalendar className="h-3 w-3" />
                          <span>{suggestion.year}</span>
                          {suggestion.rating && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{suggestion.rating.toFixed(1)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Separator */}
              {suggestions.length > 0 &&
                (recentSearches.length > 0 || trending.length > 0) && (
                  <Separator className="my-2" />
                )}

              {/* Recent Searches */}
              {showRecent && recentSearches.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recent
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-5 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  {recentSearches.slice(0, 3).map((recent, index) => (
                    <div
                      key={recent}
                      onClick={() => handleSearch(recent)}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-muted",
                        highlightedIndex === suggestions.length + index &&
                          "bg-muted"
                      )}
                    >
                      <IconClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{recent}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending */}
              {showTrending && trending.length > 0 && (
                <div className="space-y-2">
                  {(suggestions.length > 0 || recentSearches.length > 0) && (
                    <Separator className="my-2" />
                  )}
                  <div className="px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Trending
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1 p-1">
                    {trending.slice(0, 6).map((trend) => (
                      <Badge
                        key={trend}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSearch(trend)}
                      >
                        <IconTrendingUp className="h-3 w-3 mr-1" />
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && !isLoading && suggestions.length === 0 && (
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground">
                    No results found for "{query}"
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(query)}
                    className="mt-2"
                  >
                    Search anyway
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Specialized variants
export function HeroSearchBar({
  className,
  ...props
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar
      variant="hero"
      className={className}
      autoFocus={true}
      placeholder="What do you want to watch today?"
      {...props}
    />
  );
}

export function CompactSearchBar({
  className,
  ...props
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar
      variant="compact"
      className={className}
      showTrending={false}
      maxResults={5}
      {...props}
    />
  );
}

export function NavbarSearchBar({
  className,
  ...props
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar
      variant="default"
      className={cn("w-80", className)}
      placeholder="Search..."
      showTrending={false}
      maxResults={6}
      debounceMs={200}
      {...props}
    />
  );
}
