import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";

export const runtime = "nodejs";

// GET - Show all categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST - Add category
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    const subCategories = Array.isArray(body.subCategories)
      ? body.subCategories
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];

    const category = await Category.create({
      name,
      subCategories,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category added successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category",
      },
      { status: 500 }
    );
  }
}