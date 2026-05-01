import { useState } from "react";
import { Toaster } from "react-hot-toast";
import DropCard from "./components/DropCard";
import UserSetup from "./components/UserSetup";
import { useSocket } from "./hooks/useSocket";
import { useDrops } from "./hooks/useDrops";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sneaker_user");
    return saved ? JSON.parse(saved) : null;
  });

  const { socket, connected } = useSocket();
  const { drops, loading, error } = useDrops(socket);

  const handleUserSet = (userData) => {
    setUser(userData);
    localStorage.setItem("sneaker_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sneaker_user");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />

      {/* Premium Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-xl">
              👟
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                SNEAK DROP
              </h1>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500"}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {connected ? "Server Live" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                <p className="text-sm font-bold text-slate-900">@{user.username}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {!user ? (
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the Drop</h2>
              <p className="text-slate-500 mb-8">Enter your details to start reserving limited edition sneakers.</p>
              <UserSetup onUserSet={handleUserSet} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Active Drops</h2>
              <p className="text-slate-500">Live stock updates across all items. Be fast.</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[450px] rounded-3xl bg-white animate-pulse border border-slate-100"></div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-6 text-rose-700 text-center">
                <p className="font-bold mb-1">Unable to connect to the marketplace</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            ) : drops.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-slate-900">No Drops Found</h3>
                <p className="text-slate-400 mt-1">Create a new drop via the Admin API to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {drops.map((drop) => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    userId={user.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
