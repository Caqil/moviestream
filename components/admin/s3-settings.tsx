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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCheck,
  IconLoader,
  IconExternalLink,
  IconRefresh,
  IconAlertTriangle,
  IconCloud,
  IconDatabase,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface S3Settings {
  provider: "aws" | "digitalocean" | "vultr" | "wasabi" | "other";
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  isEnabled: boolean;
  cdnUrl?: string;
}

const S3_PROVIDERS = [
  {
    value: "aws",
    label: "Amazon S3",
    endpoint: "",
    regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"],
  },
  {
    value: "digitalocean",
    label: "DigitalOcean Spaces",
    endpoint: "https://{region}.digitaloceanspaces.com",
    regions: ["nyc3", "sfo3", "fra1", "sgp1"],
  },
  {
    value: "vultr",
    label: "Vultr Object Storage",
    endpoint: "https://{region}.vultrobjects.com",
    regions: ["ewr1", "ord1", "dfw1", "sjc1"],
  },
  {
    value: "wasabi",
    label: "Wasabi",
    endpoint: "https://s3.{region}.wasabisys.com",
    regions: ["us-east-1", "us-west-1", "eu-central-1", "ap-northeast-1"],
  },
  { value: "other", label: "Other S3 Compatible", endpoint: "", regions: [] },
];

