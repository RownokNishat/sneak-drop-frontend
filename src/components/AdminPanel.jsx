import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    totalStock: "",
    imageUrl: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.totalStock) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/drops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("New Drop Broadcasted!");
        setFormData({ name: "", description: "", price: "", totalStock: "", imageUrl: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create drop");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl border border-slate-800">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Admin Control</h2>
          <p className="text-slate-400 text-sm">Initialize a new limited sneaker drop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Product Name*</label>
            <input
              type="text"
              placeholder="e.g. Jordan 1 Retro"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Price ($)*</label>
            <input
              type="number"
              placeholder="180"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
          <textarea
            placeholder="Tell the story of this drop..."
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold h-24"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Initial Stock*</label>
            <input
              type="number"
              placeholder="100"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
              value={formData.totalStock}
              onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Initializing Drop..." : "GO LIVE 🚀"}
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
