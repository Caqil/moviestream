"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconDevices,
  IconMapPin,
  IconClock,
  IconX,
  IconRefresh,
  IconAlertTriangle,
  IconEye,
  IconWifi,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MonitorIcon, PlayIcon, SignalIcon, SmartphoneIcon, Table2Icon, Tv2Icon } from "lucide-react";

interface ActiveSession {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: "web" | "mobile" | "tablet" | "tv" | "desktop" | "other";
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  isActive: boolean;
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  streamingData?: {
    quality: string;
    bitrate: number;
    bufferHealth: number;
    errors: number;
  };
}

interface ActiveSessionsProps {
  className?: string;
  showActions?: boolean;
  maxSessions?: number;
  refreshInterval?: number;
}

export function ActiveSessions({
  className,
  showActions = true,
  maxSessions,
  refreshInterval = 30000, // 30 seconds
}: ActiveSessionsProps) {
  const { user } = useAuthContext();
  const { currentPlan, streamLimitInfo } = useSubscriptionContext();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminating, setTerminating] = useState<string | null>(null);

  const fetchActiveSessions = async () => {
    try {
      setError(null);
      const response = await fetch("/api/sessions/active");

      if (!response.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const data = await response.json();
      setSessions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setError("Failed to load active sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      setSessions((prev) =>
        prev.filter((session) => session._id !== sessionId)
      );
      toast.success("Session terminated successfully");
    } catch (error) {
      console.error("Failed to terminate session:", error);
      toast.error("Failed to terminate session");
    } finally {
      setTerminating(null);
    }
  };

  const terminateAllSessions = async () => {
    try {
      const response = await fetch("/api/sessions/terminate-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate all sessions");
      }

      setSessions([]);
      toast.success("All sessions terminated successfully");
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
      toast.error("Failed to terminate all sessions");
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <SmartphoneIcon className="h-4 w-4" />;
      case "tablet":
        return <Table2Icon className="h-4 w-4" />;
      case "tv":
        return <Tv2Icon className="h-4 w-4" />;
      case "desktop":
        return <IconDeviceDesktop className="h-4 w-4" />;
      default:
        return <MonitorIcon className="h-4 w-4" />;
    }
  };

  const getSignalStrength = (bufferHealth?: number) => {
    if (!bufferHealth) return "unknown";
    if (bufferHealth >= 80) return "excellent";
    if (bufferHealth >= 60) return "good";
    if (bufferHealth >= 40) return "fair";
    return "poor";
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "fair":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  useEffect(() => {
    fetchActiveSessions();

    const interval = setInterval(() => {
      fetchActiveSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const displaySessions = maxSessions
    ? sessions.slice(0, maxSessions)
    : sessions;
  const isAtLimit = streamLimitInfo && sessions.length >= streamLimitInfo.limit;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={fetchActiveSessions}
            className="mt-4"
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            Active Sessions
            <Badge variant="outline">
              {sessions.length}
              {streamLimitInfo && `/${streamLimitInfo.limit}`}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchActiveSessions}>
              <IconRefresh className="h-4 w-4" />
            </Button>
            {showActions && sessions.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={terminateAllSessions}
              >
                End All
              </Button>
            )}
          </div>
        </div>
        {isAtLimit && (
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You've reached your concurrent streaming limit.
              {currentPlan &&
                ` Upgrade to ${currentPlan.name} for more streams.`}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
              <PlayIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No active streaming sessions
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Start watching to see your active sessions here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displaySessions.map((session) => (
              <div
                key={session._id}
                className="flex items-start space-x-4 p-4 border rounded-lg"
              >
                {/* Device Info */}
                <div className="flex-shrink-0">
                  <div className="p-2 bg-muted rounded-lg">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium truncate">
                        {session.deviceName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {FormatUtils.capitalize(session.deviceType)}
                        </Badge>
                        {session.location && (
                          <span className="flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {session.location.city}, {session.location.country}
                          </span>
                        )}
                      </div>
                    </div>
                    {showActions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session._id)}
                        disabled={terminating === session._id}
                        className="text-destructive hover:text-destructive"
                      >
                        {terminating === session._id ? (
                          <IconRefresh className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconX className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Currently Watching */}
                  {session.movieId && session.movieTitle && (
                    <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                      {session.moviePoster && (
                        <Avatar className="h-8 w-8 rounded">
                          <AvatarImage src={session.moviePoster} />
                          <AvatarFallback>
                            <PlayIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.movieTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Currently watching
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Session Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {FormatUtils.getRelativeTime(session.startTime)}
                      </span>
                      {session.streamingData && (
                        <>
                          <span className="flex items-center gap-1">
                            <IconEye className="h-3 w-3" />
                            {session.streamingData.quality}
                          </span>
                          <span className="flex items-center gap-1">
                            <SignalIcon
                              className={cn(
                                "h-3 w-3",
                                getSignalColor(
                                  getSignalStrength(
                                    session.streamingData.bufferHealth
                                  )
                                )
                              )}
                            />
                            {getSignalStrength(
                              session.streamingData.bufferHealth
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <IconWifi className="h-3 w-3" />
                      <span className="font-mono text-xs">
                        {session.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {maxSessions && sessions.length > maxSessions && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  +{sessions.length - maxSessions} more sessions
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  View All Sessions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simplified version for dashboard widgets
export function ActiveSessionsWidget({ className }: { className?: string }) {
  return (
    <ActiveSessions
      className={className}
      showActions={false}
      maxSessions={3}
      refreshInterval={60000} // 1 minute
    />
  );
}

// Compact version for headers/navigation
export function ActiveSessionsIndicator({ className }: { className?: string }) {
  const [sessionCount, setSessionCount] = useState(0);
  const { streamLimitInfo } = useSubscriptionContext();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/sessions/active/count");
        if (response.ok) {
          const data = await response.json();
          setSessionCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch session count:", error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (sessionCount === 0) return null;

  const isAtLimit = streamLimitInfo && sessionCount >= streamLimitInfo.limit;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isAtLimit ? "bg-red-500" : "bg-green-500"
          )}
        />
        <IconDevices className="h-4 w-4" />
        <span className="text-sm font-medium">
          {sessionCount}
          {streamLimitInfo && `/${streamLimitInfo.limit}`}
        </span>
      </div>
    </div>
  );
}
