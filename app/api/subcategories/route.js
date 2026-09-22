
import { connectDB } from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";

export async function GET() {
  await connectDB();
  const subs = await SubCategory.find().populate("category");
  return Response.json(subs);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const newSub = await SubCategory.create({
    name: body.name,
    category: body.categoryId,
  });
  return Response.json(newSub);
}