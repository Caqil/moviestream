"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconUpload,
  IconX,
  IconMovie,
  IconLoader,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconTrash,
  IconVideo,
  IconClock,
  IconDatabase,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import { PauseIcon, PlayIcon, VideoIcon } from "lucide-react";

interface VideoUploadProps {
  value?: string;
  onChange?: (url: string, metadata?: VideoMetadata) => void;
  onRemove?: () => void;
  placeholder?: string;
  maxSize?: number; // in bytes
  accept?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
  showMetadata?: boolean;
  allowMultiple?: boolean;
  className?: string;
  onMetadataExtracted?: (metadata: VideoMetadata) => void;
}

interface VideoMetadata {
  duration?: number;
  resolution?: string;
  format?: string;
  codec?: string;
  audioCodec?: string;
  fileSize: number;
  bitrate?: number;
  fps?: number;
}

interface UploadedVideo {
  id: string;
  url: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
  metadata?: VideoMetadata;
  thumbnail?: string;
}

const SUPPORTED_FORMATS = {
  "video/mp4": { label: "MP4", maxSize: 5 * 1024 * 1024 * 1024 }, // 5GB
  "video/quicktime": { label: "MOV", maxSize: 5 * 1024 * 1024 * 1024 },
  "video/x-msvideo": { label: "AVI", maxSize: 5 * 1024 * 1024 * 1024 },
  "video/x-matroska": { label: "MKV", maxSize: 5 * 1024 * 1024 * 1024 },
  "video/webm": { label: "WebM", maxSize: 5 * 1024 * 1024 * 1024 },
};

