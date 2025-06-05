import type { Metadata } from "next";
import RegisterPageClient from "./register-page-client";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your MovieStream account and start streaming unlimited movies and shows today.",
};

interface RegisterPageProps {
  searchParams: {
    callbackUrl?: string;
    plan?: string;
  };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return <RegisterPageClient searchParams={searchParams} />;
}
