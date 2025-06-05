"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconSettings,
  IconCheck,
  IconX,
  IconLanguage,
  IconDownload,
  IconUpload,
  IconPalette,
  IconTypography,
  IconEye,
  IconEyeOff,
  IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Subtitle } from "@/types";
import { SubtitlesIcon } from "lucide-react";

interface SubtitleSelectorProps {
  subtitles: Subtitle[];
  selectedSubtitle?: Subtitle;
  onSubtitleChange: (subtitle?: Subtitle) => void;
  className?: string;
  variant?: "button" | "dropdown" | "inline";
  showSettings?: boolean;
  showUpload?: boolean;
}

interface SubtitleSettings {
  fontSize: number; // 12-24px
  fontFamily: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number; // 0-100
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number; // 0-3px
  position: "bottom" | "top" | "center";
  alignment: "left" | "center" | "right";
  enabled: boolean;
}

const defaultSettings: SubtitleSettings = {
  fontSize: 16,
  fontFamily: "Arial, sans-serif",
  color: "#ffffff",
  backgroundColor: "#000000",
  backgroundOpacity: 75,
  stroke: true,
  strokeColor: "#000000",
  strokeWidth: 1,
  position: "bottom",
  alignment: "center",
  enabled: true,
};

const fontFamilies = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times, serif", label: "Times" },
  { value: "Courier, monospace", label: "Courier" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  tr: "Turkish",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  fi: "Finnish",
  he: "Hebrew",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  tl: "Filipino",
  cs: "Czech",
  sk: "Slovak",
  hu: "Hungarian",
  ro: "Romanian",
  bg: "Bulgarian",
  hr: "Croatian",
  sr: "Serbian",
  sl: "Slovenian",
  et: "Estonian",
  lv: "Latvian",
  lt: "Lithuanian",
  uk: "Ukrainian",
  be: "Belarusian",
  mk: "Macedonian",
  sq: "Albanian",
  mt: "Maltese",
  is: "Icelandic",
  ga: "Irish",
  cy: "Welsh",
  eu: "Basque",
  ca: "Catalan",
  gl: "Galician",
  af: "Afrikaans",
  sw: "Swahili",
  zu: "Zulu",
  xh: "Xhosa",
  am: "Amharic",
  om: "Oromo",
  so: "Somali",
  rw: "Kinyarwanda",
  lg: "Luganda",
  ny: "Chichewa",
  sn: "Shona",
  st: "Sesotho",
  tn: "Setswana",
  ts: "Xitsonga",
  ve: "Tshivenda",
  nr: "Ndebele",
  ss: "Swati",
};

