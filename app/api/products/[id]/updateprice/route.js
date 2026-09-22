import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/dbConnect";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const formData = await req.formData();
    const regularPrice = formData.get("regularPrice");

    const updated = await Product.findByIdAndUpdate(
      params.id,
      { regularPrice },      // ONLY update price
      { new: true }
    );

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}