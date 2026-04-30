import { useState, useEffect } from "react";
import StockDisplay from "./StockDisplay";
import ReservationButton from "./ReservationButton";
import { useStockUpdates } from "../hooks/useStockUpdates";

function DropCard({ drop, socket, userId }) {
  const [purchases, setPurchases] = useState(drop.purchases || []);
  const { stock, lastUpdate, fetchInitialStock } = useStockUpdates(
    socket,
    drop.id,
  );

  useEffect(() => {
    fetchInitialStock();
  }, [fetchInitialStock]);

  // Listen for new purchases
  useEffect(() => {
    if (!socket) return;

    const handleNewPurchase = (data) => {
      if (data.dropId === drop.id) {
        setPurchases((prev) => {
          const newPurchase = {
            id: data.purchase.id,
            user: { username: data.purchase.username },
            createdAt: data.purchase.createdAt,
          };
          const updated = [newPurchase, ...prev].slice(0, 3);
          return updated;
        });
      }
    };

    socket.on("new-purchase", handleNewPurchase);
    return () => socket.off("new-purchase", handleNewPurchase);
  }, [socket, drop.id]);

  return (
    <div className="rounded-lg bg-white shadow-md overflow-hidden">
      {/* Image */}
      <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
        {drop.name}
      </div>

      <div className="p-4 space-y-3">
        {/* Name & Price */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900">{drop.name}</h3>
          <span className="text-lg font-bold text-green-600">
            ${drop.price}
          </span>
        </div>

        {/* Description */}
        {drop.description && (
          <p className="text-sm text-gray-600">{drop.description}</p>
        )}

        {/* Stock Display */}
        <div className="flex items-center justify-between py-2 border-t border-b border-gray-100">
          <span className="text-sm text-gray-500">Available Stock</span>
          <StockDisplay stock={stock} lastUpdate={lastUpdate} />
        </div>

        {/* Activity Feed */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">
            Recent Purchases
          </h4>
          {purchases.length > 0 ? (
            <ul className="space-y-0.5">
              {purchases.map((purchase, index) => (
                <li
                  key={purchase.id || index}
                  className="text-sm flex justify-between text-gray-600"
                >
                  <span>@{purchase.user.username}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(purchase.createdAt).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No purchases yet</p>
          )}
        </div>

        {/* Reserve / Purchase Button */}
        <ReservationButton dropId={drop.id} userId={userId} stock={stock} socket={socket} />
      </div>
    </div>
  );
}

export default DropCard;