export function SubtitleSelector({
  subtitles,
  selectedSubtitle,
  onSubtitleChange,
  className,
  variant = "button",
  showSettings = true,
  showUpload = false,
}: SubtitleSelectorProps) {
  const [settings, setSettings] = useState<SubtitleSettings>(defaultSettings);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("moviestream_subtitle_settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (error) {
        console.error("Failed to load subtitle settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: SubtitleSettings) => {
    setSettings(newSettings);
    localStorage.setItem(
      "moviestream_subtitle_settings",
      JSON.stringify(newSettings)
    );
  };

  const getLanguageName = (languageCode: string) => {
    return languageNames[languageCode] || languageCode.toUpperCase();
  };

  const groupedSubtitles = subtitles.reduce((acc, subtitle) => {
    const lang = subtitle.languageCode;
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(subtitle);
    return acc;
  }, {} as Record<string, Subtitle[]>);

  const handleSubtitleToggle = (subtitle?: Subtitle) => {
    onSubtitleChange(subtitle);

    if (subtitle) {
      toast.success(
        `Subtitles enabled: ${getLanguageName(subtitle.languageCode)}`
      );
    } else {
      toast.success("Subtitles disabled");
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/subtitle", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Subtitle uploaded successfully");
        // Refresh subtitles list
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload subtitle");
    }
  };

  const renderSettingsPanel = () => (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label htmlFor="subtitles-enabled">Enable Subtitles</Label>
        <Switch
          id="subtitles-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled: any) => saveSettings({ ...settings, enabled })}
        />
      </div>

      <Separator />

      {/* Font Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center">
          <IconTypography className="h-4 w-4 mr-2" />
          Font
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Font Family</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(fontFamily: any) =>
                saveSettings({ ...settings, fontFamily })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Font Size</Label>
            <div className="space-y-2">
              <Slider
                value={[settings.fontSize]}
                onValueChange={([fontSize]) =>
                  saveSettings({ ...settings, fontSize })
                }
                min={12}
                max={24}
                step={1}
              />
              <div className="text-sm text-muted-foreground text-center">
                {settings.fontSize}px
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Color Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center">
          <IconPalette className="h-4 w-4 mr-2" />
          Colors
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Text Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="color"
                value={settings.color}
                onChange={(e) =>
                  saveSettings({ ...settings, color: e.target.value })
                }
                className="w-8 h-8 rounded border"
              />
              <span className="text-sm font-mono">{settings.color}</span>
            </div>
          </div>

          <div>
            <Label>Background Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  saveSettings({ ...settings, backgroundColor: e.target.value })
                }
                className="w-8 h-8 rounded border"
              />
              <span className="text-sm font-mono">
                {settings.backgroundColor}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label>Background Opacity</Label>
          <div className="space-y-2">
            <Slider
              value={[settings.backgroundOpacity]}
              onValueChange={([backgroundOpacity]) =>
                saveSettings({ ...settings, backgroundOpacity })
              }
              min={0}
              max={100}
              step={5}
            />
            <div className="text-sm text-muted-foreground text-center">
              {settings.backgroundOpacity}%
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Stroke Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="stroke-enabled">Text Stroke</Label>
          <Switch
            id="stroke-enabled"
            checked={settings.stroke}
            onCheckedChange={(stroke: any) => saveSettings({ ...settings, stroke })}
          />
        </div>

        {settings.stroke && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stroke Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  value={settings.strokeColor}
                  onChange={(e) =>
                    saveSettings({ ...settings, strokeColor: e.target.value })
                  }
                  className="w-8 h-8 rounded border"
                />
                <span className="text-sm font-mono">
                  {settings.strokeColor}
                </span>
              </div>
            </div>

            <div>
              <Label>Stroke Width</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.strokeWidth]}
                  onValueChange={([strokeWidth]) =>
                    saveSettings({ ...settings, strokeWidth })
                  }
                  min={0}
                  max={3}
                  step={0.5}
                />
                <div className="text-sm text-muted-foreground text-center">
                  {settings.strokeWidth}px
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Position Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Position</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vertical Position</Label>
            <Select
              value={settings.position}
              onValueChange={(position: any) =>
                saveSettings({ ...settings, position })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alignment</Label>
            <Select
              value={settings.alignment}
              onValueChange={(alignment: any) =>
                saveSettings({ ...settings, alignment })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="relative bg-slate-900 rounded-lg h-24 flex items-center justify-center">
          <div
            className="px-2 py-1 rounded"
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              color: settings.color,
              backgroundColor: `${settings.backgroundColor}${Math.round(
                settings.backgroundOpacity * 2.55
              )
                .toString(16)
                .padStart(2, "0")}`,
              textShadow: settings.stroke
                ? `1px 1px ${settings.strokeWidth}px ${settings.strokeColor}, -1px -1px ${settings.strokeWidth}px ${settings.strokeColor}, 1px -1px ${settings.strokeWidth}px ${settings.strokeColor}, -1px 1px ${settings.strokeWidth}px ${settings.strokeColor}`
                : "none",
            }}
          >
            Sample subtitle text
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={() => saveSettings(defaultSettings)}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subtitles</h3>
          {showSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
            >
              <IconSettings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant={!selectedSubtitle ? "default" : "outline"}
              size="sm"
              onClick={() => handleSubtitleToggle()}
            >
              <IconEyeOff className="h-4 w-4 mr-2" />
              Off
            </Button>
          </div>

          {Object.entries(groupedSubtitles).map(([lang, subs]) => (
            <div key={lang} className="space-y-1">
              <h4 className="text-sm font-medium">{getLanguageName(lang)}</h4>
              <div className="flex flex-wrap gap-2">
                {subs.map((subtitle) => (
                  <Button
                    key={subtitle._id.toString()}
                    variant={
                      selectedSubtitle?._id === subtitle._id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleSubtitleToggle(subtitle)}
                  >
                    {subtitle.label}
                    {subtitle.isDefault && (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    )}
                    {subtitle.isForced && (
                      <Badge variant="destructive" className="ml-2">
                        Forced
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showUpload && (
          <div className="pt-4 border-t">
            <input
              type="file"
              accept=".vtt,.srt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="hidden"
              id="subtitle-upload"
            />
            <Label htmlFor="subtitle-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <IconUpload className="h-4 w-4 mr-2" />
                  Upload Subtitle
                </span>
              </Button>
            </Label>
          </div>
        )}

        {/* Settings Dialog */}
        {showSettings && (
          <Dialog
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Subtitle Settings</DialogTitle>
              </DialogHeader>
              {renderSettingsPanel()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <SubtitlesIcon className="h-4 w-4 mr-2" />
            {selectedSubtitle
              ? getLanguageName(selectedSubtitle.languageCode)
              : "Subtitles"}
            <IconChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Subtitle Language</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleSubtitleToggle()}>
            <IconEyeOff className="h-4 w-4 mr-2" />
            Off
            {!selectedSubtitle && <IconCheck className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {Object.entries(groupedSubtitles).map(([lang, subs]) => (
            <DropdownMenuSub key={lang}>
              <DropdownMenuSubTrigger>
                <IconLanguage className="h-4 w-4 mr-2" />
                {getLanguageName(lang)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {subs.map((subtitle) => (
                  <DropdownMenuItem
                    key={subtitle._id.toString()}
                    onClick={() => handleSubtitleToggle(subtitle)}
                  >
                    {subtitle.label}
                    {subtitle.isDefault && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Default
                      </Badge>
                    )}
                    {selectedSubtitle?._id === subtitle._id && (
                      <IconCheck className="h-4 w-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}

          {showSettings && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                <IconSettings className="h-4 w-4 mr-2" />
                Subtitle Settings
              </DropdownMenuItem>
            </>
          )}

          {showUpload && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <label
                  htmlFor="subtitle-upload-dropdown"
                  className="cursor-pointer"
                >
                  <IconUpload className="h-4 w-4 mr-2" />
                  Upload Subtitle
                  <input
                    type="file"
                    accept=".vtt,.srt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="hidden"
                    id="subtitle-upload-dropdown"
                  />
                </label>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>

        {/* Settings Dialog */}
        {showSettings && (
          <Dialog
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Subtitle Settings</DialogTitle>
              </DialogHeader>
              {renderSettingsPanel()}
            </DialogContent>
          </Dialog>
        )}
      </DropdownMenu>
    );
  }

  // Default button variant
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-white hover:bg-white/20", className)}
        >
          <SubtitlesIcon className="h-4 w-4 mr-2" />
          {selectedSubtitle
            ? getLanguageName(selectedSubtitle.languageCode)
            : "CC"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Subtitles</h4>
            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
              >
                <IconSettings className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant={!selectedSubtitle ? "default" : "outline"}
              size="sm"
              onClick={() => handleSubtitleToggle()}
              className="w-full justify-start"
            >
              <IconEyeOff className="h-4 w-4 mr-2" />
              Off
            </Button>

            {Object.entries(groupedSubtitles).map(([lang, subs]) => (
              <div key={lang} className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground px-2">
                  {getLanguageName(lang)}
                </div>
                {subs.map((subtitle) => (
                  <Button
                    key={subtitle._id.toString()}
                    variant={
                      selectedSubtitle?._id === subtitle._id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleSubtitleToggle(subtitle)}
                    className="w-full justify-start"
                  >
                    {subtitle.label}
                    {subtitle.isDefault && (
                      <Badge variant="secondary" className="ml-auto">
                        Default
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            ))}
          </div>

          {showUpload && (
            <div className="pt-2 border-t">
              <input
                type="file"
                accept=".vtt,.srt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
                className="hidden"
                id="subtitle-upload-popover"
              />
              <Label
                htmlFor="subtitle-upload-popover"
                className="cursor-pointer"
              >
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <IconUpload className="h-4 w-4 mr-2" />
                    Upload Subtitle
                  </span>
                </Button>
              </Label>
            </div>
          )}
        </div>
      </PopoverContent>

      {/* Settings Dialog */}
      {showSettings && (
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Subtitle Settings</DialogTitle>
            </DialogHeader>
            {renderSettingsPanel()}
          </DialogContent>
        </Dialog>
      )}
    </Popover>
  );
}
