#!/usr/bin/env node

import { connectToDatabase, disconnectFromDatabase } from '../lib/db';
import { User } from '../models/User';
import { Movie } from '../models/Movie';
import { Genre } from '../models/Genre';
import { Device } from '../models/Device';
import { Session } from '../models/Session';
import { WatchHistory } from '../models/WatchHistory';
import { Subtitle } from '../models/Subtitle';
import { SubscriptionPlan } from '../models/Subscription';
import { Settings } from '../models/Settings';

interface MigrationStep {
  version: string;
  description: string;
  execute: () => Promise<void>;
}

class DatabaseMigrator {
  private migrations: MigrationStep[] = [
    {
      version: '1.0.0',
      description: 'Create initial indexes',
      execute: this.createInitialIndexes.bind(this)
    },
    {
      version: '1.0.1',
      description: 'Update user schema indexes',
      execute: this.updateUserIndexes.bind(this)
    },
    {
      version: '1.0.2',
      description: 'Add movie search indexes',
      execute: this.addMovieSearchIndexes.bind(this)
    },
    {
      version: '1.0.3',
      description: 'Optimize device and session indexes',
      execute: this.optimizeDeviceSessionIndexes.bind(this)
    },
    {
      version: '1.0.4',
      description: 'Add compound indexes for performance',
      execute: this.addCompoundIndexes.bind(this)
    }
  ];

