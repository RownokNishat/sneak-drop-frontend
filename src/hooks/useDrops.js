import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useDrops(socket) {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrops = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/drops`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Failed to fetch drops");
      }
      const data = await res.json();
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

    const handlePurchaseCompleted = ({ dropId, username }) => {
      setDrops((prev) =>
        prev.map((d) => {
          if (d.id === dropId) {
            const newPurchasers = [username, ...(d.recentPurchasers || [])].slice(0, 3);
            return { ...d, recentPurchasers: newPurchasers };
          }
          return d;
        })
      );
    };

    socket.on("stockUpdate", handleStockUpdate);
    socket.on("purchaseCompleted", handlePurchaseCompleted);

    return () => {
      socket.off("stockUpdate", handleStockUpdate);
      socket.off("purchaseCompleted", handlePurchaseCompleted);
    };
  }, [socket]);

  return { drops, loading, error, refresh: fetchDrops };
}
