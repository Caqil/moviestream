export interface AuthConfig {
  providers: {
    credentials: CredentialsConfig;
    google: OAuthConfig;
    apple: OAuthConfig;
  };
  session: SessionConfig;
  jwt: JWTConfig;
  security: AuthSecurityConfig;
  devices: DeviceConfig;
  callbacks: CallbackConfig;
}

export interface CredentialsConfig {
  enabled: boolean;
  requireEmailVerification: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    blacklist: string[];
  };
}

export interface OAuthConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scope: string[];
  allowDangerous: boolean;
}

export interface SessionConfig {
  strategy: 'jwt' | 'database';
  maxAge: number;
  updateAge: number;
  generateSessionToken: () => string;
}

export interface JWTConfig {
  secret: string;
  encryption: boolean;
  issuer: string;
  audience: string;
  maxAge: number;
  clockTolerance: number;
}

export interface AuthSecurityConfig {
  rateLimit: {
    enabled: boolean;
    maxAttempts: number;
    windowMs: number;
    blockDuration: number;
  };
  bruteForce: {
    enabled: boolean;
    maxAttempts: number;
    lockoutDuration: number;
    progressiveDelay: boolean;
  };
  session: {
    regenerateOnAuth: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    secure: boolean;
    httpOnly: boolean;
  };
  csrf: {
    enabled: boolean;
    sameSite: boolean;
  };
}

export interface DeviceConfig {
  tracking: {
    enabled: boolean;
    fingerprinting: boolean;
    geolocation: boolean;
  };
  verification: {
    required: boolean;
    methods: ('email' | 'sms' | 'totp')[];
    codeExpiration: number;
  };
  limits: {
    enforcement: boolean;
    gracePeriod: number;
    notificationThreshold: number;
  };
  security: {
    anomalyDetection: boolean;
    autoBlock: boolean;
    alertOnNewDevice: boolean;
  };
}

export interface CallbackConfig {
  pages: {
    signIn: string;
    signOut: string;
    error: string;
    verifyRequest: string;
    newUser: string;
  };
  redirects: {
    afterSignIn: string;
    afterSignOut: string;
    afterError: string;
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export const authConfig: AuthConfig = {
  providers: {
    credentials: {
      enabled: true,
      requireEmailVerification: isProduction,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        blacklist: [
          'password',
          '123456',
          'qwerty',
          'admin',
          'moviestream',
        ],
      },
    },
    
    google: {
      enabled: !!process.env.GOOGLE_CLIENT_ID,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      scope: ['openid', 'email', 'profile'],
      allowDangerous: !isProduction,
    },
    
    apple: {
      enabled: !!process.env.APPLE_CLIENT_ID,
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      scope: ['name', 'email'],
      allowDangerous: !isProduction,
    },
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return require('crypto').randomBytes(32).toString('hex');
    },
  },
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
    encryption: isProduction,
    issuer: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    audience: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    clockTolerance: 15, // seconds
  },
  
  security: {
    rateLimit: {
      enabled: true,
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDuration: 60 * 60 * 1000, // 1 hour
    },
    
    bruteForce: {
      enabled: isProduction,
      maxAttempts: 3,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
      progressiveDelay: true,
    },
    
    session: {
      regenerateOnAuth: true,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
      httpOnly: true,
    },
    
    csrf: {
      enabled: isProduction,
      sameSite: true,
    },
  },
  
  devices: {
    tracking: {
      enabled: true,
      fingerprinting: true,
      geolocation: isProduction,
    },
    
    verification: {
      required: isProduction,
      methods: ['email'],
      codeExpiration: 10 * 60 * 1000, // 10 minutes
    },
    
    limits: {
      enforcement: true,
      gracePeriod: 24 * 60 * 60 * 1000, // 24 hours
      notificationThreshold: 0.8, // 80% of limit
    },
    
    security: {
      anomalyDetection: isProduction,
      autoBlock: isProduction,
      alertOnNewDevice: true,
    },
  },
  
  callbacks: {
    pages: {
      signIn: '/auth/signin',
      signOut: '/auth/signout',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request',
      newUser: '/auth/new-user',
    },
    
    redirects: {
      afterSignIn: '/dashboard',
      afterSignOut: '/',
      afterError: '/auth/error',
    },
  },
};