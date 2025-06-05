// utils/encryption.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { AuthUser } from '@/types';

export class EncryptionUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // JWT token generation
  static generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        type: 'access'
      },
      this.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        type: 'refresh'
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Device fingerprinting
  static generateDeviceFingerprint(userAgent: string, ipAddress: string, additionalData?: any): string {
    const data = {
      userAgent,
      ipAddress,
      ...additionalData
    };
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Session token generation
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verification codes
  static generateVerificationCode(length: number = 6): string {
    return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
  }

  // API key generation
  static generateApiKey(): string {
    return 'mk_' + crypto.randomBytes(32).toString('hex');
  }

  // Encryption for sensitive data
  static encrypt(text: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
