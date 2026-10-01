import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send OTP email
 * @param {string} email - Receiver email
 * @param {string} otp - OTP code
 */
export async function sendOtpEmail(email, otp) {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const mailOptions = {
    from: `"Shalban Food" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Shalban Food - Password Reset OTP",
    text: `Your Shalban Food password reset OTP is: ${otp}. This OTP will expire soon.`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          padding:30px;
          border-radius:12px;
          border:1px solid #e5e5e5;
        ">
          <h2 style="margin:0 0 10px; color:#222;">
            Shalban Food
          </h2>

          <p style="color:#555;">
            We received a request to reset your password.
          </p>

          <p style="color:#555;">
            Your verification OTP is:
          </p>

          <div style="
            background:#f3f4f6;
            padding:18px;
            text-align:center;
            border-radius:10px;
            margin:20px 0;
          ">
            <strong style="
              font-size:32px;
              letter-spacing:8px;
              color:#111;
            ">
              ${otp}
            </strong>
          </div>

          <p style="color:#666;">
            Enter this OTP on the Shalban Food website to continue
            resetting your password.
          </p>

          <p style="font-size:13px; color:#888;">
            If you did not request a password reset, you can safely ignore
            this email.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:25px 0;" />

          <p style="font-size:12px;color:#999;margin:0;">
            © ${new Date().getFullYear()} Shalban Food
          </p>
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: result.messageId,
  };
}