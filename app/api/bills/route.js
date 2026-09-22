import { connectDB } from "@/lib/dbConnect";
import Bill from "@/models/Bill";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const bills = await Bill.find().sort({ createdAt: -1 });
    return NextResponse.json(bills);
  } catch (err) {
    console.error("GET /bills error:", err);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { name, amount, month, status } = data;

    if (!name || amount == null || !month) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check duplicate for same month
    const exists = await Bill.findOne({ name, month });
    if (exists) {
      return NextResponse.json({ error: "Bill already exists for this month" }, { status: 400 });
    }

    const bill = await Bill.create({ name, amount, month, status: status || "paid" });
    return NextResponse.json(bill, { status: 201 });
  } catch (err) {
    console.error("POST /bills error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { _id, name, amount, month, status } = data;

    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updated = await Bill.findByIdAndUpdate(
      _id,
      { name, amount, month, status },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /bills error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { _id } = data;
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await Bill.findByIdAndDelete(_id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /bills error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}