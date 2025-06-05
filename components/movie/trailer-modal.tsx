"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconVolume,
  IconVolume2,
  IconMaximize,
  IconX,
  IconLoader,
  IconAlertTriangle,
  IconRefresh,
  IconShare,
  IconDownload,
  IconResize,
} from "@tabler/icons-react";
import { FormatUtils } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ExpandIcon, FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, VolumeXIcon } from "lucide-react";

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trailerUrl: string;
  movieTitle: string;
  autoplay?: boolean;
  startTime?: number;
  className?: string;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  buffered: number;
}

export function TrailerModal({
  open,
  onOpenChange,
  trailerUrl,
  movieTitle,
  autoplay = true,
  startTime = 0,
  className,
  onEnded,
  onProgress,
}: TrailerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isLoading: true,
    error: null,
    buffered: 0,
  });

  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  // Determine if URL is YouTube
  const isYouTube =
    trailerUrl.includes("youtube.com") || trailerUrl.includes("youtu.be");
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match?.[1];
  };

  const youtubeId = isYouTube ? getYouTubeId(trailerUrl) : null;
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=${
        autoplay ? 1 : 0
      }&start=${startTime}&rel=0&modestbranding=1`
    : null;

  // Setup video event listeners for direct video files
  useEffect(() => {
    if (!open || isYouTube || !videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: video.duration,
        isLoading: false,
      }));

      if (startTime > 0) {
        video.currentTime = startTime;
      }

      if (autoplay) {
        video.play().catch((error) => {
          setState((prev) => ({
            ...prev,
            error: "Failed to autoplay trailer",
            isLoading: false,
          }));
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const currentTime = video.currentTime;
        const duration = video.duration;

        setState((prev) => ({ ...prev, currentTime }));

        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          onProgress?.(progress);
        }
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = (video.buffered.end(0) / video.duration) * 100;
        setState((prev) => ({ ...prev, buffered }));
      }
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleError = () => {
      setState((prev) => ({
        ...prev,
        error: "Failed to load trailer",
        isLoading: false,
      }));
    };

    const handleVolumeChange = () => {
      setState((prev) => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted,
      }));
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [open, isYouTube, startTime, autoplay, isDragging, onProgress, onEnded]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open || isYouTube) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (state.isFullscreen) {
            exitFullscreen();
          } else {
            onOpenChange(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isYouTube, state.isFullscreen]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls || isYouTube) return;

    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, state.isPlaying, isDragging, isYouTube]);

  // Player controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        toast.error("Failed to play trailer");
      });
    }
  }, [state.isPlaying]);

  const seek = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;

      const newTime = Math.max(
        0,
        Math.min(state.duration, state.currentTime + seconds)
      );
      videoRef.current.currentTime = newTime;
    },
    [state.currentTime, state.duration]
  );

  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = time;
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const changeVolume = useCallback(
    (delta: number) => {
      if (!videoRef.current) return;

      const newVolume = Math.max(0, Math.min(1, state.volume + delta));
      videoRef.current.volume = newVolume;

      if (newVolume > 0 && state.isMuted) {
        videoRef.current.muted = false;
      }
    },
    [state.volume, state.isMuted]
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (!videoRef.current) return;

      videoRef.current.volume = volume;
      if (volume > 0 && state.isMuted) {
        videoRef.current.muted = false;
      }
    },
    [state.isMuted]
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = !state.isMuted;
  }, [state.isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (state.isFullscreen) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      toast.error("Fullscreen not supported");
    }
  }, [state.isFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  const handleProgressDrag = (value: number[]) => {
    const time = (value[0] / 100) * state.duration;
    setDragTime(time);
    setIsDragging(true);
  };

  const handleProgressDragEnd = (value: number[]) => {
    const time = (value[0] / 100) * state.duration;
    seekTo(time);
    setIsDragging(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movieTitle} - Trailer`,
          url: trailerUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(trailerUrl);
      toast.success("Trailer link copied to clipboard");
    }
  };

  const formatTime = (seconds: number) => {
    return FormatUtils.formatVideoDuration(seconds);
  };

  const progressPercent =
    state.duration > 0
      ? ((isDragging ? dragTime : state.currentTime) / state.duration) * 100
      : 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black" hideCloseButton>
        <div
          ref={containerRef}
          className={cn(
            "relative w-full aspect-video bg-black flex items-center justify-center",
            className
          )}
          onMouseMove={() => !isYouTube && setShowControls(true)}
          onMouseLeave={() =>
            !isYouTube && state.isPlaying && setShowControls(false)
          }
        >
          {/* YouTube Embed */}
          {isYouTube && youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={`${movieTitle} Trailer`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* Direct Video */}
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={trailerUrl}
                preload="metadata"
                crossOrigin="anonymous"
                onClick={togglePlay}
              />

              {/* Loading Overlay */}
              {state.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <IconLoader className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading trailer...</p>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {state.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white space-y-4">
                    <IconAlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Trailer Unavailable
                      </h3>
                      <p>{state.error}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Controls Overlay */}
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  showControls ? "opacity-100" : "opacity-0"
                )}
              >
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white text-lg font-semibold">
                      {movieTitle} - Trailer
                    </h2>

                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShare}
                              className="text-white hover:bg-white/20"
                            >
                              <IconShare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Share Trailer</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-white hover:bg-white/20"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Center Play Button */}
                {!state.isPlaying && !state.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={togglePlay}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 w-20 h-20 rounded-full"
                    >
                      <PlayIcon className="h-8 w-8" />
                    </Button>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>
                          {formatTime(
                            isDragging ? dragTime : state.currentTime
                          )}
                        </span>
                        <span>{formatTime(state.duration)}</span>
                      </div>

                      <div className="relative">
                        {/* Buffer Progress */}
                        <div className="absolute inset-0 bg-white/20 rounded-full h-1">
                          <div
                            className="bg-white/40 h-full rounded-full"
                            style={{ width: `${state.buffered}%` }}
                          />
                        </div>

                        {/* Seek Progress */}
                        <Slider
                          value={[progressPercent]}
                          onValueChange={handleProgressDrag}
                          onValueCommit={handleProgressDragEnd}
                          max={100}
                          step={0.1}
                          className="relative"
                        />
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Play/Pause */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlay}
                          className="text-white hover:bg-white/20"
                        >
                          {state.isPlaying ? (
                            <PauseIcon className="h-5 w-5" />
                          ) : (
                            <PlayIcon className="h-5 w-5" />
                          )}
                        </Button>

                        {/* Skip Backward */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => seek(-10)}
                          className="text-white hover:bg-white/20"
                        >
                          <RewindIcon className="h-4 w-4" />
                        </Button>

                        {/* Skip Forward */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => seek(10)}
                          className="text-white hover:bg-white/20"
                        >
                          <FastForwardIcon className="h-4 w-4" />
                        </Button>

                        {/* Volume */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {state.isMuted || state.volume === 0 ? (
                              <VolumeXIcon className="h-4 w-4" />
                            ) : state.volume < 0.5 ? (
                              <IconVolume className="h-4 w-4" />
                            ) : (
                              <IconVolume2 className="h-4 w-4" />
                            )}
                          </Button>

                          <Slider
                            value={[state.isMuted ? 0 : state.volume * 100]}
                            onValueChange={(value: number[]) => setVolume(value[0] / 100)}
                            max={100}
                            step={1}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Fullscreen */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleFullscreen}
                          className="text-white hover:bg-white/20"
                        >
                          {state.isFullscreen ? (
                            <IconResize className="h-4 w-4" />
                          ) : (
                            <ExpandIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Close Button for YouTube */}
          {isYouTube && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 text-white hover:bg-black/50 z-10"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
