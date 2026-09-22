// app/api/topics/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Topic from "@/models/Topic";

export async function GET() {
  await connectDB();
  const topics = await Topic.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(topics);
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.title || !body.pdfUrl) {
      return NextResponse.json({ error: "title and pdfUrl required" }, { status: 400 });
    }
    const topic = await Topic.create(body);
    return NextResponse.json(topic, { status: 201 });
  } catch (err) {
    console.error("API topics POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}