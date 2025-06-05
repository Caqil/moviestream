#!/usr/bin/env node

import { connectToDatabase, disconnectFromDatabase } from '../lib/db';
import { User } from '../models/User';
import { Settings } from '../models/Settings';
import { EncryptionUtils } from '../utils/encryption';
import * as readline from 'readline';
import * as crypto from 'crypto';

interface AdminSetupOptions {
  interactive?: boolean;
  force?: boolean;
  email?: string;
  password?: string;
  name?: string;
}

class AdminSetup {
  private options: AdminSetupOptions;
  private rl: readline.Interface;

  constructor(options: AdminSetupOptions = {}) {
    this.options = {
      interactive: true,
      force: false,
      ...options
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async setup(): Promise<void> {
    try {
      console.log('🔧 Starting admin setup...');
      await connectToDatabase();

      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: 'admin' });
      
      if (existingAdmin && !this.options.force) {
        console.log('⚠️  Admin user already exists!');
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Name: ${existingAdmin.name}`);
        console.log('   Use --force to overwrite or run with different credentials.');
        
        if (this.options.interactive) {
          const shouldContinue = await this.askQuestion('Do you want to create additional admin user? (y/N): ');
          if (!['y', 'yes', 'Y', 'YES'].includes(shouldContinue.trim())) {
            console.log('Setup cancelled.');
            return;
          }
        } else {
          return;
        }
      }

      const adminData = await this.getAdminData();
      const admin = await this.createAdminUser(adminData);
      
      await this.setupInitialSettings();
      await this.generateSecrets();
      
      console.log('\n🎉 Admin setup completed successfully!');
      console.log('\n📋 Admin Details:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      
      console.log('\n🔐 Security Recommendations:');
      console.log('   1. Change the default password immediately after first login');
      console.log('   2. Enable two-factor authentication');
      console.log('   3. Review and update application settings');
      console.log('   4. Configure email settings for notifications');
      console.log('   5. Set up proper backup procedures');
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Start the application: npm run dev');
      console.log('   2. Login at: /admin/login');
      console.log('   3. Configure TMDB API key for movie data');
      console.log('   4. Set up Stripe for payments');
      console.log('   5. Configure S3 for file storage');

    } catch (error) {
      console.error('💥 Admin setup failed:', error);
      process.exit(1);
    } finally {
      this.rl.close();
      await disconnectFromDatabase();
    }
  }

  private async getAdminData(): Promise<{ email: string; password: string; name: string }> {
    if (this.options.interactive) {
      console.log('\n📝 Please provide admin user details:');
      
      const email = this.options.email || await this.askQuestion('Email: ');
      const name = this.options.name || await this.askQuestion('Full Name: ');
      
      let password = this.options.password;
      if (!password) {
        password = await this.askPassword('Password (min 8 characters): ');
        const confirmPassword = await this.askPassword('Confirm Password: ');
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      return { email: email.trim(), password, name: name.trim() };
    } else {
      // Non-interactive mode - use provided options or defaults
      const email = this.options.email || 'admin@moviestream.com';
      const name = this.options.name || 'Admin User';
      const password = this.options.password || this.generateSecurePassword();

      console.log(`Creating admin user: ${email}`);
      if (!this.options.password) {
        console.log(`Generated password: ${password}`);
        console.log('⚠️  Please save this password securely!');
      }

      return { email, password, name };
    }
  }

  private async createAdminUser(adminData: { email: string; password: string; name: string }) {
    console.log('\n👤 Creating admin user...');

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser && !this.options.force) {
      throw new Error(`User with email ${adminData.email} already exists`);
    }

    // Hash the password
    const hashedPassword = await EncryptionUtils.hashPassword(adminData.password);

    // Create or update admin user
    const adminUser = await User.findOneAndUpdate(
      { email: adminData.email },
      {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: new Date(),
        lastLogin: null,
        preferences: {
          language: 'en',
          autoplay: true,
          videoQuality: 'auto'
        },
        deviceSettings: {
          autoApproveNewDevices: true,
          maxDeviceInactivityDays: 180,
          requireDeviceVerification: false,
          allowDeviceSharing: true
        },
        profile: {
          bio: 'System Administrator'
        },
        watchlist: [],
        devices: [],
        activeSessions: 0
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Admin user created successfully');
    return adminUser;
  }

  private async setupInitialSettings(): Promise<void> {
    console.log('\n⚙️  Setting up initial application settings...');

    const existingSettings = await Settings.findOne();
    
    if (existingSettings && !this.options.force) {
      console.log('⏭️  Settings already exist, skipping...');
      return;
    }

    // Generate secure secrets
    const jwtSecret = this.generateSecret(64);
    const nextAuthSecret = this.generateSecret(32);

    const initialSettings = {
      // General Settings
      siteName: 'MovieStream',
      siteDescription: 'Your ultimate movie streaming platform',
      siteUrl: process.env.APP_URL || 'http://localhost:3000',
      contactEmail: 'contact@moviestream.com',
      supportEmail: 'support@moviestream.com',
      
      // TMDB API Settings
      tmdb: {
        apiKey: process.env.TMDB_API_KEY || '',
        isEnabled: !!process.env.TMDB_API_KEY,
        lastSync: null
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
        provider: 'aws',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucketName: process.env.AWS_S3_BUCKET || '',
        region: process.env.AWS_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || null,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        isEnabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET),
        cdnUrl: process.env.CDN_URL || null
      },
      
      // Email Settings
      email: {
        provider: 'smtp',
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        username: process.env.SMTP_USERNAME || '',
        password: process.env.SMTP_PASSWORD || '',
        apiKey: process.env.EMAIL_API_KEY || '',
        fromEmail: process.env.FROM_EMAIL || 'noreply@moviestream.com',
        fromName: 'MovieStream',
        isEnabled: !!(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
      },
      
      // Security Settings
      security: {
        jwtSecret: process.env.JWT_SECRET || jwtSecret,
        sessionTimeout: 1440, // 24 hours
        maxLoginAttempts: 5,
        lockoutDuration: 30, // 30 minutes
        requireEmailVerification: false,
        enableTwoFactor: false
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
        allowedIPs: ['127.0.0.1', '::1'] // localhost IPs
      }
    };

    await Settings.findOneAndUpdate(
      {},
      initialSettings,
      { upsert: true, new: true }
    );

    console.log('✅ Initial settings configured');

    // Output important secrets if they were generated
    if (!process.env.JWT_SECRET) {
      console.log(`\n🔑 Generated JWT Secret: ${jwtSecret}`);
      console.log('   Add this to your .env file: JWT_SECRET=' + jwtSecret);
    }

    if (!process.env.NEXTAUTH_SECRET) {
      console.log(`\n🔑 Generated NextAuth Secret: ${nextAuthSecret}`);
      console.log('   Add this to your .env file: NEXTAUTH_SECRET=' + nextAuthSecret);
    }
  }

  private async generateSecrets(): Promise<void> {
    console.log('\n🔐 Checking application secrets...');

    const requiredSecrets = [
      'NEXTAUTH_SECRET',
      'JWT_SECRET'
    ];

    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);

    if (missingSecrets.length > 0) {
      console.log('\n⚠️  Missing required secrets in environment variables:');
      
      for (const secret of missingSecrets) {
        const generatedSecret = this.generateSecret(32);
        console.log(`${secret}=${generatedSecret}`);
      }
      
      console.log('\n📝 Please add these to your .env file for security.');
    } else {
      console.log('✅ All required secrets are configured');
    }
  }

  private generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
  private askPassword(question: string): Promise<string> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      stdin.setRawMode?.(true);
      
      process.stdout.write(question);
      
      let password = '';
      stdin.on('data', function handler(char: Buffer) {
        const input = char.toString('utf8'); // Convert Buffer to string explicitly
        
        switch (input) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl-D
            stdin.setRawMode?.(false);
            stdin.removeListener('data', handler);
            process.stdout.write('\n');
            resolve(password);
            break;
          case '\u0003': // Ctrl-C
            process.exit(1);
            break;
          case '\b':
          case '\u007f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += input;
            process.stdout.write('*');
            break;
        }
      });
    });
  }

  async listAdmins(): Promise<void> {
    console.log('👑 Current Admin Users:\n');
    
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    if (admins.length === 0) {
      console.log('No admin users found.');
      return;
    }

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`   Last Login: ${admin.lastLogin || 'Never'}`);
      console.log('');
    });
  }

  async removeAdmin(email: string): Promise<void> {
    if (!email) {
      throw new Error('Email is required');
    }

    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      throw new Error(`Admin user with email ${email} not found`);
    }

    // Check if this is the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin user');
    }

    await User.findByIdAndDelete(admin._id);
    console.log(`✅ Admin user ${email} removed successfully`);
  }

  async resetAdminPassword(email: string, newPassword?: string): Promise<void> {
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      throw new Error(`Admin user with email ${email} not found`);
    }

    const password = newPassword || this.generateSecurePassword();
    const hashedPassword = await EncryptionUtils.hashPassword(password);

    await User.findByIdAndUpdate(admin._id, {
      password: hashedPassword,
      // Force password change on next login if auto-generated
      ...(newPassword ? {} : { mustChangePassword: true })
    });

    console.log(`✅ Password reset for ${email}`);
    if (!newPassword) {
      console.log(`New password: ${password}`);
      console.log('⚠️  Please save this password securely!');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const options: AdminSetupOptions = {
    interactive: !args.includes('--non-interactive'),
    force: args.includes('--force'),
    email: args.find(arg => arg.startsWith('--email='))?.split('=')[1],
    password: args.find(arg => arg.startsWith('--password='))?.split('=')[1],
    name: args.find(arg => arg.startsWith('--name='))?.split('=')[1]
  };

  const setup = new AdminSetup(options);

  switch (command) {
    case 'create':
    case 'setup':
      await setup.setup();
      break;
    case 'list':
      await connectToDatabase();
      await setup.listAdmins();
      await disconnectFromDatabase();
      break;
    case 'remove':
      const emailToRemove = args[1];
      if (!emailToRemove) {
        console.error('❌ Email is required for remove command');
        process.exit(1);
      }
      await connectToDatabase();
      await setup.removeAdmin(emailToRemove);
      await disconnectFromDatabase();
      break;
    case 'reset-password':
      const emailToReset = args[1];
      const newPassword = args[2];
      if (!emailToReset) {
        console.error('❌ Email is required for reset-password command');
        process.exit(1);
      }
      await connectToDatabase();
      await setup.resetAdminPassword(emailToReset, newPassword);
      await disconnectFromDatabase();
      break;
    case 'help':
    default:
      console.log(`
🔧 Admin Setup Tool

Usage:
  npm run setup-admin [command] [options]

Commands:
  create, setup              Create admin user and setup application
  list                       List all admin users
  remove <email>             Remove admin user
  reset-password <email> [password]  Reset admin password
  help                       Show this help message

Options:
  --force                    Overwrite existing admin user
  --non-interactive          Run in non-interactive mode
  --email=<email>            Admin email (non-interactive mode)
  --password=<password>      Admin password (non-interactive mode)
  --name=<name>              Admin name (non-interactive mode)

Examples:
  npm run setup-admin create                           # Interactive setup
  npm run setup-admin create --force                   # Force recreate admin
  npm run setup-admin create --non-interactive         # Auto-setup with defaults
  npm run setup-admin list                             # List all admins
  npm run setup-admin remove admin@example.com         # Remove admin
  npm run setup-admin reset-password admin@example.com # Reset password
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { AdminSetup };