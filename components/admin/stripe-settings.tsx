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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  IconCheck,
  IconX,
  IconLoader,
  IconExternalLink,
  IconRefresh,
  IconAlertTriangle,
  IconShield,
  IconCreditCard,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface StripeSettings {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  isEnabled: boolean;
}

export function StripeSettings() {
  const { settings, updateSettings, testService, serviceStatus, isLoading } =
    useAdminContext();
  const [formData, setFormData] = useState<StripeSettings>({
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    isEnabled: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    secretKey: false,
    webhookSecret: false,
  });

  const stripeStatus = serviceStatus.stripe;

  useEffect(() => {
    if (settings?.stripe) {
      setFormData({
        publicKey: settings.stripe.publicKey || "",
        secretKey: settings.stripe.secretKey || "",
        webhookSecret: settings.stripe.webhookSecret || "",
        isEnabled: settings.stripe.isEnabled || false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings({
        stripe: {
          publicKey: formData.publicKey,
          secretKey: formData.secretKey,
          webhookSecret: formData.webhookSecret,
          isEnabled: formData.isEnabled,
        },
      });

      if (success) {
        toast.success("Settings saved", {
          description: "Stripe settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save Stripe settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.secretKey) {
      toast.error("Error", {
        description: "Please enter a secret key before testing.",
      });
      return;
    }

    setIsTesting(true);
    try {
      const success = await testService("stripe");
      if (success) {
        toast.success("Connection successful", {
          description: "Stripe API connection is working correctly.",
        });
      } else {
        toast.error("Connection failed", {
          description:
            "Unable to connect to Stripe API. Please check your credentials.",
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: "Failed to test Stripe connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const maskSecret = (secret: string, show: boolean) => {
    if (!secret) return "";
    if (show) return secret;
    return secret.length > 8
      ? `${secret.substring(0, 4)}${"*".repeat(
          secret.length - 8
        )}${secret.substring(secret.length - 4)}`
      : "*".repeat(secret.length);
  };

  const getWebhookEndpoint = () => {
    const baseUrl = settings?.general?.siteUrl || "https://your-domain.com";
    return `${baseUrl}/api/webhooks/stripe`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Stripe Configuration
                <Badge variant={stripeStatus ? "default" : "destructive"}>
                  {stripeStatus ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure Stripe payment processing for subscription billing and
                payments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://dashboard.stripe.com/apikeys", "_blank")
                }
              >
                <IconExternalLink className="h-4 w-4 mr-2" />
                Stripe Dashboard
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Stripe is used for processing subscription payments and managing
              customer billing. You need a Stripe account to accept payments.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stripe-enabled">Enable Stripe Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the system to process payments through Stripe
                </p>
              </div>
              <Switch
                id="stripe-enabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked: any) =>
                  setFormData((prev) => ({ ...prev, isEnabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-public-key">Publishable Key</Label>
              <Input
                id="stripe-public-key"
                type="text"
                placeholder="pk_test_... or pk_live_..."
                value={formData.publicKey}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publicKey: e.target.value,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">
                Your Stripe publishable key (safe to expose in client-side
                code).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-secret-key">Secret Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="stripe-secret-key"
                    type={showSecrets.secretKey ? "text" : "password"}
                    placeholder="sk_test_... or sk_live_..."
                    value={formData.secretKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secretKey: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() =>
                      setShowSecrets((prev) => ({
                        ...prev,
                        secretKey: !prev.secretKey,
                      }))
                    }
                  >
                    {showSecrets.secretKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !formData.secretKey}
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
                Your Stripe secret key (keep this secure and never share it
                publicly).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-webhook-secret">Webhook Secret</Label>
              <div className="relative">
                <Input
                  id="stripe-webhook-secret"
                  type={showSecrets.webhookSecret ? "text" : "password"}
                  placeholder="whsec_..."
                  value={formData.webhookSecret}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      webhookSecret: e.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() =>
                    setShowSecrets((prev) => ({
                      ...prev,
                      webhookSecret: !prev.webhookSecret,
                    }))
                  }
                >
                  {showSecrets.webhookSecret ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Webhook signing secret from your Stripe webhook endpoint.
              </p>
            </div>
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
                disabled={isTesting || !formData.secretKey}
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

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time updates from Stripe about
            payments and subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                value={getWebhookEndpoint()}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard.writeText(getWebhookEndpoint())
                }
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add this URL as a webhook endpoint in your Stripe dashboard.
            </p>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Required Events:</strong> customer.subscription.created,
              customer.subscription.updated, customer.subscription.deleted,
              invoice.payment_succeeded, invoice.payment_failed
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                window.open("https://dashboard.stripe.com/webhooks", "_blank")
              }
            >
              <IconExternalLink className="h-4 w-4 mr-2" />
              Configure Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Mode Warning */}
      {formData.publicKey && formData.publicKey.includes("test") && (
        <Alert>
          <IconAlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Test Mode:</strong> You're using test API keys. No real
            payments will be processed. Remember to use live keys in production.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
