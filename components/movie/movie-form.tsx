"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMovies } from "@/hooks/use-movies";
import { useUpload } from "@/hooks/use-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  ImageUpload,
  MoviePosterUpload,
} from "@/components/common/image-upload";
import {
  VideoUpload,
  MovieVideoUpload,
} from "@/components/common/video-upload";
import {
  IconX,
  IconPlus,
  IconTrash,
  IconLoader,
  IconUpload,
  IconEye,
  IconWorld,
  IconClock,
  IconStar,
  IconCalendar,
  IconMovie,
  IconPhoto,
  IconVideo,
  IconSettings,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Movie,
  Genre,
  CreateMovieRequest,
  UpdateMovieRequest,
  VideoMetadata,
} from "@/types";
import { SaveIcon } from "lucide-react";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  originalTitle: z.string().optional(),
  overview: z
    .string()
    .min(10, "Overview must be at least 10 characters")
    .max(2000, "Overview too long"),
  tagline: z.string().max(200, "Tagline too long").optional(),
  poster: z.string().url("Invalid poster URL"),
  backdrop: z.string().url("Invalid backdrop URL"),
  trailer: z.string().url("Invalid trailer URL").optional(),
  videoUrl: z.string().url("Video URL is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  rating: z
    .number()
    .min(0, "Rating must be 0 or higher")
    .max(10, "Rating cannot exceed 10"),
  imdbRating: z.number().min(0).max(10).optional(),
  releaseDate: z.string().min(1, "Release date is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  language: z.string().min(2, "Language code is required"),
  country: z.string().min(2, "Country code is required"),
  director: z.string().max(100, "Director name too long").optional(),
  cast: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPremium: z.boolean().default(true),
  tmdbId: z.number().optional(),
  imdbId: z.string().optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: CreateMovieRequest | UpdateMovieRequest) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
];

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
];

