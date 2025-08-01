const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config'); // ✅ DB connection
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["https://real-time-insta-chat-application.vercel.app/"],
  credentials: true
}));
// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);

// Setup Socket.io
const io = new Server(server, { cors: { origin: '*' } });

// ✅ Track online users: userId -> socketId
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('✅ New socket connected:', socket.id);

  // When user logs in or dashboard loads
  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`✅ User joined: ${userId} → socket ${socket.id}`);
  });

  // 📨 Real-time message sending
  socket.on('sendMessage', (msg) => {
    console.log(`➡️ sendMessage from ${msg.from} to ${msg.to}`);
    const targetSocketId = onlineUsers[msg.to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiveMessage', msg);
      console.log(`✅ Message delivered to user ${msg.to}`);
    } else {
      console.log(`⚠️ User ${msg.to} is offline`);
    }
  });

  // 📞 Start video call
  socket.on('callUser', ({ toUserId, roomID, fromUserName }) => {
  console.log(`📞 callUser: ${fromUserName} → user ${toUserId} roomID=${roomID}`);
  const targetSocketId = onlineUsers[toUserId];
  if (targetSocketId) {
    io.to(targetSocketId).emit('incomingCall', { roomID, fromUserName });
    console.log(`✅ Incoming call sent to ${toUserId}`);
  } else {
    console.log(`⚠️ User ${toUserId} is offline`);
  }
});


  // ❌ Reject call
  socket.on('rejectCall', ({ toUserId }) => {
    console.log(`❌ rejectCall to user ${toUserId}`);
    const targetSocketId = onlineUsers[toUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('callRejected');
      console.log(`✅ CallRejected event sent to ${toUserId}`);
    }
  });

  // 📴 Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log(`🗑 Removed user ${userId} from onlineUsers`);
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
