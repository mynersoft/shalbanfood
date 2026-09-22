import { Server } from 'socket.io';
import { Message, ChatRoom } from '@/models/Chat';

let io;

export function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room
    socket.on('join-room', async (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Mark messages as read
      await Message.updateMany(
        { roomId, receiverId: userId, read: false },
        { read: true }
      );
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const {
          roomId,
          senderId,
          senderModel,
          message,
          productId,
          attachments,
        } = data;

        // Save message to database
        const newMessage = new Message({
          roomId,
          senderId,
          senderModel,
          message,
          productId,
          attachments,
          receiverId: null, // Will be set when admin replies
          receiverModel: null,
        });

        await newMessage.save();

        // Update chat room
        await ChatRoom.findOneAndUpdate(
          { roomId },
          {
            lastMessage: message,
            lastMessageAt: new Date(),
            $inc: { [`unreadCount.admin`]: 1 },
          }
        );

        // Broadcast to room
        io.to(roomId).emit('receive-message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Admin reply
    socket.on('admin-reply', async (data) => {
      try {
        const { roomId, adminId, message, receiverId } = data;

        const newMessage = new Message({
          roomId,
          senderId: adminId,
          senderModel: 'Admin',
          message,
          receiverId,
          receiverModel: 'User',
        });

        await newMessage.save();

        // Update chat room
        await ChatRoom.findOneAndUpdate(
          { roomId },
          {
            lastMessage: message,
            lastMessageAt: new Date(),
            $inc: { [`unreadCount.${receiverId}`]: 1 },
          }
        );

        io.to(roomId).emit('receive-message', newMessage);
      } catch (error) {
        console.error('Error sending admin reply:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (roomId, userId) => {
      socket.to(roomId).emit('user-typing', userId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
