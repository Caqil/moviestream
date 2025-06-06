"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useMovies } from "@/hooks/use-movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  IconPlus,
  IconInfoCircle,
  IconStar,
  IconVolume,
  IconVolumeOff,
  IconChevronRight,
  IconTrendingUp,
  IconClock,
  IconCalendar,
  IconHeart,
  IconBookmark,
  IconShare,
  IconCrown,
  IconLogin,
  IconUserPlus,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Movie } from "@/types";
import { PlayIcon } from "lucide-react";

// Error Boundary Component
class HomepageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Homepage error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <IconAlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-gray-400">
              We're sorry, but something unexpected happened.
            </p>
            <Button onClick={() => window.location.reload()}>
              <IconRefresh className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function HomepageLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Loading */}
      <section className="relative h-screen overflow-hidden">
        <Skeleton className="w-full h-full bg-gray-800" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-12 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
                <Skeleton className="h-16 w-96 bg-gray-700" />
                <Skeleton className="h-6 w-full bg-gray-700" />
                <Skeleton className="h-6 w-4/5 bg-gray-700" />
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-32 bg-gray-700" />
                  <Skeleton className="h-12 w-32 bg-gray-700" />
                  <Skeleton className="h-12 w-24 bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Loading */}
      <div className="relative z-10 bg-black">
        {Array.from({ length: 4 }).map((_, i) => (
          <section key={i} className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48 bg-gray-800" />
                <Skeleton className="h-6 w-20 bg-gray-800" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full bg-gray-800 rounded-lg" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-3 w-2/3 bg-gray-800" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function HomepageClient() {
  return (
    <HomepageErrorBoundary>
      <Suspense fallback={<HomepageLoading />}>
        <HomepageContent />
      </Suspense>
    </HomepageErrorBoundary>
  );
}

// Main Homepage Content Component
function HomepageContent() {
  const router = useRouter();
  const { isAuthenticated, user, isSubscriber } = useAuthContext();
  const { subscriptionStatus, currentPlan } = useSubscriptionContext();
  const {
    featuredMovies,
    popularMovies,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
  } = useMovies();

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get featured movie (first from featured movies or fallback to popular)
  const featuredMovie = featuredMovies?.[0] || popularMovies?.[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlayClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to watch movies");
      router.push("/auth/login");
      return;
    }

    if (featuredMovie?.isPremium && !isSubscriber) {
      toast.error("Premium subscription required");
      router.push("/pricing");
      return;
    }

    router.push(`/watch/${featuredMovie?._id}`);
  };

  const handleWatchlistToggle = async (movie: Movie) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to manage your watchlist");
      router.push("/auth/login");
      return;
    }

    try {
      const isInWatchlist = user?.watchlist?.includes(movie._id);
      if (isInWatchlist) {
        await removeFromWatchlist(movie._id.toString());
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(movie._id.toString());
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  // Show loading state
  if (isLoading && !featuredMovies.length && !popularMovies.length) {
    return <HomepageLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load content. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Prepare content sections
  const contentSections = [
    {
      title: "Trending Now",
      icon: IconTrendingUp,
      movies: popularMovies.slice(0, 12),
      showRanking: true,
    },
    {
      title: "New Releases",
      icon: IconCalendar,
      movies: popularMovies.slice(12, 22),
    },
    {
      title: "Featured Movies",
      icon: IconStar,
      movies: featuredMovies.slice(1, 11),
    },
    ...(isAuthenticated
      ? [
          {
            title: "Continue Watching",
            icon: IconClock,
            movies: popularMovies.slice(5, 13),
            requireAuth: true,
          },
          {
            title: "Your Watchlist",
            icon: IconBookmark,
            movies: popularMovies.slice(8, 16),
            requireAuth: true,
          },
        ]
      : []),
    {
      title: "Action & Adventure",
      movies: popularMovies.slice(2, 12),
    },
    {
      title: "Comedy",
      movies: popularMovies.slice(6, 16),
    },
    ...(isSubscriber
      ? [
          {
            title: "Premium Exclusives",
            icon: IconCrown,
            movies: popularMovies.filter((m) => m.isPremium).slice(0, 10),
            requireSubscription: true,
          },
        ]
      : []),
  ].filter((section) => {
    if (section.requireAuth && !isAuthenticated) return false;
    if (section.requireSubscription && !isSubscriber) return false;
    return section.movies.length > 0;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - identical to your original implementation */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          {featuredMovie && (
            <>
              {showVideo && featuredMovie.trailer ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedData={handleVideoLoad}
                  poster={featuredMovie.backdrop}
                >
                  <source src={featuredMovie.trailer} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={featuredMovie.backdrop || featuredMovie.poster}
                  alt={featuredMovie.title}
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Hero Content - Rest of your hero implementation... */}
        <div className="relative z-10 flex items-center h-full">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-6">
              {featuredMovie ? (
                <div className="space-y-4">
                  {/* Movie Info */}
                  <div className="flex items-center gap-3">
                    {featuredMovie.isPremium && (
                      <Badge className="bg-yellow-600 hover:bg-yellow-700">
                        <IconCrown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    <span className="text-sm text-gray-300">
                      {new Date(featuredMovie.releaseDate).getFullYear()}
                    </span>
                    <span className="text-sm text-gray-300">
                      {featuredMovie.duration} min
                    </span>
                    <div className="flex items-center gap-1">
                      <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-300">
                        {featuredMovie.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    {featuredMovie.title}
                  </h1>

                  <p className="text-lg text-gray-200 leading-relaxed line-clamp-3">
                    {featuredMovie.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-200 gap-2"
                      onClick={handlePlayClick}
                    >
                      <PlayIcon className="h-5 w-5 fill-current" />
                      {isAuthenticated ? "Play Now" : "Sign In to Watch"}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-white/10 gap-2"
                      asChild
                    >
                      <Link href={`/movies/${featuredMovie._id}`}>
                        <IconInfoCircle className="h-5 w-5" />
                        More Info
                      </Link>
                    </Button>

                    {isAuthenticated ? (
                      <Button
                        size="lg"
                        variant="ghost"
                        className="text-white hover:bg-white/10 gap-2"
                        onClick={() => handleWatchlistToggle(featuredMovie)}
                      >
                        <IconPlus className="h-5 w-5" />
                        My List
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="ghost"
                        className="text-white hover:bg-white/10 gap-2"
                        asChild
                      >
                        <Link href="/auth/register">
                          <IconUserPlus className="h-5 w-5" />
                          Sign Up Free
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Volume Control */}
        {featuredMovie?.trailer && showVideo && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-6 right-6 z-20 bg-black/50 hover:bg-black/70 text-white"
            onClick={toggleMute}
          >
            {isMuted ? (
              <IconVolumeOff className="h-5 w-5" />
            ) : (
              <IconVolume className="h-5 w-5" />
            )}
          </Button>
        )}
      </section>

      {/* Not Authenticated CTA */}
      {!isAuthenticated && (
        <section className="py-12 bg-gradient-to-r from-primary/20 to-primary/10 border-t border-primary/20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold">Join MovieStream Today</h2>
              <p className="text-gray-300">
                Get unlimited access to thousands of movies and shows. Start
                your free trial now.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    <IconUserPlus className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">
                    <IconLogin className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="relative z-10 bg-black">
        {contentSections.map((section, categoryIndex) => (
          <section key={section.title} className="py-8">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {section.icon && (
                    <section.icon className="h-6 w-6 text-red-500" />
                  )}
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  {section.requireSubscription && !isSubscriber && (
                    <Badge className="bg-yellow-600">Premium</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white gap-1"
                  asChild
                >
                  <Link
                    href={`/movies?category=${section.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    View All
                    <IconChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Movies Carousel */}
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {section.movies.map((movie, index) => (
                    <CarouselItem
                      key={movie._id}
                      className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                    >
                      <MovieCard
                        movie={movie}
                        index={index}
                        showProgress={section.title === "Continue Watching"}
                        onWatchlistToggle={handleWatchlistToggle}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex bg-black/50 hover:bg-black/70 border-gray-600" />
                <CarouselNext className="hidden md:flex bg-black/50 hover:bg-black/70 border-gray-600" />
              </Carousel>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// Movie Card Component
interface MovieCardProps {
  movie: Movie;
  index: number;
  showProgress?: boolean;
  onWatchlistToggle: (movie: Movie) => void;
}

function MovieCard({
  movie,
  index,
  showProgress = false,
  onWatchlistToggle,
}: MovieCardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isSubscriber } = useAuthContext();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlayClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to watch movies");
      router.push("/auth/login");
      return;
    }

    if (movie.isPremium && !isSubscriber) {
      toast.error("Premium subscription required");
      router.push("/pricing");
      return;
    }

    router.push(`/watch/${movie._id}`);
  };

  const handleCardClick = () => {
    router.push(`/movies/${movie._id}`);
  };

  return (
    <Card
      className="bg-transparent border-none group cursor-pointer movie-card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative">
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          {!imageLoaded && <Skeleton className="w-full h-full bg-gray-800" />}
          <img
            src={movie.poster}
            alt={movie.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isHovered && "scale-105",
              !imageLoaded && "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Ranking Badge */}
          {index < 3 && (
            <Badge
              className={cn(
                "absolute top-2 left-2 text-white font-bold",
                index === 0 && "bg-red-500",
                index === 1 && "bg-orange-500",
                index === 2 && "bg-yellow-500"
              )}
            >
              #{index + 1}
            </Badge>
          )}

          {/* Premium Badge */}
          {movie.isPremium && (
            <Badge className="absolute top-2 right-2 bg-yellow-600">
              <IconCrown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}

          {/* Progress Bar for Continue Watching */}
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${Math.random() * 60 + 20}%` }} // Mock progress
              />
            </div>
          )}

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayClick();
                }}
              >
                <PlayIcon className="h-4 w-4 fill-current" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchlistToggle(movie);
                }}
              >
                <IconBookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="pt-3 space-y-1">
          <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
            <div className="flex items-center gap-1">
              <IconStar className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