  async run(targetVersion?: string): Promise<void> {
    try {
      console.log('🚀 Starting database migration...');
      await connectToDatabase();

      const currentVersion = await this.getCurrentVersion();
      console.log(`📍 Current version: ${currentVersion}`);

      const migrationsToRun = this.getMigrationsToRun(currentVersion, targetVersion);
      
      if (migrationsToRun.length === 0) {
        console.log('✅ Database is up to date');
        return;
      }

      console.log(`📋 Running ${migrationsToRun.length} migration(s)...`);

      for (const migration of migrationsToRun) {
        console.log(`⏳ Running migration ${migration.version}: ${migration.description}`);
        
        try {
          await migration.execute();
          await this.updateVersion(migration.version);
          console.log(`✅ Migration ${migration.version} completed`);
        } catch (error) {
          console.error(`❌ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    } finally {
      await disconnectFromDatabase();
    }
  }

  private async getCurrentVersion(): Promise<string> {
    try {
      const settings = await Settings.findOne();
      return settings?.migration?.version || '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  }

  private async updateVersion(version: string): Promise<void> {
    await Settings.findOneAndUpdate(
      {},
      { 
        $set: { 
          'migration.version': version,
          'migration.lastMigrated': new Date()
        }
      },
      { upsert: true }
    );
  }

  private getMigrationsToRun(currentVersion: string, targetVersion?: string): MigrationStep[] {
    const current = this.parseVersion(currentVersion);
    const target = targetVersion ? this.parseVersion(targetVersion) : null;

    return this.migrations.filter(migration => {
      const migrationVersion = this.parseVersion(migration.version);
      const shouldRun = this.compareVersions(migrationVersion, current) > 0;
      
      if (target) {
        return shouldRun && this.compareVersions(migrationVersion, target) <= 0;
      }
      
      return shouldRun;
    });
  }

  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10));
  }

  private compareVersions(a: number[], b: number[]): number {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const aVal = a[i] || 0;
      const bVal = b[i] || 0;
      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }
    return 0;
  }

  private async createInitialIndexes(): Promise<void> {
    console.log('Creating initial database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ 'subscription.status': 1 });
    await User.collection.createIndex({ 'subscription.stripeCustomerId': 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ lastLogin: -1 });

    // Movie indexes
    await Movie.collection.createIndex({ title: 'text', overview: 'text' });
    await Movie.collection.createIndex({ genres: 1 });
    await Movie.collection.createIndex({ isActive: 1 });
    await Movie.collection.createIndex({ isFeatured: 1 });
    await Movie.collection.createIndex({ isPremium: 1 });
    await Movie.collection.createIndex({ releaseDate: -1 });
    await Movie.collection.createIndex({ views: -1 });
    await Movie.collection.createIndex({ rating: -1 });
    await Movie.collection.createIndex({ tmdbId: 1 }, { unique: true, sparse: true });
    await Movie.collection.createIndex({ imdbId: 1 }, { unique: true, sparse: true });

    // Genre indexes
    await Genre.collection.createIndex({ slug: 1 }, { unique: true });
    await Genre.collection.createIndex({ isActive: 1 });
    await Genre.collection.createIndex({ tmdbId: 1 });

    console.log('✅ Initial indexes created');
  }

  private async updateUserIndexes(): Promise<void> {
    console.log('Updating user schema indexes...');

    // Add new user indexes
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ emailVerified: 1 });
    await User.collection.createIndex({ activeSessions: 1 });

    console.log('✅ User indexes updated');
  }

  private async addMovieSearchIndexes(): Promise<void> {
    console.log('Adding movie search indexes...');

    // Enhanced search indexes
    await Movie.collection.createIndex({ 
      title: 'text', 
      overview: 'text', 
      director: 'text', 
      cast: 'text',
      keywords: 'text'
    }, {
      weights: {
        title: 10,
        director: 5,
        cast: 3,
        keywords: 2,
        overview: 1
      },
      name: 'movie_search_index'
    });

    // Performance indexes
    await Movie.collection.createIndex({ language: 1, country: 1 });
    await Movie.collection.createIndex({ duration: 1 });
    await Movie.collection.createIndex({ 'videoMetadata.resolution': 1 });

    console.log('✅ Movie search indexes added');
  }

  private async optimizeDeviceSessionIndexes(): Promise<void> {
    console.log('Optimizing device and session indexes...');

    // Device indexes
    await Device.collection.createIndex({ userId: 1 });
    await Device.collection.createIndex({ deviceId: 1 }, { unique: true });
    await Device.collection.createIndex({ userId: 1, deviceType: 1 });
    await Device.collection.createIndex({ isBlocked: 1 });
    await Device.collection.createIndex({ lastUsed: -1 });
    await Device.collection.createIndex({ registeredAt: -1 });
    await Device.collection.createIndex({ isVerified: 1, isBlocked: 1 });

    // Session indexes
    await Session.collection.createIndex({ userId: 1 });
    await Session.collection.createIndex({ deviceId: 1 });
    await Session.collection.createIndex({ sessionToken: 1 }, { unique: true });
    await Session.collection.createIndex({ isActive: 1 });
    await Session.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await Session.collection.createIndex({ userId: 1, isActive: 1 });
    await Session.collection.createIndex({ lastActivity: -1 });

    // WatchHistory indexes
    await WatchHistory.collection.createIndex({ userId: 1 });
    await WatchHistory.collection.createIndex({ movieId: 1 });
    await WatchHistory.collection.createIndex({ deviceId: 1 });
    await WatchHistory.collection.createIndex({ sessionId: 1 });
    await WatchHistory.collection.createIndex({ userId: 1, movieId: 1 });
    await WatchHistory.collection.createIndex({ userId: 1, deviceId: 1 });
    await WatchHistory.collection.createIndex({ watchedAt: -1 });
    await WatchHistory.collection.createIndex({ userId: 1, watchedAt: -1 });

    // Subtitle indexes
    await Subtitle.collection.createIndex({ movieId: 1 });
    await Subtitle.collection.createIndex({ languageCode: 1 });
    await Subtitle.collection.createIndex({ movieId: 1, languageCode: 1 }, { unique: true });

    console.log('✅ Device and session indexes optimized');
  }

  private async addCompoundIndexes(): Promise<void> {
    console.log('Adding compound indexes for performance...');

    // Subscription plan indexes
    await SubscriptionPlan.collection.createIndex({ isActive: 1 });
    await SubscriptionPlan.collection.createIndex({ stripePriceId: 1 }, { unique: true, sparse: true });
    await SubscriptionPlan.collection.createIndex({ price: 1 });

    // Settings indexes (ensure only one document)
    await Settings.collection.createIndex({}, { unique: true });

    // Compound indexes for common queries
    await Movie.collection.createIndex({ isActive: 1, isFeatured: 1 });
    await Movie.collection.createIndex({ isActive: 1, isPremium: 1 });
    await Movie.collection.createIndex({ genres: 1, isActive: 1 });
    await Movie.collection.createIndex({ releaseDate: -1, isActive: 1 });
    await Movie.collection.createIndex({ views: -1, isActive: 1 });
    await Movie.collection.createIndex({ rating: -1, isActive: 1 });

    // User compound indexes
    await User.collection.createIndex({ role: 1, isActive: 1 });
    await User.collection.createIndex({ 'subscription.status': 1, isActive: 1 });

    // Device compound indexes
    await Device.collection.createIndex({ userId: 1, isVerified: 1, isBlocked: 1 });
    await Device.collection.createIndex({ userId: 1, lastUsed: -1 });

    console.log('✅ Compound indexes added');
  }

  async dropAllIndexes(): Promise<void> {
    console.log('⚠️  Dropping all custom indexes...');
    
    const collections = [
      User, Movie, Genre, Device, Session, 
      WatchHistory, Subtitle, SubscriptionPlan, Settings
    ];

    for (const collection of collections) {
      try {
        const indexes = await collection.collection.listIndexes().toArray();
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await collection.collection.dropIndex(index.name);
            console.log(`Dropped index: ${index.name} from ${collection.collection.collectionName}`);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not drop indexes for ${collection.collection.collectionName}:`, error);
      }
    }

    console.log('✅ All custom indexes dropped');
  }

  async showIndexes(): Promise<void> {
    console.log('📋 Current database indexes:\n');
    
    const collections = [
      { name: 'User', model: User },
      { name: 'Movie', model: Movie },
      { name: 'Genre', model: Genre },
      { name: 'Device', model: Device },
      { name: 'Session', model: Session },
      { name: 'WatchHistory', model: WatchHistory },
      { name: 'Subtitle', model: Subtitle },
      { name: 'SubscriptionPlan', model: SubscriptionPlan },
      { name: 'Settings', model: Settings }
    ];

    for (const { name, model } of collections) {
      try {
        const indexes = await model.collection.listIndexes().toArray();
        console.log(`${name} Collection:`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        console.log('');
      } catch (error) {
        console.warn(`Warning: Could not list indexes for ${name}:`, error);
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const version = args[1];

  const migrator = new DatabaseMigrator();

  switch (command) {
    case 'run':
      await migrator.run(version);
      break;
    case 'drop-indexes':
      await connectToDatabase();
      await migrator.dropAllIndexes();
      await disconnectFromDatabase();
      break;
    case 'show-indexes':
      await connectToDatabase();
      await migrator.showIndexes();
      await disconnectFromDatabase();
      break;
    case 'help':
    default:
      console.log(`
🔧 Database Migration Tool

Usage:
  npm run migrate [command] [options]

Commands:
  run [version]     Run migrations (optionally to specific version)
  drop-indexes      Drop all custom indexes
  show-indexes      Show current indexes
  help             Show this help message

Examples:
  npm run migrate run              # Run all pending migrations
  npm run migrate run 1.0.2        # Run migrations up to version 1.0.2
  npm run migrate drop-indexes     # Drop all custom indexes
  npm run migrate show-indexes     # Show current database indexes
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseMigrator };