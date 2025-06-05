"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useThemeContext } from "@/contexts/theme-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  IconUser,
  IconSettings,
  IconLogout,
  IconCreditCard,
  IconDevices,
  IconHeart,
  IconHistory,
  IconShield,
  IconMoon,
  IconSun,
  IconChevronDown,
  IconCrown,
  IconUserCog,
  IconBell,
  IconHelp,
  IconDownload,
} from "@tabler/icons-react";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import Link from "next/link";
import { MonitorCheckIcon } from "lucide-react";

interface UserMenuProps {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  variant?: "full" | "compact" | "minimal";
}

export function UserMenu({
  align = "end",
  side = "bottom",
  className,
  variant = "full",
}: UserMenuProps) {
  const router = useRouter();
  const { user, logout, deviceCount } = useAuthContext();
  const { currentPlan, isSubscribed, subscriptionStatus, daysRemaining } =
    useSubscriptionContext();
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out", {
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSubscriptionBadge = () => {
    if (!isSubscribed) return null;

    const badgeProps = FormatUtils.getStatusBadge(subscriptionStatus);
    return (
      <Badge variant="outline" className={`text-xs ${badgeProps.color}`}>
        {badgeProps.text}
      </Badge>
    );
  };

  // Minimal variant - just avatar
  if (variant === "minimal") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <IconUser className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Compact variant - avatar with name
  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 ${className}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block font-medium">
              {user.name.split(" ")[0]}
            </span>
            <IconChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-72">
          {/* User Info Header */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {FormatUtils.capitalize(user.role)}
                  </Badge>
                  {getSubscriptionBadge()}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <IconUser className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant - complete menu
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 ${className}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">
              {user.name.split(" ")[0]}
            </span>
            {currentPlan && (
              <span className="text-xs text-muted-foreground">
                {currentPlan.name}
              </span>
            )}
          </div>
          <IconChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-80">
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {FormatUtils.capitalize(user.role)}
                </Badge>
                {getSubscriptionBadge()}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Subscription Info */}
        {isSubscribed && currentPlan && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current Plan</span>
                <div className="flex items-center gap-1">
                  <IconCrown className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{currentPlan.name}</span>
                </div>
              </div>
              {daysRemaining > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {daysRemaining} days remaining
                </p>
              )}
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Main Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <IconUser className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <IconUserCog className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/watchlist")}>
            <IconHeart className="mr-2 h-4 w-4" />
            <span>My Watchlist</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/history")}>
            <IconHistory className="mr-2 h-4 w-4" />
            <span>Watch History</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/downloads")}>
            <IconDownload className="mr-2 h-4 w-4" />
            <span>Downloads</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Account Management */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/subscription")}>
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
            {!isSubscribed && (
              <Badge variant="outline" className="ml-auto text-xs">
                Upgrade
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/devices")}>
            <IconDevices className="mr-2 h-4 w-4" />
            <span>Manage Devices</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {deviceCount}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/notifications")}>
            <IconBell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme Selector */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {resolvedTheme === "dark" ? (
              <IconMoon className="mr-2 h-4 w-4" />
            ) : (
              <IconSun className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <IconSun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {theme === "light" && <IconShield className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <IconMoon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && <IconShield className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <MonitorCheckIcon className="mr-2 h-4 w-4" />
              <span>System</span>
              {theme === "system" && <IconShield className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Admin Access */}
        {user.role === "admin" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <IconShield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
                <Badge variant="destructive" className="ml-auto text-xs">
                  Admin
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Help & Support */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <IconHelp className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <IconLogout className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convenience wrapper for different use cases
export function HeaderUserMenu() {
  return <UserMenu variant="compact" className="h-10" />;
}

export function MobileUserMenu() {
  return <UserMenu variant="minimal" />;
}

export function SidebarUserMenu() {
  return <UserMenu variant="full" align="start" side="right" />;
}
