import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { generateOTP } from '@/lib/utils';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'name', 'email', 'phone', 'password',
      'shopName', 'shopAddress',
      'bankAccount', 'bankName', 'bankBranch'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate Bangladeshi phone number
    const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Bangladeshi phone number' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: body.email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: body.phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create vendor user
    const vendor = await User.create({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.trim(),
      password: hashedPassword,
      role: 'seller',
      address: {
        area: body.address?.area?.trim(),
        thana: body.address?.thana?.trim(),
        city: body.address?.city?.trim(),
      },
      shopName: body.shopName.trim(),
      shopAddress: body.shopAddress.trim(),
      bankAccount: body.bankAccount.trim(),
      bankName: body.bankName.trim(),
      bankBranch: body.bankBranch.trim(),
      otp,
      otpExpiresAt,
      isVerified: false,
      avatar: body.avatar || `/api/avatar/${body.name.charAt(0).toUpperCase()}`,
    });

    // Send OTP via email/SMS (implement based on your service)
    await sendOTPNotification(vendor.email, vendor.phone, otp);

    // Remove sensitive data from response
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;
    delete vendorResponse.otp;
    delete vendorResponse.otpExpiresAt;

    return NextResponse.json({
      success: true,
      message: 'Vendor registered successfully. Please verify your email/phone with OTP.',
      data: vendorResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Vendor registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to send OTP (implement based on your service)
async function sendOTPNotification(email, phone, otp) {
  try {
    // Send email OTP
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-otp-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    // Send SMS OTP (if you have SMS service)
    const smsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-otp-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });

    // Log responses for debugging
    console.log('Email OTP sent:', await emailResponse.json());
    console.log('SMS OTP sent:', await smsResponse.json());

  } catch (error) {
    console.error('Error sending OTP:', error);
    // Don't fail registration if OTP sending fails
  }
}