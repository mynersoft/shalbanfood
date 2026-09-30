import { NextResponse } from "next/server";
import 		{connectDB} from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { value, password } = await req.json();

    /* -------- VALIDATION -------- */
    if (!value || !password) {
      return NextResponse.json(
        { success: false, message: "Value and password required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* -------- FIND USER -------- */
    const user = await User.findOne({
      $or: [{ email: value }, { phone: value }],
    });

    if (!user || user.otp !== "") {
      return NextResponse.json(
        { success: false, message: "OTP not verified" },
        { status: 403 }
      );
    }

    /* -------- HASH PASSWORD -------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}