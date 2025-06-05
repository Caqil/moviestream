import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconDevices,
  IconDownload,
  IconShield,
  IconStar,
  IconUsers,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconQuote,
  IconTrendingUp,
  IconAward,
  IconGlobe,
  IconInfinity,
  IconHeart,
  IconCrown,
  IconMovie,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { PlayIcon, ZapIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "MovieStream - Your Ultimate Movie Streaming Platform",
  description:
    "Stream unlimited movies and shows in 4K quality. No ads, no limits, cancel anytime. Start your free trial today.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
              <ZapIcon className="h-4 w-4 text-primary" />
              New: 4K streaming now available
              <Badge variant="secondary" className="text-xs">
                Limited Time
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Stream Unlimited
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  {" "}
                  Movies
                </span>
                <br />
                Anywhere, Anytime
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover millions of movies and shows in stunning 4K quality. No
                ads, no interruptions, just pure entertainment.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
                asChild
              >
                <Link href="/auth/register">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
                asChild
              >
                <Link href="/movies">
                  <IconMovie className="mr-2 h-5 w-5" />
                  Browse Movies
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 text-sm text-muted-foreground">
              <div className="flex flex-wrap justify-center items-center gap-6">
                <div className="flex items-center gap-2">
                  <IconUsers className="h-4 w-4" />
                  <span>10M+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconStar className="h-4 w-4 text-yellow-500" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconShield className="h-4 w-4 text-green-500" />
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/30 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for the Perfect Streaming Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium features designed to give you the best movie watching
              experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: IconDevices,
                title: "Watch Anywhere",
                description:
                  "Stream on any device - TV, laptop, tablet, or phone. Pick up where you left off.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: IconDownload,
                title: "Offline Downloads",
                description:
                  "Download your favorites and watch offline. Perfect for travel or limited internet.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: IconShield,
                title: "Ad-Free Experience",
                description:
                  "No interruptions, no ads. Just pure, uninterrupted entertainment.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: IconInfinity,
                title: "Unlimited Streaming",
                description:
                  "Watch as much as you want, whenever you want. No limits, no restrictions.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: IconAward,
                title: "4K Ultra HD",
                description:
                  "Crystal clear picture quality with HDR support for the ultimate viewing experience.",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: IconGlobe,
                title: "Global Content",
                description:
                  "Movies and shows from around the world with subtitles in multiple languages.",
                gradient: "from-teal-500 to-green-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/50"
              >
                <CardHeader className="pb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      feature.gradient,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Movies & Shows", icon: IconMovie },
              { number: "10M+", label: "Happy Users", icon: IconUsers },
              { number: "190+", label: "Countries", icon: IconGlobe },
              { number: "99.9%", label: "Uptime", icon: IconTrendingUp },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Movie Enthusiasts Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their MovieStream experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The best streaming service I've ever used. The quality is incredible and the selection is unmatched.",
                author: "Sarah Johnson",
                role: "Movie Enthusiast",
                avatar: "/api/placeholder/64/64",
                rating: 5,
              },
              {
                quote:
                  "Love being able to download movies for my flights. The offline feature is a game-changer.",
                author: "Michael Chen",
                role: "Frequent Traveler",
                avatar: "/api/placeholder/64/64",
                rating: 5,
              },
              {
                quote:
                  "Finally, a streaming service without ads! Worth every penny for the uninterrupted experience.",
                author: "Emily Rodriguez",
                role: "Binge Watcher",
                avatar: "/api/placeholder/64/64",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 bg-background/50 backdrop-blur"
              >
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IconStar
                        key={i}
                        className="h-5 w-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>

                  <div className="mb-6">
                    <IconQuote className="h-8 w-8 text-primary/20 mb-4" />
                    <p className="text-lg leading-relaxed">
                      {testimonial.quote}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.author}
                      />
                      <AvatarFallback>
                        {testimonial.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that's right for you. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$8.99",
                description: "Perfect for individuals",
                features: [
                  "HD streaming",
                  "1 device",
                  "Unlimited movies",
                  "Cancel anytime",
                ],
                popular: false,
              },
              {
                name: "Standard",
                price: "$13.99",
                description: "Great for families",
                features: [
                  "Full HD streaming",
                  "2 devices simultaneously",
                  "Download for offline",
                  "No ads",
                  "Cancel anytime",
                ],
                popular: true,
              },
              {
                name: "Premium",
                price: "$17.99",
                description: "Ultimate experience",
                features: [
                  "4K Ultra HD streaming",
                  "4 devices simultaneously",
                  "Download for offline",
                  "No ads",
                  "Priority support",
                  "Cancel anytime",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={cn(
                  "relative border-2 transition-all duration-300 hover:shadow-xl",
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-2 bg-primary text-primary-foreground">
                      <IconCrown className="h-4 w-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold mt-4">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <IconCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full mt-8",
                      plan.popular ? "bg-primary" : "variant-outline"
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link
                      href={`/auth/register?plan=${plan.name.toLowerCase()}`}
                    >
                      Get Started
                      <IconArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              All plans include a 30-day free trial. No commitment required.
            </p>
            <Button variant="ghost" asChild>
              <Link href="/pricing">
                View detailed comparison
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Movie Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of users who have already discovered their new
              favorite streaming platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 h-auto"
                asChild
              >
                <Link href="/auth/register">
                  Start Free Trial
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>

            <div className="mt-8 text-sm opacity-75">
              <p>
                No credit card required • Cancel anytime • 30-day money-back
                guarantee
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
