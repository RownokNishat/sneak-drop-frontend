import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const RESERVATION_WINDOW_MS = 120000; // Increased to 2 minutes
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Phases: idle → queued → reserved → purchasing → purchased | expired
function ReservationButton({ dropId, userId, stock, socket }) {
  const [phase, setPhase] = useState("idle");
  const [reservation, setReservation] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const phaseRef = useRef("idle");

  // Check for existing reservation on mount or when userId changes
  useEffect(() => {
    if (!userId || !dropId) return;

    const checkExisting = async () => {
      try {
        console.log("🔍 Checking for existing reservation...");
        const res = await fetch(`${BASE_URL}/api/users/${userId}/reservations`);
        if (!res.ok) return;
        const data = await res.json();
        const match = data.find((r) => r.dropId === dropId);
        if (match) {
          console.log("✅ Found active reservation! Switching to Buy Now.");
          activateReservation(match.id, match.expiresAt);
        }
      } catch (err) {
        console.error("Failed to check existing reservations:", err);
      }
    };

    checkExisting();
  }, [userId, dropId, activateReservation]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    },
    []
  );

  // Start the 60-second countdown timer given an expiry timestamp
  const startCountdown = useCallback((expiresAt) => {
    clearInterval(timerRef.current);
    const secs = Math.max(
      0,
      Math.floor((new Date(expiresAt) - Date.now()) / 1000)
    );
    setSecondsLeft(secs);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setPhase("expired");
          phaseRef.current = "expired";
          setTimeout(() => {
            setPhase("idle");
            phaseRef.current = "idle";
          }, 3000);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // Activate the reserved phase — called by either socket event or polling
  const activateReservation = useCallback(
    (reservationId, expiresAt) => {
      clearInterval(pollRef.current);
      setReservation({ id: reservationId });
      setPhase("reserved");
      phaseRef.current = "reserved";
      startCountdown(expiresAt);
    },
    [startCountdown]
  );

  // Poll reservations API every 2s while in queued phase
  const startPolling = useCallback(() => {
    clearInterval(pollRef.current);
    const deadline = Date.now() + RESERVATION_WINDOW_MS;

    pollRef.current = setInterval(async () => {
      // Socket event already handled it — stop polling
      if (phaseRef.current !== "queued") {
        clearInterval(pollRef.current);
        return;
      }
      // Deadline passed — give up
      if (Date.now() > deadline) {
        clearInterval(pollRef.current);
        setPhase("idle");
        phaseRef.current = "idle";
        toast.error("Reservation timed out. Please try again.");
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/users/${userId}/reservations`);
        if (!res.ok) return;
        const data = await res.json();
        const match = data.find((r) => r.dropId === dropId);
        if (match) {
          activateReservation(match.id, match.expiresAt);
        }
      } catch {
        // transient network error — keep polling
      }
    }, 2000);
  }, [userId, dropId, activateReservation]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onReservationSuccess = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      console.log("🚀 Reservation success received via socket");
      activateReservation(data.reservation.id, data.reservation.expiresAt);
    };

    const onReservationFailed = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      console.error("❌ Reservation failed received via socket:", data.message);
      clearInterval(pollRef.current);
      setPhase("idle");
      phaseRef.current = "idle";
      toast.error(data.message || "Reservation failed");
    };

    const onReservationExpired = (data) => {
      if (data.userId !== userId || data.dropId !== dropId) return;
      console.log("⏰ Reservation expired received via socket");
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
      setPhase("expired");
      phaseRef.current = "expired";
      setTimeout(() => {
        setPhase("idle");
        phaseRef.current = "idle";
      }, 3000);
    };

    socket.on("reservation-success", onReservationSuccess);
    socket.on("reservation-failed", onReservationFailed);
    socket.on("reservation-expired", onReservationExpired);

    // If we were already in queue, let's double check immediately in case we missed a message
    if (phase === "queued") {
        startPolling();
    }

    return () => {
      socket.off("reservation-success", onReservationSuccess);
      socket.off("reservation-failed", onReservationFailed);
      socket.off("reservation-expired", onReservationExpired);
    };
  }, [socket, userId, dropId, activateReservation]);

  const handleReserve = async () => {
    if (!userId) {
      toast.error("Please set a username first!");
      return;
    }
    setPhase("queued");
    phaseRef.current = "queued";
    try {
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Start polling immediately — don't rely only on socket event
        startPolling();
      } else {
        toast.error(data.error || "Failed to reserve");
        setPhase("idle");
        phaseRef.current = "idle";
      }
    } catch {
      toast.error("Network error. Please try again.");
      setPhase("idle");
      phaseRef.current = "idle";
    }
  };

  const handlePurchase = async () => {
    if (!reservation) return;
    setPhase("purchasing");
    phaseRef.current = "purchasing";
    try {
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        clearInterval(timerRef.current);
        setPhase("purchased");
        phaseRef.current = "purchased";
        toast.success("Purchase successful!");
      } else {
        toast.error(data.error || "Purchase failed");
        if (data.error === "Reservation has expired") {
          clearInterval(timerRef.current);
          setPhase("expired");
          phaseRef.current = "expired";
          setTimeout(() => {
            setPhase("idle");
            phaseRef.current = "idle";
          }, 3000);
        } else {
          setPhase("reserved");
          phaseRef.current = "reserved";
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
      setPhase("reserved");
      phaseRef.current = "reserved";
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
              secondsLeft <= 10
                ? "text-red-600 animate-pulse"
                : "text-orange-500"
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
