import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Phases: idle → queued → reserved → purchasing → purchased | expired
function ReservationButton({ dropId, userId, stock, socket }) {
  const [phase, setPhase] = useState("idle");
  const [reservation, setReservation] = useState(null); // { id, expiresAt }
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (!socket) return;

    const onReservationSuccess = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      const secs = Math.max(
        0,
        Math.floor((new Date(data.reservation.expiresAt) - Date.now()) / 1000)
      );
      setReservation({ id: data.reservation.id });
      setSecondsLeft(secs);
      setPhase("reserved");

      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setPhase("expired");
            setTimeout(() => setPhase("idle"), 3000);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    };

    const onReservationFailed = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      setPhase("idle");
    };

    const onReservationExpired = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      clearInterval(timerRef.current);
      setPhase("expired");
      setTimeout(() => setPhase("idle"), 3000);
    };

    socket.on("reservation-success", onReservationSuccess);
    socket.on("reservation-failed", onReservationFailed);
    socket.on("reservation-expired", onReservationExpired);

    return () => {
      socket.off("reservation-success", onReservationSuccess);
      socket.off("reservation-failed", onReservationFailed);
      socket.off("reservation-expired", onReservationExpired);
    };
  }, [socket, userId, dropId]);

  const handleReserve = async () => {
    if (!userId) {
      toast.error("Please set a username first!");
      return;
    }
    setPhase("queued");
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reserve");
        setPhase("idle");
      }
      // On success: wait for reservation-success socket event to advance phase
    } catch {
      toast.error("Network error. Please try again.");
      setPhase("idle");
    }
  };

  const handlePurchase = async () => {
    if (!reservation) return;
    setPhase("purchasing");
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        clearInterval(timerRef.current);
        setPhase("purchased");
        toast.success("Purchase successful!");
      } else {
        toast.error(data.error || "Purchase failed");
        if (data.error === "Reservation has expired") {
          clearInterval(timerRef.current);
          setPhase("expired");
          setTimeout(() => setPhase("idle"), 3000);
        } else {
          setPhase("reserved");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
      setPhase("reserved");
    }
  };

  const isOutOfStock = stock !== null && stock <= 0;

  if (phase === "purchased") {
    return (
      <div className="w-full py-2 px-4 rounded-lg font-medium text-center bg-green-100 text-green-700 border border-green-200">
        ✓ Purchased!
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="w-full py-2 px-4 rounded-lg font-medium text-center bg-red-100 text-red-600 border border-red-200">
        Reservation expired
      </div>
    );
  }

  if (phase === "reserved" || phase === "purchasing") {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Reserved — expires in</span>
          <span
            className={`font-mono font-bold ${
              secondsLeft <= 10 ? "text-red-600 animate-pulse" : "text-orange-500"
            }`}
          >
            {secondsLeft}s
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${
              secondsLeft <= 10 ? "bg-red-500" : "bg-orange-400"
            }`}
            style={{ width: `${(secondsLeft / 60) * 100}%` }}
          />
        </div>
        <button
          onClick={handlePurchase}
          disabled={phase === "purchasing"}
          className="w-full py-2 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          {phase === "purchasing" ? "Processing..." : "Buy Now"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReserve}
      disabled={phase === "queued" || isOutOfStock || !userId}
      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
        isOutOfStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : phase === "queued"
          ? "bg-yellow-400 text-black cursor-wait animate-pulse"
          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
      }`}
    >
      {isOutOfStock
        ? "Sold Out"
        : phase === "queued"
        ? "In Queue..."
        : "Reserve Now"}
    </button>
  );
}

export default ReservationButton;
