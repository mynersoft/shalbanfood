import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import ShippingSetting from "@/models/ShippingSetting";

export async function GET() {
  try {
    await connectDB();

    let settings = await ShippingSetting.findOne();

    if (!settings) {
      settings = await ShippingSetting.create({});
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to load shipping settings" },
      { status: 500 }
    );
  }
}