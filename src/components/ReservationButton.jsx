import { useState } from "react";
import toast from "react-hot-toast";

function ReservationButton({ dropId, userId, stock, onReserve }) {
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);

  const handleReserve = async () => {
    if (!userId) {
      toast.error("Please set a username first!");
      return;
    }

    setLoading(true);
    setQueueStatus("pending");

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/api/drops/${dropId}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setQueueStatus("queued");
        if (onReserve) onReserve(data);
      } else {
        toast.error(data.error || "Failed to reserve");
        setQueueStatus("error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Reservation error:", error);
      toast.error("Network error. Please try again.");
      setQueueStatus("error");
      setLoading(false);
    }
  };

  const isOutOfStock = stock !== null && stock <= 0;

  return (
    <button
      onClick={handleReserve}
      disabled={loading || isOutOfStock || !userId}
      className={`
        w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
        ${
          isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : loading
              ? "bg-yellow-400 text-black cursor-wait animate-pulse"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
        }
      `}
    >
      {isOutOfStock
        ? "Sold Out"
        : loading
          ? queueStatus === "queued"
            ? "Processing..."
            : "Requesting..."
          : "Reserve Now"}
    </button>
  );
}

export default ReservationButton;
