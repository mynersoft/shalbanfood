export function generateOtp(length = 6) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * Math.pow(10, length - 1)
  ).toString();
}