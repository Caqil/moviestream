import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/contexts/theme-context";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MovieStream - Your Ultimate Movie Streaming Platform",
    template: "%s | MovieStream",
  },
  description:
    "Stream unlimited movies and shows with MovieStream. Enjoy HD quality, offline viewing, and multi-device support.",
  keywords: ["movies", "streaming", "entertainment", "TV shows", "cinema"],
  authors: [{ name: "MovieStream Team" }],
  creator: "MovieStream",
  publisher: "MovieStream",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MovieStream",
    title: "MovieStream - Your Ultimate Movie Streaming Platform",
    description:
      "Stream unlimited movies and shows with MovieStream. Enjoy HD quality, offline viewing, and multi-device support.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MovieStream - Stream Unlimited Movies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieStream - Your Ultimate Movie Streaming Platform",
    description:
      "Stream unlimited movies and shows with MovieStream. Enjoy HD quality, offline viewing, and multi-device support.",
    images: ["/og-image.jpg"],
    creator: "@moviestream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          content="#0f0f0f"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased"
        )}
        suppressHydrationWarning
      >
        <AppProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                className: "text-sm",
              }}
            />
          </div>
        </AppProvider>

        {/* Accessibility */}
        <div id="skip-link" className="sr-only">
          <a
            href="#main-content"
            className="absolute top-0 left-0 bg-primary text-primary-foreground p-2 z-50 focus:not-sr-only"
          >
            Skip to main content
          </a>
        </div>

        {/* Scripts for theme handling */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </body>
    </html>
  );
}
