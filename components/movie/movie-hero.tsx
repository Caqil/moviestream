"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useMovies } from "@/hooks/use-movies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import {
  IconPlus,
  IconCheck,
  IconStar,
  IconClock,
  IconCalendar,
  IconEye,
  IconVolume,
  IconBookmark,
  IconBookmarkFilled,
  IconCrown,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
} from "@tabler/icons-react";
import { TrailerModal } from "./trailer-modal";
import { MoviePlayer } from "./movie-player";
import { FormatUtils } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Movie } from "@/types";
import { InfoIcon, PlayIcon, VolumeXIcon } from "lucide-react";

interface MovieHeroProps {
  movies?: Movie[];
  autoplay?: boolean;
  showNavigation?: boolean;
  showIndicators?: boolean;
  interval?: number;
  className?: string;
  onMoviePlay?: (movie: Movie) => void;
  onMovieDetails?: (movie: Movie) => void;
  priority?: boolean;
}

interface HeroSlideProps {
  movie: Movie;
  isActive: boolean;
  onPlay?: (movie: Movie) => void;
  onDetails?: (movie: Movie) => void;
  showMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  priority?: boolean;
}

function HeroSlide({
  movie,
  isActive,
  onPlay,
  onDetails,
  showMuted = false,
  onMutedChange,
  priority = false,
}: HeroSlideProps) {
  const { checkAccess } = useSubscriptionContext();
  const { addToWatchlist, removeFromWatchlist } = useMovies();

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const releaseYear = new Date(movie.releaseDate).getFullYear();
  const formattedDuration = FormatUtils.formatVideoDuration(
    movie.duration * 60
  );

  const handlePlay = async () => {
    if (movie.isPremium) {
      const hasAccess = await checkAccess(movie._id.toString());
      if (!hasAccess) {
        toast.error("Subscription required", {
          description: "This movie requires an active subscription to watch.",
        });
        return;
      }
    }

    if (onPlay) {
      onPlay(movie);
    } else {
      setShowPlayer(true);
    }
  };

  const handleWatchlistToggle = async () => {
    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie._id.toString());
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(movie._id.toString());
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onMutedChange?.(newMuted);
  };

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={imageError ? "/placeholder-movie.jpg" : movie.backdrop}
            alt={movie.title}
            fill
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
            sizes="100vw"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-20">
            <div className="max-w-2xl space-y-6">
              {/* Movie Info */}
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  {movie.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                      ⭐ Featured
                    </Badge>
                  )}
                  {movie.isPremium && (
                    <Badge>
                      <IconCrown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="text-xl md:text-2xl text-white/90 italic">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <IconCalendar className="h-4 w-4" />
                    <span>{releaseYear}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <IconClock className="h-4 w-4" />
                    <span>{formattedDuration}</span>
                  </div>

                  {movie.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <IconEye className="h-4 w-4" />
                    <span>{FormatUtils.formatNumber(movie.views)} views</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-white/90 leading-relaxed line-clamp-3 max-w-xl">
                  {movie.overview}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                >
                  <PlayIcon className="h-6 w-6 mr-3" />
                  Play Now
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => onDetails?.(movie)}
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-8 py-3"
                >
                  <InfoIcon className="h-5 w-5 mr-2" />
                  More Info
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleWatchlistToggle}
                  disabled={isLoading}
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                >
                  {isInWatchlist ? (
                    <IconCheck className="h-5 w-5 mr-2" />
                  ) : (
                    <IconPlus className="h-5 w-5 mr-2" />
                  )}
                  {isInWatchlist ? "In List" : "My List"}
                </Button>

                {movie.trailer && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowTrailer(true)}
                    className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                  >
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mute Button */}
          {showMuted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMuteToggle}
              className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeXIcon className="h-4 w-4" />
              ) : (
                <IconVolume className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showTrailer && movie.trailer && (
        <TrailerModal
          open={showTrailer}
          onOpenChange={setShowTrailer}
          trailerUrl={movie.trailer}
          movieTitle={movie.title}
        />
      )}

      {showPlayer && (
        <MoviePlayer
          movie={movie}
          open={showPlayer}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}

export function MovieHero({
  movies = [],
  autoplay = true,
  showNavigation = true,
  showIndicators = true,
  interval = 8000,
  className,
  onMoviePlay,
  onMovieDetails,
  priority = true,
}: MovieHeroProps) {
  const { featuredMovies, isLoading } = useMovies();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const displayMovies = movies.length > 0 ? movies : featuredMovies.slice(0, 5);

  // Set up carousel API
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-advance carousel
  useEffect(() => {
    if (!autoplay || !api || count <= 1) return;

    intervalRef.current = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api, autoplay, interval, count]);

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoplay && api && count > 1) {
      intervalRef.current = setInterval(() => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
      }, interval);
    }
  };

  // Loading state
  if (isLoading || displayMovies.length === 0) {
    return (
      <div className={cn("relative w-full h-screen", className)}>
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-20 left-4 right-4 space-y-4">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (displayMovies.length === 1) {
    return (
      <div className={className}>
        <HeroSlide
          movie={displayMovies[0]}
          isActive={true}
          onPlay={onMoviePlay}
          onDetails={onMovieDetails}
          showMuted={true}
          onMutedChange={setIsMuted}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayMovies.map((movie, index) => (
            <CarouselItem key={movie._id.toString()}>
              <HeroSlide
                movie={movie}
                isActive={index === current}
                onPlay={onMoviePlay}
                onDetails={onMovieDetails}
                showMuted={index === current}
                onMutedChange={setIsMuted}
                priority={priority && index === 0}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation */}
        {showNavigation && count > 1 && (
          <>
            <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/20" />
            <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/20" />
          </>
        )}

        {/* Indicators */}
        {showIndicators && count > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === current
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoplay && count > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-300 ease-linear"
              style={{
                width: `${((current + 1) / count) * 100}%`,
              }}
            />
          </div>
        )}
      </Carousel>

      {/* Movie Info Overlay */}
      <div className="absolute bottom-20 right-6 hidden lg:block">
        <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm">
              {displayMovies[current]?.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span>
                {new Date(displayMovies[current]?.releaseDate).getFullYear()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {displayMovies[current]?.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-white/80 line-clamp-2">
              {displayMovies[current]?.overview}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Specialized variants
export function FeaturedMovieHero({
  className,
  ...props
}: Omit<MovieHeroProps, "movies">) {
  const { featuredMovies } = useMovies();

  return (
    <MovieHero
      movies={featuredMovies.filter((m) => m.isFeatured).slice(0, 3)}
      className={className}
      {...props}
    />
  );
}

export function StaticMovieHero({
  movie,
  className,
  ...props
}: Omit<
  MovieHeroProps,
  "movies" | "autoplay" | "showNavigation" | "showIndicators"
> & {
  movie: Movie;
}) {
  return (
    <MovieHero
      movies={[movie]}
      autoplay={false}
      showNavigation={false}
      showIndicators={false}
      className={className}
      {...props}
    />
  );
}

export function CompactMovieHero({
  movies,
  className,
  ...props
}: MovieHeroProps) {
  return (
    <div className={cn("h-96 md:h-[32rem]", className)}>
      <MovieHero
        movies={movies}
        showIndicators={false}
        interval={6000}
        {...props}
      />
    </div>
  );
}
