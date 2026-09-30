'use client'

import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  setEmailOrPhone,
  goToOtp,
  otpVerified,
  resetDone,
} from '@/store/slices/authRecoverySlice'
import { Mail, Phone, Lock, Key, CheckCircle, RotateCcw, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const dispatch = useDispatch()
  const { step, emailOrPhone } = useSelector((state) => state.authRecovery)

  /* ---------------- OTP TIMER STATE ---------------- */
  const [seconds, setSeconds] = useState(0)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const canResend = seconds === 0

  useEffect(() => {
    if (seconds === 0) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds])

  /* ---------------- VALIDATION ---------------- */
  const validateEmailOrPhone = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[+]?[0-9\s\-]+$/
    return emailRegex.test(value) || phoneRegex.test(value)
  }

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters'
    if (!/(?=.*[A-Z])/.test(pass)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(pass)) return 'Password must contain at least one number'
    return ''
  }

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = useMutation({
    mutationFn: async (value) => {
      if (!validateEmailOrPhone(value)) {
        throw new Error('Please enter a valid email or phone number')
      }
      
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      return data
    },
    onSuccess: () => {
      dispatch(goToOtp())
      setSeconds(60)
      toast.success('OTP sent successfully! Check your inbox.', {
        icon: '📧',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 4000,
      })
    },
  })

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = useMutation({
    mutationFn: async (otpCode) => {
      if (otpCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP')
      }
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: emailOrPhone, otp: otpCode }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')
      return data
    },
    onSuccess: () => {
      dispatch(otpVerified())
      setSeconds(0)
      toast.success('OTP verified successfully!', {
        icon: '✅',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 4000,
      })
    },
  })

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = useMutation({
    mutationFn: async (password) => {
      const error = validatePassword(password)
      if (error) throw new Error(error)
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: emailOrPhone, password }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      return data
    },
    onSuccess: () => {
      toast.success('Password reset successful! You can now login with your new password.', {
        icon: '🔐',
        duration: 4000,
      })
      dispatch(resetDone())
      setSeconds(0)
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 4000,
      })
    },
  })

  const handleSendOtp = () => {
    if (!emailOrPhone.trim()) {
      toast.error('Please enter your email or phone number', {
        duration: 3000,
      })
      return
    }
    sendOtp.mutate(emailOrPhone)
  }

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP', {
        duration: 3000,
      })
      return
    }
    verifyOtp.mutate(otp)
  }

  const handleResetPassword = () => {
    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      toast.error(error, { duration: 4000 })
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { duration: 4000 })
      return
    }
    resetPassword.mutate(password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Key className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Password Recovery</h2>
              <p className="text-blue-100 text-sm mt-1">
                {step === 'EMAIL' && 'Enter your email or phone to get started'}
                {step === 'OTP' && 'Enter the verification code sent to you'}
                {step === 'RESET' && 'Create your new password'}
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-400/30 -translate-y-1/2 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 transition-all duration-300 -z-10"
              style={{ 
                width: step === 'EMAIL' ? '0%' : 
                       step === 'OTP' ? '50%' : 
                       '100%' 
              }}
            ></div>
            
            {['Email', 'Verify', 'Reset'].map((label, index) => {
              let stepNumber = index + 1
              let isActive = (step === 'EMAIL' && index === 0) ||
                           (step === 'OTP' && index <= 1) ||
                           (step === 'RESET')
              
              return (
                <div key={label} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${isActive 
                      ? 'bg-white text-blue-600 shadow-lg scale-110' 
                      : 'bg-blue-400/30 text-white'
                    }`}>
                    {isActive ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : 'text-blue-200'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ---------------- STEP 1: EMAIL/PHONE ---------------- */}
          {step === 'EMAIL' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  {emailOrPhone.includes('@') ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => dispatch(setEmailOrPhone(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your email or phone number"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We&apos;ll send a verification code to this email or phone
                </p>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={sendOtp.isPending || !emailOrPhone.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {sendOtp.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Check your spam folder if you don't see the email within a few minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- STEP 2: OTP VERIFICATION ---------------- */}
          {step === 'OTP' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-digit Verification Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtp(value)
                    }}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg tracking-widest font-semibold"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code sent to {emailOrPhone}
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={verifyOtp.isPending || otp.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {verifyOtp.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              {/* Timer & Resend */}
              <div className="text-center pt-4 border-t border-gray-100">
                {canResend ? (
                  <button
                    onClick={() => {
                      sendOtp.mutate(emailOrPhone)
                      setSeconds(60)
                    }}
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resend Verification Code</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>You can request a new code in</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {seconds}s
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- STEP 3: RESET PASSWORD ---------------- */}
          {step === 'RESET' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordError(validatePassword(e.target.value))
                      }}
                      className={`w-full pl-11 pr-11 py-3 border ${passwordError && password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="Enter new password"
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && password && (
                    <p className="text-sm text-red-600 mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 py-3 border ${password !== confirmPassword && confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="Confirm new password"
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                  </div>
                  {password !== confirmPassword && confirmPassword && (
                    <p className="text-sm text-red-600 mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {[
                    { label: 'At least 8 characters', check: password.length >= 8 },
                    { label: 'One uppercase letter', check: /(?=.*[A-Z])/.test(password) },
                    { label: 'One number', check: /(?=.*\d)/.test(password) },
                  ].map((req, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${req.check ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={req.check ? 'text-green-600 font-medium' : ''}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={resetPassword.isPending || !password || !confirmPassword || password !== confirmPassword}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {resetPassword.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}