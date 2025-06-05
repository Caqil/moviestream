"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useThemeContext } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  IconMoon,
  IconSun,
  IconArrowLeft,
  IconHome,
  IconShield,
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlayIcon } from "lucide-react";

interface AuthLayoutClientProps {
  children: React.ReactNode;
}

export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  const { theme, setTheme, resolvedTheme } = useThemeContext();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render if authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header */}
      <header className="relative z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <PlayIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">
              MovieStream
            </span>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Home Link */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <IconHome className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="w-9 h-9"
            >
              <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">
          {/* Security Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 border rounded-full text-sm text-muted-foreground mb-4">
              <IconShield className="h-3 w-3" />
              Secure authentication
            </div>
            <p className="text-muted-foreground text-sm">
              Your data is protected with enterprise-grade security
            </p>
          </div>

          {/* Form Container */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/20 rounded-xl blur opacity-25" />
            <div className="relative bg-card/50 backdrop-blur border rounded-xl p-1">
              {children}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Help Center
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              © 2024 MovieStream. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      {/* Background Decorations */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-0 transform -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
    </div>
  );
}
