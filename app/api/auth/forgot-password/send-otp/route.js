import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req) {
  try {
    await connectDB();

    const { value } = await req.json();

    /* ---------------- VALIDATION ---------------- */
    if (!value || typeof value !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email or phone is required' },
        { status: 400 }
      );
    }

    /* ---------------- FIND USER ---------------- */
    const user = await User.findOne({
      $or: [{ email: value }, { phone: value }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    /* ---------------- GENERATE OTP ---------------- */
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    /* ---------------- SAVE OTP ---------------- */
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 5 minutes
    await user.save();

    /* ---------------- SEND OTP (EMAIL) ---------------- */
    if (user.email) {
      await sendOtpEmail({
        to: user.email,
        otp,
        purpose: 'Password Reset',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'User email not found' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('SEND OTP ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'Failed to send OTP. Try again.',
      },
      { status: 500 }
    );
  }
}
