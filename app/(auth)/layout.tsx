import type { Metadata } from "next";
import { AuthLayoutClient } from "./auth-layout-client";

export const metadata: Metadata = {
  title: {
    default: "Authentication - MovieStream",
    template: "%s - MovieStream",
  },
  description: "Sign in to your MovieStream account or create a new account...",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
