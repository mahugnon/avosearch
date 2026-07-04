import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { markMissionPaidFromWebhook } from "@/lib/actions/payments";
import type Stripe from "stripe";

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const existing = await prisma.processedStripeEvent.findUnique({
    where: { id: event.id },
  });
  if (existing) return;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const missionId = session.metadata?.missionId;
    if (missionId && session.payment_status === "paid") {
      await markMissionPaidFromWebhook(missionId, session.id);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const missionId = intent.metadata?.missionId;
    if (missionId) {
      await markMissionPaidFromWebhook(missionId, intent.id);
    }
  }

  await prisma.processedStripeEvent.create({
    data: { id: event.id, type: event.type },
  });
}

export async function constructStripeEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}
