import { NextResponse } from 'next/server'
import { randomInt, createHash } from 'crypto'

import { connectDB } from '@/lib/dbConnect'
import User from '@/models/User'
import PasswordRecovery from '@/models/PasswordRecovery'
import { sendRecoveryEmail } from '@/lib/sendRecoveryEmail'

export const runtime = 'nodejs'

const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex')

const normalizeEmail = (value) =>
  String(value || '').trim().toLowerCase()

function normalizePhone(value) {
  let phone = String(value || '').replace(/\D/g, '')

  if (phone.startsWith('00880')) phone = phone.slice(2)
  if (phone.startsWith('880') && phone.length === 13) {
    phone = `0${phone.slice(3)}`
  }

  return phone
}

function phoneCandidates(phone) {
  const canonical = normalizePhone(phone)

  if (!canonical) return []

  const candidates = [canonical]

  if (canonical.startsWith('0')) {
    candidates.push(`88${canonical}`)
    candidates.push(`+88${canonical}`)
  }

  if (canonical.startsWith('880')) {
    candidates.push(`+${canonical}`)
  }

  return [...new Set(candidates)]
}

const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const value = String(body.value || '').trim()
    const suppliedEmail = normalizeEmail(body.email)

    if (!value || value.length > 254) {
      return NextResponse.json(
        { message: 'Enter a valid email or phone number' },
        { status: 400 }
      )
    }

    let user = null
    let identifier

    
    if (isEmail(value)) {
      identifier = normalizeEmail(value)
      user = await User.findOne({ email: identifier })
    } else {
      const phone = normalizePhone(value)

      if (phone.length < 10 || phone.length > 15) {
        return NextResponse.json(
          { message: 'Enter a valid phone number' },
          { status: 400 }
        )
      }

      // ফোন দিলে আগে registered email চাইবে
      if (!suppliedEmail) {
        return NextResponse.json({
          requiresEmail: true,
          message: 'Enter the email linked to your account.',
        })
      }

      if (!isEmail(suppliedEmail)) {
        return NextResponse.json(
          { message: 'Enter a valid email address' },
          { status: 400 }
        )
      }

      user = await User.findOne({
        phone: { $in: phoneCandidates(value) },
        email: suppliedEmail,
      })

      identifier = `phone:${phone}`
    }

    // Account আছে কি নেই তা response দিয়ে প্রকাশ না করা
    if (!user?.email) {
      return NextResponse.json({
        success: true,
        message:
          'If the details match your account, a verification code will be sent to its registered email.',
      })
    }

    const now = new Date()

    const existing = await PasswordRecovery.findOne({ identifier })

    if (existing?.resendAfter > now) {
      return NextResponse.json(
        { message: 'Please wait before requesting another OTP.' },
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
          otpHash: sha256(otp),
          expiresAt,
          attempts: 0,
          resendAfter,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      },
      { upsert: true, new: true }
    )

    try {
      await sendRecoveryEmail(user.email, otp)
    } catch (error) {
      // ইমেইল ব্যর্থ হলে OTP আর ব্যবহার করা যাবে না
      await PasswordRecovery.deleteOne({ identifier })

      console.error('Recovery email error:', error.message)

      return NextResponse.json(
        { message: 'Email delivery failed. Please try again later.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'If the details match your account, a code has been sent.',
    })
  } catch (error) {
    console.error('Send OTP error:', error)

    return NextResponse.json(
      { message: 'Unable to process your request right now.' },
      { status: 500 }
    )
  }
}