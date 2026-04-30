import { useEffect, useRef, useState } from "react";

function StockDisplay({ stock, lastUpdate }) {
  const prevStockRef = useRef(stock);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (stock !== null && prevStockRef.current !== null) {
      if (stock > prevStockRef.current) {
        setAnimation("animate-stock-up");
      } else if (stock < prevStockRef.current) {
        setAnimation("animate-stock-down");
      }

      const timer = setTimeout(() => setAnimation(""), 1000);
      prevStockRef.current = stock;

      return () => clearTimeout(timer);
    }
    prevStockRef.current = stock;
  }, [stock]);

  if (stock === null) {
    return <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`text-lg font-bold ${stock > 0 ? "text-green-600" : "text-red-600"} ${animation}`}
      >
        {stock}
      </div>
      <span className="text-sm text-gray-500">left</span>
      {lastUpdate && (
        <span className="text-xs text-gray-400">
          Updated: {new Date(lastUpdate.timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default StockDisplay;
