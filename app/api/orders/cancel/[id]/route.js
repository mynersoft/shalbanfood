import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { ApiError } from "@/lib/ApiError";

export async function PATCH(req, { params }) {
  try {
    // 🔐 Check session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 🔒 Check order owner
    if (order.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Not your order" },
        { status: 403 }
      );
    }

    // 🚫 Cancel condition
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Order cannot be cancelled at this stage",
        },
        { status: 400 }
      );
    }

    // ❌ Cancel order
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("ORDER CANCEL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}