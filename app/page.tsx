import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPlay,
  IconHd,
  IconDevices,
  IconDownload,
  IconShield,
  IconUsers,
  IconTrendingUp,
  IconStar,
  IconHeart,
  IconClock,
  IconArrowRight,
  IconSparkles,
  IconZap,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MainNavigation } from "@/components/layout/main-navigation";

export const metadata: Metadata = {
  title: "MovieStream - Your Ultimate Movie Streaming Platform",
  description:
    "Stream unlimited movies and shows in HD quality. Start your free trial today and enjoy ad-free entertainment on any device.",
};

// Demo data for featured content
const featuredMovies = [
  {
    id: "1",
    title: "Epic Adventure",
    genre: "Action • Adventure",
    rating: 8.7,
    year: 2024,
    duration: "2h 15m",
    backdrop:
      "https://images.unsplash.com/photo-1489599904152-3ef9518632e4?w=1200&h=675&fit=crop&q=80",
    description:
      "An epic adventure that takes you to the edge of the world and beyond. Experience stunning visuals and heart-pounding action.",
    isPremium: true,
  },
  {
    id: "2",
    title: "Mystery of Tomorrow",
    genre: "Sci-Fi • Thriller",
    rating: 9.1,
    year: 2024,
    duration: "1h 58m",
    backdrop:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop&q=80",
    description:
      "A mind-bending thriller that explores the mysteries of time and space. Prepare for an unforgettable journey.",
    isPremium: false,
  },
  {
    id: "3",
    title: "Love in Paris",
    genre: "Romance • Drama",
    rating: 8.3,
    year: 2024,
    duration: "1h 42m",
    backdrop:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=675&fit=crop&q=80",
    description:
      "A beautiful love story set against the romantic backdrop of Paris. Experience passion, heartbreak, and redemption.",
    isPremium: true,
  },
];

const popularMovies = [
  {
    id: "4",
    title: "Action Hero",
    poster:
      "https://images.unsplash.com/photo-1478720568477-b2709d26d04e?w=300&h=450&fit=crop&q=80",
    rating: 8.5,
  },
  {
    id: "5",
    title: "Space Odyssey",
    poster:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=450&fit=crop&q=80",
    rating: 9.2,
  },
  {
    id: "6",
    title: "Comedy Gold",
    poster:
      "https://images.unsplash.com/photo-1489599904152-3ef9518632e4?w=300&h=450&fit=crop&q=80",
    rating: 7.8,
  },
  {
    id: "7",
    title: "Horror Night",
    poster:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop&q=80",
    rating: 8.1,
  },
  {
    id: "8",
    title: "Drama Classic",
    poster:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=450&fit=crop&q=80",
    rating: 8.9,
  },
  {
    id: "9",
    title: "Fantasy World",
    poster:
      "https://images.unsplash.com/photo-1478720568477-b2709d26d04e?w=300&h=450&fit=crop&q=80",
    rating: 8.6,
  },
];

const features = [
  {
    icon: IconHd,
    title: "HD & 4K Quality",
    description: "Crystal clear streaming in HD, Full HD, and 4K resolution",
  },
  {
    icon: IconDevices,
    title: "Any Device",
    description: "Watch on TV, laptop, phone, and tablet seamlessly",
  },
  {
    icon: IconDownload,
    title: "Offline Viewing",
    description: "Download movies and shows to watch offline anywhere",
  },
  {
    icon: IconShield,
    title: "Ad-Free",
    description: "Enjoy uninterrupted streaming without any advertisements",
  },
  {
    icon: IconUsers,
    title: "Family Profiles",
    description: "Create up to 5 profiles with personalized recommendations",
  },
  {
    icon: IconZap,
    title: "Instant Streaming",
    description:
      "Start watching immediately with our fast streaming technology",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative">
        <HeroSection />
      </section>

      {/* Featured Content */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Movies</h2>
              <p className="text-muted-foreground">
                Handpicked movies just for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/movies">
                View All
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={<FeaturedMoviesSkeleton />}>
            <FeaturedMovies movies={featuredMovies} />
          </Suspense>
        </div>
      </section>

      {/* Popular Movies */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Now</h2>
              <p className="text-muted-foreground">What everyone's watching</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/movies/popular">
                View All
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={<PopularMoviesSkeleton />}>
            <PopularMoviesGrid movies={popularMovies} />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MovieStream?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of entertainment with our cutting-edge
              streaming platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-6">
              <IconSparkles className="h-4 w-4" />
              Start Your Journey Today
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Ready to Stream Unlimited Entertainment?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join millions of movie lovers and start your free trial today.
              Cancel anytime, no commitment required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <IconPlay className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                asChild
              >
                <Link href="/movies">Browse Movies</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-500" />
                7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-500" />
                No commitment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <IconPlay className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">MovieStream</span>
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 MovieStream. All rights reserved.</p>
            <div className="flex items-center justify-center gap-6 mt-4">
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
                href="/help"
                className="hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="relative min-h-[70vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-sm">
            <IconTrendingUp className="h-3 w-3 mr-1" />
            #1 Streaming Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Stream Unlimited
            <br />
            Entertainment
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Watch thousands of movies and shows in stunning HD quality. Start
            your free trial and enjoy ad-free streaming on any device.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/register">
                Start Free Trial
                <IconPlay className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8"
              asChild
            >
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconHd className="h-4 w-4" />
              HD & 4K Quality
            </div>
            <div className="flex items-center gap-2">
              <IconDevices className="h-4 w-4" />
              Any Device
            </div>
            <div className="flex items-center gap-2">
              <IconShield className="h-4 w-4" />
              Ad-Free
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedMovies({ movies }: { movies: typeof featuredMovies }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {movies.map((movie, index) => (
        <Card
          key={movie.id}
          className={cn(
            "group cursor-pointer overflow-hidden border-0 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
            index === 0 && "lg:col-span-2 lg:row-span-2"
          )}
        >
          <div className="relative">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-48 lg:h-60 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" className="w-16 h-16 rounded-full">
                <IconPlay className="h-6 w-6" />
              </Button>
            </div>

            {/* Premium Badge */}
            {movie.isPremium && (
              <Badge className="absolute top-4 right-4 bg-primary">
                Premium
              </Badge>
            )}
          </div>

          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{movie.rating}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{movie.year}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{movie.duration}</span>
            </div>

            <h3 className="font-bold text-xl mb-2">{movie.title}</h3>
            <p className="text-muted-foreground text-sm mb-3">{movie.genre}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {movie.description}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" className="flex-1">
                <IconPlay className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
              <Button size="sm" variant="outline">
                <IconHeart className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PopularMoviesGrid({ movies }: { movies: typeof popularMovies }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <Card
          key={movie.id}
          className="group cursor-pointer overflow-hidden border-0 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="relative">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" className="w-12 h-12 rounded-full">
                <IconPlay className="h-4 w-4" />
              </Button>
            </div>

            {/* Rating */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 rounded px-2 py-1">
              <IconStar className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-white text-xs font-medium">
                {movie.rating}
              </span>
            </div>
          </div>

          <CardContent className="p-3">
            <h4 className="font-medium text-sm truncate">{movie.title}</h4>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FeaturedMoviesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className={cn("overflow-hidden", i === 1 && "lg:col-span-2")}
        >
          <Skeleton className="w-full h-48 lg:h-60" />
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PopularMoviesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full aspect-[2/3]" />
          <CardContent className="p-3">
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
