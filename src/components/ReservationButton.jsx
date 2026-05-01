import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { RESERVATION_DURATION_S } from "../lib/constants";

function ReservationButton({ dropId, userId, availableStock }) {
  const [phase, setPhase] = useState("idle");
  const [reservationId, setReservationId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(RESERVATION_DURATION_S);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setTimeLeft(RESERVATION_DURATION_S);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase("idle");
          setReservationId(null);
          toast.error("Reservation expired!");
          return RESERVATION_DURATION_S;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReserve = async () => {
    setPhase("reserving");
    try {
      const data = await api.reservations.create(userId, dropId);
      setReservationId(data.id);
      setPhase("reserved");
      startTimer();
      toast.success("Reserved! You have 60 seconds to buy.");
    } catch (error) {
      setPhase("idle");
      if (error.message?.includes("Foreign key")) {
        toast.error("Session expired. Please log out and back in.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handlePurchase = async () => {
    setPhase("purchasing");
    try {
      await api.purchases.create(userId, dropId, reservationId);
      setPhase("purchased");
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("SUCCESS! Item purchased.");
    } catch (error) {
      setPhase("reserved");
      toast.error(error.message);
    }
  };

  if (phase === "purchased") {
    return (
      <div className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-center shadow-lg shadow-emerald-200">
        GOT 'EM!
      </div>
    );
  }

  if (phase === "reserved" || phase === "purchasing") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Expires in
          </span>
          <span
            className={`text-sm font-black ${timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-indigo-600"}`}
          >
            {timeLeft}s
          </span>
        </div>
        <button
          onClick={handlePurchase}
          disabled={phase === "purchasing"}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
        >
          {phase === "purchasing" ? "Processing..." : "Complete Purchase"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReserve}
      disabled={availableStock === 0 || phase === "reserving"}
      className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 ${
        availableStock === 0
          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
      }`}
    >
      {phase === "reserving"
        ? "Checking..."
        : availableStock === 0
          ? "Sold Out"
          : "Reserve Now"}
    </button>
  );
}

export default ReservationButton;
