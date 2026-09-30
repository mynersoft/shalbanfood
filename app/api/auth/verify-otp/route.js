import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();

    const { value, otp } = await req.json();

	  
    /* -------- VALIDATION -------- */
    if (!value || !otp) {
      return NextResponse.json(
        { success: false, message: 'Value and OTP required' },
        { status: 400 }
      );
    }

    /* -------- FIND USER -------- */
    const user = await User.findOne({
      $or: [{ email: value }, { phone: value }],
    });
	  

	  
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid request. Try again',
 },
        { status: 400 }
      );
	  }
	  

    /* -------- OTP EXPIRE CHECK -------- */
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'OTP expired' },
        { status: 400 }
      );
    }

    /* -------- OTP MATCH -------- */
    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    /* -------- MARK VERIFIED -------- */
    user.otp = '';
    await user.save();

    return NextResponse.json(
      { success: true, message: 'OTP verified' },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP VERIFY ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