export function S3Settings() {
  const { settings, updateSettings, testService, serviceStatus, isLoading } =
    useAdminContext();
  const [formData, setFormData] = useState<S3Settings>({
    provider: "aws",
    accessKeyId: "",
    secretAccessKey: "",
    bucketName: "",
    region: "us-east-1",
    endpoint: "",
    forcePathStyle: false,
    isEnabled: false,
    cdnUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const s3Status = serviceStatus.s3;
  const selectedProvider = S3_PROVIDERS.find(
    (p) => p.value === formData.provider
  );

  useEffect(() => {
    if (settings?.s3) {
      setFormData({
        provider: settings.s3.provider || "aws",
        accessKeyId: settings.s3.accessKeyId || "",
        secretAccessKey: settings.s3.secretAccessKey || "",
        bucketName: settings.s3.bucketName || "",
        region: settings.s3.region || "us-east-1",
        endpoint: settings.s3.endpoint || "",
        forcePathStyle: settings.s3.forcePathStyle || false,
        isEnabled: settings.s3.isEnabled || false,
        cdnUrl: settings.s3.cdnUrl || "",
      });
    }
  }, [settings]);

  const handleProviderChange = (provider: string) => {
    const providerConfig = S3_PROVIDERS.find((p) => p.value === provider);
    setFormData((prev) => ({
      ...prev,
      provider: provider as S3Settings["provider"],
      endpoint:
        providerConfig?.endpoint?.replace("{region}", prev.region) || "",
      region: providerConfig?.regions[0] || prev.region,
      forcePathStyle: provider !== "aws",
    }));
  };

  const handleRegionChange = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      region,
      endpoint:
        selectedProvider?.endpoint?.replace("{region}", region) ||
        prev.endpoint,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings({
        s3: formData,
      });

      if (success) {
        toast.success("Settings saved", {
          description: "S3 settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save S3 settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (
      !formData.accessKeyId ||
      !formData.secretAccessKey ||
      !formData.bucketName
    ) {
      toast.error("Error", {
        description: "Please fill in all required fields before testing.",
      });
      return;
    }

    setIsTesting(true);
    try {
      const success = await testService("s3");
      if (success) {
        toast.success("Connection successful", {
          description: "S3 bucket connection is working correctly.",
        });
      } else {
        toast.error("Connection failed", {
          description:
            "Unable to connect to S3 bucket. Please check your credentials and settings.",
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: "Failed to test S3 connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret) return "";
    if (showSecrets) return secret;
    return secret.length > 8
      ? `${secret.substring(0, 4)}${"*".repeat(
          secret.length - 8
        )}${secret.substring(secret.length - 4)}`
      : "*".repeat(secret.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                S3 Storage Configuration
                <Badge variant={s3Status ? "default" : "destructive"}>
                  {s3Status ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure S3-compatible storage for video files, images, and
                other media assets.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://aws.amazon.com/s3/", "_blank")
                }
              >
                <IconExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              S3 storage is used for storing and serving video files, movie
              posters, thumbnails, and other media assets. Choose from various
              S3-compatible providers.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="s3-enabled">Enable S3 Storage</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the system to store and serve files from S3
                </p>
              </div>
              <Switch
                id="s3-enabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked: any) =>
                  setFormData((prev) => ({ ...prev, isEnabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s3-provider">Storage Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {S3_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your S3-compatible storage provider.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s3-access-key">Access Key ID</Label>
                <Input
                  id="s3-access-key"
                  type="text"
                  placeholder="AKIA..."
                  value={formData.accessKeyId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accessKeyId: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s3-secret-key">Secret Access Key</Label>
                <div className="relative">
                  <Input
                    id="s3-secret-key"
                    type={showSecrets ? "text" : "password"}
                    placeholder="Secret access key"
                    value={formData.secretAccessKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secretAccessKey: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <IconEyeOff className="h-3 w-3" />
                    ) : (
                      <IconEye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s3-bucket">Bucket Name</Label>
                <Input
                  id="s3-bucket"
                  type="text"
                  placeholder="my-moviestream-bucket"
                  value={formData.bucketName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bucketName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s3-region">Region</Label>
                {selectedProvider?.regions.length ? (
                  <Select
                    value={formData.region}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="s3-region"
                    type="text"
                    placeholder="us-east-1"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        region: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            </div>

            {formData.provider !== "aws" && (
              <div className="space-y-2">
                <Label htmlFor="s3-endpoint">Custom Endpoint</Label>
                <Input
                  id="s3-endpoint"
                  type="url"
                  placeholder="https://your-s3-endpoint.com"
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endpoint: e.target.value,
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Custom S3 endpoint URL for your provider.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="s3-cdn-url">CDN URL (Optional)</Label>
              <Input
                id="s3-cdn-url"
                type="url"
                placeholder="https://cdn.example.com"
                value={formData.cdnUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cdnUrl: e.target.value }))
                }
              />
              <p className="text-sm text-muted-foreground">
                CloudFront or other CDN URL for faster content delivery.
              </p>
            </div>

            {formData.provider !== "aws" && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="force-path-style">Force Path Style</Label>
                  <p className="text-sm text-muted-foreground">
                    Use path-style URLs instead of virtual-hosted-style
                  </p>
                </div>
                <Switch
                  id="force-path-style"
                  checked={formData.forcePathStyle}
                  onCheckedChange={(checked: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      forcePathStyle: checked,
                    }))
                  }
                />
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
                disabled={
                  isTesting ||
                  !formData.accessKeyId ||
                  !formData.secretAccessKey ||
                  !formData.bucketName
                }
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

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-4 w-4" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Monitor your S3 storage usage and costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {s3Status ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Files Stored</Label>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Total files</p>
              </div>
              <div className="space-y-2">
                <Label>Storage Used</Label>
                <p className="text-2xl font-bold">124.5 GB</p>
                <p className="text-sm text-muted-foreground">
                  Of available space
                </p>
              </div>
              <div className="space-y-2">
                <Label>Bandwidth Used</Label>
                <p className="text-2xl font-bold">2.1 TB</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
            </div>
          ) : (
            <Alert>
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connect to S3 to view storage usage statistics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Examples</CardTitle>
          <CardDescription>
            Common configuration examples for popular S3 providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>CORS Configuration:</strong> Make sure your S3 bucket has
              proper CORS settings to allow web browsers to access your files.
              This is required for video streaming and image display.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Recommended Bucket Policy</Label>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              {`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${formData.bucketName || "your-bucket"}/*"
    }
  ]
}`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
