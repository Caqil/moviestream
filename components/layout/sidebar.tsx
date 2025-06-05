"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconHome,
  IconDashboard,
  IconMovie,
  IconUsers,
  IconSettings,
  IconCrown,
  IconBookmark,
  IconHistory,
  IconHeart,
  IconDownload,
  IconUser,
  IconCreditCard,
  IconBell,
  IconShield,
  IconDevices,
  IconDatabase,
  IconMail,
  IconPalette,
  IconGlobe,
  IconKey,
  IconToggleLeft,
  IconChartBar,
  IconTrendingUp,
  IconCurrencyDollar,
  IconPlayerPlay,
  IconUpload,
  IconFileText,
  IconHelp,
  IconLogout,
  IconArrowLeft,
  IconFileAnalytics,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

interface SidebarProps {
  className?: string;
  variant?: "admin" | "user" | "dashboard";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: SidebarItem[];
  requireAdmin?: boolean;
  requireSubscription?: boolean;
  separator?: boolean;
  comingSoon?: boolean;
}

const adminSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
  },
  {
    label: "Content",
    icon: IconMovie,
    children: [
      {
        label: "Movies",
        href: "/admin/movies",
        icon: IconMovie,
      },
      {
        label: "Genres",
        href: "/admin/genres",
        icon: IconPalette,
      },
      {
        label: "Upload",
        href: "/admin/upload",
        icon: IconUpload,
      },
      {
        label: "TMDB Import",
        href: "/admin/import",
        icon: IconDatabase,
      },
    ],
  },
  {
    label: "Users",
    icon: IconUsers,
    children: [
      {
        label: "All Users",
        href: "/admin/users",
        icon: IconUsers,
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        icon: IconCrown,
      },
      {
        label: "Devices",
        href: "/admin/devices",
        icon: IconDevices,
      },
    ],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: IconFileAnalytics,
  },
  {
    label: "Revenue",
    icon: IconCurrencyDollar,
    children: [
      {
        label: "Overview",
        href: "/admin/revenue",
        icon: IconChartBar,
      },
      {
        label: "Subscriptions",
        href: "/admin/revenue/subscriptions",
        icon: IconCrown,
      },
      {
        label: "Payments",
        href: "/admin/revenue/payments",
        icon: IconCreditCard,
      },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings,
    children: [
      {
        label: "General",
        href: "/admin/settings",
        icon: IconSettings,
      },
      {
        label: "TMDB",
        href: "/admin/settings/tmdb",
        icon: IconDatabase,
      },
      {
        label: "Stripe",
        href: "/admin/settings/stripe",
        icon: IconCreditCard,
      },
      {
        label: "Storage",
        href: "/admin/settings/storage",
        icon: IconDatabase,
      },
      {
        label: "Email",
        href: "/admin/settings/email",
        icon: IconMail,
      },
      {
        label: "Security",
        href: "/admin/settings/security",
        icon: IconShield,
      },
    ],
  },
  {
    label: "System",
    icon: IconShield,
    children: [
      {
        label: "Logs",
        href: "/admin/logs",
        icon: IconFileText,
      },
      {
        label: "Backups",
        href: "/admin/backups",
        icon: IconDatabase,
        comingSoon: true,
      },
      {
        label: "Maintenance",
        href: "/admin/maintenance",
        icon: IconSettings,
        comingSoon: true,
      },
    ],
  },
];

const userSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconHome,
  },
  {
    label: "My Library",
    icon: IconUser,
    children: [
      {
        label: "Watchlist",
        href: "/watchlist",
        icon: IconBookmark,
      },
      {
        label: "History",
        href: "/history",
        icon: IconHistory,
      },
      {
        label: "Favorites",
        href: "/favorites",
        icon: IconHeart,
      },
      {
        label: "Downloads",
        href: "/downloads",
        icon: IconDownload,
        requireSubscription: true,
      },
    ],
  },
  {
    label: "Account",
    icon: IconSettings,
    children: [
      {
        label: "Profile",
        href: "/account",
        icon: IconUser,
      },
      {
        label: "Subscription",
        href: "/account/subscription",
        icon: IconCrown,
      },
      {
        label: "Devices",
        href: "/account/devices",
        icon: IconDevices,
      },
      {
        label: "Billing",
        href: "/account/billing",
        icon: IconCreditCard,
      },
      {
        label: "Notifications",
        href: "/account/notifications",
        icon: IconBell,
      },
    ],
  },
];

