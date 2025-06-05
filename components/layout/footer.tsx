"use client";

import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useThemeContext } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandLinkedin,
  IconMail,
  IconPhone,
  IconMapPin,
  IconHeart,
  IconCrown,
  IconShield,
  IconDevices,
  IconGlobe,
  IconMoon,
  IconSun,
  IconChevronUp,
  IconExternalLink,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { MonitorIcon } from "lucide-react";

interface FooterProps {
  className?: string;
  variant?: "default" | "minimal" | "expanded";
}

const footerLinks = {
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Investors", href: "/investors" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "System Status", href: "/status" },
      { label: "Device Support", href: "/devices" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "DMCA", href: "/dmca" },
      { label: "Content Guidelines", href: "/guidelines" },
    ],
  },
  features: {
    title: "Features",
    links: [
      { label: "Browse Movies", href: "/movies" },
      { label: "Genres", href: "/genres" },
      { label: "New Releases", href: "/new" },
      { label: "Top Rated", href: "/top-rated" },
      { label: "My Watchlist", href: "/watchlist" },
    ],
  },
};

const socialLinks = [
  {
    icon: IconBrandTwitter,
    href: "https://twitter.com/moviestream",
    label: "Twitter",
  },
  {
    icon: IconBrandFacebook,
    href: "https://facebook.com/moviestream",
    label: "Facebook",
  },
  {
    icon: IconBrandInstagram,
    href: "https://instagram.com/moviestream",
    label: "Instagram",
  },
  {
    icon: IconBrandYoutube,
    href: "https://youtube.com/moviestream",
    label: "YouTube",
  },
  {
    icon: IconBrandLinkedin,
    href: "https://linkedin.com/company/moviestream",
    label: "LinkedIn",
  },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
];

export function Footer({ className, variant = "default" }: FooterProps) {
  const { isAuthenticated, user, isSubscriber } = useAuthContext();
  const { currentPlan, subscriptionStatus, daysRemaining } =
    useSubscriptionContext();
  const { theme, setTheme, preferences, updatePreferences } = useThemeContext();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (variant === "minimal") {
    return (
      <footer
        className={cn(
          "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/" className="font-bold text-lg">
                {APP_CONFIG.name}
              </Link>
              <span className="text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="h-8 w-8 p-0"
              >
                <IconChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Subscription Status Banner */}
        {isAuthenticated && (
          <div className="py-4 border-b">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <div className="flex items-center space-x-3">
                {isSubscriber ? (
                  <>
                    <IconCrown className="h-5 w-5 text-yellow-500" />
                    <div>
                      <span className="font-medium">
                        {currentPlan?.name} Plan
                      </span>
                      {subscriptionStatus === "active" && daysRemaining > 0 && (
                        <span className="text-sm text-muted-foreground ml-2">
                          Renews in {daysRemaining} days
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <IconShield className="h-5 w-5 text-muted-foreground" />
                    <span>Free Account</span>
                    <Badge variant="outline">Limited Access</Badge>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!isSubscriber && (
                  <Button asChild size="sm">
                    <Link href="/pricing">
                      <IconCrown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Link>
                  </Button>
                )}

                <Button variant="outline" size="sm" asChild>
                  <Link href="/account">Manage Account</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand and Description */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    MS
                  </span>
                </div>
                <span className="font-bold text-xl">{APP_CONFIG.name}</span>
              </Link>

              <p className="text-muted-foreground max-w-md">
                {APP_CONFIG.description}. Stream unlimited movies and shows in
                HD and 4K quality, with new releases added weekly.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <IconDevices className="h-3 w-3" />
                  All Devices
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <IconShield className="h-3 w-3" />
                  Secure Streaming
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <IconHeart className="h-3 w-3" />
                  Ad-Free
                </Badge>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Follow us:
                </span>
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="space-y-3">
                <h3 className="font-medium">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Footer Bottom */}
        <div className="py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Copyright and Legal */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
              <span>
                © {new Date().getFullYear()} {APP_CONFIG.name}. All rights
                reserved.
              </span>
              <div className="flex items-center space-x-4">
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Settings and Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <IconGlobe className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={preferences.language}
                  onValueChange={(language) => updatePreferences({ language })}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center space-x-1 rounded-lg border p-1">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="h-6 w-6 p-0"
                >
                  <IconSun className="h-3 w-3" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="h-6 w-6 p-0"
                >
                  <IconMoon className="h-3 w-3" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="h-6 w-6 p-0"
                >
                  <MonitorIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* Scroll to Top */}
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="h-8 w-8 p-0"
              >
                <IconChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {variant === "expanded" && (
          <>
            <Separator />
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Support:</span>
                  <a
                    href={`mailto:${APP_CONFIG.supportEmail}`}
                    className="text-foreground hover:underline"
                  >
                    {APP_CONFIG.supportEmail}
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="text-foreground">1-800-MOVIES</span>
                </div>

                <div className="flex items-center space-x-2">
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">Global Service</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Version and Build Info */}
        <div className="py-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Version {APP_CONFIG.version}</span>
            <div className="flex items-center space-x-2">
              <span>Made with</span>
              <IconHeart className="h-3 w-3 text-red-500" />
              <span>by the MovieStream Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Specialized variants
export function MinimalFooter({ className }: Pick<FooterProps, "className">) {
  return <Footer variant="minimal" className={className} />;
}

export function ExpandedFooter({ className }: Pick<FooterProps, "className">) {
  return <Footer variant="expanded" className={className} />;
}
