"use client";

import * as React from "react";
import {
  IconDashboard,
  IconMovie,
  IconUsers,
  IconDevices,
  IconChartBar,
  IconSettings,
  IconCurrencyDollar,
  IconCloud,
  IconMail,
  IconDatabase,
  IconShield,
  IconHelp,
  IconBell,
  IconUpload,
  IconFile,
  IconEye,
  IconCreditCard,
  IconKey,
  IconBrandStripe,
  IconBrandAws,
  IconApi,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/admin/nav-documents";
import { NavMain } from "@/components/admin/nav-main";
import { NavSecondary } from "@/components/admin/nav-secondary";
import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/auth-context";
import { useAdminContext } from "@/contexts/admin-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext();
  const { settings, stats } = useAdminContext();

  const data = {
    user: user
      ? {
          name: user.name,
          email: user.email,
          avatar: user.image || "",
        }
      : {
          name: "Admin User",
          email: "admin@moviestream.com",
          avatar: "",
        },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: IconDashboard,
      },
      {
        title: "Movies",
        url: "/admin/movies",
        icon: IconMovie,
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: IconUsers,
      },
      {
        title: "Subscriptions",
        url: "/admin/subscriptions",
        icon: IconCurrencyDollar,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: IconChartBar,
      },
      {
        title: "Devices",
        url: "/admin/devices",
        icon: IconDevices,
      },
    ],
    navServices: [
      {
        title: "Upload Manager",
        icon: IconUpload,
        url: "/admin/uploads",
        description: "Manage file uploads",
      },
      {
        title: "TMDB Integration",
        icon: IconApi,
        url: "/admin/settings/tmdb",
        description: "Movie database API",
      },
      {
        title: "Stripe Payments",
        icon: IconBrandStripe,
        url: "/admin/settings/stripe",
        description: "Payment processing",
      },
      {
        title: "S3 Storage",
        icon: IconBrandAws,
        url: "/admin/settings/s3",
        description: "Cloud file storage",
      },
    ],
    navSecondary: [
      {
        title: "System Settings",
        url: "/admin/settings",
        icon: IconSettings,
      },
      {
        title: "Security",
        url: "/admin/security",
        icon: IconShield,
      },
      {
        title: "Notifications",
        url: "/admin/notifications",
        icon: IconBell,
      },
      {
        title: "Help & Support",
        url: "/admin/help",
        icon: IconHelp,
      },
    ],
    documents: [
      {
        name: "Content Library",
        url: "/admin/content",
        icon: IconDatabase,
      },
      {
        name: "Analytics Reports",
        url: "/admin/reports",
        icon: IconFile,
      },
      {
        name: "Audit Logs",
        url: "/admin/logs",
        icon: IconEye,
      },
      {
        name: "API Documentation",
        url: "/admin/api-docs",
        icon: IconKey,
      },
    ],
  };

  const platformName = settings?.general?.siteName || "MovieStream";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {platformName} Admin
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
