"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  IconX,
  IconClock,
  IconTrendingUp,
  IconMovie,
  IconUser,
  IconHash,
  IconLoader,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: "default" | "compact" | "minimal";
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  onSearch?: (query: string) => void;
  onClose?: () => void;
}

interface SearchSuggestion {
  type: "movie" | "genre" | "person" | "keyword";
  id: string;
  title: string;
  subtitle?: string;
  year?: number;
  image?: string;
}

export function SearchBar({
  className,
  placeholder = "Search movies, shows, genres...",
  variant = "default",
  showSuggestions = true,
  showRecentSearches = true,
  onSearch,
  onClose,
}: SearchBarProps) {
  const router = useRouter();
  const {
    suggestions,
    recentSearches,
    isLoading,
    searchSuggestions,
    addToRecentSearches,
    clearRecentSearches,
  } = useSearch();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery && showSuggestions) {
      searchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, searchSuggestions, showSuggestions]);

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();
    addToRecentSearches(trimmedQuery);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }

    setQuery("");
    setIsOpen(false);
    onClose?.();
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion | string) => {
    const searchTerm =
      typeof suggestion === "string" ? suggestion : suggestion.title;
    handleSearch(searchTerm);
  };

  // Get search icon size based on variant
  const getIconSize = () => {
    switch (variant) {
      case "compact":
        return "h-4 w-4";
      case "minimal":
        return "h-3 w-3";
      default:
        return "h-4 w-4";
    }
  };

  // Get input size based on variant
  const getInputSize = () => {
    switch (variant) {
      case "compact":
        return "h-8 text-sm";
      case "minimal":
        return "h-6 text-xs";
      default:
        return "h-10";
    }
  };

  const shouldShowDropdown = isOpen && (!!query || showRecentSearches);
  const hasResults = suggestions.length > 0 || recentSearches.length > 0;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Popover open={!!shouldShowDropdown} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <IconSearch
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                getIconSize()
              )}
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                setIsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={cn(
                "pl-10 pr-10",
                getInputSize(),
                isFocused && "ring-2 ring-primary/20"
              )}
            />
            {(query || isLoading) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <IconLoader
                    className={cn(
                      "animate-spin text-muted-foreground",
                      getIconSize()
                    )}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery("")}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <IconX
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        getIconSize()
                      )}
                    />
                  </Button>
                )}
              </div>
            )}
          </div>
        </PopoverTrigger>

        {shouldShowDropdown && (
          <PopoverContent
            className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            side="bottom"
          >
            <Command>
              <CommandList>
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestions.slice(0, 5).map((suggestion, index) => (
                      <CommandItem
                        key={`suggestion-${index}`}
                        onSelect={() => handleSuggestionClick(suggestion)}
                        className="flex items-center space-x-3 px-3 py-2"
                      >
                        <IconSearch className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{suggestion}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Recent Searches */}
                {showRecentSearches && recentSearches.length > 0 && !query && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <CommandItem
                        key={`recent-${index}`}
                        onSelect={() => handleSuggestionClick(search)}
                        className="flex items-center space-x-3 px-3 py-2"
                      >
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{search}</span>
                      </CommandItem>
                    ))}
                    {recentSearches.length > 0 && (
                      <div className="px-3 py-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                        >
                          Clear recent searches
                        </Button>
                      </div>
                    )}
                  </CommandGroup>
                )}

                {/* Trending Searches */}
                {!query && (
                  <CommandGroup heading="Trending">
                    {[
                      "Action Movies",
                      "Marvel",
                      "Comedy",
                      "Horror",
                      "Sci-Fi",
                    ].map((trend) => (
                      <CommandItem
                        key={trend}
                        onSelect={() => handleSuggestionClick(trend)}
                        className="flex items-center space-x-3 px-3 py-2"
                      >
                        <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{trend}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Empty State */}
                {query && suggestions.length === 0 && !isLoading && (
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

// Navbar variant of the search bar
export function NavbarSearchBar({
  className,
  ...props
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar
      variant="compact"
      className={cn("w-64 lg:w-80", className)}
      {...props}
    />
  );
}

// Mobile search overlay
export function MobileSearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <SearchBar
            className="flex-1"
            placeholder="Search movies, shows, genres..."
            onSearch={() => onClose()}
          />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Quick search for admin panels
export function QuickSearch({
  onSelect,
  placeholder = "Quick search...",
}: {
  onSelect: (item: any) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Movies">
          {/* Add your search results here */}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

// Search filters component
export function SearchFilters({
  filters,
  onFilterChange,
}: {
  filters: any;
  onFilterChange: (filters: any) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="cursor-pointer">
        <IconMovie className="h-3 w-3 mr-1" />
        Movies
      </Badge>
      <Badge variant="outline" className="cursor-pointer">
        <IconUser className="h-3 w-3 mr-1" />
        People
      </Badge>
      <Badge variant="outline" className="cursor-pointer">
        <IconHash className="h-3 w-3 mr-1" />
        Genres
      </Badge>
    </div>
  );
}
