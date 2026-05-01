import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WS_URL } from "../lib/constants";

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(WS_URL, { transports: ["websocket"] });

    newSocket.on("connect", () => {
      console.log(`Socket connected (${newSocket.id})`);
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
}
