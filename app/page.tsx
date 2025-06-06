import type { Metadata } from "next";
import { HomepageClient } from "./homepage-client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "MovieStream - Your Ultimate Movie Streaming Platform",
  description:
    "Stream unlimited movies and shows in HD and 4K quality. Discover trending movies, new releases, and exclusive content on MovieStream.",
  keywords: [
    "movies",
    "streaming",
    "entertainment",
    "TV shows",
    "cinema",
    "HD movies",
    "4K streaming",
    "new releases",
    "trending movies",
    "movie platform",
  ],
  openGraph: {
    title: "MovieStream - Stream Unlimited Movies & Shows",
    description:
      "Discover thousands of movies and shows. Stream in HD and 4K quality with no ads. Start your free trial today!",
    type: "website",
    images: [
      {
        url: "/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "MovieStream - Ultimate Movie Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieStream - Stream Unlimited Movies",
    description:
      "Your ultimate destination for movies and shows. Start streaming today!",
    images: ["/og-homepage.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Transparent Header for Homepage */}
      <Header variant="transparent" sticky={true} />

      {/* Main Content */}
      <main className="flex-1">
        <HomepageClient />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
