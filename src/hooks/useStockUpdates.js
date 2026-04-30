import { useState, useEffect, useCallback } from "react";

export function useStockUpdates(socket, dropId) {
  const [stock, setStock] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!socket || !dropId) return;

    // Join drop-specific room
    socket.emit("join-drop", dropId);

    // Listen for stock updates
    const handleStockUpdate = (data) => {
      if (data.dropId === dropId) {
        setStock(data.stock);
        setLastUpdate({
          timestamp: new Date(),
          event: data.event,
        });
      }
    };

    const handleGlobalUpdate = (data) => {
      if (data.dropId === dropId) {
        setStock(data.stock);
        setLastUpdate({
          timestamp: new Date(),
          event: "global",
        });
      }
    };

    socket.on("stock-update", handleStockUpdate);
    socket.on("global-stock-update", handleGlobalUpdate);

    return () => {
      socket.off("stock-update", handleStockUpdate);
      socket.off("global-stock-update", handleGlobalUpdate);
      socket.emit("leave-drop", dropId);
    };
  }, [socket, dropId]);

  const fetchInitialStock = useCallback(async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/api/drops/${dropId}/stock`);
      const data = await response.json();
      setStock(data.stock);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    }
  }, [dropId]);

  return { stock, lastUpdate, fetchInitialStock };
}
