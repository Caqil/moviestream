"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { useMovies } from "@/hooks/use-movies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconDownload,
  IconClock,
  IconCalendar,
  IconStar,
  IconEye,
  IconThumbUp,
  IconThumbDown,
  IconCrown,
  IconWorld,
  IconUser,
  IconDevices,
  IconVolume,
  IconHdr,
} from "@tabler/icons-react";
import { TrailerModal } from "./trailer-modal";
import { MoviePlayer } from "./movie-player";
import { FormatUtils } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Movie, Genre } from "@/types";
import { InfoIcon, PlayIcon, XIcon } from "lucide-react";

interface MovieDetailsProps {
  movie: Movie;
  genres?: Genre[];
  similarMovies?: Movie[];
  className?: string;
  onPlay?: (movie: Movie) => void;
  onClose?: () => void;
  showSimilar?: boolean;
  showCast?: boolean;
  showTechnicalInfo?: boolean;
  inWatchlist?: boolean;
  isLiked?: boolean;
  watchProgress?: number;
  userRating?: number;
}

interface MovieStats {
  views: number;
  likes: number;
  dislikes: number;
  rating: number;
  totalRatings: number;
}

export function MovieDetails({
  movie,
  genres = [],
  similarMovies = [],
  className,
  onPlay,
  onClose,
  showSimilar = true,
  showCast = true,
  showTechnicalInfo = true,
  inWatchlist = false,
  isLiked = false,
  watchProgress = 0,
  userRating = 0,
}: MovieDetailsProps) {
  const { checkAccess, isSubscribed } = useSubscriptionContext();
  const { addToWatchlist, removeFromWatchlist, rateMovie } = useMovies();

  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(inWatchlist);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [userRatingState, setUserRatingState] = useState(userRating);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [stats, setStats] = useState<MovieStats>({
    views: movie.views,
    likes: movie.likes,
    dislikes: movie.dislikes,
    rating: movie.rating,
    totalRatings: 0,
  });

  const releaseYear = new Date(movie.releaseDate).getFullYear();
  const formattedDuration = FormatUtils.formatVideoDuration(
    movie.duration * 60
  );
  const movieGenres = genres.filter((g) =>
    movie.genres.some((mg) => mg.toString() === g._id.toString())
  );

  const hasAccess = async () => {
    if (!movie.isPremium) return true;
    return await checkAccess(movie._id.toString());
  };

  const handlePlay = async () => {
    const canAccess = await hasAccess();
    if (!canAccess) {
      toast.error("Subscription required", {
        description: "This movie requires an active subscription to watch.",
      });
      return;
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

  const handleRating = async (rating: number) => {
    try {
      await rateMovie(movie._id.toString(), rating);
      setUserRatingState(rating);

      if (rating >= 7) {
        setIsLikedState(true);
        setStats((prev) => ({ ...prev, likes: prev.likes + 1 }));
      }

      toast.success("Rating submitted");
    } catch (error) {
      toast.error("Failed to submit rating");
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

  const canDownload = isSubscribed && movie.isPremium;

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {/* Hero Section */}
        <div className="relative">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={imageError ? "/placeholder-movie.jpg" : movie.backdrop}
              alt={movie.title}
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" onClick={handlePlay} className="scale-125">
                <PlayIcon className="h-8 w-8 mr-3" />
                Play Movie
              </Button>
            </div>

            {/* Progress Bar */}
            {watchProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0">
                <Progress value={watchProgress} className="h-2 rounded-none" />
                <div className="text-xs text-white/90 p-2">
                  Continue watching • {Math.round(watchProgress)}% complete
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Movie Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{movie.title}</h1>
                  {movie.originalTitle &&
                    movie.originalTitle !== movie.title && (
                      <p className="text-lg text-muted-foreground">
                        Original: {movie.originalTitle}
                      </p>
                    )}
                  {movie.tagline && (
                    <p className="text-lg italic text-muted-foreground">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>

                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4" />
                  <span>{releaseYear}</span>
                </div>

                <div className="flex items-center gap-1">
                  <IconClock className="h-4 w-4" />
                  <span>{formattedDuration}</span>
                </div>

                <div className="flex items-center gap-1">
                  <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <IconEye className="h-4 w-4" />
                  <span>{FormatUtils.formatNumber(stats.views)} views</span>
                </div>

                {movie.isPremium && (
                  <Badge>
                    <IconCrown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}

                <Badge variant="outline">
                  <IconHdr className="h-3 w-3 mr-1" />
                  {movie.videoMetadata?.resolution?.includes("3840")
                    ? "4K"
                    : "HD"}
                </Badge>
              </div>

              {/* Genres */}
              {movieGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movieGenres.map((genre) => (
                    <Badge key={genre._id.toString()} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handlePlay}>
                <PlayIcon className="h-5 w-5 mr-2" />
                Play Now
              </Button>

              {movie.trailer && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowTrailer(true)}
                >
                  <InfoIcon className="h-5 w-5 mr-2" />
                  Trailer
                </Button>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWatchlistToggle}
                      disabled={isLoading}
                    >
                      {isInWatchlist ? (
                        <IconBookmarkFilled className="h-5 w-5" />
                      ) : (
                        <IconBookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isInWatchlist
                      ? "Remove from watchlist"
                      : "Add to watchlist"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="lg" onClick={handleShare}>
                      <IconShare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share movie</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {canDownload && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="lg">
                        <IconDownload className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Download for offline viewing
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Plot</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview}
              </p>
            </div>

            {/* Cast */}
            {showCast && movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {movie.cast.slice(0, 8).map((actor, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <IconUser className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Information */}
            {showTechnicalInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Video</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>
                          Resolution: {movie.videoMetadata?.resolution || "N/A"}
                        </div>
                        <div>
                          Format:{" "}
                          {movie.videoMetadata?.format?.toUpperCase() || "N/A"}
                        </div>
                        <div>
                          Codec:{" "}
                          {movie.videoMetadata?.codec?.toUpperCase() || "N/A"}
                        </div>
                        {movie.videoMetadata?.bitrate && (
                          <div>
                            Bitrate:{" "}
                            {FormatUtils.formatFileSize(
                              movie.videoMetadata.bitrate * 1000
                            )}
                            /s
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Audio</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>
                          Codec:{" "}
                          {movie.videoMetadata?.audioCodec?.toUpperCase() ||
                            "N/A"}
                        </div>
                        <div>Language: {movie.language.toUpperCase()}</div>
                        {movie.subtitles && movie.subtitles.length > 0 && (
                          <div>
                            Subtitles: {movie.subtitles.length} languages
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">File Info</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>
                          Size:{" "}
                          {FormatUtils.formatFileSize(
                            movie.videoMetadata?.fileSize || 0
                          )}
                        </div>
                        <div>
                          Quality:{" "}
                          {movie.videoMetadata?.resolution?.includes("3840")
                            ? "4K Ultra HD"
                            : "HD"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Production</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Country: {movie.country}</div>
                        {movie.director && (
                          <div>Director: {movie.director}</div>
                        )}
                        {movie.imdbId && (
                          <div>
                            <a
                              href={`https://www.imdb.com/title/${movie.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View on IMDb
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate This Movie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Your Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(rating)}
                        className={cn(
                          "p-1",
                          userRatingState >= rating
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      >
                        <IconStar
                          className={cn(
                            "h-4 w-4",
                            userRatingState >= rating && "fill-current"
                          )}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Community Rating:</span>
                    <span className="font-medium">
                      {movie.rating.toFixed(1)}/10
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <IconThumbUp className="h-4 w-4" />
                      <span>{FormatUtils.formatNumber(stats.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconThumbDown className="h-4 w-4" />
                      <span>{FormatUtils.formatNumber(stats.dislikes)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Movie Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Views</span>
                  <span className="font-medium">
                    {FormatUtils.formatNumber(stats.views)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Release Date</span>
                  <span className="font-medium">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="font-medium">{formattedDuration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Language</span>
                  <span className="font-medium">
                    {movie.language.toUpperCase()}
                  </span>
                </div>

                {movie.keywords && movie.keywords.length > 0 && (
                  <div className="pt-2">
                    <span className="text-sm font-medium">Keywords</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {movie.keywords.slice(0, 6).map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Movies */}
            {showSimilar && similarMovies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">More Like This</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {similarMovies.slice(0, 5).map((similarMovie) => (
                        <div
                          key={similarMovie._id.toString()}
                          className="flex space-x-3"
                        >
                          <div className="relative w-16 h-24 flex-shrink-0">
                            <Image
                              src={similarMovie.poster}
                              alt={similarMovie.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {similarMovie.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(similarMovie.releaseDate).getFullYear()}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {similarMovie.overview}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
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
          startTime={
            watchProgress ? (movie.duration * 60 * watchProgress) / 100 : 0
          }
        />
      )}
    </>
  );
}
