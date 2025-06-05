import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconDevices,
  IconDownload,
  IconUsers,
  IconShield,
  IconHdr,
} from "@tabler/icons-react";
import { ZapIcon } from "lucide-react";

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
  const { callbackUrl, plan } = searchParams;

  return (
    <div className="space-y-8">
      {/* Special Offer Banner */}
      {plan && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ZapIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Special Offer</span>
            <Badge variant="secondary" className="text-xs">
              Limited Time
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            You're signing up for the <strong>{plan}</strong> plan. Enjoy your
            free trial and cancel anytime.
          </p>
        </div>
      )}

      {/* Register Form */}
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm
          redirectTo={callbackUrl || "/dashboard"}
          showOAuth={true}
          showLoginLink={true}
        />
      </Suspense>

      {/* Benefits Section */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              What you'll get
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <FeatureBenefit
            icon={<IconHdr className="h-4 w-4" />}
            text="HD & 4K streaming quality"
          />
          <FeatureBenefit
            icon={<IconDevices className="h-4 w-4" />}
            text="Watch on any device"
          />
          <FeatureBenefit
            icon={<IconDownload className="h-4 w-4" />}
            text="Download for offline viewing"
          />
          <FeatureBenefit
            icon={<IconUsers className="h-4 w-4" />}
            text="Multiple user profiles"
          />
          <FeatureBenefit
            icon={<IconShield className="h-4 w-4" />}
            text="Ad-free experience"
          />
          <FeatureBenefit
            icon={<ZapIcon className="h-4 w-4" />}
            text="Instant streaming"
          />
        </div>

        <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium mb-1">🎬 Start your free trial today</p>
          <p>No hidden fees • Cancel anytime • No commitment required</p>
        </div>
      </div>
    </div>
  );
}

function FeatureBenefit({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
