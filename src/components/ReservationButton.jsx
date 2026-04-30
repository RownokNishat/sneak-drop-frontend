import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const RESERVATION_WINDOW_MS = 120000; 
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function ReservationButton({ dropId, userId, stock, socket }) {
  const [phase, setPhase] = useState("idle");
  const [reservation, setReservation] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const phaseRef = useRef("idle");

  const activateReservation = useCallback((reservationId, expiresAt) => {
    clearInterval(pollRef.current);
    setReservation({ id: reservationId });
    setPhase("reserved");
    phaseRef.current = "reserved";
    
    // Start countdown
    clearInterval(timerRef.current);
    const secs = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
    setSecondsLeft(secs);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setPhase("expired");
          phaseRef.current = "expired";
          setTimeout(() => { setPhase("idle"); phaseRef.current = "idle"; }, 3000);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const startPolling = useCallback(() => {
    clearInterval(pollRef.current);
    const deadline = Date.now() + RESERVATION_WINDOW_MS;
    pollRef.current = setInterval(async () => {
      if (phaseRef.current !== "queued" && phaseRef.current !== "waiting") {
        clearInterval(pollRef.current);
        return;
      }
      if (Date.now() > deadline) {
        clearInterval(pollRef.current);
        setPhase("idle");
        phaseRef.current = "idle";
        toast.error("Queue timeout. Please try again.");
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/users/${userId}/reservations`);
        const data = await res.json();
        const match = data.find((r) => r.dropId === dropId);
        if (match) activateReservation(match.id, match.expiresAt);
      } catch (e) {}
    }, 2500);
  }, [userId, dropId, activateReservation]);

  useEffect(() => {
    if (!socket || !userId || !dropId) return;

    const onResSuccess = (data) => {
      if (data.userId === userId && data.dropId === dropId) {
        activateReservation(data.reservation.id, data.reservation.expiresAt);
      }
    };
    const onResWaiting = (data) => {
      if (data.userId === userId && data.dropId === dropId) {
        setPhase("waiting");
        phaseRef.current = "waiting";
      }
    };
    const onResFailed = (data) => {
      if (data.userId === userId && data.dropId === dropId) {
        setPhase("idle");
        phaseRef.current = "idle";
        toast.error(data.message || "Reservation failed");
      }
    };

    socket.on("reservation-success", onResSuccess);
    socket.on("reservation-waiting", onResWaiting);
    socket.on("reservation-failed", onResFailed);

    return () => {
      socket.off("reservation-success", onResSuccess);
      socket.off("reservation-waiting", onResWaiting);
      socket.off("reservation-failed", onResFailed);
    };
  }, [socket, userId, dropId, activateReservation]);

  const handleReserve = async () => {
    setPhase("queued");
    phaseRef.current = "queued";
    try {
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
      });
      if (res.ok) startPolling();
      else { setPhase("idle"); phaseRef.current = "idle"; toast.error("Sold out or busy!"); }
    } catch (e) { setPhase("idle"); phaseRef.current = "idle"; }
  };

  const handlePurchase = async () => {
    setPhase("purchasing");
    phaseRef.current = "purchasing";
    try {
      const res = await fetch(`${BASE_URL}/api/drops/${dropId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id, userId }),
      });
      if (res.ok) { setPhase("purchased"); phaseRef.current = "purchased"; toast.success("Copped!"); }
      else { setPhase("reserved"); phaseRef.current = "reserved"; toast.error("Purchase failed!"); }
    } catch (e) { setPhase("reserved"); phaseRef.current = "reserved"; }
  };

  if (phase === "purchased") return <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-center font-bold">✓ GOT 'EM</div>;
  if (phase === "expired") return <div className="w-full py-3 rounded-xl bg-red-50 text-red-500 border border-red-100 text-center font-medium">Missed it! Try again.</div>;

  if (phase === "reserved" || phase === "purchasing") {
    return (
      <div className="space-y-3 p-4 rounded-2xl bg-white shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
          <span>Checkout Window</span>
          <span className={secondsLeft <= 10 ? "text-red-500 animate-pulse" : "text-blue-500"}>{secondsLeft}s left</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${secondsLeft <= 10 ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${(secondsLeft / 60) * 100}%` }}
          />
        </div>
        <button
          onClick={handlePurchase}
          disabled={phase === "purchasing"}
          className="w-full py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {phase === "purchasing" ? "VERIFYING..." : "PURCHASE NOW"}
        </button>
      </div>
    );
  }

  const isOutOfStock = stock <= 0;
  return (
    <button
      onClick={handleReserve}
      disabled={isOutOfStock || phase !== "idle"}
      className={`w-full py-4 rounded-xl font-black uppercase tracking-tighter text-lg transition-all duration-300 transform active:scale-95 ${
        isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
        phase === "waiting" ? "bg-amber-400 text-black animate-pulse cursor-wait shadow-lg shadow-amber-200" :
        phase === "queued" ? "bg-blue-600 text-white animate-pulse cursor-wait" :
        "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200"
      }`}
    >
      {isOutOfStock ? "SOLD OUT" : 
       phase === "waiting" ? "In Waitlist..." : 
       phase === "queued" ? "Entering Queue..." : "Reserve Now"}
    </button>
  );
}

export default ReservationButton;
