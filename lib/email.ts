
import nodemailer from 'nodemailer';
import { Settings } from '@/models/Settings';
import { connectToDatabase } from './db';

interface EmailConfig {
  provider: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
}

let emailConfig: EmailConfig | null = null;
let transporter: nodemailer.Transporter | null = null;

export async function initializeEmail(): Promise<void> {
  await connectToDatabase();
  const settings = await Settings.findOne();
  
  if (!settings?.email.isEnabled) {
    throw new Error('Email is not configured or enabled');
  }

  emailConfig = settings.email;
  
  // Create transporter based on provider
  switch (emailConfig.provider) {
    case 'smtp':
      transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.port === 465,
        auth: {
          user: emailConfig.username,
          pass: emailConfig.password,
        },
      });
      break;
      
    case 'sendgrid':
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: emailConfig.apiKey,
        },
      });
      break;
      
    case 'mailgun':
      // Configure Mailgun
      break;
      
    case 'aws-ses':
      // Configure AWS SES
      break;
      
    default:
      throw new Error(`Unsupported email provider: ${emailConfig.provider}`);
  }
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<void> {
  if (!transporter || !emailConfig) {
    throw new Error('Email service not initialized');
  }

  const mailOptions = {
    from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html: htmlContent,
    text: textContent,
  };

  await transporter.sendMail(mailOptions);
}

export const EmailTemplates = {
  deviceVerification: (verificationCode: string, deviceName: string) => ({
    subject: 'Device Verification Required',
    html: `
      <h2>Device Verification</h2>
      <p>A new device "${deviceName}" is trying to access your MovieStream account.</p>
      <p>Verification code: <strong>${verificationCode}</strong></p>
      <p>If this wasn't you, please secure your account immediately.</p>
    `,
  }),

  welcomeEmail: (name: string) => ({
    subject: 'Welcome to MovieStream!',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining MovieStream. Get ready for unlimited entertainment!</p>
      <p>Start exploring our vast library of movies and shows.</p>
    `,
  }),

  subscriptionConfirmation: (planName: string, amount: number) => ({
    subject: 'Subscription Confirmed',
    html: `
      <h2>Subscription Confirmed</h2>
      <p>Your ${planName} subscription has been activated.</p>
      <p>Amount: $${amount}</p>
      <p>Enjoy unlimited streaming!</p>
    `,
  }),

  passwordReset: (resetToken: string, resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  }),
};