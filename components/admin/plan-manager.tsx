"use client";

import { useState, useEffect } from "react";
import { useAdminContext } from "@/contexts/admin-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FormatUtils } from "@/utils/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconLoader,
  IconStar,
  IconDevices,
  IconEye,
  IconDownload,
  IconSettings,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  intervalCount: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  deviceLimit: number;
  simultaneousStreams: number;
  videoQuality: "HD" | "Full HD" | "4K";
  downloadAllowed: boolean;
  offlineViewing: boolean;
  adsSupported: boolean;
  trialDays: number;
  deviceFeatures: {
    allowMobile: boolean;
    allowTV: boolean;
    allowWeb: boolean;
    allowTablet: boolean;
    allowDesktop: boolean;
    deviceKickEnabled: boolean;
    autoVerifyTrusted: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const defaultPlan: Omit<SubscriptionPlan, "_id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  price: 0,
  currency: "USD",
  interval: "month",
  intervalCount: 1,
  features: [],
  isPopular: false,
  isActive: true,
  deviceLimit: 1,
  simultaneousStreams: 1,
  videoQuality: "HD",
  downloadAllowed: false,
  offlineViewing: false,
  adsSupported: false,
  trialDays: 0,
  deviceFeatures: {
    allowMobile: true,
    allowTV: true,
    allowWeb: true,
    allowTablet: true,
    allowDesktop: true,
    deviceKickEnabled: false,
    autoVerifyTrusted: false,
  },
};

