import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;

  let clientId: string | null =
    typeof window !== "undefined" ? localStorage.getItem("syncup_client_id") : null;

  if (!clientId) {
    clientId = crypto.randomUUID();
    if (typeof window !== "undefined") {
      localStorage.setItem("syncup_client_id", clientId);
    }
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

  socket = io(WS_URL, {
    query: { clientId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.3,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};