import type { Metadata } from "next";
import LoginPageClient from "./login-page-client";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your MovieStream account to access unlimited movies and shows.",
};

interface LoginPageProps {
  searchParams: {
    callbackUrl?: string;
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginPageClient searchParams={searchParams} />;
}
