import { NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent } from "@/lib/stripe/webhook";
import { isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = await constructStripeEvent(body, signature);
    await handleStripeEvent(event);
    return NextResponse.json({ received: true, id: event.id });
  } catch (error) {
    console.error("[stripe webhook]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
