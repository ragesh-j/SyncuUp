require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const { getRedisClient } = require("./config/redis");
const feedRouter = require("./routes/feed");

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  // Reconnection handled client-side; server broadcasts to all connected clients
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Track connected clients (for diagnostics / preventing duplicate events)
const connectedClients = new Map();

io.on("connection", (socket) => {
  const clientId = socket.handshake.query.clientId || socket.id;
  console.log(`🔌 Socket connected: ${socket.id} (client: ${clientId})`);

  // If this clientId already has a socket, disconnect the old one
  // This prevents duplicate event receivers when the client reconnects.
  if (connectedClients.has(clientId)) {
    const oldSocketId = connectedClients.get(clientId);
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket && oldSocket.id !== socket.id) {
      oldSocket.disconnect(true);
      console.log(`♻️  Replaced old socket for clientId: ${clientId}`);
    }
  }
  connectedClients.set(clientId, socket.id);

  // Send current connection status to client
  socket.emit("connection:ack", {
    socketId: socket.id,
    clientId,
    connectedAt: new Date().toISOString(),
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${socket.id} (reason: ${reason})`);
    // Only remove from map if this is the current active socket for clientId
    if (connectedClients.get(clientId) === socket.id) {
      connectedClients.delete(clientId);
    }
  });

  socket.on("ping:client", () => {
    socket.emit("pong:server", { ts: Date.now() });
  });
});

// Expose io on app so routes can access it
app.set("io", io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (lightweight)
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString(),
  });
});

app.use("/feed", feedRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const bootstrap = async () => {
  await connectDB();
  getRedisClient();
  server.listen(PORT, () => {
    console.log(`\n🚀 SyncUp Backend running on http://localhost:${PORT}`);
    console.log(`   WebSocket server ready`);
    console.log(`   CORS origin: ${FRONTEND_URL}\n`);
  });
};

bootstrap().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});