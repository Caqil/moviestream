"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useThemeContext } from "@/contexts/theme-context";
import { SearchBar } from "@/components/movie/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IconHome,
  IconMovie,
  IconSearch,
  IconHeart,
  IconUser,
  IconSettings,
  IconCrown,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconChevronDown,
  IconChevronRight,
  IconGrid3x3,
  IconList,
  IconStar,
  IconTrendingUp,
  IconClock,
  IconBookmark,
  IconDownload,
  IconHistory,
  IconShield,
  IconPalette,
  IconLanguage,
  IconMoon,
  IconSun,
  IconX,
  IconExternalLink,
  IconHelp,
  IconMail,
  IconPhone,
  IconBell,
  IconCreditCard,
  IconDeviceMobileX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MonitorIcon } from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
  children?: MenuItem[];
  requireAuth?: boolean;
  requireSubscription?: boolean;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/",
    icon: IconHome,
  },
  {
    label: "Movies",
    icon: IconMovie,
    children: [
      { label: "Browse All", href: "/movies", icon: IconGrid3x3 },
      { label: "New Releases", href: "/movies/new", icon: IconTrendingUp },
      { label: "Top Rated", href: "/movies/top-rated", icon: IconStar },
      { label: "Genres", href: "/genres", icon: IconList },
    ],
  },
  {
    label: "My Library",
    icon: IconUser,
    requireAuth: true,
    children: [
      { label: "Watchlist", href: "/watchlist", icon: IconBookmark },
      { label: "History", href: "/history", icon: IconHistory },
      {
        label: "Downloads",
        href: "/downloads",
        icon: IconDownload,
        requireSubscription: true,
      },
      { label: "Favorites", href: "/favorites", icon: IconHeart },
    ],
  },
  {
    label: "Search",
    href: "/search",
    icon: IconSearch,
  },
];

const accountMenuItems: MenuItem[] = [
  {
    label: "Account Settings",
    href: "/account",
    icon: IconSettings,
  },
  {
    label: "Subscription",
    href: "/account/subscription",
    icon: IconCrown,
  },
  {
    label: "Devices",
    href: "/account/devices",
    icon: IconDeviceMobileX,
  },
  {
    label: "Notifications",
    href: "/account/notifications",
    icon: IconBell,
  },
  {
    label: "Billing",
    href: "/account/billing",
    icon: IconCreditCard,
  },
];

const supportMenuItems: MenuItem[] = [
  {
    label: "Help Center",
    href: "/help",
    icon: IconHelp,
  },
  {
    label: "Contact Support",
    href: "/contact",
    icon: IconMail,
  },
  {
    label: "System Status",
    href: "/status",
    icon: IconShield,
  },
];

export function MobileMenu({ open, onClose, className }: MobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isAdmin, isSubscriber, logout } =
    useAuthContext();
  const { currentPlan, subscriptionStatus, daysRemaining } =
    useSubscriptionContext();
  const { theme, setTheme, preferences, updatePreferences } = useThemeContext();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Handle menu item click
  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
      onClose();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Filter menu items based on auth and subscription status
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (item.requireAuth && !isAuthenticated) return false;
        if (item.requireSubscription && !isSubscriber) return false;
        if (item.adminOnly && !isAdmin) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined,
      }));
  };

  const filteredMenuItems = filterMenuItems(menuItems);
  const filteredAccountItems = filterMenuItems(accountMenuItems);

  // Render menu item
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isExpanded}
          onOpenChange={(open: any) => {
            setExpandedItems((prev) =>
              open
                ? [...prev, item.label]
                : prev.filter((label) => label !== item.label)
            );
          }}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between h-12 px-4",
                level > 0 && "ml-6",
                isActive && "bg-muted"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || "secondary"}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <IconChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.label}
        variant="ghost"
        onClick={() => handleItemClick(item)}
        className={cn(
          "w-full justify-start h-12 px-4",
          level > 0 && "ml-6",
          isActive && "bg-muted font-medium"
        )}
      >
        <item.icon className="h-5 w-5 mr-3" />
        <span>{item.label}</span>
        {item.badge && (
          <Badge
            variant={item.badgeVariant || "secondary"}
            className="ml-auto text-xs"
          >
            {item.badge}
          </Badge>
        )}
        {item.href?.startsWith("http") && (
          <IconExternalLink className="h-3 w-3 ml-auto" />
        )}
      </Button>
    );
  };

  if (!open) return null;

  return (
    <div className={cn("bg-background border-r", className)}>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <SearchBar
              variant="compact"
              placeholder="Search movies..."
              onSearch={(query) => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                onClose();
              }}
            />
          </div>

          <Separator />

          {/* User Profile Section */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 px-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="px-2">
                {isSubscriber ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <IconCrown className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {currentPlan?.name} Plan
                        </p>
                        {subscriptionStatus === "active" &&
                          daysRemaining > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Renews in {daysRemaining} days
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Free Account</p>
                        <p className="text-xs text-muted-foreground">
                          Upgrade for unlimited access
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/pricing" onClick={onClose}>
                          Upgrade
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login" onClick={onClose}>
                  <IconLogin className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/register" onClick={onClose}>
                  <IconUserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation Menu */}
          <div className="space-y-1">
            <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Navigate
            </h3>
            {filteredMenuItems.map((item) => renderMenuItem(item))}
          </div>

          {/* Account Menu (for authenticated users) */}
          {isAuthenticated && (
            <>
              <Separator />
              <div className="space-y-1">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Account
                </h3>
                {filteredAccountItems.map((item) => renderMenuItem(item))}
              </div>
            </>
          )}

          {/* Settings */}
          <Separator />
          <div className="space-y-3">
            <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Settings
            </h3>

            {/* Theme Selector */}
            <div className="px-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconPalette className="h-4 w-4" />
                  <span className="text-sm">Theme</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 rounded-lg border p-1">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1 h-8"
                >
                  <IconSun className="h-3 w-3 mr-1" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1 h-8"
                >
                  <IconMoon className="h-3 w-3 mr-1" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1 h-8"
                >
                  <MonitorIcon className="h-3 w-3 mr-1" />
                  Auto
                </Button>
              </div>
            </div>

            {/* Preferences */}
            <div className="px-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconSettings className="h-4 w-4" />
                  <span className="text-sm">Autoplay</span>
                </div>
                <Switch
                  checked={preferences.autoplay}
                  onCheckedChange={(autoplay: any) =>
                    updatePreferences({ autoplay })
                  }
                />
              </div>
            </div>
          </div>

          {/* Support */}
          <Separator />
          <div className="space-y-1">
            <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Support
            </h3>
            {supportMenuItems.map((item) => renderMenuItem(item))}
          </div>

          {/* Logout (for authenticated users) */}
          {isAuthenticated && (
            <>
              <Separator />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start h-12 px-4 text-destructive hover:text-destructive"
              >
                <IconLogout className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </>
          )}

          {/* Footer Links */}
          <Separator />
          <div className="px-2 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <Link
                href="/privacy"
                onClick={onClose}
                className="hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                onClick={onClose}
                className="hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/help"
                onClick={onClose}
                className="hover:text-foreground"
              >
                Help
              </Link>
            </div>
            <p className="text-center">© 2024 MovieStream</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
