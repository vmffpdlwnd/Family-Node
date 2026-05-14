import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import schedulesRouter from './routes/schedules.js';
import chatsRouter from './routes/chats.js';
import roomsRouter from './routes/rooms.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/chats', chatsRouter);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on('chatMessage', (messageData) => {
    io.emit('newMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Backend API server listening on port ${port}`);
});
