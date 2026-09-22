import { transporter } from './mailer';

export async function sendOtpEmail({
  to,
  otp,
  purpose = 'Account Verification',
  expireOtp = '2',
}) {
  if (!to) {
    throw new Error('Recipient email is missing');
  }

  await transporter.sendMail({
    from: `"TomartBD" <${process.env.SMTP_USER}>`,
    to,
    subject: `${purpose}`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px">
        <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px">
          <h2 style="color:#004488">TomartBD</h2>
          <p>You requested an OTP for <b>${purpose}</b>.</p>

          <div style="font-size:28px; font-weight:bold; letter-spacing:6px; margin:20px 0; color:#111">
            ${otp}
          </div>

          <p>This OTP will expire in <b> ${expireOtp} minutes</b>.</p>
          <p>If you did not request this, please ignore this email.</p>
 
          <hr />
          <p style="font-size:12px; color:#666">
            © ${new Date().getFullYear()} TomartBD. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}
