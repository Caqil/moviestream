"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useMovies } from "@/hooks/use-movies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconPlus,
  IconCheck,
  IconStar,
  IconClock,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconDots,
  IconShare,
  IconBookmark,
  IconBookmarkFilled,
  IconCrown,
  IconHdr,
} from "@tabler/icons-react";
import { FormatUtils } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Movie } from "@/types";
import { CalendarIcon, PlayIcon, StarIcon } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  variant?: "default" | "compact" | "featured" | "list";
  showGenres?: boolean;
  showActions?: boolean;
  showProgress?: boolean;
  showRating?: boolean;
  showDuration?: boolean;
  className?: string;
  priority?: boolean;
  onPlay?: (movie: Movie) => void;
  onWatchlistToggle?: (movieId: string, inWatchlist: boolean) => void;
  onLike?: (movieId: string) => void;
  inWatchlist?: boolean;
  isLiked?: boolean;
  watchProgress?: number; // 0-100
}

export function MovieCard({
  movie,
  variant = "default",
  showGenres = true,
  showActions = true,
  showProgress = false,
  showRating = true,
  showDuration = true,
  className,
  priority = false,
  onPlay,
  onWatchlistToggle,
  onLike,
  inWatchlist = false,
  isLiked = false,
  watchProgress = 0,
}: MovieCardProps) {
  const { checkAccess } = useSubscriptionContext();
  const { addToWatchlist, removeFromWatchlist, rateMovie } = useMovies();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const releaseYear = new Date(movie.releaseDate).getFullYear();
  const formattedDuration = FormatUtils.formatVideoDuration(
    movie.duration * 60
  ); // Convert minutes to seconds
  const hasAccess = movie.isPremium ? checkAccess : () => Promise.resolve(true);

  const handlePlay = async () => {
    if (onPlay) {
      const canAccess = await hasAccess(movie._id.toString());
      if (canAccess) {
        onPlay(movie);
      } else {
        toast.error("Subscription required", {
          description: "This movie requires an active subscription to watch.",
        });
      }
    }
  };

  const handleWatchlistToggle = async () => {
    setIsLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movie._id.toString());
        onWatchlistToggle?.(movie._id.toString(), false);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(movie._id.toString());
        onWatchlistToggle?.(movie._id.toString(), true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await rateMovie(movie._id.toString(), isLiked ? 0 : 8); // Toggle like with rating
      onLike?.(movie._id.toString());
      toast.success(isLiked ? "Removed like" : "Added like");
    } catch (error) {
      toast.error("Failed to update rating");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/movies/${movie._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.overview,
          url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Movie link copied to clipboard");
    }
  };

  if (variant === "compact") {
    return (
      <Card className={cn("overflow-hidden group cursor-pointer", className)}>
        <div className="flex">
          <div className="relative w-20 h-28 flex-shrink-0">
            <Image
              src={imageError ? "/placeholder-movie.jpg" : movie.poster}
              alt={movie.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            {movie.isPremium && (
              <Badge className="absolute top-1 left-1 h-5 text-xs">
                <IconCrown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          <CardContent className="flex-1 p-3">
            <div className="space-y-1">
              <h4 className="font-medium text-sm line-clamp-1">
                {movie.title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{releaseYear}</span>
                {showDuration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <IconClock className="h-3 w-3 mr-1" />
                      {formattedDuration}
                    </span>
                  </>
                )}
                {showRating && movie.rating > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <StarIcon className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {movie.overview}
              </p>

              {showProgress && watchProgress > 0 && (
                <div className="w-full bg-muted rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (variant === "list") {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="flex">
          <div className="relative w-32 h-20 flex-shrink-0">
            <Image
              src={imageError ? "/placeholder-movie.jpg" : movie.backdrop}
              alt={movie.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" onClick={handlePlay}>
                <PlayIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{movie.title}</h3>
                  {movie.isPremium && (
                    <Badge variant="secondary" className="h-5">
                      <IconCrown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{releaseYear}</span>
                  {showDuration && (
                    <span className="flex items-center">
                      <IconClock className="h-3 w-3 mr-1" />
                      {formattedDuration}
                    </span>
                  )}
                  {showRating && movie.rating > 0 && (
                    <span className="flex items-center">
                      <StarIcon className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center">
                    <IconEye className="h-3 w-3 mr-1" />
                    {FormatUtils.formatNumber(movie.views)} views
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {movie.overview}
                </p>

                {showGenres && movie.genres && movie.genres.length > 0 && (
                  <div className="flex gap-1">
                    {movie.genres.slice(0, 3).map((genreId) => (
                      <Badge
                        key={genreId.toString()}
                        variant="outline"
                        className="text-xs"
                      >
                        Genre
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {showActions && (
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleWatchlistToggle}
                          disabled={isLoading}
                        >
                          {inWatchlist ? (
                            <IconBookmarkFilled className="h-4 w-4" />
                          ) : (
                            <IconBookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {inWatchlist
                          ? "Remove from watchlist"
                          : "Add to watchlist"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconDots className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handlePlay}>
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Play Movie
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLike}>
                        {isLiked ? (
                          <IconHeartFilled className="h-4 w-4 mr-2" />
                        ) : (
                          <IconHeart className="h-4 w-4 mr-2" />
                        )}
                        {isLiked ? "Unlike" : "Like"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleShare}>
                        <IconShare className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="relative aspect-video">
          <Image
            src={imageError ? "/placeholder-movie.jpg" : movie.backdrop}
            alt={movie.title}
            fill
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {movie.isPremium && (
            <Badge className="absolute top-4 left-4">
              <IconCrown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}

          {showProgress && watchProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div
                className="bg-primary h-full"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              {movie.title}
            </h2>

            <div className="flex items-center gap-4 text-white/90 text-sm mb-3">
              <span>{releaseYear}</span>
              {showDuration && (
                <span className="flex items-center">
                  <IconClock className="h-4 w-4 mr-1" />
                  {formattedDuration}
                </span>
              )}
              {showRating && movie.rating > 0 && (
                <span className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center">
                <IconEye className="h-4 w-4 mr-1" />
                {FormatUtils.formatNumber(movie.views)}
              </span>
            </div>

            <p className="text-white/90 text-sm line-clamp-2 mb-4">
              {movie.overview}
            </p>

            {showActions && (
              <div className="flex items-center gap-2">
                <Button onClick={handlePlay} size="lg">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Play Now
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleWatchlistToggle}
                  disabled={isLoading}
                >
                  {inWatchlist ? (
                    <IconCheck className="h-5 w-5 mr-2" />
                  ) : (
                    <IconPlus className="h-5 w-5 mr-2" />
                  )}
                  {inWatchlist ? "In List" : "My List"}
                </Button>

                <Button variant="ghost" size="lg" onClick={handleLike}>
                  {isLiked ? (
                    <IconHeartFilled className="h-5 w-5 text-red-500" />
                  ) : (
                    <IconHeart className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        "overflow-hidden group cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/movies/${movie._id}`}>
        <div className="relative aspect-[2/3]">
          <Image
            src={imageError ? "/placeholder-movie.jpg" : movie.poster}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority={priority}
            onError={() => setImageError(true)}
          />

          <div
            className={cn(
              "absolute inset-0 bg-black/60 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  handlePlay();
                }}
                className="transform scale-110"
              >
                <PlayIcon className="h-6 w-6 mr-2" />
                Play
              </Button>
            </div>
          </div>

          {movie.isPremium && (
            <Badge className="absolute top-2 left-2">
              <IconCrown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}

          {movie.videoMetadata?.resolution && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              <IconHdr className="h-3 w-3 mr-1" />
              {movie.videoMetadata.resolution.includes("3840") ? "4K" : "HD"}
            </Badge>
          )}

          {showProgress && watchProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div
                className="bg-primary h-full"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold line-clamp-1 flex-1">{movie.title}</h3>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <IconDots className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePlay()}>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Play Movie
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWatchlistToggle}>
                    {inWatchlist ? (
                      <IconBookmarkFilled className="h-4 w-4 mr-2" />
                    ) : (
                      <IconBookmark className="h-4 w-4 mr-2" />
                    )}
                    {inWatchlist ? "Remove from List" : "Add to List"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLike}>
                    {isLiked ? (
                      <IconHeartFilled className="h-4 w-4 mr-2" />
                    ) : (
                      <IconHeart className="h-4 w-4 mr-2" />
                    )}
                    {isLiked ? "Unlike" : "Like"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare}>
                    <IconShare className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{releaseYear}</span>
            {showDuration && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <IconClock className="h-3 w-3 mr-1" />
                  {formattedDuration}
                </span>
              </>
            )}
            {showRating && movie.rating > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <StarIcon className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          {showGenres && movie.genres && movie.genres.length > 0 && (
            <div className="flex gap-1">
              {movie.genres.slice(0, 2).map((genreId) => (
                <Badge
                  key={genreId.toString()}
                  variant="outline"
                  className="text-xs"
                >
                  Genre
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2">
            {movie.overview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized variants
export function MovieCardCompact({
  movie,
  ...props
}: Omit<MovieCardProps, "variant">) {
  return <MovieCard movie={movie} variant="compact" {...props} />;
}

export function MovieCardFeatured({
  movie,
  ...props
}: Omit<MovieCardProps, "variant">) {
  return <MovieCard movie={movie} variant="featured" {...props} />;
}

export function MovieCardList({
  movie,
  ...props
}: Omit<MovieCardProps, "variant">) {
  return <MovieCard movie={movie} variant="list" {...props} />;
}
