#!/usr/bin/env node

import { connectToDatabase, disconnectFromDatabase } from '../lib/db';
import { Genre } from '../models/Genre';
import { SubscriptionPlan } from '../models/Subscription';
import { Settings } from '../models/Settings';
import { Movie } from '../models/Movie';
import { User } from '../models/User';
import { EncryptionUtils } from '../utils/encryption';

interface SeedOptions {
  force?: boolean;
  verbose?: boolean;
  includeMovies?: boolean;
  includeSampleUsers?: boolean;
}

class DatabaseSeeder {
  private options: SeedOptions;

  constructor(options: SeedOptions = {}) {
    this.options = {
      force: false,
      verbose: false,
      includeMovies: false,
      includeSampleUsers: false,
      ...options
    };
  }

  async seed(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      await connectToDatabase();

      await this.seedGenres();
      await this.seedSubscriptionPlans();
      await this.seedSettings();

      if (this.options.includeMovies) {
        await this.seedMovies();
      }

      if (this.options.includeSampleUsers) {
        await this.seedSampleUsers();
      }

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    } finally {
      await disconnectFromDatabase();
    }
  }

  private async seedGenres(): Promise<void> {
    console.log('📚 Seeding genres...');

    const genres = [
      { name: 'Action', slug: 'action', tmdbId: 28, description: 'High-energy films with exciting sequences and stunts' },
      { name: 'Adventure', slug: 'adventure', tmdbId: 12, description: 'Exciting journeys and quests' },
      { name: 'Animation', slug: 'animation', tmdbId: 16, description: 'Animated films for all ages' },
      { name: 'Comedy', slug: 'comedy', tmdbId: 35, description: 'Humorous and entertaining films' },
      { name: 'Crime', slug: 'crime', tmdbId: 80, description: 'Stories involving criminal activities' },
      { name: 'Documentary', slug: 'documentary', tmdbId: 99, description: 'Non-fiction films about real subjects' },
      { name: 'Drama', slug: 'drama', tmdbId: 18, description: 'Serious and realistic storytelling' },
      { name: 'Family', slug: 'family', tmdbId: 10751, description: 'Films suitable for all family members' },
      { name: 'Fantasy', slug: 'fantasy', tmdbId: 14, description: 'Magical and fantastical worlds' },
      { name: 'History', slug: 'history', tmdbId: 36, description: 'Stories set in historical periods' },
      { name: 'Horror', slug: 'horror', tmdbId: 27, description: 'Scary and suspenseful films' },
      { name: 'Music', slug: 'music', tmdbId: 10402, description: 'Musical performances and stories' },
      { name: 'Mystery', slug: 'mystery', tmdbId: 9648, description: 'Puzzling and suspenseful stories' },
      { name: 'Romance', slug: 'romance', tmdbId: 10749, description: 'Love stories and romantic relationships' },
      { name: 'Science Fiction', slug: 'science-fiction', tmdbId: 878, description: 'Futuristic and sci-fi concepts' },
      { name: 'TV Movie', slug: 'tv-movie', tmdbId: 10770, description: 'Movies made for television' },
      { name: 'Thriller', slug: 'thriller', tmdbId: 53, description: 'Intense and suspenseful stories' },
      { name: 'War', slug: 'war', tmdbId: 10752, description: 'Stories about warfare and conflict' },
      { name: 'Western', slug: 'western', tmdbId: 37, description: 'Stories set in the American Old West' }
    ];

    for (const genreData of genres) {
      const existingGenre = await Genre.findOne({ slug: genreData.slug });
      
      if (!existingGenre || this.options.force) {
        await Genre.findOneAndUpdate(
          { slug: genreData.slug },
          {
            ...genreData,
            isActive: true,
            movieCount: 0
          },
          { upsert: true, new: true }
        );
        
        if (this.options.verbose) {
          console.log(`  ✅ ${genreData.name}`);
        }
      } else if (this.options.verbose) {
        console.log(`  ⏭️  ${genreData.name} (exists)`);
      }
    }

    const totalGenres = await Genre.countDocuments();
    console.log(`✅ Genres seeded: ${totalGenres} total`);
  }

  private async seedSubscriptionPlans(): Promise<void> {
    console.log('💳 Seeding subscription plans...');

    const plans = [
      {
        name: 'Basic',
        description: 'Perfect for individuals who want to enjoy movies on one device',
        price: 8.99,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        features: [
          'Stream on 1 device',
          'HD video quality',
          'Unlimited movies and shows',
          'Cancel anytime'
        ],
        isPopular: false,
        isActive: true,
        maxStreams: 1,
        deviceLimit: 2,
        simultaneousStreams: 1,
        videoQuality: 'HD' as const,
        downloadAllowed: false,
        offlineViewing: false,
        adsSupported: true,
        trialDays: 7,
        deviceFeatures: {
          allowMobile: true,
          allowTV: true,
          allowWeb: true,
          allowTablet: true,
          allowDesktop: true,
          deviceKickEnabled: false,
          autoVerifyTrusted: false
        }
      },
      {
        name: 'Standard',
        description: 'Great for families who want to stream on multiple devices',
        price: 13.99,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        features: [
          'Stream on 2 devices simultaneously',
          'Full HD video quality',
          'Unlimited movies and shows',
          'Download for offline viewing',
          'No ads',
          'Cancel anytime'
        ],
        isPopular: true,
        isActive: true,
        maxStreams: 2,
        deviceLimit: 5,
        simultaneousStreams: 2,
        videoQuality: 'Full HD' as const,
        downloadAllowed: true,
        offlineViewing: true,
        adsSupported: false,
        trialDays: 14,
        deviceFeatures: {
          allowMobile: true,
          allowTV: true,
          allowWeb: true,
          allowTablet: true,
          allowDesktop: true,
          deviceKickEnabled: true,
          autoVerifyTrusted: false
        }
      },
      {
        name: 'Premium',
        description: 'The ultimate experience with 4K quality and maximum devices',
        price: 17.99,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        features: [
          'Stream on 4 devices simultaneously',
          'Ultra HD (4K) video quality',
          'Unlimited movies and shows',
          'Download for offline viewing',
          'No ads',
          'Priority customer support',
          'Early access to new releases',
          'Cancel anytime'
        ],
        isPopular: false,
        isActive: true,
        maxStreams: 4,
        deviceLimit: 10,
        simultaneousStreams: 4,
        videoQuality: '4K' as const,
        downloadAllowed: true,
        offlineViewing: true,
        adsSupported: false,
        trialDays: 30,
        deviceFeatures: {
          allowMobile: true,
          allowTV: true,
          allowWeb: true,
          allowTablet: true,
          allowDesktop: true,
          deviceKickEnabled: true,
          autoVerifyTrusted: true
        }
      },
      {
        name: 'Annual Basic',
        description: 'Basic plan with annual billing - save 2 months!',
        price: 89.99,
        currency: 'USD',
        interval: 'year' as const,
        intervalCount: 1,
        features: [
          'Stream on 1 device',
          'HD video quality',
          'Unlimited movies and shows',
          'Save 2 months with annual billing',
          'Cancel anytime'
        ],
        isPopular: false,
        isActive: true,
        maxStreams: 1,
        deviceLimit: 2,
        simultaneousStreams: 1,
        videoQuality: 'HD' as const,
        downloadAllowed: false,
        offlineViewing: false,
        adsSupported: true,
        trialDays: 30,
        deviceFeatures: {
          allowMobile: true,
          allowTV: true,
          allowWeb: true,
          allowTablet: true,
          allowDesktop: true,
          deviceKickEnabled: false,
          autoVerifyTrusted: false
        }
      },
      {
        name: 'Annual Premium',
        description: 'Premium plan with annual billing - save 3 months!',
        price: 179.99,
        currency: 'USD',
        interval: 'year' as const,
        intervalCount: 1,
        features: [
          'Stream on 4 devices simultaneously',
          'Ultra HD (4K) video quality',
          'Unlimited movies and shows',
          'Download for offline viewing',
          'No ads',
          'Priority customer support',
          'Early access to new releases',
          'Save 3 months with annual billing',
          'Cancel anytime'
        ],
        isPopular: false,
        isActive: true,
        maxStreams: 4,
        deviceLimit: 999, // Unlimited
        simultaneousStreams: 4,
        videoQuality: '4K' as const,
        downloadAllowed: true,
        offlineViewing: true,
        adsSupported: false,
        trialDays: 30,
        deviceFeatures: {
          allowMobile: true,
          allowTV: true,
          allowWeb: true,
          allowTablet: true,
          allowDesktop: true,
          deviceKickEnabled: true,
          autoVerifyTrusted: true
        }
      }
    ];

    for (const planData of plans) {
      const existingPlan = await SubscriptionPlan.findOne({ name: planData.name });
      
      if (!existingPlan || this.options.force) {
        await SubscriptionPlan.findOneAndUpdate(
          { name: planData.name },
          planData,
          { upsert: true, new: true }
        );
        
        if (this.options.verbose) {
          console.log(`  ✅ ${planData.name} - $${planData.price}/${planData.interval}`);
        }
      } else if (this.options.verbose) {
        console.log(`  ⏭️  ${planData.name} (exists)`);
      }
    }

    const totalPlans = await SubscriptionPlan.countDocuments();
    console.log(`✅ Subscription plans seeded: ${totalPlans} total`);
  }

  private async seedSettings(): Promise<void> {
    console.log('⚙️  Seeding application settings...');

    const defaultSettings = {
      // General Settings
      siteName: 'MovieStream',
      siteDescription: 'Your ultimate movie streaming platform',
      siteUrl: process.env.APP_URL || 'http://localhost:3000',
      contactEmail: 'contact@moviestream.com',
      supportEmail: 'support@moviestream.com',
      
      // TMDB API Settings
      tmdb: {
        apiKey: process.env.TMDB_API_KEY || '',
        isEnabled: !!process.env.TMDB_API_KEY
      },
      
      // Stripe Settings
      stripe: {
        publicKey: process.env.STRIPE_PUBLIC_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        isEnabled: !!(process.env.STRIPE_PUBLIC_KEY && process.env.STRIPE_SECRET_KEY)
      },
      
      // S3 Storage Settings
      s3: {
        provider: 'aws' as const,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucketName: process.env.AWS_S3_BUCKET || '',
        region: process.env.AWS_REGION || 'us-east-1',
        forcePathStyle: false,
        isEnabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET),
        cdnUrl: process.env.CDN_URL || null
      },
      
      // Email Settings
      email: {
        provider: 'smtp' as const,
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        username: process.env.SMTP_USERNAME || '',
        password: process.env.SMTP_PASSWORD || '',
        fromEmail: process.env.FROM_EMAIL || 'noreply@moviestream.com',
        fromName: 'MovieStream',
        isEnabled: !!(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
      },
      
      // Security Settings
      security: {
        jwtSecret: process.env.NEXTAUTH_SECRET || 'your-jwt-secret-key',
        sessionTimeout: 1440, // 24 hours
        maxLoginAttempts: 5,
        lockoutDuration: 30, // 30 minutes
        requireEmailVerification: false,
        enableTwoFactor: false
      },
      
      // Features Settings
      features: {
        userRegistration: true,
        guestAccess: true,
        downloadEnabled: false,
        offlineViewing: false,
        socialLogin: true,
        commentsEnabled: true,
        ratingsEnabled: true,
        watchlistEnabled: true
      },
      
      // Device Management Settings
      deviceManagement: {
        globalDeviceLimit: 0, // 0 means use plan limits
        enforceDeviceLimits: true,
        allowDeviceSharing: false,
        deviceInactivityDays: 90,
        requireDeviceVerification: true,
        autoBlockSuspiciousDevices: true,
        enableGeolocationCheck: false,
        maxSessionDuration: 24, // 24 hours
        allowSimultaneousStreams: true,
        kickPreviousSession: false,
        deviceTrustScoring: false,
        logDeviceActivity: true
      },
      
      // Analytics Settings
      analytics: {
        googleAnalyticsId: process.env.GA_TRACKING_ID || '',
        facebookPixelId: process.env.FB_PIXEL_ID || '',
        enableTracking: false
      },
      
      // Maintenance Settings
      maintenance: {
        isEnabled: false,
        message: 'Site is under maintenance. Please check back later.',
        allowedIPs: []
      }
    };

    const existingSettings = await Settings.findOne();
    
    if (!existingSettings || this.options.force) {
      await Settings.findOneAndUpdate(
        {},
        defaultSettings,
        { upsert: true, new: true }
      );
      console.log('  ✅ Application settings configured');
    } else {
      // Update only missing fields
      const updateFields: any = {};
      
      // Check for new fields and add them
      for (const [key, value] of Object.entries(defaultSettings)) {
        if (!(key in existingSettings.toObject())) {
          updateFields[key] = value;
        }
      }
      
      if (Object.keys(updateFields).length > 0) {
        await Settings.findOneAndUpdate({}, { $set: updateFields });
        console.log(`  ✅ Updated ${Object.keys(updateFields).length} new setting fields`);
      } else {
        console.log('  ⏭️  Settings exist and are up to date');
      }
    }

    console.log('✅ Application settings seeded');
  }

  private async seedMovies(): Promise<void> {
    console.log('🎬 Seeding sample movies...');

    // Get some genres for the movies
    const actionGenre = await Genre.findOne({ slug: 'action' });
    const dramaGenre = await Genre.findOne({ slug: 'drama' });
    const comedyGenre = await Genre.findOne({ slug: 'comedy' });
    const scifiGenre = await Genre.findOne({ slug: 'science-fiction' });

    const sampleMovies = [
      {
        title: 'The Demo Action Movie',
        overview: 'An exciting action-packed movie for demonstration purposes. Features thrilling chase scenes and spectacular stunts.',
        poster: '/demo-posters/action-movie.jpg',
        backdrop: '/demo-backdrops/action-movie.jpg',
        videoUrl: '/demo-videos/action-movie.mp4',
        genres: actionGenre ? [actionGenre._id] : [],
        rating: 7.5,
        releaseDate: new Date('2023-06-15'),
        duration: 120,
        language: 'en',
        country: 'US',
        director: 'Demo Director',
        cast: ['Demo Actor 1', 'Demo Actor 2', 'Demo Actor 3'],
        keywords: ['action', 'adventure', 'demo'],
        isActive: true,
        isFeatured: true,
        isPremium: false,
        videoMetadata: {
          fileSize: 2147483648, // 2GB
          format: 'mp4',
          resolution: '1920x1080',
          bitrate: 5000,
          codec: 'h264',
          audioCodec: 'aac'
        },
        s3Metadata: {
          bucket: 'demo-bucket',
          key: 'videos/action-movie.mp4',
          region: 'us-east-1',
          contentType: 'video/mp4'
        }
      },
      {
        title: 'Demo Drama Series',
        overview: 'A compelling drama series that explores human relationships and emotions in a realistic setting.',
        poster: '/demo-posters/drama-series.jpg',
        backdrop: '/demo-backdrops/drama-series.jpg',
        videoUrl: '/demo-videos/drama-series.mp4',
        genres: dramaGenre ? [dramaGenre._id] : [],
        rating: 8.2,
        releaseDate: new Date('2023-09-20'),
        duration: 95,
        language: 'en',
        country: 'US',
        director: 'Demo Drama Director',
        cast: ['Drama Actor 1', 'Drama Actor 2'],
        keywords: ['drama', 'emotional', 'demo'],
        isActive: true,
        isFeatured: false,
        isPremium: true,
        videoMetadata: {
          fileSize: 1610612736, // 1.5GB
          format: 'mp4',
          resolution: '1920x1080',
          bitrate: 3500,
          codec: 'h264',
          audioCodec: 'aac'
        },
        s3Metadata: {
          bucket: 'demo-bucket',
          key: 'videos/drama-series.mp4',
          region: 'us-east-1',
          contentType: 'video/mp4'
        }
      },
      {
        title: 'Comedy Demo Film',
        overview: 'A hilarious comedy that will keep you laughing from start to finish. Perfect family entertainment.',
        poster: '/demo-posters/comedy-film.jpg',
        backdrop: '/demo-backdrops/comedy-film.jpg',
        videoUrl: '/demo-videos/comedy-film.mp4',
        genres: comedyGenre ? [comedyGenre._id] : [],
        rating: 6.8,
        releaseDate: new Date('2023-12-01'),
        duration: 105,
        language: 'en',
        country: 'US',
        director: 'Comedy Demo Director',
        cast: ['Comedy Actor 1', 'Comedy Actor 2', 'Comedy Actor 3'],
        keywords: ['comedy', 'humor', 'family', 'demo'],
        isActive: true,
        isFeatured: true,
        isPremium: false,
        videoMetadata: {
          fileSize: 1879048192, // 1.75GB
          format: 'mp4',
          resolution: '1920x1080',
          bitrate: 4000,
          codec: 'h264',
          audioCodec: 'aac'
        },
        s3Metadata: {
          bucket: 'demo-bucket',
          key: 'videos/comedy-film.mp4',
          region: 'us-east-1',
          contentType: 'video/mp4'
        }
      },
      {
        title: 'Sci-Fi Demo Epic',
        overview: 'An epic science fiction adventure set in the distant future with stunning visual effects and an engaging storyline.',
        poster: '/demo-posters/scifi-epic.jpg',
        backdrop: '/demo-backdrops/scifi-epic.jpg',
        videoUrl: '/demo-videos/scifi-epic.mp4',
        genres: scifiGenre ? [scifiGenre._id] : [],
        rating: 8.7,
        releaseDate: new Date('2024-01-15'),
        duration: 150,
        language: 'en',
        country: 'US',
        director: 'Sci-Fi Demo Director',
        cast: ['Sci-Fi Actor 1', 'Sci-Fi Actor 2', 'Sci-Fi Actor 3', 'Sci-Fi Actor 4'],
        keywords: ['sci-fi', 'future', 'space', 'demo'],
        isActive: true,
        isFeatured: true,
        isPremium: true,
        videoMetadata: {
          fileSize: 3221225472, // 3GB
          format: 'mp4',
          resolution: '3840x2160', // 4K
          bitrate: 8000,
          codec: 'h265',
          audioCodec: 'aac'
        },
        s3Metadata: {
          bucket: 'demo-bucket',
          key: 'videos/scifi-epic.mp4',
          region: 'us-east-1',
          contentType: 'video/mp4'
        }
      }
    ];

    for (const movieData of sampleMovies) {
      const existingMovie = await Movie.findOne({ title: movieData.title });
      
      if (!existingMovie || this.options.force) {
        await Movie.findOneAndUpdate(
          { title: movieData.title },
          movieData,
          { upsert: true, new: true }
        );
        
        if (this.options.verbose) {
          console.log(`  ✅ ${movieData.title}`);
        }
      } else if (this.options.verbose) {
        console.log(`  ⏭️  ${movieData.title} (exists)`);
      }
    }

    const totalMovies = await Movie.countDocuments();
    console.log(`✅ Sample movies seeded: ${totalMovies} total`);
  }

  private async seedSampleUsers(): Promise<void> {
    console.log('👥 Seeding sample users...');

    const sampleUsers = [
      {
        email: 'subscriber@demo.com',
        name: 'Demo Subscriber',
        role: 'subscriber' as const,
        password: 'password123',
        isActive: true,
        emailVerified: new Date(),
        preferences: {
          language: 'en',
          autoplay: true,
          videoQuality: 'auto' as const
        },
        deviceSettings: {
          autoApproveNewDevices: false,
          maxDeviceInactivityDays: 90,
          requireDeviceVerification: true,
          allowDeviceSharing: false
        },
        profile: {},
        watchlist: [],
        devices: [],
        activeSessions: 0
      },
      {
        email: 'guest@demo.com',
        name: 'Demo Guest',
        role: 'guest' as const,
        password: 'password123',
        isActive: true,
        emailVerified: new Date(),
        preferences: {
          language: 'en',
          autoplay: true,
          videoQuality: 'auto' as const
        },
        deviceSettings: {
          autoApproveNewDevices: true,
          maxDeviceInactivityDays: 30,
          requireDeviceVerification: false,
          allowDeviceSharing: true
        },
        profile: {},
        watchlist: [],
        devices: [],
        activeSessions: 0
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser || this.options.force) {
        // Hash the password
        const hashedPassword = await EncryptionUtils.hashPassword(userData.password);
        
        await User.findOneAndUpdate(
          { email: userData.email },
          {
            ...userData,
            password: hashedPassword
          },
          { upsert: true, new: true }
        );
        
        if (this.options.verbose) {
          console.log(`  ✅ ${userData.name} (${userData.email})`);
        }
      } else if (this.options.verbose) {
        console.log(`  ⏭️  ${userData.name} (exists)`);
      }
    }

    const totalUsers = await User.countDocuments();
    console.log(`✅ Sample users seeded: ${totalUsers} total`);
  }

  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing database...');
    
    await Promise.all([
      Genre.deleteMany({}),
      SubscriptionPlan.deleteMany({}),
      Settings.deleteMany({}),
      Movie.deleteMany({}),
      User.deleteMany({ role: { $ne: 'admin' } }) // Keep admin users
    ]);

    console.log('✅ Database cleared (admin users preserved)');
  }

  async showStats(): Promise<void> {
    console.log('📊 Database Statistics:\n');
    
    const stats = await Promise.all([
      Genre.countDocuments(),
      SubscriptionPlan.countDocuments(),
      Settings.countDocuments(),
      Movie.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'subscriber' }),
      User.countDocuments({ role: 'guest' })
    ]);

    console.log(`Genres: ${stats[0]}`);
    console.log(`Subscription Plans: ${stats[1]}`);
    console.log(`Settings: ${stats[2]}`);
    console.log(`Movies: ${stats[3]}`);
    console.log(`Total Users: ${stats[4]}`);
    console.log(`  - Admins: ${stats[5]}`);
    console.log(`  - Subscribers: ${stats[6]}`);
    console.log(`  - Guests: ${stats[7]}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const options: SeedOptions = {
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
    includeMovies: args.includes('--include-movies'),
    includeSampleUsers: args.includes('--include-users')
  };

  const seeder = new DatabaseSeeder(options);

  switch (command) {
    case 'run':
      await seeder.seed();
      break;
    case 'clear':
      await connectToDatabase();
      await seeder.clearDatabase();
      await disconnectFromDatabase();
      break;
    case 'stats':
      await connectToDatabase();
      await seeder.showStats();
      await disconnectFromDatabase();
      break;
    case 'help':
    default:
      console.log(`
🌱 Database Seeding Tool

Usage:
  npm run seed [command] [options]

Commands:
  run            Seed the database with initial data
  clear          Clear all seeded data (preserves admin users)
  stats          Show database statistics
  help           Show this help message

Options:
  --force              Overwrite existing data
  --verbose            Show detailed output
  --include-movies     Include sample movies
  --include-users      Include sample users

Examples:
  npm run seed run --verbose                    # Seed with detailed output
  npm run seed run --force --include-movies     # Force seed with sample movies
  npm run seed clear                            # Clear seeded data
  npm run seed stats                            # Show database stats
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseSeeder };