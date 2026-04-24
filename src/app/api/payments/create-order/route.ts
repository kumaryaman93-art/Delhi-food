import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const { amount } = await req.json();

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  return NextResponse.json({ orderId: order.id, amount: order.amount });
}
