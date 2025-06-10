
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import { User } from '@/models/User';
import { Device } from '@/models/Device';
import { EncryptionUtils } from '@/utils/encryption';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'admin' | 'subscriber' | 'guest';
    watchlist: string[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'admin' | 'subscriber' | 'guest';
      watchlist: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    userId: string;
    watchlist: string[];
  }
}

export const authOptions: NextAuthOptions = {
  // Use JWT sessions instead of database sessions for better control
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Apple Sign In Provider
    {
      id: "apple",
      name: "Apple",
      type: "oauth",
      authorization: {
        url: "https://appleid.apple.com/auth/authorize",
        params: {
          scope: "name email",
          response_mode: "form_post",
        },
      },
      token: "https://appleid.apple.com/auth/token",
      userinfo: {
        async request({ tokens }) {
          // Apple doesn't provide a userinfo endpoint
          // We need to decode the id_token to get user info
          if (!tokens.id_token) throw new Error("No id_token from Apple");
          
          const payload = JSON.parse(
            Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
          );
          
          return {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email?.split('@')[0] || 'Apple User',
            email_verified: payload.email_verified === 'true',
          };
        },
      },
      client: {
        id: process.env.APPLE_CLIENT_ID!,
        secret: process.env.APPLE_CLIENT_SECRET!,
      },
      profile(profile) {
        return {
          id: profile.sub || profile.id,
          email: profile.email,
          name: profile.name || profile.email?.split('@')[0] || 'Apple User',
          image: undefined,
          role: 'guest' as const,
          watchlist: [], // Add empty watchlist for new users
        };
      },
    },
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectToDatabase();
        
        // Find user and explicitly select password field
        const user = await User.findOne({ email: credentials.email })
          .select('+password')
          .populate('watchlist');
          
        if (!user) {
          return null;
        }

        // Check if user has a password (for OAuth users who might not have one)
        if (!user.password) {
          return null;
        }

        const isValidPassword = await EncryptionUtils.comparePassword(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          watchlist: (user.watchlist || []).map((id: any) => id.toString()), // Convert ObjectIds to strings
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.userId = user.id;
        token.watchlist = user.watchlist || [];
      }
      
      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as 'admin' | 'subscriber' | 'guest';
        session.user.watchlist = token.watchlist as string[];
        
        // Fetch fresh user data from database to ensure up-to-date info
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.userId).populate('watchlist');
          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.name = dbUser.name;
            session.user.image = dbUser.image;
            session.user.watchlist = (dbUser.watchlist || []).map((id: any) => id.toString());
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'apple') {
        await connectToDatabase();
        
        // Check if user exists, create if not
        const existingUser = await User.findOne({ email: user.email }).populate('watchlist');
        
        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'guest',
            emailVerified: new Date(),
            isActive: true,
            preferences: {
              language: 'en',
              autoplay: true,
              videoQuality: 'auto',
            },
            deviceSettings: {
              autoApproveNewDevices: false,
              maxDeviceInactivityDays: 90,
              requireDeviceVerification: true,
              allowDeviceSharing: false,
            },
            profile: {},
            watchlist: [],
            devices: [],
            activeSessions: 0,
          });
          
          // Update the user object with the role from database
          user.role = newUser.role;
          user.id = newUser._id.toString();
          user.watchlist = [];
        } else {
          // Update the user object with the role from database
          user.role = existingUser.role;
          user.id = existingUser._id.toString();
          user.watchlist = (existingUser.watchlist || []).map((id: any) => id.toString());
          
          // Update last login and other info
          await User.findByIdAndUpdate(existingUser._id, {
            lastLogin: new Date(),
            name: user.name, // Update name in case it changed
            image: user.image, // Update image in case it changed
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      await connectToDatabase();
      
      // Update last login
      if (user.id) {
        await User.findByIdAndUpdate(user.id, {
          lastLogin: new Date(),
        });
        
        // Log sign-in event (optional)
        console.log(`User ${user.email} signed in via ${account?.provider || 'credentials'}`);
      }
    },
    async signOut({ session, token }) {
      // Optional: Handle sign-out events
      if (session?.user?.id) {
        console.log(`User ${session.user.email} signed out`);
        
        // Optional: Mark all user sessions as inactive
        try {
          await connectToDatabase();
          await User.findByIdAndUpdate(session.user.id, {
            activeSessions: 0,
          });
        } catch (error) {
          console.error('Error updating user on signout:', error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions for authentication
export async function getServerSession() {
  const { getServerSession: getSession } = await import('next-auth');
  return await getSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireRole(role: 'admin' | 'subscriber' | 'guest') {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== 'admin') {
    throw new Error(`${role} role required`);
  }
  return session;
}

export async function requireAdmin() {
  return await requireRole('admin');
}

export async function requireSubscriber() {
  const session = await requireAuth();
  if (session.user.role !== 'subscriber' && session.user.role !== 'admin') {
    throw new Error('Active subscription required');
  }
  return session;
}

// Custom user management functions
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'subscriber' | 'guest';
}) {
  await connectToDatabase();
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await EncryptionUtils.hashPassword(userData.password);
  
  // Create user
  const user = await User.create({
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
    role: userData.role || 'guest',
    isActive: true,
    preferences: {
      language: 'en',
      autoplay: true,
      videoQuality: 'auto',
    },
    deviceSettings: {
      autoApproveNewDevices: false,
      maxDeviceInactivityDays: 90,
      requireDeviceVerification: true,
      allowDeviceSharing: false,
    },
    profile: {},
    watchlist: [],
    devices: [],
    activeSessions: 0,
  });
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    watchlist: [],
  };
}

export async function updateUserRole(userId: string, role: 'admin' | 'subscriber' | 'guest') {
  await connectToDatabase();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  
  const user = await User.findById(userId).populate('watchlist');
  if (!user) {
    return null;
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    watchlist: (user.watchlist || []).map((id: any) => id.toString()),
  };
}