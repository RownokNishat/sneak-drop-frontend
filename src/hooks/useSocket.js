import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:3001";

export function useSocket(userId) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected");
      setConnected(true);

      // Join all drops for dashboard updates
      newSocket.emit("join-all-drops");
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setConnected(false);
    });

    // Global event listeners
    newSocket.on("reservation-success", (data) => {
      if (data.userId === userId) {
        toast.success(data.message || "Reservation successful!");
      }
    });

    newSocket.on("reservation-failed", (data) => {
      if (data.userId === userId) {
        toast.error(data.message || "Reservation failed");
      }
    });

    newSocket.on("reservation-expired", (data) => {
      if (data.userId === userId) {
        toast.error(data.message || "Reservation expired");
      }
    });

    newSocket.on("purchase-success", (data) => {
      if (data.userId === userId) {
        toast.success(data.message || "Purchase successful!");
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return { socket, connected };
}
