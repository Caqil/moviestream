
import Stripe from 'stripe';
import { Settings } from '@/models/Settings';
import { connectToDatabase } from './db';

let stripeClient: Stripe | null = null;

export async function initializeStripe(): Promise<void> {
  await connectToDatabase();
  const settings = await Settings.findOne();
  
  if (!settings?.stripe.isEnabled || !settings.stripe.secretKey) {
    throw new Error('Stripe is not configured or enabled');
  }

  stripeClient = new Stripe(settings.stripe.secretKey);
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe client not initialized. Call initializeStripe() first.');
  }
  return stripeClient;
}

export async function createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  
  const subscriptionData: Stripe.SubscriptionCreateParams = {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  };

  if (trialDays && trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  return await stripe.subscriptions.create(subscriptionData);
}

export async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerId?: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  
  const sessionData: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (customerId) {
    sessionData.customer = customerId;
  }

  return await stripe.checkout.sessions.create(sessionData);
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function constructWebhookEvent(
  body: string,
  signature: string,
  webhookSecret: string
): Promise<Stripe.Event> {
  const stripe = getStripeClient();
  
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
