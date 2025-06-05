"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AdminProvider } from "./admin-context";
import { SubscriptionProvider } from "./subscription-context";
import { AuthProvider } from "./auth-context";

type Theme = "light" | "dark" | "system";

interface UserPreferences {
  theme: Theme;
  language: string;
  autoplay: boolean;
  videoQuality: "auto" | "480p" | "720p" | "1080p" | "4k";
  subtitleLanguage: string | null;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface PlayerSettings {
  volume: number;
  playbackRate: number;
  subtitlesEnabled: boolean;
  autoplay: boolean;
  theaterMode: boolean;
  skipIntro: boolean;
  skipCredits: boolean;
}

interface ThemeContextType {
  // Theme state
  theme: Theme;
  resolvedTheme: "light" | "dark";
  preferences: UserPreferences;
  playerSettings: PlayerSettings;

  // Theme actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Preferences actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updatePlayerSettings: (updates: Partial<PlayerSettings>) => void;
  resetPreferences: () => void;
  resetPlayerSettings: () => void;

  // Accessibility
  isReducedMotion: boolean;
  isHighContrast: boolean;

  // Utilities
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  theme: "system",
  language: "en",
  autoplay: true,
  videoQuality: "auto",
  subtitleLanguage: null,
  reducedMotion: false,
  highContrast: false,
};

const defaultPlayerSettings: PlayerSettings = {
  volume: 1,
  playbackRate: 1,
  subtitlesEnabled: false,
  autoplay: true,
  theaterMode: false,
  skipIntro: true,
  skipCredits: false,
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage(
    "moviestream_preferences",
    defaultPreferences
  );
  const [playerSettings, setPlayerSettings] = useLocalStorage(
    "moviestream_player",
    defaultPlayerSettings
  );

  // Resolve system theme
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const resolvedTheme =
    preferences.theme === "system" ? getSystemTheme() : preferences.theme;

  // Update theme actions
  const setTheme = (theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    if (preferences.theme === "system") {
      setTheme("light");
    } else if (preferences.theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  // Preferences actions
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const updatePlayerSettings = (updates: Partial<PlayerSettings>) => {
    setPlayerSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const resetPlayerSettings = () => {
    setPlayerSettings(defaultPlayerSettings);
  };

  // Export/Import settings
  const exportSettings = () => {
    return JSON.stringify(
      {
        preferences,
        playerSettings,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);

      if (imported.preferences) {
        setPreferences({ ...defaultPreferences, ...imported.preferences });
      }

      if (imported.playerSettings) {
        setPlayerSettings({
          ...defaultPlayerSettings,
          ...imported.playerSettings,
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(resolvedTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0f0f0f" : "#ffffff"
      );
    }
  }, [resolvedTheme]);

  // Apply accessibility preferences
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // High contrast
    if (preferences.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [preferences.reducedMotion, preferences.highContrast]);

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Force re-render when system theme changes
      setPreferences((prev) => ({ ...prev }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preferences.theme]);

  // Detect system accessibility preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect reduced motion preference
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (reducedMotionQuery.matches && !preferences.reducedMotion) {
      updatePreferences({ reducedMotion: true });
    }

    // Detect high contrast preference
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    if (highContrastQuery.matches && !preferences.highContrast) {
      updatePreferences({ highContrast: true });
    }
  }, []);

  const contextValue: ThemeContextType = {
    // Theme state
    theme: preferences.theme,
    resolvedTheme,
    preferences,
    playerSettings,

    // Theme actions
    setTheme,
    toggleTheme,

    // Preferences actions
    updatePreferences,
    updatePlayerSettings,
    resetPreferences,
    resetPlayerSettings,

    // Accessibility
    isReducedMotion: preferences.reducedMotion,
    isHighContrast: preferences.highContrast,

    // Utilities
    exportSettings,
    importSettings,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}

// Root provider component that combines all contexts
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <AdminProvider>{children}</AdminProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
