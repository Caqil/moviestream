"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconSearch,
  IconHistory,
  IconTrendingUp,
  IconMovie,
  IconX,
  IconLoader,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: "default" | "compact" | "navbar";
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  className,
  placeholder = "Search movies, shows, actors...",
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
    getTrending,
    addToRecentSearches,
    clearRecentSearches,
  } = useSearch();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [trending, setTrending] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Handle search suggestions
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 1) {
      searchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, searchSuggestions]);

  // Load trending searches on mount
  useEffect(() => {
    const loadTrending = async () => {
      const trendingResults = await getTrending();
      setTrending(trendingResults);
    };
    loadTrending();
  }, [getTrending]);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();
    addToRecentSearches(trimmedQuery);
    setIsOpen(false);
    setQuery("");

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Get search content based on query state
  const getSearchContent = () => {
    if (isLoading) {
      return (
        <CommandEmpty>
          <div className="flex items-center justify-center py-6">
            <IconLoader className="h-4 w-4 animate-spin mr-2" />
            <span>Searching...</span>
          </div>
        </CommandEmpty>
      );
    }

    if (query.length > 1 && suggestions.length > 0) {
      return (
        <CommandGroup heading="Suggestions">
          {suggestions.map((suggestion, index) => (
            <CommandItem
              key={index}
              onSelect={() => handleSuggestionClick(suggestion)}
              className="flex items-center cursor-pointer"
            >
              <IconSearch className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{suggestion}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      );
    }

    return (
      <>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <CommandGroup heading="Recent Searches">
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-xs text-muted-foreground">Recent</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            {recentSearches.slice(0, 5).map((search, index) => (
              <CommandItem
                key={index}
                onSelect={() => handleSuggestionClick(search)}
                className="flex items-center cursor-pointer"
              >
                <IconHistory className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{search}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Trending Searches */}
        {trending.length > 0 && (
          <>
            {recentSearches.length > 0 && <Separator />}
            <CommandGroup heading="Trending">
              {trending.slice(0, 5).map((trend, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSuggestionClick(trend)}
                  className="flex items-center cursor-pointer"
                >
                  <IconTrendingUp className="h-4 w-4 mr-2 text-red-500" />
                  <span>{trend}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Trending
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Quick Links */}
        <Separator />
        <CommandGroup heading="Browse">
          <CommandItem
            onSelect={() => router.push("/movies/new")}
            className="flex items-center cursor-pointer"
          >
            <IconMovie className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>New Releases</span>
            <IconArrowRight className="h-3 w-3 ml-auto" />
          </CommandItem>
          <CommandItem
            onSelect={() => router.push("/movies/top-rated")}
            className="flex items-center cursor-pointer"
          >
            <IconTrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Top Rated</span>
            <IconArrowRight className="h-3 w-3 ml-auto" />
          </CommandItem>
        </CommandGroup>
      </>
    );
  };

  // Render different variants
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)}>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-10"
            autoFocus={autoFocus}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>
    );
  }

  if (variant === "navbar") {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className={cn("relative w-64", className)}>
            <form onSubmit={handleSubmit}>
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
                  className="pl-10 pr-10 bg-muted/50 border-muted focus:bg-background"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandList className="max-h-80">
              {getSearchContent()}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                className="pl-12 pr-12 h-12 text-lg"
                autoFocus={autoFocus}
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command>
          <CommandList className="max-h-96">
            {getSearchContent()}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Navbar-specific search bar
export function NavbarSearchBar({ className }: { className?: string }) {
  return (
    <SearchBar 
      variant="navbar" 
      placeholder="Search movies..." 
      className={className} 
    />
  );
}

// Compact search bar for mobile
export function CompactSearchBar({ 
  className,
  ...props 
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar 
      variant="compact" 
      className={className} 
      {...props} 
    />
  );
}

// Full-featured search bar for search page
export function FullSearchBar({ 
  className,
  ...props 
}: Omit<SearchBarProps, "variant">) {
  return (
    <SearchBar 
      variant="default" 
      className={className} 
      {...props} 
    />
  );
}