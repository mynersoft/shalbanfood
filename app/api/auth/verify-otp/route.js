import { NextResponse } from 'next/server'
import { randomBytes, createHash, timingSafeEqual } from 'crypto'

import { connectDB } from '@/lib/dbConnect'
import PasswordRecovery from '@/models/PasswordRecovery'

export const runtime = 'nodejs'

const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex')

function getIdentifier(value) {
  const input = String(value || '').trim()

  if (input.includes('@')) return input.toLowerCase()

  let phone = input.replace(/\D/g, '')
  if (phone.startsWith('00880')) phone = phone.slice(2)
  if (phone.startsWith('880') && phone.length === 13) {
    phone = `0${phone.slice(3)}`
  }

  return `phone:${phone}`
}

function safeCompareHex(a, b) {
  const first = Buffer.from(a, 'hex')
  const second = Buffer.from(b, 'hex')

  return first.length === second.length &&
    first.length > 0 &&
    timingSafeEqual(first, second)
}

export async function POST(request) {
  try {
    await connectDB()

    const { value, otp } = await request.json()

    if (
      typeof value !== 'string' ||
      value.length > 254 ||
      !/^\d{6}$/.test(String(otp || ''))
    ) {
      return NextResponse.json(
        { message: 'Enter a valid 6-digit OTP.' },
        { status: 400 }
      )
    }

    const identifier = getIdentifier(value)
    const recovery = await PasswordRecovery.findOne({ identifier })

    if (
      !recovery ||
      !recovery.otpHash ||
      recovery.expiresAt <= new Date()
    ) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP. Request a new code.' },
        { status: 400 }
      )
    }

    if (recovery.attempts >= 5) {
      await PasswordRecovery.deleteOne({ _id: recovery._id })

      return NextResponse.json(
        { message: 'Too many attempts. Request a new OTP.' },
        { status: 429 }
      )
    }

    if (!safeCompareHex(sha256(String(otp)), recovery.otpHash)) {
      recovery.attempts += 1
      await recovery.save()

      return NextResponse.json(
        { message: 'Incorrect OTP. Please try again.' },
        { status: 400 }
      )
    }

    const resetToken = randomBytes(32).toString('hex')

    recovery.resetTokenHash = sha256(resetToken)
    recovery.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // OTP invalidate; expiresAt-কে reset session-এর মেয়াদে রাখো।
    // এতে TTL index record-টি সঙ্গে সঙ্গে মুছে ফেলবে না।
    recovery.otpHash = sha256(randomBytes(32).toString('hex'))
    recovery.expiresAt = recovery.resetTokenExpiresAt

    await recovery.save()

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)

    return NextResponse.json(
      { message: 'Unable to verify the code right now.' },
      { status: 500 }
    )
  }
}