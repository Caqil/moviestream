"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  className?: string;
  maxItems?: number;
  autoGenerate?: boolean;
}

export function Breadcrumb({
  items = [],
  separator,
  showHome = true,
  homeLabel = "Home",
  homeHref = "/",
  className,
  maxItems,
  autoGenerate = false,
  ...props
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    pathSegments.forEach((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Handle special cases
      if (segment === "admin") label = "Admin";
      if (segment === "api") label = "API";
      if (segment.length === 24 && /^[a-f\d]{24}$/i.test(segment)) {
        // MongoDB ObjectId pattern
        label = `Item ${segment.slice(-6)}`;
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href,
        isCurrentPage: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = autoGenerate ? generateBreadcrumbs() : items;

  // Truncate items if maxItems is specified
  const displayItems =
    maxItems && breadcrumbItems.length > maxItems
      ? [
          ...breadcrumbItems.slice(0, 1),
          { label: "...", href: undefined },
          ...breadcrumbItems.slice(-(maxItems - 2)),
        ]
      : breadcrumbItems;

  const defaultSeparator = (
    <IconChevronRight className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
      {...props}
    >
      <ol className="flex items-center space-x-1">
        {/* Home item */}
        {showHome && (
          <>
            <li>
              <Link
                href={homeHref}
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconHome className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">{homeLabel}</span>
              </Link>
            </li>
            {displayItems.length > 0 && (
              <li>{separator || defaultSeparator}</li>
            )}
          </>
        )}

        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              <li>
                {item.href && !item.isCurrentPage ? (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "flex items-center space-x-1",
                      item.isCurrentPage
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                    aria-current={item.isCurrentPage ? "page" : undefined}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
              {!isLast && <li>{separator || defaultSeparator}</li>}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Specialized breadcrumb variants
export function AdminBreadcrumb({
  items = [],
  className,
  ...props
}: Omit<BreadcrumbProps, "showHome" | "homeLabel" | "homeHref">) {
  return (
    <Breadcrumb
      items={items}
      showHome={true}
      homeLabel="Admin"
      homeHref="/admin"
      className={className}
      {...props}
    />
  );
}

export function DashboardBreadcrumb({
  items = [],
  className,
  ...props
}: Omit<BreadcrumbProps, "showHome" | "homeLabel" | "homeHref">) {
  return (
    <Breadcrumb
      items={items}
      showHome={true}
      homeLabel="Dashboard"
      homeHref="/dashboard"
      className={className}
      {...props}
    />
  );
}

// Hook for building breadcrumbs
export function useBreadcrumbs() {
  const pathname = usePathname();

  const buildBreadcrumb = (
    label: string,
    href?: string,
    icon?: React.ComponentType<{ className?: string }>
  ): BreadcrumbItem => ({
    label,
    href,
    icon,
    isCurrentPage: !href,
  });

  const getBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;

      return buildBreadcrumb(
        segment.charAt(0).toUpperCase() + segment.slice(1),
        isLast ? undefined : href
      );
    });
  };

  return {
    buildBreadcrumb,
    getBreadcrumbsFromPath,
    currentPath: pathname,
  };
}

// Common breadcrumb patterns
export const CommonBreadcrumbs = {
  // Admin patterns
  adminDashboard: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/admin", isCurrentPage: true },
  ],

  adminMovies: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/admin" },
    { label: "Movies", href: "/admin/movies", isCurrentPage: true },
  ],

  adminUsers: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users", isCurrentPage: true },
  ],

  adminSettings: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/admin" },
    { label: "Settings", href: "/admin/settings", isCurrentPage: true },
  ],

  // User patterns
  userDashboard: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/dashboard", isCurrentPage: true },
  ],

  userProfile: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile", isCurrentPage: true },
  ],

  userWatchlist: (): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Watchlist", href: "/watchlist", isCurrentPage: true },
  ],

  // Movie patterns
  movieDetails: (movieTitle: string): BreadcrumbItem[] => [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Movies", href: "/movies" },
    { label: movieTitle, isCurrentPage: true },
  ],
};
