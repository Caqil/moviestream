"use client";

import React, { useState, useRef, useCallback } from "react";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconUpload,
  IconX,
  IconLoader,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconTrash,
  IconCamera,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  maxSize?: number; // in bytes
  accept?: string;
  disabled?: boolean;
  variant?: "default" | "avatar" | "banner" | "thumbnail";
  showPreview?: boolean;
  showProgress?: boolean;
  multiple?: boolean;
  className?: string;
}

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Click to upload an image",
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "image/*",
  disabled = false,
  variant = "default",
  showPreview = true,
  showProgress = true,
  multiple = false,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const { uploadImage, isUploading, progress } = useUpload();

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `File size must be less than ${FormatUtils.formatFileSize(
          maxSize
        )}`;
      }

      if (accept && !file.type.match(accept.replace("*", ".*"))) {
        return "Please select a valid image file";
      }

      return null;
    },
    [maxSize, accept]
  );

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      const filesToProcess = multiple ? Array.from(files) : [files[0]];

      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          toast.error("Invalid file", { description: validationError });
          continue;
        }

        const imageId = Math.random().toString(36).substr(2, 9);
        const newImage: UploadedImage = {
          id: imageId,
          url: URL.createObjectURL(file),
          file,
          progress: 0,
          status: "uploading",
        };

        setImages((prev) => [...prev, newImage]);

        try {
          const result = await uploadImage(file, (progressPercent) => {
            setImages((prev) =>
              prev.map((img) =>
                img.id === imageId ? { ...img, progress: progressPercent } : img
              )
            );
          });

          if (result) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      status: "completed" as const,
                      url: result.url,
                      progress: 100,
                    }
                  : img
              )
            );

            if (!multiple) {
              onChange?.(result.url);
            }

            toast.success("Image uploaded successfully");
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? { ...img, status: "error" as const, error: "Upload failed" }
                : img
            )
          );
          toast.error("Upload failed");
        }
      }
    },
    [multiple, validateFile, uploadImage, onChange]
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

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      if (!multiple && value) {
        onRemove?.();
      }
    },
    [multiple, value, onRemove]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const getVariantStyles = () => {
    switch (variant) {
      case "avatar":
        return {
          container: "w-24 h-24 rounded-full",
          placeholder: "p-4",
        };
      case "banner":
        return {
          container: "w-full h-32 sm:h-40",
          placeholder: "p-8",
        };
      case "thumbnail":
        return {
          container: "w-20 h-20",
          placeholder: "p-2",
        };
      default:
        return {
          container: "w-full h-40",
          placeholder: "p-6",
        };
    }
  };

  const styles = getVariantStyles();

  // Show existing image if provided
  if (value && !multiple && images.length === 0) {
    return (
      <div className={cn("relative group", styles.container, className)}>
        <img
          src={value}
          alt="Uploaded image"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
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
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          styles.container,
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
        <div
          className={cn(
            "flex flex-col items-center justify-center text-center",
            styles.placeholder
          )}
        >
          <div className="p-2 bg-muted rounded-full mb-2">
            {isUploading ? (
              <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <p className="text-sm font-medium mb-1">
            {isUploading ? "Uploading..." : placeholder}
          </p>

          <p className="text-xs text-muted-foreground">
            {multiple ? "Select multiple images" : "or drag and drop"}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Max size: {FormatUtils.formatFileSize(maxSize)}
          </p>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Progress Bar */}
      {showProgress && isUploading && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Status Overlay */}
                {image.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <IconLoader className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">{image.progress}%</p>
                    </div>
                  </div>
                )}

                {image.status === "completed" && (
                  <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                    <IconCheck className="h-3 w-3 text-white" />
                  </div>
                )}

                {image.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <IconAlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id);
                  }}
                >
                  <IconX className="h-3 w-3" />
                </Button>
              </div>

              {/* File Info */}
              <div className="mt-2">
                <p className="text-xs font-medium truncate">
                  {image.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {FormatUtils.formatFileSize(image.file.size)}
                </p>
                {image.error && (
                  <p className="text-xs text-red-500">{image.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Specialized image upload components
export function AvatarUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: Pick<
  ImageUploadProps,
  "value" | "onChange" | "onRemove" | "disabled" | "className"
>) {
  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      disabled={disabled}
      variant="avatar"
      placeholder="Upload avatar"
      maxSize={5 * 1024 * 1024} // 5MB
      className={className}
    />
  );
}

export function BannerUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: Pick<
  ImageUploadProps,
  "value" | "onChange" | "onRemove" | "disabled" | "className"
>) {
  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      disabled={disabled}
      variant="banner"
      placeholder="Upload banner image"
      maxSize={10 * 1024 * 1024} // 10MB
      className={className}
    />
  );
}

export function MoviePosterUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: Pick<
  ImageUploadProps,
  "value" | "onChange" | "onRemove" | "disabled" | "className"
>) {
  return (
    <div className="space-y-2">
      <Label htmlFor="poster-upload">Movie Poster</Label>
      <ImageUpload
        value={value}
        onChange={onChange}
        onRemove={onRemove}
        disabled={disabled}
        placeholder="Upload movie poster"
        maxSize={5 * 1024 * 1024} // 5MB
        className={className}
        accept="image/jpeg,image/png,image/webp"
      />
      <p className="text-xs text-muted-foreground">
        Recommended: 600x900px (2:3 aspect ratio)
      </p>
    </div>
  );
}

export function GalleryUpload({
  onChange,
  disabled = false,
  className,
}: Pick<ImageUploadProps, "onChange" | "disabled" | "className">) {
  return (
    <ImageUpload
      onChange={onChange}
      disabled={disabled}
      multiple={true}
      placeholder="Upload multiple images"
      maxSize={10 * 1024 * 1024} // 10MB
      className={className}
    />
  );
}
