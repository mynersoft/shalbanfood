import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ category: 1 });

    const grouped = products.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      categories: grouped,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}