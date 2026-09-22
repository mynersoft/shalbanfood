import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const payload = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASS,
      total_amount: body.totalAmount,
      currency: "BDT",
      tran_id: "TXN_" + Date.now(),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/cancel`,
      cus_name: "Customer",
      cus_phone: body.phone,
      cus_add1: body.address,
      cus_city: body.city,
      product_name: "Order Payment",
      product_category: "General",
      product_profile: "general",
    };

    const formData = new URLSearchParams(payload);

    const res = await fetch(process.env.SSL_SANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}