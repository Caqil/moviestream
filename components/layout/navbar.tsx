"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { NavbarSearchBar } from "@/components/movie/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconCrown,
  IconHeart,
  IconHistory,
  IconBookmark,
  IconDownload,
  IconBell,
  IconCreditCard,
  IconShield,
  IconChevronDown,
  IconMovie,
  IconHome,
  IconTrendingUp,
  IconStar,
  IconGrid3x3,
  IconSearch,
  IconDevices,
  IconHelp,
  IconMail,
  IconExternalLink,
  IconDashboard,
  IconUsers,
  IconDatabase,
  IconPlayerPlay,
  IconFileAnalytics,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/constants";

interface NavbarProps {
  className?: string;
  variant?: "default" | "transparent" | "minimal" | "auth";
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  children?: NavItem[];
  badge?: string;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: IconHome,
  },
  {
    label: "Movies",
    icon: IconMovie,
    children: [
      {
        label: "Browse All",
        href: "/movies",
        icon: IconGrid3x3,
      },
      {
        label: "New Releases",
        href: "/movies/new",
        icon: IconTrendingUp,
      },
      {
        label: "Top Rated",
        href: "/movies/top-rated",
        icon: IconStar,
      },
      {
        label: "Genres",
        href: "/genres",
        icon: IconGrid3x3,
      },
    ],
  },
  {
    label: "My Library",
    icon: IconUser,
    requireAuth: true,
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
];

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
  },
  {
    label: "Movies",
    href: "/admin/movies",
    icon: IconMovie,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: IconFileAnalytics,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

export function Navbar({
  className,
  variant = "default",
  isMobile = false,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isAdmin, isSubscriber, logout } =
    useAuthContext();
  const { currentPlan, subscriptionStatus, daysRemaining } =
    useSubscriptionContext();

  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notification count for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Implement notification count fetching
      setNotificationCount(3); // Placeholder
    }
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Filter nav items based on auth status
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        if (item.requireAuth && !isAuthenticated) return false;
        if (item.requireSubscription && !isSubscriber) return false;
        if (item.adminOnly && !isAdmin) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterNavItems(item.children) : undefined,
      }));
  };

  const filteredMainNav = filterNavItems(mainNavItems);

  // Check if path is active
  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Get logo styles based on variant
  const getLogoStyles = () => {
    switch (variant) {
      case "transparent":
        return "text-white";
      case "auth":
        return "text-foreground";
      default:
        return "text-foreground";
    }
  };

  return (
    <nav className={cn("flex items-center justify-between w-full", className)}>
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <IconPlayerPlay className="h-5 w-5 text-primary-foreground" />
        </div>
        <span
          className={cn("font-bold text-xl hidden sm:block", getLogoStyles())}
        >
          {APP_CONFIG.name}
        </span>
      </Link>

      {/* Main Navigation (Desktop) */}
      {!isMobile && variant !== "minimal" && variant !== "auth" && (
        <NavigationMenu className="hidden lg:flex mx-8">
          <NavigationMenuList>
            {filteredMainNav.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger className="gap-1">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-64 gap-1 p-2">
                        {item.children.map((child) => (
                          <NavigationMenuLink
                            key={child.href}
                            asChild
                            className={cn(
                              "flex items-center space-x-2 p-3 rounded-md hover:bg-muted transition-colors",
                              isActivePath(child.href!) &&
                                "bg-muted font-medium"
                            )}
                          >
                            <Link href={child.href!}>
                              {child.icon && <child.icon className="h-4 w-4" />}
                              <span>{child.label}</span>
                              {child.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto text-xs"
                                >
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link href={item.href!} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "gap-1",
                        isActivePath(item.href!) && "bg-muted font-medium"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      )}

      {/* Right Side */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search (Desktop) */}
        {!isMobile && variant !== "minimal" && variant !== "auth" && (
          <div className="hidden md:block">
            <NavbarSearchBar />
          </div>
        )}

        {/* Search Button (Mobile) */}
        {isMobile && variant !== "auth" && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <Link href="/search">
              <IconSearch className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* Admin Panel Link */}
        {isAdmin && !pathname.startsWith("/admin") && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href="/admin">
                    <IconShield className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Admin Panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Notifications */}
        {isAuthenticated && !isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 relative"
                  asChild
                >
                  <Link href="/notifications">
                    <IconBell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* User Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              {/* User Info */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>

                  {/* Subscription Status */}
                  {isSubscriber ? (
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded-md">
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
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Free Account</p>
                        <p className="text-xs text-muted-foreground">
                          Upgrade for unlimited access
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/pricing">Upgrade</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Quick Actions */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/watchlist">
                    <IconBookmark className="mr-2 h-4 w-4" />
                    <span>My Watchlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history">
                    <IconHistory className="mr-2 h-4 w-4" />
                    <span>Watch History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">
                    <IconHeart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                </DropdownMenuItem>
                {isSubscriber && (
                  <DropdownMenuItem asChild>
                    <Link href="/downloads">
                      <IconDownload className="mr-2 h-4 w-4" />
                      <span>Downloads</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Account Management */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <IconUser className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/subscription">
                    <IconCrown className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/devices">
                    <IconDevices className="mr-2 h-4 w-4" />
                    <span>Manage Devices</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/billing">
                    <IconCreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {/* Admin Menu */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <IconShield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {adminNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href!}>
                            {item.icon && (
                              <item.icon className="mr-2 h-4 w-4" />
                            )}
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Support */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <IconHelp className="mr-2 h-4 w-4" />
                    <span>Help Center</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact">
                    <IconMail className="mr-2 h-4 w-4" />
                    <span>Contact Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout}>
                <IconLogout className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Auth Buttons */
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">
                <IconLogin className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">
                <IconUserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
