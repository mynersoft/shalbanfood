'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePassword(password) {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (password.length > 128) return 'Password is too long.'
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.'
  if (!/\d/.test(password)) return 'Add at least one number.'
  return ''
}

async function postJSON(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState('ACCOUNT')
  const [value, setValue] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)

  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)

  const isEmail = EMAIL_REGEX.test(value.trim())
  const isPhone = !isEmail && /^[+\d\s()-]+$/.test(value.trim())
  const passwordError = password ? validatePassword(password) : ''

  useEffect(() => {
    if (seconds <= 0) return

    const timer = setTimeout(() => {
      setSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [seconds])

  async function handleSendOTP(event) {
    event?.preventDefault()

    const cleanValue = value.trim()

    if (!cleanValue) {
      toast.error('Enter your email or phone number.')
      return
    }

    if (!isEmail && !isPhone) {
      toast.error('Enter a valid email or phone number.')
      return
    }

    if (showEmailPrompt && !EMAIL_REGEX.test(accountEmail.trim())) {
      toast.error('Enter a valid registered email address.')
      return
    }

    setLoading(true)

    try {
      const data = await postJSON(
        '/api/auth/forgot-password/send-otp',
        {
          value: cleanValue,
          email: showEmailPrompt ? accountEmail.trim() : '',
        }
      )

      if (data.requiresEmail) {
        setShowEmailPrompt(true)
        toast('Enter the email linked to your account.')
        return
      }

      setStep('OTP')
      setOtp('')
      setResetToken('')
      setSeconds(60)

      toast.success(
        'If your account details match, a verification code has been sent.'
      )
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(event) {
    event?.preventDefault()

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the 6-digit verification code.')
      return
    }

    setLoading(true)

    try {
      const data = await postJSON('/api/auth/verify-otp', {
        value: value.trim(),
        otp,
      })

      if (!data.resetToken) {
        throw new Error('Verification failed. Please try again.')
      }

      setResetToken(data.resetToken)
      setStep('RESET')
      setSeconds(0)

      toast.success('Email verified successfully.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event?.preventDefault()

    const error = validatePassword(password)

    if (error) {
      toast.error(error)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (!resetToken) {
      toast.error('Please verify your OTP again.')
      setStep('OTP')
      return
    }

    setLoading(true)

    try {
      await postJSON('/api/auth/reset-password', {
        value: value.trim(),
        password,
        resetToken,
      })

      setStep('SUCCESS')
      setPassword('')
      setConfirmPassword('')
      setOtp('')
      setResetToken('')
      toast.success('Password reset successfully.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    if (loading) return

    if (step === 'RESET') {
      setStep('OTP')
      setPassword('')
      setConfirmPassword('')
      return
    }

    if (step === 'OTP') {
      setStep('ACCOUNT')
      setOtp('')
      setResetToken('')
      return
    }

    router.push('/login')
  }

  const steps = [
    { id: 'ACCOUNT', label: 'Account', number: 1 },
    { id: 'OTP', label: 'Verify', number: 2 },
    { id: 'RESET', label: 'Reset', number: 3 },
  ]

  const currentIndex =
    step === 'ACCOUNT' ? 0 : step === 'OTP' ? 1 : 2

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-gray-50'

  const primaryButton =
    'flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
            <KeyRound size={27} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Shalban Food
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Password recovery
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-900/5">
          <div className="border-b border-gray-100 px-6 pb-6 pt-7 sm:px-8">
            <button
              type="button"
              onClick={goBack}
              disabled={loading || step === 'SUCCESS'}
              className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-700 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {step === 'ACCOUNT' && 'Forgot your password?'}
              {step === 'OTP' && 'Check your email'}
              {step === 'RESET' && 'Create a new password'}
              {step === 'SUCCESS' && 'You’re all set!'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {step === 'ACCOUNT' &&
                'Enter your registered email or phone number to recover your account.'}
              {step === 'OTP' &&
                'Enter the 6-digit verification code sent to your registered email.'}
              {step === 'RESET' &&
                'Choose a strong password you have not used before.'}
              {step === 'SUCCESS' &&
                'Your password has been changed successfully. You can now sign in.'}
            </p>

            {step !== 'SUCCESS' && (
              <div className="mt-7 flex items-center">
                {steps.map((item, index) => {
                  const completed = index < currentIndex
                  const active = index === currentIndex

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center ${
                        index < 2 ? 'flex-1' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                            completed
                              ? 'bg-emerald-700 text-white'
                              : active
                                ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {completed ? (
                            <Check size={17} />
                          ) : (
                            item.number
                          )}
                        </div>

                        <span
                          className={`mt-2 text-xs font-medium ${
                            active || completed
                              ? 'text-emerald-800'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {index < 2 && (
                        <div
                          className={`mx-3 mb-5 h-0.5 flex-1 rounded ${
                            completed ? 'bg-emerald-600' : 'bg-gray-100'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-7 sm:px-8">
            {step === 'ACCOUNT' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label
                    htmlFor="account"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email or phone number
                  </label>

                  <div className="relative">
                    {isEmail ? (
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    ) : (
                      <Phone
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    )}

                    <input
                      id="account"
                      type="text"
                      autoComplete="username"
                      value={value}
                      onChange={(event) => {
                        setValue(event.target.value)
                        setShowEmailPrompt(false)
                        setAccountEmail('')
                      }}
                      placeholder="Email or 01XXXXXXXXX"
                      className={`${inputClass} pl-11`}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {showEmailPrompt && (
                  <div className="animate-in space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-start gap-2">
                      <Mail
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-700"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Enter your registered email
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          We’ll check whether this email belongs to the
                          account linked to your phone number.
                        </p>
                      </div>
                    </div>

                    <input
                      type="email"
                      autoComplete="email"
                      value={accountEmail}
                      onChange={(event) =>
                        setAccountEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !value.trim() ||
                    (showEmailPrompt &&
                      !EMAIL_REGEX.test(accountEmail.trim()))
                  }
                  className={primaryButton}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Sending verification code...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      {showEmailPrompt
                        ? 'Send OTP to registered email'
                        : 'Continue'}
                    </>
                  )}
                </button>

                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />
                  <p className="text-xs leading-5 text-gray-500">
                    For your security, the verification code is sent to
                    the email registered with your account.
                  </p>
                </div>
              </form>
            )}

            {step === 'OTP' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Mail size={30} />
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-3 block text-center text-sm font-semibold text-gray-700"
                  >
                    Enter verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
                    disabled={loading}
                    required
                  />

                  <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                    The code is valid for 5 minutes. Check your inbox
                    and spam folder.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={primaryButton}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Verify code
                    </>
                  )}
                </button>

                <div className="border-t border-gray-100 pt-4 text-center">
                  {seconds > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in{' '}
                      <span className="font-semibold tabular-nums text-emerald-700">
                        {seconds}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOTP}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                    >
                      <RefreshCw size={16} />
                      Resend verification code
                    </button>
                  )}
                </div>
              </form>
            )}

            {step === 'RESET' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a strong password"
                      className={`${inputClass} pl-11 pr-12`}
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle size={14} />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter password again"
                    className={inputClass}
                    disabled={loading}
                    required
                  />

                  {confirmPassword &&
                    password !== confirmPassword && (
                      <p className="mt-2 text-xs text-red-600">
                        Passwords do not match.
                      </p>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-semibold text-gray-700">
                    Password requirements
                  </p>

                  {[
                    ['At least 8 characters', password.length >= 8],
                    ['One uppercase letter (A–Z)', /[A-Z]/.test(password)],
                    ['One number (0–9)', /\d/.test(password)],
                  ].map(([label, valid]) => (
                    <div
                      key={label}
                      className="mb-2 flex items-center gap-2 last:mb-0"
                    >
                      <CheckCircle2
                        size={15}
                        className={
                          valid ? 'text-emerald-600' : 'text-gray-300'
                        }
                      />
                      <span
                        className={`text-xs ${
                          valid ? 'text-emerald-700' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !!passwordError ||
                    !password ||
                    password !== confirmPassword ||
                    !resetToken
                  }
                  className={primaryButton}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={18} />
                      Reset password
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 'SUCCESS' && (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={42} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Password updated
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your password has been reset. Sign in with your new
                    password to continue shopping at Shalban Food.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className={primaryButton}
                >
                  Continue to login
                </button>
              </div>
            )}
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Shalban Food
        </p>
      </div>
    </main>
  )
}