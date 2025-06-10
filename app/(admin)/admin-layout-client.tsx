"use client";

import { AdminSidebar } from "@/components/layout/sidebar";
import { AdminHeader } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminGuard } from "@/components/auth/admin-guard";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <AdminHeader />

        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar
            collapsible={!isMobile}
            defaultCollapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            className={cn(
              "flex-shrink-0",
              isMobile && "hidden" // Hide sidebar on mobile, use mobile menu instead
            )}
          />

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 min-w-0 p-4 md:p-6 lg:p-8",
              "transition-all duration-300"
            )}
          >
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
