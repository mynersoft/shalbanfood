import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { checkAuthRole } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = await checkAuthRole();

    if (!auth) {
      return NextResponse.json(
        { message: "অনুমতি নেই" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const conditions = [
      { name: { $regex: escapeRegex(q), $options: "i" } },
      { phone: { $regex: escapeRegex(q), $options: "i" } },
    ];

    if (mongoose.isValidObjectId(q)) {
      conditions.push({ _id: q });
    }

    const users = await User.find({
      $or: conditions,
    })
      .select("_id name phone email role")
      .limit(10)
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
        customerId: String(user._id),
        name: user.name || "নাম নেই",
        phone: user.phone || "",
        email: user.email || "",
      })),
    });
  } catch (error) {
    console.error("Customer search error:", error);

    return NextResponse.json(
      { message: "কাস্টমার সার্চ করা যায়নি" },
      { status: 500 }
    );
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}