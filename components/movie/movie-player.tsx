"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconVolume,
  IconVolume2,
  IconMaximize,
  IconMinimize,
  IconSettings,
  IconPictureInPicture,
  IconX,
  IconLoader,
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconShare,
  IconBookmark,
  IconResize,
} from "@tabler/icons-react";
import { SubtitleSelector } from "./subtitle-selector";
import { FormatUtils } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Movie, Subtitle } from "@/types";
import { CrownIcon, ExpandIcon, FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, VolumeXIcon } from "lucide-react";

interface MoviePlayerProps {
  movie: Movie;
  open: boolean;
  onClose: () => void;
  startTime?: number; // in seconds
  autoplay?: boolean;
  onProgress?: (progress: number) => void; // 0-100
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
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
  playbackRate: number;
  quality: string;
  subtitles: {
    enabled: boolean;
    language?: string;
    track?: Subtitle;
  };
}

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const qualities = ["auto", "360p", "480p", "720p", "1080p", "4k"];

export function MoviePlayer({
  movie,
  open,
  onClose,
  startTime = 0,
  autoplay = true,
  onProgress,
  onTimeUpdate,
  onEnded,
  className,
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressUpdateRef = useRef<NodeJS.Timeout>();

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
    playbackRate: 1,
    quality: "auto",
    subtitles: {
      enabled: false,
    },
  });

  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

  // Load video metadata and setup
  useEffect(() => {
    if (!open || !videoRef.current) return;

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
            error: "Failed to autoplay video",
            isLoading: false,
          }));
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const currentTime = video.currentTime;
        const duration = video.duration;

        setState((prev) => ({
          ...prev,
          currentTime,
        }));

        onTimeUpdate?.(currentTime, duration);

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
        error: "Failed to load video",
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
  }, [
    open,
    startTime,
    autoplay,
    isDragging,
    onTimeUpdate,
    onProgress,
    onEnded,
  ]);

  // Fetch subtitles
  useEffect(() => {
    if (!open || !movie.subtitles?.length) return;

    const fetchSubtitles = async () => {
      try {
        const response = await fetch(`/api/movies/${movie._id}/subtitles`);
        if (response.ok) {
          const data = await response.json();
          setSubtitles(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch subtitles:", error);
      }
    };

    fetchSubtitles();
  }, [open, movie._id, movie.subtitles]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

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
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, state.isFullscreen]);

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
    if (!showControls) return;

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
  }, [showControls, state.isPlaying, isDragging]);

  // Player controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        toast.error("Failed to play video");
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

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * state.duration;
    seekTo(time);
  };

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

  const handleSubtitleChange = (subtitle?: Subtitle) => {
    setState((prev) => ({
      ...prev,
      subtitles: {
        enabled: !!subtitle,
        language: subtitle?.languageCode,
        track: subtitle,
      },
    }));

    // Update video subtitle track
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = "hidden";
      }

      if (subtitle) {
        // Load subtitle track
        const track = videoRef.current.querySelector(
          `track[src="${subtitle.url}"]`
        ) as HTMLTrackElement;
        if (track?.track) {
          track.track.mode = "showing";
        }
      }
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
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-none w-screen h-screen p-0 bg-black"
        hideCloseButton
      >
        <div
          ref={containerRef}
          className={cn(
            "relative w-full h-full bg-black flex items-center justify-center",
            className
          )}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => state.isPlaying && setShowControls(false)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={movie.videoUrl}
            poster={movie.backdrop}
            preload="metadata"
            crossOrigin="anonymous"
            onClick={togglePlay}
          >
            {/* Subtitle Tracks */}
            {subtitles.map((subtitle) => (
              <track
                key={subtitle._id.toString()}
                kind="subtitles"
                src={subtitle.url}
                srcLang={subtitle.languageCode}
                label={subtitle.label}
                default={subtitle.isDefault}
              />
            ))}
          </video>

          {/* Loading Overlay */}
          {state.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <IconLoader className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading video...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {state.error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white space-y-4">
                <IconAlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Playback Error</h3>
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
                <div className="flex items-center space-x-4">
                  <h2 className="text-white text-lg font-semibold">
                    {movie.title}
                  </h2>
                  {movie.isPremium && (
                    <Badge>
                      <CrownIcon className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <IconBookmark className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add to Watchlist</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <IconShare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
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
                      {formatTime(isDragging ? dragTime : state.currentTime)}
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
                    {/* Subtitles */}
                    {subtitles.length > 0 && (
                      <SubtitleSelector
                        subtitles={subtitles}
                        selectedSubtitle={state.subtitles.track}
                        onSubtitleChange={handleSubtitleChange}
                      />
                    )}

                    {/* Settings */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <IconSettings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="p-2 space-y-2">
                          <div>
                            <label className="text-sm font-medium">
                              Playback Speed
                            </label>
                            <Select
                              value={state.playbackRate.toString()}
                              onValueChange={(value: string) =>
                                changePlaybackRate(parseFloat(value))
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {playbackRates.map((rate) => (
                                  <SelectItem
                                    key={rate}
                                    value={rate.toString()}
                                  >
                                    {rate}x
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Quality
                            </label>
                            <Select
                              value={state.quality}
                              onValueChange={(value: any) =>
                                setState((prev) => ({
                                  ...prev,
                                  quality: value,
                                }))
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {qualities.map((quality) => (
                                  <SelectItem key={quality} value={quality}>
                                    {quality.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Picture in Picture */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                videoRef.current &&
                                "requestPictureInPicture" in videoRef.current
                              ) {
                                (
                                  videoRef.current as any
                                ).requestPictureInPicture();
                              }
                            }}
                            className="text-white hover:bg-white/20"
                          >
                            <IconPictureInPicture className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Picture in Picture</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
