import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

// THE MONOLITH URL (Point this to your Render server)
const MONOLITH_URL = import.meta.env.VITE_API_URL || "https://sneak-realtime-server.onrender.com";

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
    pollRef.current = setInterval(async () => {
      if (phaseRef.current !== "queued" && phaseRef.current !== "waiting") return;
      try {
        const res = await fetch(`${MONOLITH_URL}/api/users/${userId}/reservations`);
        const data = await res.json();
        const match = data.find((r) => r.dropId === dropId);
        if (match) activateReservation(match.id, match.expiresAt);
      } catch (e) {}
    }, 2000);
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

    if (phase === "queued" || phase === "waiting") startPolling();

    return () => {
      socket.off("reservation-success", onResSuccess);
      socket.off("reservation-waiting", onResWaiting);
      socket.off("reservation-failed", onResFailed);
    };
  }, [socket, userId, dropId, activateReservation, phase, startPolling]);

  const handleReserve = async () => {
    setPhase("queued");
    phaseRef.current = "queued";
    try {
      const res = await fetch(`${MONOLITH_URL}/api/drops/${dropId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
      });
      if (res.ok) startPolling();
      else { setPhase("idle"); phaseRef.current = "idle"; toast.error("Sold out!"); }
    } catch (e) { setPhase("idle"); phaseRef.current = "idle"; }
  };

  const handlePurchase = async () => {
    setPhase("purchasing");
    phaseRef.current = "purchasing";
    try {
      const res = await fetch(`${MONOLITH_URL}/api/drops/${dropId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id, userId }),
      });
      if (res.ok) { setPhase("purchased"); phaseRef.current = "purchased"; toast.success("GOT 'EM!"); }
      else { setPhase("reserved"); phaseRef.current = "reserved"; toast.error("Fail!"); }
    } catch (e) { setPhase("reserved"); phaseRef.current = "reserved"; }
  };

  if (phase === "purchased") return <div className="w-full py-4 rounded-xl bg-green-500 text-white text-center font-black">✓ PURCHASED</div>;
  if (phase === "expired") return <div className="w-full py-4 rounded-xl bg-red-100 text-red-600 text-center font-bold">EXPIRED</div>;

  if (phase === "reserved" || phase === "purchasing") {
    return (
      <div className="space-y-4 p-4 rounded-2xl bg-white shadow-2xl border-2 border-blue-500">
        <div className="flex justify-between font-bold text-sm">
          <span>COUPON EXPIRES IN</span>
          <span className="text-blue-600">{secondsLeft}s</span>
        </div>
        <button
          onClick={handlePurchase}
          disabled={phase === "purchasing"}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          {phase === "purchasing" ? "PAYING..." : "BUY NOW"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReserve}
      disabled={stock <= 0 || phase !== "idle"}
      className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 ${
        stock <= 0 ? "bg-gray-200 text-gray-400" :
        phase === "waiting" ? "bg-amber-400 animate-pulse" :
        phase === "queued" ? "bg-blue-400 animate-pulse" : "bg-black text-white hover:bg-gray-800"
      }`}
    >
      {stock <= 0 ? "SOLD OUT" : 
       phase === "waiting" ? "WAITING..." : 
       phase === "queued" ? "QUEUED..." : "RESERVE NOW"}
    </button>
  );
}

export default ReservationButton;
