"use client";

import { useAdminContext } from "@/contexts/admin-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormatUtils } from "@/utils/format";
import {
  IconUsers,
  IconMovie,
  IconCurrencyDollar,
  IconDevices,
  IconTrendingUp,
  IconTrendingDown,
  IconEye,
  IconUserPlus,
  IconActivity,
  IconDatabase,
  IconServer,
  IconShield,
} from "@tabler/icons-react";

export function DashboardStats() {
  const { stats, isLoading, serviceStatus } = useAdminContext();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <IconTrendingUp className="h-3 w-3" />;
    if (change < 0) return <IconTrendingDown className="h-3 w-3" />;
    return null;
  };

  const getChangeDisplay = (growth: number) => {
    return {
      value: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
      isPositive: growth >= 0,
    };
  };

  const serviceStatusCount =
    Object.values(serviceStatus).filter(Boolean).length;
  const totalServices = Object.keys(serviceStatus).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatNumber(stats.users.total)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getChangeIcon(stats.users.growth || 0)}
            <span className={getChangeColor(stats.users.growth || 0)}>
              {getChangeDisplay(stats.users.growth || 0).value}
            </span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Subscribers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Subscribers
          </CardTitle>
          <IconUserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatNumber(stats.users.subscribers)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Conversion rate:</span>
            <span className="font-medium">
              {stats.users.total > 0
                ? ((stats.users.subscribers / stats.users.total) * 100).toFixed(
                    1
                  )
                : "0"}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Movies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
          <IconMovie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatNumber(stats.movies.total)}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="text-xs">
              {stats.movies.active} active
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.movies.featured} featured
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatCurrency(stats.revenue.thisMonth)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getChangeIcon(stats.revenue.growth || 0)}
            <span className={getChangeColor(stats.revenue.growth || 0)}>
              {getChangeDisplay(stats.revenue.growth || 0).value}
            </span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
          <IconDevices className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatNumber(stats.devices?.total || 0)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{stats.devices?.verified || 0} verified</span>
            <span>•</span>
            <span>{stats.devices?.blocked || 0} blocked</span>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
          <IconActivity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.streaming?.activeSessions || 0}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconEye className="h-3 w-3" />
            <span>
              {FormatUtils.formatNumber(stats.streaming?.totalViews || 0)} total
              views
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Storage Used */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          <IconDatabase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {FormatUtils.formatFileSize(stats.storage?.used || 0)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>
              of {FormatUtils.formatFileSize(stats.storage?.total || 0)}
            </span>
            <span>•</span>
            <span>
              {stats.storage?.total
                ? ((stats.storage.used / stats.storage.total) * 100).toFixed(1)
                : "0"}
              % used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <IconShield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span>
              {serviceStatusCount}/{totalServices}
            </span>
            <Badge
              variant={
                serviceStatusCount === totalServices ? "default" : "destructive"
              }
              className="text-xs"
            >
              {serviceStatusCount === totalServices ? "Healthy" : "Issues"}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconServer className="h-3 w-3" />
            <span>Services operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
