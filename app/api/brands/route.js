
import { connectDB } from "@/lib/dbConnect";
import Brand from "@/models/Brand";

export async function GET() {
  await connectDB();
  const brands = await Brand.find();
  return Response.json(brands);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const newBrand = await Brand.create({ name: body.name });
  return Response.json(newBrand);
}