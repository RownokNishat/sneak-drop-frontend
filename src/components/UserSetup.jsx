import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function UserSetup({ onUserSet }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      toast.error("Username required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          email: email || `${trimmedUsername}@example.com`,
        }),
      });

      if (res.ok) {
        const user = await res.json();
        onUserSet(user);
        toast.success(`Welcome, @${user.username}!`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Connection error. Check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2">
            Username
          </label>
          <input
            type="text"
            placeholder="e.g. sneakerhead_99"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700"
          />
        </div>
        
        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2">
            Email (Optional)
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 py-4 text-white font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Initializing..." : "Enter Marketplace"}
      </button>
    </div>
  );
}

export default UserSetup;
