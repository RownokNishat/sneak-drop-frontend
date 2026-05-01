import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";

function UserSetup({ onUserSet }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      toast.error("Username is required");
      return;
    }

    setLoading(true);
    try {
      const user = await api.users.register(
        trimmed,
        email || `${trimmed}@example.com`
      );
      onUserSet(user);
      toast.success(`Welcome, @${user.username}!`);
    } catch (error) {
      toast.error(error.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 py-4 text-white font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Initializing..." : "Enter Marketplace"}
      </button>
    </form>
  );
}

export default UserSetup;
