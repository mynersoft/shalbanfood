import mongoose from 'mongoose';

export const createAdminNotification = async ({
  title,
  message,
  type,
  link,
}) => {
  await connectDB();

  // Check if model already exists
  const Notification =
    mongoose.models.Notification ||
    (await import('@/models/Notification')).default;

  await Notification.create({
    title,
    message,
    type,
    link,
  });
};
