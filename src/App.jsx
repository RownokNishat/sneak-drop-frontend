import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import DropCard from "./components/DropCard";
import UserSetup from "./components/UserSetup";
import { useSocket } from "./hooks/useSocket";

function App() {
  const [user, setUser] = useState(null);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, connected } = useSocket(user?.id);

  // Fetch drops
  const fetchDrops = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${BASE_URL}/api/drops`);
      if (!res.ok) throw new Error("Failed to fetch drops");
      const data = await res.json();
      setDrops(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  // Listen for stock updates to refresh drops
  useEffect(() => {
    if (!socket) return;

    const handleGlobalUpdate = () => {
      // Refresh all drops to get latest data
      fetchDrops();
    };

    socket.on("global-stock-update", handleGlobalUpdate);
    return () => socket.off("global-stock-update", handleGlobalUpdate);
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🔥 Sneaker Drop
            </h1>
            <p className="text-sm text-gray-500">Limited edition drops</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-sm text-gray-600">
              {connected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* User Setup */}
        {!user && (
          <div className="mb-8">
            <UserSetup onUserSet={setUser} />
          </div>
        )}

        {/* Drops Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drops...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        ) : drops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No active drops yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create one using the API!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                socket={socket}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
