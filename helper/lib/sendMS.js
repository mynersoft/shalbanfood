import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOrderSMS({ phone, orderId, status }) {
  await client.messages.create({
    body: `TomartBD: Your order #${orderId} status is now ${status.toUpperCase()}.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
}