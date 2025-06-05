import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  IconHome,
  IconSearch,
  IconArrowLeft,
  IconMovie,
  IconStar,
  IconClock,
} from "@tabler/icons-react";
import { PlayIcon, Tv2Icon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <PlayIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MovieStream</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
              <div className="relative">
                <IconMovie className="h-16 w-16 text-muted-foreground" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
                  <span className="text-xs font-bold text-destructive-foreground">
                    404
                  </span>
                </div>
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">
              Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground">
              Looks like this movie isn't in our catalog yet. But don't worry,
              we have plenty of other great content for you to discover!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <IconHome className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/movies">
                <IconMovie className="mr-2 h-4 w-4" />
                Browse Movies
              </Link>
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSearch className="h-5 w-5" />
                Search for Something Else
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for movies, shows, or genres..."
                  className="flex-1"
                />
                <Button>
                  <IconSearch className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular Suggestions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="text-left">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <IconStar className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">Popular Movies</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Discover the most watched movies right now
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/movies?sort=popular">
                    <IconMovie className="mr-2 h-3 w-3" />
                    Explore
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Tv2Icon className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">TV Shows</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Binge-watch your favorite series
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/shows">
                    <Tv2Icon className="mr-2 h-3 w-3" />
                    Browse
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Recently Added</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Check out the latest additions
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/movies?sort=newest">
                    <IconClock className="mr-2 h-3 w-3" />
                    See New
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              If you believe this page should exist, please{" "}
              <Link
                href="/support"
                className="text-primary underline-offset-4 hover:underline"
              >
                contact our support team
              </Link>
              .
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-muted-foreground"
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} MovieStream. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
