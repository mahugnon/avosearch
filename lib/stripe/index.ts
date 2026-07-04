import Stripe from "stripe";
import { pricing } from "@/lib/config";

const PLACEHOLDER = /(\.\.\.|change-me|xxx|placeholder)/i;

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || PLACEHOLDER.test(key)) return false;
  return key.startsWith("sk_test_") || key.startsWith("sk_live_");
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export function demoPaymentLabel(cents: number): string {
  return `Demo — ${(cents / 100).toFixed(2)} € (aucun prélèvement réel)`;
}

export { pricing };