export function Sidebar({
  className,
  variant = "user",
  collapsible = true,
  defaultCollapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isSubscriber, logout } = useAuthContext();
  const { currentPlan, subscriptionStatus, daysRemaining } =
    useSubscriptionContext();

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Handle collapse state change
  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // Auto-expand current section
  useEffect(() => {
    const items = variant === "admin" ? adminSidebarItems : userSidebarItems;

    for (const item of items) {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.href && pathname.startsWith(child.href)
        );
        if (hasActiveChild && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    }
  }, [pathname, variant, expandedItems]);

  // Get sidebar items based on variant
  const getSidebarItems = (): SidebarItem[] => {
    const items = variant === "admin" ? adminSidebarItems : userSidebarItems;

    return items
      .filter((item) => {
        if (item.requireAdmin && !isAdmin) return false;
        if (item.requireSubscription && !isSubscriber) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => {
          if (child.requireAdmin && !isAdmin) return false;
          if (child.requireSubscription && !isSubscriber) return false;
          return true;
        }),
      }));
  };

  const sidebarItems = getSidebarItems();

  // Check if item is active
  const isActiveItem = (href?: string) => {
    if (!href) return false;
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Toggle expanded state
  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Render sidebar item
  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    const ItemContent = () => (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          "hover:bg-muted",
          level > 0 && "ml-6",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
          item.comingSoon && "opacity-50 cursor-not-allowed"
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 flex-shrink-0",
            collapsed && !level && "h-5 w-5"
          )}
        />

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>

            {item.badge && (
              <Badge
                variant={item.badgeVariant || "secondary"}
                className="text-xs"
              >
                {item.badge}
              </Badge>
            )}

            {item.comingSoon && (
              <Badge variant="outline" className="text-xs">
                Soon
              </Badge>
            )}

            {hasChildren && (
              <IconChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </>
        )}
      </div>
    );

    if (item.comingSoon) {
      return (
        <TooltipProvider key={item.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ItemContent />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Coming Soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isExpanded}
          onOpenChange={() => !collapsed && toggleExpanded(item.label)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => collapsed && handleCollapsedChange(false)}
            >
              <ItemContent />
            </Button>
          </CollapsibleTrigger>

          {!collapsed && (
            <CollapsibleContent className="space-y-1 mt-1">
              {item.children?.map((child) =>
                renderSidebarItem(child, level + 1)
              )}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    if (collapsed && level === 0) {
      return (
        <TooltipProvider key={item.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center p-2 h-auto"
                asChild={!!item.href}
              >
                {item.href ? (
                  <Link href={item.href}>
                    <ItemContent />
                  </Link>
                ) : (
                  <ItemContent />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        key={item.label}
        variant="ghost"
        className="w-full justify-start p-0 h-auto"
        asChild={!!item.href}
      >
        {item.href ? (
          <Link href={item.href}>
            <ItemContent />
          </Link>
        ) : (
          <ItemContent />
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        collapsed ? "w-16" : "w-64",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <IconPlayerPlay className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">{APP_CONFIG.name}</span>
          </Link>
        )}

        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCollapsedChange(!collapsed)}
            className={cn("h-6 w-6 p-0", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <IconChevronRight className="h-4 w-4" />
            ) : (
              <IconChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-muted-foreground truncate">
                  {isAdmin
                    ? "Admin"
                    : isSubscriber
                    ? currentPlan?.name
                    : "Free"}
                </p>
                {isAdmin && (
                  <Badge variant="destructive" className="text-xs h-4">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {isSubscriber &&
            subscriptionStatus === "active" &&
            daysRemaining &&
            daysRemaining <= 7 && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <IconCrown className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                      Subscription expires in {daysRemaining} days
                    </p>
                    <Progress
                      value={((30 - daysRemaining) / 30) * 100}
                      className="h-1 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {/* Back to Main Site (Admin) */}
          {variant === "admin" && (
            <>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/">
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  {!collapsed && "Back to Site"}
                </Link>
              </Button>
              <Separator className="my-2" />
            </>
          )}

          {sidebarItems.map((item, index) => (
            <div key={item.label}>
              {item.separator && index > 0 && <Separator className="my-2" />}
              {renderSidebarItem(item)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8"
            asChild
          >
            <Link href="/help">
              <IconHelp className="h-4 w-4 mr-2" />
              Help & Support
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start h-8 text-muted-foreground"
          >
            <IconLogout className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}

// Specialized variants
export function AdminSidebar(props: Omit<SidebarProps, "variant">) {
  return <Sidebar variant="admin" {...props} />;
}

export function UserSidebar(props: Omit<SidebarProps, "variant">) {
  return <Sidebar variant="user" {...props} />;
}

export function DashboardSidebar(props: Omit<SidebarProps, "variant">) {
  return <Sidebar variant="dashboard" {...props} />;
}
