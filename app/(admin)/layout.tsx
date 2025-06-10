import type { Metadata } from "next";
import { AdminLayoutClient } from "./admin-layout-client";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel - MovieStream",
    template: "%s - Admin Panel - MovieStream",
  },
  description:
    "MovieStream administration panel for managing content, users, and system settings.",
  robots: { index: false, follow: false }, // Don't index admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
