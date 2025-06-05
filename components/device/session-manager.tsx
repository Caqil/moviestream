"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconX,
  IconRefresh,
  IconSettings,
  IconDeviceDesktop,
  IconMapPin,
  IconClock,
  IconEye,
  IconWifi,
  IconAlertTriangle,
  IconShieldOff,
  IconHistory,
  IconDevices,
  IconDots,
} from "@tabler/icons-react";
import { SignOutAllDevicesDialog } from "@/components/common/confirmation-dialog";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MonitorIcon,
  PauseIcon,
  PlayIcon,
  SignalIcon,
  SmartphoneIcon,
  Table2Icon,
  Tv2Icon,
} from "lucide-react";

interface StreamingSession {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: "web" | "mobile" | "tablet" | "tv" | "desktop" | "other";
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  movieProgress?: number; // 0-100
  isActive: boolean;
  isPaused: boolean;
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
    startupTime: number;
  };
}

interface SessionHistory {
  _id: string;
  deviceName: string;
  deviceType: string;
  movieTitle: string;
  moviePoster?: string;
  watchedAt: Date;
  duration: number;
  progress: number;
  completed: boolean;
}

interface SessionManagerProps {
  className?: string;
  refreshInterval?: number;
  showHistory?: boolean;
  maxSessions?: number;
}

