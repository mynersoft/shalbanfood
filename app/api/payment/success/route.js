import { NextResponse } from "next/server";
import{ connectDB} from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  const data = await req.formData();

  await connectDB();

  const order = await Order.create({
    totalAmount: data.get("amount"),
    payment: {
      method: data.get("bKash"), // bKash / Nagad / Rocket
      status: "paid",
      transactionId: data.get("tran_id"),
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${order._id}`
  );
}