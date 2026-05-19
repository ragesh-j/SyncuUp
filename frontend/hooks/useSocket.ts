"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import type { SocketStatus } from "@/types/feed";

interface UseSocketReturn {
  socket: Socket | null;
  status: SocketStatus;
  on: <T = unknown>(event: string, handler: (data: T) => void) => () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (socket.connected) setStatus("connected");

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("error");
    const onReconnecting = () => setStatus("connecting");
    const onAck = () => setStatus("connected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnecting", onReconnecting);
    socket.on("connection:ack", onAck);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnecting", onReconnecting);
      socket.off("connection:ack", onAck);
    };
  }, []);

  const on = useCallback(<T = unknown>(
    event: string,
    handler: (data: T) => void
  ): (() => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.off(event);
    socket.on(event, handler as (...args: unknown[]) => void);
    return () => socket.off(event, handler as (...args: unknown[]) => void);
  }, []);

  return { socket: socketRef.current, status, on };
};