export function MovieForm({
  movie,
  onSubmit,
  onCancel,
  className,
  isLoading = false,
  mode = movie ? "edit" : "create",
}: MovieFormProps) {
  const { genres } = useMovies();
  const { uploadImage, uploadVideo } = useUpload();

  const [castInput, setCastInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );

  const form = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie?.title || "",
      originalTitle: movie?.originalTitle || "",
      overview: movie?.overview || "",
      tagline: movie?.tagline || "",
      poster: movie?.poster || "",
      backdrop: movie?.backdrop || "",
      trailer: movie?.trailer || "",
      videoUrl: movie?.videoUrl || "",
      genres: movie?.genres?.map((g) => g.toString()) || [],
      rating: movie?.rating || 0,
      imdbRating: movie?.imdbRating || undefined,
      releaseDate: movie?.releaseDate
        ? new Date(movie.releaseDate).toISOString().split("T")[0]
        : "",
      duration: movie?.duration || 0,
      language: movie?.language || "en",
      country: movie?.country || "US",
      director: movie?.director || "",
      cast: movie?.cast || [],
      keywords: movie?.keywords || [],
      isActive: movie?.isActive ?? true,
      isFeatured: movie?.isFeatured ?? false,
      isPremium: movie?.isPremium ?? true,
      tmdbId: movie?.tmdbId || undefined,
      imdbId: movie?.imdbId || "",
    },
  });

  const genreOptions = genres.map((g) => ({
    label: g.name,
    value: g._id.toString(),
  }));

  const handleImageUpload = async (
    file: File,
    field: "poster" | "backdrop"
  ) => {
    setIsUploading(true);
    try {
      const result = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result) {
        form.setValue(field, result.url);
        toast.success(`${field} uploaded successfully`);
      }
    } catch (error) {
      toast.error(`Failed to upload ${field}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result) {
        form.setValue("videoUrl", result.url);
        toast.success("Video uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoMetadataExtracted = (metadata: VideoMetadata) => {
    setVideoMetadata(metadata);
    if (metadata.duration && !form.getValues("duration")) {
      form.setValue("duration", Math.round(metadata.duration / 60)); // Convert to minutes
    }
  };

  const addCastMember = () => {
    if (castInput.trim()) {
      const currentCast = form.getValues("cast");
      form.setValue("cast", [...currentCast, castInput.trim()]);
      setCastInput("");
    }
  };

  const removeCastMember = (index: number) => {
    const currentCast = form.getValues("cast");
    form.setValue(
      "cast",
      currentCast.filter((_, i) => i !== index)
    );
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = form.getValues("keywords");
      if (!currentKeywords.includes(keywordInput.trim().toLowerCase())) {
        form.setValue("keywords", [
          ...currentKeywords,
          keywordInput.trim().toLowerCase(),
        ]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues("keywords");
    form.setValue(
      "keywords",
      currentKeywords.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (data: MovieFormData) => {
    try {
      const formattedData = {
        ...data,
        releaseDate: new Date(data.releaseDate),
        genres: data.genres.map((g) => g as any), // Type assertion for ObjectId
        videoMetadata: videoMetadata || movie?.videoMetadata,
      };

      await onSubmit(formattedData);
      toast.success(`Movie ${mode}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${mode} movie`);
    }
  };

  const importFromTMDB = async () => {
    const tmdbId = form.getValues("tmdbId");
    if (!tmdbId) {
      toast.error("Please enter a TMDB ID first");
      return;
    }

    try {
      setIsUploading(true);
      const response = await fetch(`/api/admin/movies/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });

      if (!response.ok) throw new Error("Import failed");

      const movieData = await response.json();

      // Populate form with TMDB data
      form.setValue("title", movieData.title);
      form.setValue("originalTitle", movieData.original_title);
      form.setValue("overview", movieData.overview);
      form.setValue("poster", movieData.poster_path);
      form.setValue("backdrop", movieData.backdrop_path);
      form.setValue("releaseDate", movieData.release_date);
      form.setValue("rating", movieData.vote_average);

      toast.success("Movie data imported from TMDB");
    } catch (error) {
      toast.error("Failed to import from TMDB");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "create" ? "Add New Movie" : "Edit Movie"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "create"
                ? "Fill in the details to add a new movie to your library"
                : "Update the movie information"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? (
                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )}
              {mode === "create" ? "Create Movie" : "Update Movie"}
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Alert>
            <IconUpload className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Uploading... {uploadProgress}%</p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconMovie className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter movie title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Original title (if different)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Movie tagline or slogan"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overview *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Movie plot and description"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="7.5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconPhoto className="h-5 w-5 mr-2" />
                  Media Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Upload */}
                <div>
                  <Label>Main Video File *</Label>
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            {field.value ? (
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      Video uploaded
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {field.value}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange("")}
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <MovieVideoUpload
                                onChange={(url, metadata) => {
                                  field.onChange(url);
                                  if (metadata)
                                    handleVideoMetadataExtracted(metadata);
                                }}
                                onMetadataExtracted={
                                  handleVideoMetadataExtracted
                                }
                                disabled={isUploading}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Movie Poster *</Label>
                    <FormField
                      control={form.control}
                      name="poster"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MoviePosterUpload
                              value={field.value}
                              onChange={field.onChange}
                              onRemove={() => field.onChange("")}
                              disabled={isUploading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Backdrop Image *</Label>
                    <FormField
                      control={form.control}
                      name="backdrop"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              onRemove={() => field.onChange("")}
                              placeholder="Upload backdrop image"
                              disabled={isUploading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Trailer URL */}
                <FormField
                  control={form.control}
                  name="trailer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        YouTube or direct video URL for the movie trailer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Cast and Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Director</FormLabel>
                      <FormControl>
                        <Input placeholder="Director name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cast Members */}
                <div>
                  <Label>Cast Members</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add cast member"
                        value={castInput}
                        onChange={(e) => setCastInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addCastMember())
                        }
                      />
                      <Button type="button" onClick={addCastMember}>
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {form.watch("cast").length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.watch("cast").map((member, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1"
                          >
                            {member}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeCastMember(index)}
                            >
                              <IconX className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <Label>Keywords</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addKeyword())
                        }
                      />
                      <Button type="button" onClick={addKeyword}>
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {form.watch("keywords").length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.watch("keywords").map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="gap-1"
                          >
                            {keyword}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeKeyword(index)}
                            >
                              <IconX className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TMDB Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconWorld className="h-5 w-5 mr-2" />
                  TMDB Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tmdbId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TMDB ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="123456"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={importFromTMDB}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconUpload className="h-4 w-4 mr-2" />
                  )}
                  Import from TMDB
                </Button>

                <FormField
                  control={form.control}
                  name="imdbId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMDb ID</FormLabel>
                      <FormControl>
                        <Input placeholder="tt1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Genres */}
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          options={genreOptions}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select genres"
                          variant="inverted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconSettings className="h-5 w-5 mr-2" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this movie visible to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Show in featured sections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Premium Content</FormLabel>
                        <FormDescription>
                          Requires subscription to watch
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Video Metadata */}
            {videoMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconVideo className="h-5 w-5 mr-2" />
                    Video Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>
                      {FormatUtils.formatVideoDuration(
                        videoMetadata.duration || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span>{videoMetadata.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span>{videoMetadata.format?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>
                      {FormatUtils.formatFileSize(videoMetadata.fileSize)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
