// app/auth/verify-token/VerifyTokenContent.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided.');
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (verificationStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push('/login');
    }
  }, [verificationStatus, countdown, router]);

  const verifyToken = async (verificationToken) => {
    try {
      setIsLoading(true);
      setVerificationStatus('verifying');
      setMessage('Verifying your token...');

      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message || 'Your account has been successfully verified!');
      } else {
        setVerificationStatus('error');
        setMessage(data.error || 'Invalid or expired verification token.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      return;
    }

    try {
      setMessage('Sending new verification email...');
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'New verification email sent!');
      } else {
        setMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      setMessage('Failed to resend verification email.');
      console.error('Resend error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Rest of your JSX remains the same */}
      {/* ... */}
    </div>
  );
}