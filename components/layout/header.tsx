"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconMenu2,
  IconX,
  IconWifi,
  IconWifiOff,
  IconAlertTriangle,
  IconDownload,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Navbar } from "./navbar";
import { MobileMenu } from "./mobile-menu";

interface HeaderProps {
  className?: string;
  variant?: "default" | "transparent" | "minimal" | "auth";
  sticky?: boolean;
  showProgress?: boolean;
  progressValue?: number;
}

interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
}

export function Header({
  className,
  variant = "default",
  sticky = true,
  showProgress = false,
  progressValue = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthContext();
  const isMobile = useIsMobile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
  });
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    if (variant !== "transparent") return;

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // Handle network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const online = navigator.onLine;
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: online,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
      });

      if (!online && !showOfflineAlert) {
        setShowOfflineAlert(true);
        toast.error("No internet connection", {
          description: "Some features may not work properly while offline.",
        });
      } else if (online && showOfflineAlert) {
        setShowOfflineAlert(false);
        toast.success("Connection restored");
      }
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, [showOfflineAlert]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Determine header styles based on variant and state
  const getHeaderStyles = () => {
    const baseStyles = "w-full z-50 transition-all duration-300";

    switch (variant) {
      case "transparent":
        return cn(
          baseStyles,
          sticky && "fixed top-0 left-0 right-0",
          isScrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm"
            : "bg-transparent"
        );

      case "minimal":
        return cn(
          baseStyles,
          "bg-background border-b",
          sticky && "sticky top-0"
        );

      case "auth":
        return cn(
          baseStyles,
          "bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30"
        );

      default:
        return cn(
          baseStyles,
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
          sticky && "sticky top-0"
        );
    }
  };

  // Don't show header on certain auth pages
  const hideHeader = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
  ].includes(pathname);

  if (hideHeader) return null;

  return (
    <>
      {/* Offline Alert */}
      {!networkStatus.isOnline && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10 text-destructive border-destructive/20">
          <IconWifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're currently offline. Some features may be limited.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-6 text-xs"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Header */}
      <header className={cn(getHeaderStyles(), className)}>
        {/* Progress Bar */}
        {showProgress && progressValue > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1">
            <Progress value={progressValue} className="h-full rounded-none" />
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-8 w-8 p-0 md:hidden"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <IconX className="h-5 w-5" />
                ) : (
                  <IconMenu2 className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Navbar */}
            <Navbar variant={variant} isMobile={isMobile} className="flex-1" />

            {/* Network Status Indicator */}
            {variant !== "minimal" && (
              <div className="hidden md:flex items-center space-x-2">
                {networkStatus.isOnline ? (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <IconWifi className="h-3 w-3 text-green-500" />
                    {networkStatus.effectiveType && (
                      <span className="uppercase">
                        {networkStatus.effectiveType}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-destructive">
                    <IconWifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <MobileMenu
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              className="fixed top-16 left-0 right-0 bottom-0 z-50 md:hidden"
            />
          </>
        )}
      </header>

      {/* Header Spacer for Fixed/Sticky Positioning */}
      {sticky && variant === "transparent" && isScrolled && (
        <div className="h-16" />
      )}

      {sticky && variant !== "transparent" && <div className="h-16" />}
    </>
  );
}

// Specialized variants
export function TransparentHeader({
  className,
  ...props
}: Omit<HeaderProps, "variant">) {
  return <Header variant="transparent" className={className} {...props} />;
}

export function MinimalHeader({
  className,
  ...props
}: Omit<HeaderProps, "variant">) {
  return <Header variant="minimal" className={className} {...props} />;
}

export function AuthHeader({
  className,
  ...props
}: Omit<HeaderProps, "variant" | "sticky">) {
  return (
    <Header variant="auth" sticky={false} className={className} {...props} />
  );
}

// Admin Header with additional features
export function AdminHeader({ className, ...props }: HeaderProps) {
  const { user } = useAuthContext();

  if (user?.role !== "admin") {
    return <Header className={className} {...props} />;
  }

  return (
    <div className="space-y-0">
      {/* Admin Banner */}
      <div className="bg-primary text-primary-foreground py-1">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-xs">
            <IconAlertTriangle className="h-3 w-3 mr-1" />
            <span>Admin Mode</span>
          </div>
        </div>
      </div>

      {/* Regular Header */}
      <Header className={className} {...props} />
    </div>
  );
}
