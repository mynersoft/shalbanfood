import {connectDB} from "@/lib/dbConnect";
import AyBay from "@/models/Aybay";

export async function GET() {
  await connectDB();
  const data = await AyBay.find().sort({ createdAt: -1 });

  return Response.json({
    success: true,
    data,
  });
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const newAyBay = await AyBay.create(body);

  return Response.json({
    success: true,
    data: newAyBay,
  });
}