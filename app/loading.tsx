import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { IconLoader2 } from "@tabler/icons-react";
import { PlayIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-64 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Loading */}
      <div className="container py-8">
        {/* Hero Section Skeleton */}
        <div className="relative mb-12 overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[21/9] w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="mb-4 h-4 w-96" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Loading Indicator */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo/Icon */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
              <PlayIcon className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <IconLoader2 className="absolute inset-0 h-16 w-16 animate-spin text-primary/30" />
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Loading MovieStream
            </h3>
            <p className="text-sm text-muted-foreground">
              Preparing your entertainment...
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full bg-primary animate-pulse`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
