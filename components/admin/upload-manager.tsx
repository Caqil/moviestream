"use client";

import { useState, useRef, useCallback } from "react";
import { useAdminContext } from "@/contexts/admin-context";
import { useUpload } from "@/hooks/use-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormatUtils } from "@/utils/format";
import {
  IconUpload,
  IconX,
  IconCheck,
  IconFile,
  IconMovie,
  IconPhoto,
  IconFileText,
  IconTrash,
  IconEye,
  IconDownload,
  IconAlertTriangle,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadItem {
  id: string;
  file: File;
  type: "video" | "image" | "subtitle";
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  url?: string;
  error?: string;
  createdAt: Date;
}

const FILE_TYPES = {
  video: {
    accept: ".mp4,.mov,.avi,.mkv,.webm",
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    icon: IconMovie,
    label: "Video",
  },
  image: {
    accept: ".jpg,.jpeg,.png,.webp",
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: IconPhoto,
    label: "Image",
  },
  subtitle: {
    accept: ".vtt,.srt",
    maxSize: 1024 * 1024, // 1MB
    icon: IconFileText,
    label: "Subtitle",
  },
} as const;

export function UploadManager() {
  const { serviceStatus } = useAdminContext();
  const { uploadFile, isUploading, progress, error, clearError } = useUpload();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const s3Status = serviceStatus.s3;

  const validateFile = (
    file: File,
    type: keyof typeof FILE_TYPES
  ): string | null => {
    const config = FILE_TYPES[type];

    if (file.size > config.maxSize) {
      return `File size exceeds ${FormatUtils.formatFileSize(
        config.maxSize
      )} limit`;
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!config.accept.includes(extension)) {
      return `Invalid file type. Accepted: ${config.accept}`;
    }

    return null;
  };

  const addUpload = useCallback((file: File, type: keyof typeof FILE_TYPES) => {
    const validation = validateFile(file, type);
    if (validation) {
      toast.error(validation);
      return;
    }

    const upload: UploadItem = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      type,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
    };

    setUploads((prev) => [upload, ...prev]);
    return upload.id;
  }, []);

  const startUpload = useCallback(
    async (uploadId: string) => {
      const upload = uploads.find((u) => u.id === uploadId);
      if (!upload) return;

      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, status: "uploading" as const } : u
        )
      );

      try {
        const result = await uploadFile(
          upload.file,
          upload.type,
          (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
            );
          }
        );

        if (result) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? {
                    ...u,
                    status: "completed" as const,
                    progress: 100,
                    url: result.url,
                  }
                : u
            )
          );
          toast.success(`${upload.type} uploaded successfully`);
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  status: "error" as const,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : u
          )
        );
        toast.error(`Failed to upload ${upload.type}`);
      }
    },
    [uploads, uploadFile]
  );

  const removeUpload = useCallback((uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  const retryUpload = useCallback(
    (uploadId: string) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? {
                ...u,
                status: "pending" as const,
                progress: 0,
                error: undefined,
              }
            : u
        )
      );
      startUpload(uploadId);
    },
    [startUpload]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null, type: keyof typeof FILE_TYPES) => {
      if (!files) return;

      Array.from(files).forEach((file) => {
        const uploadId = addUpload(file, type);
        if (uploadId) {
          setTimeout(() => startUpload(uploadId), 100);
        }
      });
    },
    [addUpload, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (!files.length) return;

      // Auto-detect file type based on extension
      Array.from(files).forEach((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        let type: keyof typeof FILE_TYPES = "image";

        if (FILE_TYPES.video.accept.includes(extension)) {
          type = "video";
        } else if (FILE_TYPES.subtitle.accept.includes(extension)) {
          type = "subtitle";
        } else if (FILE_TYPES.image.accept.includes(extension)) {
          type = "image";
        }

        const uploadId = addUpload(file, type);
        if (uploadId) {
          setTimeout(() => startUpload(uploadId), 100);
        }
      });
    },
    [addUpload, startUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const getStatusIcon = (status: UploadItem["status"]) => {
    switch (status) {
      case "pending":
        return <IconClock className="h-4 w-4 text-muted-foreground" />;
      case "uploading":
        return <IconUpload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "completed":
        return <IconCheck className="h-4 w-4 text-green-500" />;
      case "error":
        return <IconAlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: UploadItem["status"]) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "Pending" },
      uploading: { variant: "default" as const, label: "Uploading" },
      completed: { variant: "default" as const, label: "Completed" },
      error: { variant: "destructive" as const, label: "Error" },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!s3Status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Manager</CardTitle>
          <CardDescription>Upload and manage your media files.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              S3 storage must be configured and connected before you can upload
              files. Please configure S3 settings first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Upload videos, images, and subtitle files to your S3 storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border",
              "hover:border-primary/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {Object.entries(FILE_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={type} className="p-2 rounded-lg bg-muted/50">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">
                  Drop files here or click to upload
                </h3>
                <p className="text-sm text-muted-foreground">
                  Supports videos (MP4, MOV, AVI, MKV), images (JPG, PNG, WebP),
                  and subtitles (VTT, SRT)
                </p>
              </div>

              <div className="flex gap-2">
                {Object.entries(FILE_TYPES).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = config.accept;
                      input.multiple = true;
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        handleFileSelect(
                          target.files,
                          type as keyof typeof FILE_TYPES
                        );
                      };
                      input.click();
                    }}
                  >
                    <config.icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Max sizes: Videos (2GB), Images (10MB), Subtitles (1MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upload Queue</CardTitle>
                <CardDescription>
                  {uploads.length} file{uploads.length !== 1 ? "s" : ""} in
                  queue
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploads([])}
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => {
                const Icon = FILE_TYPES[upload.type].icon;

                return (
                  <div
                    key={upload.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium truncate">
                            {upload.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {FormatUtils.formatFileSize(upload.file.size)}
                            </span>
                            <span>•</span>
                            <span>{FormatUtils.capitalize(upload.type)}</span>
                            <span>•</span>
                            <span>
                              {FormatUtils.getRelativeTime(upload.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(upload.status)}
                          {getStatusBadge(upload.status)}
                        </div>
                      </div>

                      {upload.status === "uploading" && (
                        <Progress value={upload.progress} className="h-2" />
                      )}

                      {upload.error && (
                        <p className="text-sm text-red-500">{upload.error}</p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <IconFile className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {upload.status === "completed" && upload.url && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(upload.url, "_blank")
                                }
                              >
                                <IconEye className="h-4 w-4 mr-2" />
                                View File
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(upload.url!);
                                  toast.success("URL copied to clipboard");
                                }}
                              >
                                <IconDownload className="h-4 w-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {upload.status === "error" && (
                            <DropdownMenuItem
                              onClick={() => retryUpload(upload.id)}
                            >
                              <IconRefresh className="h-4 w-4 mr-2" />
                              Retry Upload
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => removeUpload(upload.id)}
                          >
                            <IconX className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Statistics</CardTitle>
          <CardDescription>Overview of your uploaded files.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Total Files</Label>
              <p className="text-2xl font-bold">{uploads.length}</p>
            </div>
            <div className="space-y-2">
              <Label>Completed</Label>
              <p className="text-2xl font-bold text-green-600">
                {uploads.filter((u) => u.status === "completed").length}
              </p>
            </div>
            <div className="space-y-2">
              <Label>In Progress</Label>
              <p className="text-2xl font-bold text-blue-600">
                {uploads.filter((u) => u.status === "uploading").length}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Failed</Label>
              <p className="text-2xl font-bold text-red-600">
                {uploads.filter((u) => u.status === "error").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
