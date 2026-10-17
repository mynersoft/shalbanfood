import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'

import { connectDB } from '@/lib/dbConnect'
import User from '@/models/User'
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

    const { value, password, resetToken } = await request.json()

    if (
      typeof value !== 'string' ||
      value.length > 254 ||
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 128 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      typeof resetToken !== 'string' ||
      !/^[a-f0-9]{64}$/.test(resetToken)
    ) {
      return NextResponse.json(
        { message: 'Invalid request or password requirements not met.' },
        { status: 400 }
      )
    }

    const identifier = getIdentifier(value)
    const recovery = await PasswordRecovery.findOne({ identifier })

    if (
      !recovery?.resetTokenHash ||
      !recovery.resetTokenExpiresAt ||
      recovery.resetTokenExpiresAt <= new Date() ||
      !safeCompareHex(sha256(resetToken), recovery.resetTokenHash)
    ) {
      return NextResponse.json(
        { message: 'Reset session expired. Please verify your OTP again.' },
        { status: 400 }
      )
    }

    const user = await User.findById(recovery.userId)

    if (!user) {
      return NextResponse.json(
        { message: 'Unable to reset this account.' },
        { status: 400 }
      )
    }

    user.password = await bcrypt.hash(password, 12)
    await user.save()

    // Token ব্যবহার শেষ; পুনরায় ব্যবহার করা যাবে না।
    await PasswordRecovery.deleteOne({ _id: recovery._id })

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now log in.',
    })
  } catch (error) {
    console.error('Reset password error:', error)

    return NextResponse.json(
      { message: 'Unable to reset your password right now.' },
      { status: 500 }
    )
  }
}