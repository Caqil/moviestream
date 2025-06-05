"use client";

import { useState, useEffect } from "react";
import { useAdminContext } from "@/contexts/admin-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconCheck,
  IconX,
  IconLoader,
  IconExternalLink,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

interface TMDBSettings {
  apiKey: string;
  isEnabled: boolean;
  lastSync?: Date;
}

export function TMDBSettings() {
  const { settings, updateSettings, testService, serviceStatus, isLoading } =
    useAdminContext();
  const [formData, setFormData] = useState<TMDBSettings>({
    apiKey: "",
    isEnabled: false,
    lastSync: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const tmdbStatus = serviceStatus.tmdb;

  useEffect(() => {
    if (settings?.tmdb) {
      setFormData({
        apiKey: settings.tmdb.apiKey || "",
        isEnabled: settings.tmdb.isEnabled || false,
        lastSync: settings.tmdb.lastSync,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings({
        tmdb: {
          apiKey: formData.apiKey,
          isEnabled: formData.isEnabled,
        },
      });

      if (success) {
        toast.success("Settings saved", {
          description: "TMDB settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save TMDB settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.apiKey) {
      toast.error("Error", {
        description: "Please enter an API key before testing.",
      });
      return;
    }

    setIsTesting(true);
    try {
      const success = await testService("tmdb");
      if (success) {
        toast.success("Connection successful", {
          description: "TMDB API connection is working correctly.",
        });
      } else {
        toast.error("Connection failed", {
          description:
            "Unable to connect to TMDB API. Please check your API key.",
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: "Failed to test TMDB connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncMovies = async () => {
    if (!formData.isEnabled || !tmdbStatus) {
      toast.error("Error", {
        description: "TMDB must be enabled and working to sync movies.",
      });
      return;
    }

    setIsImporting(true);
    try {
      // This would call an API endpoint to sync popular movies from TMDB
      const response = await fetch("/api/admin/tmdb/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        toast.info("Sync initiated", {
          description: `Started syncing ${
            data.count || 0
          } popular movies from TMDB.`,
        });
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      toast.error("Sync failed", {
        description: "Failed to sync movies from TMDB.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (showApiKey) return key;
    return key.length > 8
      ? `${key.substring(0, 4)}${"*".repeat(key.length - 8)}${key.substring(
          key.length - 4
        )}`
      : "*".repeat(key.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                TMDB Configuration
                <Badge variant={tmdbStatus ? "default" : "destructive"}>
                  {tmdbStatus ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure The Movie Database (TMDB) API integration for movie
                data and metadata.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://www.themoviedb.org/settings/api",
                    "_blank"
                  )
                }
              >
                <IconExternalLink className="h-4 w-4 mr-2" />
                Get API Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              TMDB API is used to fetch movie metadata, posters, trailers, and
              other content information. You need a free TMDB account to get an
              API key.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tmdb-enabled">Enable TMDB Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the system to fetch movie data from TMDB
                </p>
              </div>
              <Switch
                id="tmdb-enabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked: any) =>
                  setFormData((prev) => ({ ...prev, isEnabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmdb-api-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="tmdb-api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your TMDB API key"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        apiKey: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !formData.apiKey}
                >
                  {isTesting ? (
                    <IconLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconCheck className="h-4 w-4" />
                  )}
                  Test
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your TMDB API key (v3 auth) - keep this secure and never share
                it publicly.
              </p>
            </div>

            {formData.lastSync && (
              <div className="space-y-2">
                <Label>Last Sync</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(formData.lastSync).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconCheck className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || !formData.apiKey}
              >
                {isTesting ? (
                  <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconRefresh className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movie Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Movie Import</CardTitle>
          <CardDescription>
            Import popular movies and metadata from TMDB to quickly populate
            your catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!formData.isEnabled || !tmdbStatus ? (
            <Alert>
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                TMDB integration must be enabled and working to import movies.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Popular Movies</h4>
                  <p className="text-sm text-muted-foreground">
                    Import the most popular movies from TMDB (metadata only, no
                    video files)
                  </p>
                </div>
                <Button
                  onClick={handleSyncMovies}
                  disabled={isImporting}
                  variant="outline"
                >
                  {isImporting ? (
                    <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconRefresh className="h-4 w-4 mr-2" />
                  )}
                  Sync Popular Movies
                </Button>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  This will import movie metadata (titles, descriptions,
                  posters, etc.) but not video files. You'll need to upload
                  video files separately.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
