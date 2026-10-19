import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import CustomerDue from "@/models/CustomerDue";
import { checkAuthRole } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await checkAuthRole();

    if (!auth) {
      return NextResponse.json(
        { message: "অনুমতি নেই" },
        { status: 401 }
      );
    }

    await connectDB();

    const dues = await CustomerDue.find()
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      dues: dues.map((item) => ({
        _id: String(item._id),
        customerId: String(item.customerId),
        customerName: item.customerName,
        totalDue: item.totalDue,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Load dues error:", error);

    return NextResponse.json(
      { message: "বকেয়ার তালিকা লোড করা যায়নি" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await checkAuthRole();

    if (!auth) {
      return NextResponse.json(
        { message: "অনুমতি নেই" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const customerId = String(body.customerId || "").trim();
    const totalDue = Number(body.totalDue);

    if (!mongoose.isValidObjectId(customerId)) {
      return NextResponse.json(
        { message: "সঠিক কাস্টমার নির্বাচন করুন" },
        { status: 400 }
      );
    }

    if (
      body.totalDue === "" ||
      body.totalDue === null ||
      body.totalDue === undefined ||
      !Number.isFinite(totalDue) ||
      totalDue < 0
    ) {
      return NextResponse.json(
        { message: "সঠিক বকেয়ার পরিমাণ লিখুন" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(customerId)
      .select("_id name")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "এই কাস্টমার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const due = await CustomerDue.findOneAndUpdate(
      { customerId: user._id },
      {
        $set: {
          customerName: user.name || "নাম নেই",
          totalDue,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "বকেয়া সফলভাবে আপডেট হয়েছে",
      due: {
        _id: String(due._id),
        customerId: String(due.customerId),
        customerName: due.customerName,
        totalDue: due.totalDue,
        updatedAt: due.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update due error:", error);

    return NextResponse.json(
      { message: "বকেয়া আপডেট করা যায়নি" },
      { status: 500 }
    );
  }
}