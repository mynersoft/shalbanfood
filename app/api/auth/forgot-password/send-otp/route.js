import { NextResponse } from 'next/server'
import { randomInt, createHash } from 'crypto'

import { connectDB } from '@/lib/dbConnect'
import User from '@/models/User'
import PasswordRecovery from '@/models/PasswordRecovery'
import { sendRecoveryEmail } from '@/lib/sendRecoveryEmail'

export const runtime = 'nodejs'

const hash = (value) =>
  createHash('sha256').update(value).digest('hex')

const normalizeEmail = (value) =>
  String(value || '').trim().toLowerCase()

const normalizePhone = (value) =>
  String(value || '').replace(/\D/g, '')

const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const value = String(body.value || '').trim()
    const suppliedEmail = normalizeEmail(body.email)

    if (!value) {
      return NextResponse.json(
        { message: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    let user
    let identifier

    if (isEmail(value)) {
      // Email দিয়ে account খোঁজা
      identifier = normalizeEmail(value)
      user = await User.findOne({ email: identifier })
    } else {
      // Phone দিয়ে account খোঁজা
      const phone = normalizePhone(value)

      if (phone.length < 10 || phone.length > 15) {
        return NextResponse.json(
          { message: 'Enter a valid phone number' },
          { status: 400 }
        )
      }

      // প্রথম ধাপে ফোন নম্বর দিলে ইমেইল চাইবে
      if (!suppliedEmail) {
        return NextResponse.json({
          requiresEmail: true,
          message: 'Enter the email address linked to your account',
        })
      }

      // এখানে User Model-এর phone field ব্যবহার করা হয়েছে।
      // Database-এ phone একই normalized format-এ রাখা উত্তম।
      user = await User.findOne({
        phone,
        email: suppliedEmail,
      })

      identifier = `phone:${phone}`
    }

    // Account enumeration কমাতে generic response
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message:
          'If the account details match, a verification code will be sent to the registered email.',
      })
    }

    const existing = await PasswordRecovery.findOne({ identifier })

    if (existing?.resendAfter && existing.resendAfter > new Date()) {
      return NextResponse.json(
        { message: 'Please wait before requesting another code' },
        { status: 429 }
      )
    }

    const otp = String(randomInt(100000, 1000000))
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const resendAfter = new Date(Date.now() + 60 * 1000)

    await PasswordRecovery.findOneAndUpdate(
      { identifier },
      {
        $set: {
          userId: user._id,
          otpHash: hash(otp),
          expiresAt,
          attempts: 0,
          resendAfter,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    try {
      await sendRecoveryEmail(user.email, otp)
    } catch (error) {
      await PasswordRecovery.deleteOne({ identifier })

      console.error('Recovery email failed:', error.message)

      return NextResponse.json(
        { message: 'Unable to send email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'If the account details match, a verification code has been sent.',
    })
  } catch (error) {
    console.error('Send recovery OTP error:', error)

    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}