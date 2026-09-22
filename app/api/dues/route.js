
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import Due from "@/models/Due";

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await connectDB();
    }

    const due = await Due.find().lean();
    return NextResponse.json(due);
  } catch (err) {
    console.error("Error fetching due:", err);
    return NextResponse.json({ error: "Failed to fetch due" }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const due = await Due.create(body);
  return NextResponse.json(due);
}
