import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useDrops(socket) {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrops = useCallback(async () => {
    try {
      const data = await api.drops.getAll();
      setDrops(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setDrops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = ({ dropId, availableStock }) => {
      setDrops((prev) =>
        prev.map((d) => (d.id === dropId ? { ...d, availableStock } : d))
      );
    };

    const handleNewDrop = (newDrop) => {
      setDrops((prev) => {
        if (prev.some((d) => d.id === newDrop.id)) return prev;
        return [newDrop, ...prev];
      });
    };

    const handlePurchaseCompleted = ({ dropId, username }) => {
      setDrops((prev) =>
        prev.map((d) => {
          if (d.id !== dropId) return d;
          const updated = [username, ...(d.recentPurchasers || [])].slice(0, 3);
          return { ...d, recentPurchasers: updated };
        })
      );
    };

    socket.on("stockUpdate", handleStockUpdate);
    socket.on("newDrop", handleNewDrop);
    socket.on("purchaseCompleted", handlePurchaseCompleted);

    return () => {
      socket.off("stockUpdate", handleStockUpdate);
      socket.off("newDrop", handleNewDrop);
      socket.off("purchaseCompleted", handlePurchaseCompleted);
    };
  }, [socket]);

  return { drops, loading, error, refresh: fetchDrops };
}
