"use client";

import { useState } from "react";
import {
  IconBell,
  IconSearch,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useAdminContext } from "@/contexts/admin-context";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormatUtils } from "@/utils/format";

export function AdminHeader() {
  const { user, logout } = useAuthContext();
  const { stats, serviceStatus, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");

  const criticalIssues = Object.values(serviceStatus).filter(
    (status) => !status
  ).length;
  const hasUnreadNotifications = criticalIssues > 0;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies, users, settings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        {stats && !isLoading && (
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Users:</span>
              <span className="font-medium text-foreground">
                {FormatUtils.formatNumber(stats.users.total)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Movies:</span>
              <span className="font-medium text-foreground">
                {FormatUtils.formatNumber(stats.movies.total)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Revenue:</span>
              <span className="font-medium text-foreground">
                {FormatUtils.formatCurrency(stats.revenue.monthly)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <IconBell className="h-4 w-4" />
                {hasUnreadNotifications && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {criticalIssues || "!"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {criticalIssues > 0 ? (
                <>
                  <DropdownMenuItem className="p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="h-2 w-2 p-0" />
                        <span className="font-medium">
                          Service Issues Detected
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {criticalIssues} critical service
                        {criticalIssues > 1 ? "s" : ""} need attention
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {!serviceStatus.tmdb && "• TMDB API connection failed"}
                        {!serviceStatus.stripe &&
                          "• Stripe payment processing offline"}
                        {!serviceStatus.s3 && "• S3 storage connection failed"}
                        {!serviceStatus.email && "• Email service unavailable"}
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <DropdownMenuItem className="p-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">All Systems Operational</span>
                    <p className="text-sm text-muted-foreground">
                      No critical issues detected
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              {stats && (
                <>
                  <DropdownMenuItem className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        New User Registrations
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {stats.users.new || 0} new users registered recently
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {stats.streaming?.activeSessions > 0 && (
                    <DropdownMenuItem className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Active Streaming</span>
                        <p className="text-sm text-muted-foreground">
                          {stats.streaming.activeSessions} active streaming
                          sessions
                        </p>
                      </div>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <IconSettings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="w-fit mt-1">
                    {FormatUtils.capitalize(user?.role || "admin")}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconUser className="mr-2 h-4 w-4" />
                Admin Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconSettings className="mr-2 h-4 w-4" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
