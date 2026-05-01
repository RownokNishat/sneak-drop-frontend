import { useState, useEffect } from "react";
import ReservationButton from "./ReservationButton";

function DropCard({ drop, userId }) {
  const [recentPurchasers, setRecentPurchasers] = useState(drop.recentPurchasers || []);

  useEffect(() => {
    setRecentPurchasers(drop.recentPurchasers || []);
  }, [drop.recentPurchasers]);

  const percentage = (drop.availableStock / drop.totalStock) * 100;
  const isLowStock = drop.availableStock > 0 && drop.availableStock <= 5;

  return (
    <div className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col h-full">
      {/* Image / Header Area */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        {drop.imageUrl ? (
          <img src={drop.imageUrl} alt={drop.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl group-hover:scale-110 transition-transform duration-700">
            👟
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-wider">
            Limited Drop
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        {/* Title & Price */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {drop.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">{drop.description || "Premium Quality Sneaker"}</p>
          </div>
          <span className="text-2xl font-black text-slate-900">
            ${drop.price}
          </span>
        </div>

        {/* Stock Status */}
        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className={isLowStock ? "text-rose-500 animate-pulse" : "text-slate-400"}>
              {drop.availableStock === 0 ? "Sold Out" : isLowStock ? `Only ${drop.availableStock} Left!` : "Available"}
            </span>
            <span className="text-slate-900">{drop.availableStock}/{drop.totalStock}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                drop.availableStock === 0 ? "bg-slate-300" : 
                isLowStock ? "bg-rose-500" : "bg-indigo-600"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Recent W's
          </h4>
          {recentPurchasers.length > 0 ? (
            <div className="space-y-2">
              {recentPurchasers.map((username, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-bold text-slate-600 animate-in fade-in slide-in-from-left duration-500">
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px]">🔥</div>
                  <span>@{username}</span>
                  <span className="text-[10px] font-medium text-slate-300 ml-auto">Just now</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-300 italic">No wins yet. Be the first.</p>
          )}
        </div>

        {/* Reservation Area */}
        <div className="mt-auto">
          <ReservationButton 
            dropId={drop.id} 
            userId={userId} 
            availableStock={drop.availableStock}
          />
        </div>
      </div>
    </div>
  );
}

export default DropCard;
