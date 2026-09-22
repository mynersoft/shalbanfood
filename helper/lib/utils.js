// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +8801XXXXXXXXX
  if (cleaned.startsWith('0')) {
    return `+88${cleaned}`;
  } else if (cleaned.startsWith('88')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('1')) {
    return `+88${cleaned}`;
  } else {
    return `+880${cleaned}`;
  }
}