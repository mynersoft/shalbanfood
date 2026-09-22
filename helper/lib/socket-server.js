import { Server } from 'socket.io';

let io;

export function initSocketIO(server) {
  if (io) return io;

  io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on('send-message', (data) => {
      const { roomId, message, senderId } = data;
      socket.to(roomId).emit('receive-message', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