export function VideoUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Click to upload a video file",
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  accept = "video/*",
  disabled = false,
  showPreview = true,
  showProgress = true,
  showMetadata = true,
  allowMultiple = false,
  className,
  onMetadataExtracted,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [currentVideoPlaying, setCurrentVideoPlaying] = useState<string | null>(
    null
  );
  const { uploadVideo, isUploading, progress } = useUpload();

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${FormatUtils.formatFileSize(
          maxSize
        )}`;
      }

      // Check file type
      if (!(file.type in SUPPORTED_FORMATS)) {
        return `Unsupported format. Supported formats: ${Object.values(
          SUPPORTED_FORMATS
        )
          .map((f) => f.label)
          .join(", ")}`;
      }

      // Check specific format size limits
      const formatConfig =
        SUPPORTED_FORMATS[file.type as keyof typeof SUPPORTED_FORMATS];
      if (file.size > formatConfig.maxSize) {
        return `${
          formatConfig.label
        } files must be less than ${FormatUtils.formatFileSize(
          formatConfig.maxSize
        )}`;
      }

      return null;
    },
    [maxSize]
  );

  const extractVideoMetadata = useCallback(
    async (file: File): Promise<VideoMetadata> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          const metadata: VideoMetadata = {
            duration: video.duration,
            resolution: `${video.videoWidth}x${video.videoHeight}`,
            format: file.type.split("/")[1]?.toUpperCase(),
            fileSize: file.size,
            // Note: More detailed metadata would require server-side processing
          };

          URL.revokeObjectURL(url);
          resolve(metadata);
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({
            fileSize: file.size,
            format: file.type.split("/")[1]?.toUpperCase(),
          });
        };

        video.src = url;
      });
    },
    []
  );

  const generateThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const url = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = Math.min(5, video.duration / 4); // Thumbnail at 25% or 5 seconds
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
          URL.revokeObjectURL(url);
          resolve(thumbnail);
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Video load error"));
      };

      video.src = url;
    });
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      const filesToProcess = allowMultiple ? Array.from(files) : [files[0]];

      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          toast.error("Invalid file", { description: validationError });
          continue;
        }

        const videoId = Math.random().toString(36).substr(2, 9);
        const newVideo: UploadedVideo = {
          id: videoId,
          url: URL.createObjectURL(file),
          file,
          progress: 0,
          status: "uploading",
        };

        setVideos((prev) => [...prev, newVideo]);

        try {
          // Extract metadata
          const metadata = await extractVideoMetadata(file);
          setVideos((prev) =>
            prev.map((video) =>
              video.id === videoId ? { ...video, metadata } : video
            )
          );

          // Generate thumbnail
          try {
            const thumbnail = await generateThumbnail(file);
            setVideos((prev) =>
              prev.map((video) =>
                video.id === videoId ? { ...video, thumbnail } : video
              )
            );
          } catch (error) {
            console.warn("Thumbnail generation failed:", error);
          }

          // Upload video
          const result = await uploadVideo(file, (progressPercent) => {
            setVideos((prev) =>
              prev.map((video) =>
                video.id === videoId
                  ? { ...video, progress: progressPercent }
                  : video
              )
            );
          });

          if (result) {
            setVideos((prev) =>
              prev.map((video) =>
                video.id === videoId
                  ? {
                      ...video,
                      status: "completed" as const,
                      url: result.url,
                      progress: 100,
                    }
                  : video
              )
            );

            if (!allowMultiple) {
              onChange?.(result.url, metadata);
            }

            onMetadataExtracted?.(metadata);
            toast.success("Video uploaded successfully");
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          setVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? { ...video, status: "error" as const, error: "Upload failed" }
                : video
            )
          );
          toast.error("Upload failed");
        }
      }
    },
    [
      allowMultiple,
      validateFile,
      extractVideoMetadata,
      generateThumbnail,
      uploadVideo,
      onChange,
      onMetadataExtracted,
    ]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveVideo = useCallback(
    (videoId: string) => {
      const video = videos.find((v) => v.id === videoId);
      if (video) {
        URL.revokeObjectURL(video.url);
      }
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (!allowMultiple && value) {
        onRemove?.();
      }
    },
    [videos, allowMultiple, value, onRemove]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const toggleVideoPlayback = (videoId: string) => {
    if (currentVideoPlaying === videoId) {
      setCurrentVideoPlaying(null);
    } else {
      setCurrentVideoPlaying(videoId);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      videos.forEach((video) => {
        if (video.url.startsWith("blob:")) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [videos]);

  // Show existing video if provided
  if (value && !allowMultiple && videos.length === 0) {
    return (
      <div className={cn("relative group", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconVideo className="h-5 w-5" />
              Uploaded Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showPreview && (
                <video
                  controls
                  className="w-full max-h-64 rounded-lg bg-black"
                  src={value}
                  preload="metadata"
                />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <IconCheck className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(value, "_blank")}
                  >
                    <IconEye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onRemove}
                    disabled={disabled}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-colors min-h-[200px]",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            {isUploading ? (
              <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <VideoIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <h3 className="text-lg font-medium mb-2">
            {isUploading ? "Uploading video..." : placeholder}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            {allowMultiple
              ? "Select multiple video files or drag and drop"
              : "or drag and drop a video file"}
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Object.entries(SUPPORTED_FORMATS).map(([type, config]) => (
              <Badge key={type} variant="outline">
                {config.label}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Maximum file size: {FormatUtils.formatFileSize(maxSize)}
          </p>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Progress Bar */}
      {showProgress && isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {progress}% uploaded
          </p>
        </div>
      )}

      {/* Video Previews */}
      {videos.length > 0 && (
        <div className="space-y-4">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconMovie className="h-4 w-4" />
                    {video.file.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {video.status === "uploading" && (
                      <Badge variant="secondary">
                        <IconLoader className="h-3 w-3 mr-1 animate-spin" />
                        Uploading {video.progress}%
                      </Badge>
                    )}
                    {video.status === "processing" && (
                      <Badge variant="secondary">
                        <IconSettings className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    {video.status === "completed" && (
                      <Badge variant="default">
                        <IconCheck className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {video.status === "error" && (
                      <Badge variant="destructive">
                        <IconAlertTriangle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveVideo(video.id)}
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                {showPreview && video.thumbnail && (
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt="Video thumbnail"
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full"
                      onClick={() => toggleVideoPlayback(video.id)}
                    >
                      {currentVideoPlaying === video.id ? (
                        <PauseIcon className="h-6 w-6" />
                      ) : (
                        <PlayIcon className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Video Player (when playing) */}
                {currentVideoPlaying === video.id && (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full max-h-64 rounded-lg bg-black"
                    src={video.url}
                    onEnded={() => setCurrentVideoPlaying(null)}
                  />
                )}

                {/* Progress Bar */}
                {video.status === "uploading" && (
                  <Progress value={video.progress} className="h-2" />
                )}

                {/* Metadata */}
                {showMetadata && video.metadata && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {video.metadata.duration && (
                      <div className="flex items-center gap-1">
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {FormatUtils.formatVideoDuration(
                            video.metadata.duration
                          )}
                        </span>
                      </div>
                    )}
                    {video.metadata.resolution && (
                      <div className="flex items-center gap-1">
                        <IconSettings className="h-4 w-4 text-muted-foreground" />
                        <span>{video.metadata.resolution}</span>
                      </div>
                    )}
                    {video.metadata.format && (
                      <div className="flex items-center gap-1">
                        <VideoIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{video.metadata.format}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <IconDatabase className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {FormatUtils.formatFileSize(video.metadata.fileSize)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {video.error && (
                  <Alert variant="destructive">
                    <IconAlertTriangle className="h-4 w-4" />
                    <AlertDescription>{video.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Specialized video upload components
export function MovieVideoUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  onMetadataExtracted,
}: Pick<
  VideoUploadProps,
  | "value"
  | "onChange"
  | "onRemove"
  | "disabled"
  | "className"
  | "onMetadataExtracted"
>) {
  return (
    <div className="space-y-2">
      <Label>Movie Video File</Label>
      <VideoUpload
        value={value}
        onChange={onChange}
        onRemove={onRemove}
        disabled={disabled}
        placeholder="Upload the main movie file"
        maxSize={5 * 1024 * 1024 * 1024} // 5GB
        showMetadata={true}
        onMetadataExtracted={onMetadataExtracted}
        className={className}
      />
      <p className="text-xs text-muted-foreground">
        Recommended: MP4 format, H.264 codec, 1080p or higher resolution
      </p>
    </div>
  );
}

export function TrailerUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: Pick<
  VideoUploadProps,
  "value" | "onChange" | "onRemove" | "disabled" | "className"
>) {
  return (
    <div className="space-y-2">
      <Label>Movie Trailer (Optional)</Label>
      <VideoUpload
        value={value}
        onChange={onChange}
        onRemove={onRemove}
        disabled={disabled}
        placeholder="Upload movie trailer"
        maxSize={500 * 1024 * 1024} // 500MB
        showMetadata={false}
        className={className}
      />
      <p className="text-xs text-muted-foreground">
        Short preview video (recommended: 30 seconds to 3 minutes)
      </p>
    </div>
  );
}
