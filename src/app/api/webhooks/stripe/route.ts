// /api/webhooks/stripe
import { db } from "@/server/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
	const body = await req.text();
	const signature = (await headers()).get("Stripe-Signature") as string;
	console.log(signature);
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (error) {
		console.log("invalid signature");
		return NextResponse.json(
			{ error: "Invalid signature" },
			{ status: 400 },
		);
	}

	const session = event.data.object as Stripe.Checkout.Session;

	if (event.type === "checkout.session.completed") {
		const credits = Number(session.metadata?.credits);
		const userId = session.client_reference_id;
		if (!userId || !credits) {
			console.log("Missing userid");
			return NextResponse.json(
				{ error: "UserId or credits is missing" },
				{ status: 400 },
			);
		}

		await db.stripeTransaction.create({
			data: {
				userId,
				credits,
			},
		});
		await db.user.update({
			where: { id: userId },
			data: {
				credits: {
					increment: credits,
				},
			},
		});
		return NextResponse.json(
			{ success: "Credits has been added to account" },
			{ status: 200 },
		);
	}
}

export async function GET(req: NextRequest) {
	return NextResponse.json({ success: "Hellow" });
}