export function SessionManager({
  className,
  refreshInterval = 30000, // 30 seconds
  showHistory = true,
  maxSessions,
}: SessionManagerProps) {
  const { user } = useAuthContext();
  const { streamLimitInfo, currentPlan } = useSubscriptionContext();

  const [activeSessions, setActiveSessions] = useState<StreamingSession[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminating, setTerminating] = useState<string[]>([]);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const fetchActiveSessions = async () => {
    try {
      setError(null);
      const response = await fetch("/api/sessions/active");

      if (!response.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const data = await response.json();
      setActiveSessions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setError("Failed to load active sessions");
    }
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await fetch("/api/sessions/history?limit=20");

      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }

      const data = await response.json();
      setSessionHistory(data.data || []);
    } catch (error) {
      console.error("Failed to fetch session history:", error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating((prev) => [...prev, sessionId]);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      setActiveSessions((prev) =>
        prev.filter((session) => session._id !== sessionId)
      );
      toast.success("Session terminated successfully");
    } catch (error) {
      console.error("Failed to terminate session:", error);
      toast.error("Failed to terminate session");
    } finally {
      setTerminating((prev) => prev.filter((id) => id !== sessionId));
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

      setActiveSessions([]);
      toast.success("All sessions terminated successfully");
      setShowSignOutDialog(false);
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
      toast.error("Failed to terminate all sessions");
    }
  };

  const pauseSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/pause`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pause session");
      }

      setActiveSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isPaused: true } : session
        )
      );
      toast.success("Session paused");
    } catch (error) {
      console.error("Failed to pause session:", error);
      toast.error("Failed to pause session");
    }
  };

  const resumeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/resume`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to resume session");
      }

      setActiveSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isPaused: false } : session
        )
      );
      toast.success("Session resumed");
    } catch (error) {
      console.error("Failed to resume session:", error);
      toast.error("Failed to resume session");
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const iconClass = "h-4 w-4";
    switch (deviceType) {
      case "mobile":
        return <SmartphoneIcon className={iconClass} />;
      case "tablet":
        return <Table2Icon className={iconClass} />;
      case "tv":
        return <Tv2Icon className={iconClass} />;
      case "desktop":
        return <IconDeviceDesktop className={iconClass} />;
      default:
        return <MonitorIcon className={iconClass} />;
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

  const isAtStreamLimit =
    streamLimitInfo && activeSessions.length >= streamLimitInfo.limit;
  const displaySessions = maxSessions
    ? activeSessions.slice(0, maxSessions)
    : activeSessions;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchActiveSessions(),
        showHistory && fetchSessionHistory(),
      ]);
      setIsLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      fetchActiveSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, showHistory]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            Session Manager
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

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconDevices className="h-5 w-5" />
              Session Manager
              <Badge variant="outline">
                {activeSessions.length}
                {streamLimitInfo && `/${streamLimitInfo.limit}`}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchActiveSessions}>
                <IconRefresh className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <IconSettings className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={fetchActiveSessions}>
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Refresh Sessions
                  </DropdownMenuItem>
                  {activeSessions.length > 1 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowSignOutDialog(true)}
                        className="text-destructive"
                      >
                        <IconShieldOff className="h-4 w-4 mr-2" />
                        Terminate All Sessions
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stream Limit Warning */}
          {isAtStreamLimit && (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've reached your concurrent streaming limit.
                {currentPlan && ` Upgrade to increase your stream limit.`}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                  Active Sessions ({activeSessions.length})
                </TabsTrigger>
                {showHistory && (
                  <TabsTrigger value="history">Recent History</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeSessions.length === 0 ? (
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
                        className="border rounded-lg p-4 space-y-4"
                      >
                        {/* Session Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getDeviceIcon(session.deviceType)}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {session.deviceName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {FormatUtils.capitalize(session.deviceType)}
                                </Badge>
                                {session.location && (
                                  <span className="flex items-center gap-1">
                                    <IconMapPin className="h-3 w-3" />
                                    {session.location.city},{" "}
                                    {session.location.country}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {session.isPaused ? (
                                <DropdownMenuItem
                                  onClick={() => resumeSession(session._id)}
                                >
                                  <PlayIcon className="h-4 w-4 mr-2" />
                                  Resume Session
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => pauseSession(session._id)}
                                >
                                  <PauseIcon className="h-4 w-4 mr-2" />
                                  Pause Session
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => terminateSession(session._id)}
                                disabled={terminating.includes(session._id)}
                                className="text-destructive"
                              >
                                <IconX className="h-4 w-4 mr-2" />
                                Terminate Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Currently Watching */}
                        {session.movieId && session.movieTitle && (
                          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                            {session.moviePoster && (
                              <Avatar className="h-12 w-12 rounded">
                                <AvatarImage src={session.moviePoster} />
                                <AvatarFallback>
                                  <PlayIcon className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {session.movieTitle}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  {session.isPaused ? "Paused" : "Playing"}
                                </span>
                                {session.movieProgress && (
                                  <span>
                                    • {Math.round(session.movieProgress)}%
                                    watched
                                  </span>
                                )}
                              </div>
                              {session.movieProgress && (
                                <Progress
                                  value={session.movieProgress}
                                  className="h-1 mt-2"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Session Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <IconClock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {FormatUtils.getRelativeTime(session.startTime)}
                            </span>
                          </div>

                          {session.streamingData && (
                            <>
                              <div className="flex items-center gap-2">
                                <IconEye className="h-4 w-4 text-muted-foreground" />
                                <span>{session.streamingData.quality}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <SignalIcon
                                  className={cn(
                                    "h-4 w-4",
                                    getSignalColor(
                                      getSignalStrength(
                                        session.streamingData.bufferHealth
                                      )
                                    )
                                  )}
                                />
                                <span>
                                  {getSignalStrength(
                                    session.streamingData.bufferHealth
                                  )}
                                </span>
                              </div>
                            </>
                          )}

                          <div className="flex items-center gap-2">
                            <IconWifi className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">
                              {session.ipAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {maxSessions && activeSessions.length > maxSessions && (
                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          +{activeSessions.length - maxSessions} more sessions
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {showHistory && (
                <TabsContent value="history" className="space-y-4">
                  {sessionHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
                        <IconHistory className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No recent session history
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionHistory.map((session) => (
                        <div
                          key={session._id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          {session.moviePoster && (
                            <Avatar className="h-10 w-10 rounded">
                              <AvatarImage src={session.moviePoster} />
                              <AvatarFallback>
                                <PlayIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {session.movieTitle}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getDeviceIcon(session.deviceType)}
                              <span>{session.deviceName}</span>
                              <span>•</span>
                              <span>
                                {FormatUtils.getRelativeTime(session.watchedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <Badge
                              variant={
                                session.completed ? "default" : "outline"
                              }
                            >
                              {session.completed
                                ? "Completed"
                                : `${Math.round(session.progress)}%`}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <SignOutAllDevicesDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={terminateAllSessions}
      />
    </>
  );
}

// Simplified variant for dashboards
export function SessionManagerWidget({ className }: { className?: string }) {
  return (
    <SessionManager
      className={className}
      showHistory={false}
      maxSessions={3}
      refreshInterval={60000} // 1 minute
    />
  );
}

// Compact variant for modals/sidebars
export function SessionManagerCompact({ className }: { className?: string }) {
  return (
    <SessionManager
      className={className}
      showHistory={false}
      maxSessions={5}
      refreshInterval={30000} // 30 seconds
    />
  );
}