export function PlanManager() {
  const { serviceStatus } = useAdminContext();
  const {
    plans: contextPlans,
    refreshPlans,
    isLoading: plansLoading,
  } = useSubscriptionContext();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] =
    useState<Omit<SubscriptionPlan, "_id" | "createdAt" | "updatedAt">>(
      defaultPlan
    );
  const [newFeature, setNewFeature] = useState("");

  const stripeStatus = serviceStatus.stripe;

  // Load plans from context or API
  useEffect(() => {
    if (contextPlans && contextPlans.length > 0) {
      setPlans(contextPlans as unknown as SubscriptionPlan[]);
      setIsLoading(false);
    } else {
      fetchPlans();
    }
  }, [contextPlans]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/subscription-plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      } else {
        throw new Error("Failed to fetch plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData(defaultPlan);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      features: [...plan.features],
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      stripePriceId: plan.stripePriceId,
      stripeProductId: plan.stripeProductId,
      deviceLimit: plan.deviceLimit,
      simultaneousStreams: plan.simultaneousStreams,
      videoQuality: plan.videoQuality,
      downloadAllowed: plan.downloadAllowed,
      offlineViewing: plan.offlineViewing,
      adsSupported: plan.adsSupported,
      trialDays: plan.trialDays,
      deviceFeatures: { ...plan.deviceFeatures },
    });
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingPlan
        ? `/api/admin/subscription-plans/${editingPlan._id}`
        : "/api/admin/subscription-plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          `Plan ${editingPlan ? "updated" : "created"} successfully`
        );
        setIsDialogOpen(false);
        await fetchPlans();
        await refreshPlans(); // Refresh context plans
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(`Failed to ${editingPlan ? "update" : "create"} plan`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this plan? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Plan deleted successfully");
        await fetchPlans();
        await refreshPlans();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(
        `/api/admin/subscription-plans/${plan._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...plan, isActive: !plan.isActive }),
        }
      );

      if (response.ok) {
        toast.success(`Plan ${plan.isActive ? "deactivated" : "activated"}`);
        await fetchPlans();
        await refreshPlans();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      HD: "bg-blue-100 text-blue-800",
      "Full HD": "bg-green-100 text-green-800",
      "4K": "bg-purple-100 text-purple-800",
    };
    return (
      colors[quality as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  if (!stripeStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan Manager</CardTitle>
          <CardDescription>
            Create and manage subscription plans for your platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Stripe must be configured and connected before you can manage
              subscription plans. Please configure Stripe settings first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Create and manage your subscription offerings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPlans} disabled={isLoading}>
            <IconRefresh
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreatePlan}>
                <IconPlus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </DialogTitle>
                <DialogDescription>
                  Configure your subscription plan details and features.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Premium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.currency}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({ ...prev, currency: value }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="9.99"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this plan includes..."
                    rows={3}
                  />
                </div>

                {/* Billing & Features */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Billing Interval</Label>
                    <Select
                      value={formData.interval}
                      onValueChange={(value: "month" | "year") =>
                        setFormData((prev) => ({ ...prev, interval: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Trial Days</Label>
                    <Input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          trialDays: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Video Quality</Label>
                    <Select
                      value={formData.videoQuality}
                      onValueChange={(value: "HD" | "Full HD" | "4K") =>
                        setFormData((prev) => ({
                          ...prev,
                          videoQuality: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HD">HD (720p)</SelectItem>
                        <SelectItem value="Full HD">Full HD (1080p)</SelectItem>
                        <SelectItem value="4K">4K (2160p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Limits */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Device Limit</Label>
                    <Input
                      type="number"
                      value={formData.deviceLimit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deviceLimit: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use 999 for unlimited
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Simultaneous Streams</Label>
                    <Input
                      type="number"
                      value={formData.simultaneousStreams}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          simultaneousStreams: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Label>Plan Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => e.key === "Enter" && addFeature()}
                    />
                    <Button onClick={addFeature} variant="outline">
                      <IconPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Download Allowed</Label>
                      <Switch
                        checked={formData.downloadAllowed}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            downloadAllowed: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Offline Viewing</Label>
                      <Switch
                        checked={formData.offlineViewing}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            offlineViewing: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Popular Plan</Label>
                      <Switch
                        checked={formData.isPopular}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            isPopular: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Ads</Label>
                      <Switch
                        checked={formData.adsSupported}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            adsSupported: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Device Kick Enabled</Label>
                      <Switch
                        checked={formData.deviceFeatures.deviceKickEnabled}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            deviceFeatures: {
                              ...prev.deviceFeatures,
                              deviceKickEnabled: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Auto Verify Trusted</Label>
                      <Switch
                        checked={formData.deviceFeatures.autoVerifyTrusted}
                        onCheckedChange={(checked: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            deviceFeatures: {
                              ...prev.deviceFeatures,
                              autoVerifyTrusted: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePlan} disabled={isSaving}>
                  {isSaving ? (
                    <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconCheck className="h-4 w-4 mr-2" />
                  )}
                  {editingPlan ? "Update" : "Create"} Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading || plansLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No subscription plans found. Create your first plan to get
              started.
            </p>
            <Button onClick={handleCreatePlan}>
              <IconPlus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`relative ${
                plan.isPopular ? "border-primary shadow-lg" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <IconStar className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {!plan.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">
                        {FormatUtils.formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        /
                        {FormatUtils.formatSubscriptionInterval(
                          plan.interval,
                          plan.intervalCount
                        )}
                      </span>
                    </div>
                    {plan.trialDays > 0 && (
                      <Badge variant="outline" className="mt-2">
                        {FormatUtils.formatTrialPeriod(plan.trialDays)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan._id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Plan Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <IconDevices className="h-4 w-4" />
                    <span>
                      {plan.deviceLimit === 999
                        ? "Unlimited"
                        : plan.deviceLimit}{" "}
                      device{plan.deviceLimit !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconEye className="h-4 w-4" />
                    <span>
                      {plan.simultaneousStreams} simultaneous stream
                      {plan.simultaneousStreams !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={getQualityBadge(plan.videoQuality)}>
                      {plan.videoQuality}
                    </Badge>
                  </div>
                  {plan.downloadAllowed && (
                    <div className="flex items-center gap-2 text-sm">
                      <IconDownload className="h-4 w-4" />
                      <span>Download allowed</span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                {plan.features.length > 0 && (
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <IconCheck className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} more features
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={() => handleToggleActive(plan)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {plan.stripePriceId && (
                    <Badge variant="outline" className="text-xs">
                      Stripe Connected
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
