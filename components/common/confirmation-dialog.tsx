"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconAlertTriangle,
  IconTrash,
  IconLoader,
  IconCheck,
  IconX,
  IconExclamationMark,
  IconShieldOff,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
  requireExactMatch?: boolean;
  showDontAskAgain?: boolean;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmationDialog({
  children,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  disabled = false,
  requireConfirmation = false,
  confirmationText = "DELETE",
  requireExactMatch = true,
  showDontAskAgain = false,
  isLoading = false,
  open,
  onOpenChange,
}: ConfirmationDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const isConfirmDisabled =
    disabled ||
    isLoading ||
    (requireConfirmation &&
      (requireExactMatch
        ? confirmationInput !== confirmationText
        : !confirmationInput.trim()));

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setIsOpen(false);
      setConfirmationInput("");
      setDontAskAgain(false);
    } catch (error) {
      // Error handling should be done in the onConfirm function
      console.error("Confirmation action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setIsOpen(false);
    setConfirmationInput("");
    setDontAskAgain(false);
  };

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <IconTrash className="h-6 w-6 text-destructive" />;
      case "warning":
        return <IconExclamationMark className="h-6 w-6 text-orange-500" />;
      default:
        return <IconAlertTriangle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          confirmButton:
            "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
          headerBg: "bg-destructive/10",
        };
      case "warning":
        return {
          confirmButton: "bg-orange-500 hover:bg-orange-600 text-white",
          headerBg: "bg-orange-50 dark:bg-orange-950",
        };
      default:
        return {
          confirmButton: "",
          headerBg: "bg-muted/50",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 p-3 rounded-full w-fit",
              styles.headerBg
            )}
          >
            {getIcon()}
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Confirmation Input */}
        {requireConfirmation && (
          <div className="space-y-3 px-6">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                  {confirmationText}
                </code>{" "}
                to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={`Enter "${confirmationText}"`}
                disabled={isLoading}
                className={cn(
                  requireExactMatch &&
                    confirmationInput &&
                    confirmationInput !== confirmationText
                    ? "border-destructive"
                    : ""
                )}
              />
              {requireExactMatch &&
                confirmationInput &&
                confirmationInput !== confirmationText && (
                  <p className="text-sm text-destructive">
                    Text must match exactly
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Don't ask again option */}
        {/* Don't ask again option */}
        {showDontAskAgain && (
          <div className="px-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-ask-again"
                checked={dontAskAgain}
                onCheckedChange={(checked) => {
                  setDontAskAgain(checked === true);
                }}
                disabled={isLoading}
              />
              <Label
                htmlFor="dont-ask-again"
                className="text-sm cursor-pointer"
              >
                Don't ask me again
              </Label>
            </div>
          </div>
        )}
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={cn(styles.confirmButton)}
          >
            {isLoading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Preset confirmation dialogs for common actions
export function DeleteConfirmationDialog({
  children,
  title = "Delete Item",
  description = "This action cannot be undone. This will permanently delete the item.",
  itemName,
  onConfirm,
  disabled = false,
  isLoading = false,
  ...props
}: Omit<
  ConfirmationDialogProps,
  "variant" | "confirmText" | "requireConfirmation"
> & {
  itemName?: string;
}) {
  return (
    <ConfirmationDialog
      title={title}
      description={itemName ? `${description} "${itemName}"` : description}
      confirmText="Delete"
      variant="destructive"
      requireConfirmation={true}
      confirmationText="DELETE"
      onConfirm={onConfirm}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ConfirmationDialog>
  );
}

export function BlockUserDialog({
  children,
  userName,
  onConfirm,
  disabled = false,
  isLoading = false,
  ...props
}: Omit<
  ConfirmationDialogProps,
  "variant" | "title" | "description" | "confirmText"
>) {
  return (
    <ConfirmationDialog
      title="Block User"
      description={`This will block "${userName}" from accessing the platform. They will be signed out and unable to sign in again.`}
      confirmText="Block User"
      variant="destructive"
      onConfirm={onConfirm}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ConfirmationDialog>
  );
}

export function CancelSubscriptionDialog({
  children,
  onConfirm,
  disabled = false,
  isLoading = false,
  ...props
}: Omit<
  ConfirmationDialogProps,
  "variant" | "title" | "description" | "confirmText"
>) {
  return (
    <ConfirmationDialog
      title="Cancel Subscription"
      description="Your subscription will remain active until the end of your current billing period. You can resubscribe at any time."
      confirmText="Cancel Subscription"
      variant="warning"
      showDontAskAgain
      onConfirm={onConfirm}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ConfirmationDialog>
  );
}

export function RemoveDeviceDialog({
  children,
  deviceName,
  onConfirm,
  disabled = false,
  isLoading = false,
  ...props
}: Omit<
  ConfirmationDialogProps,
  "variant" | "title" | "description" | "confirmText"
> & {
  deviceName: string;
}) {
  return (
    <ConfirmationDialog
      title="Remove Device"
      description={`This will remove "${deviceName}" from your account. Any active sessions on this device will be terminated.`}
      confirmText="Remove Device"
      variant="destructive"
      onConfirm={onConfirm}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ConfirmationDialog>
  );
}

export function SignOutAllDevicesDialog({
  children,
  onConfirm,
  disabled = false,
  isLoading = false,
  ...props
}: Omit<
  ConfirmationDialogProps,
  "variant" | "title" | "description" | "confirmText"
>) {
  return (
    <ConfirmationDialog
      title="Sign Out All Devices"
      description="This will sign you out of all devices except this one. You'll need to sign in again on other devices."
      confirmText="Sign Out All"
      variant="warning"
      onConfirm={onConfirm}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ConfirmationDialog>
  );
}

// Hook for programmatic confirmation dialogs
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    config: Partial<ConfirmationDialogProps>;
  }>({
    isOpen: false,
    config: {},
  });

  const confirm = (
    config: Omit<ConfirmationDialogProps, "children" | "open" | "onOpenChange">
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        config: {
          ...config,
          onConfirm: async () => {
            await config.onConfirm();
            resolve(true);
            setDialogState((prev) => ({ ...prev, isOpen: false }));
          },
          onCancel: () => {
            config.onCancel?.();
            resolve(false);
            setDialogState((prev) => ({ ...prev, isOpen: false }));
          },
        },
      });
    });
  };

  const Dialog = () => (
    <ConfirmationDialog
      open={dialogState.isOpen}
      onOpenChange={(open) =>
        setDialogState((prev) => ({ ...prev, isOpen: open }))
      }
      {...dialogState.config}
    >
      <div />
    </ConfirmationDialog>
  );

  return { confirm, Dialog };
}
