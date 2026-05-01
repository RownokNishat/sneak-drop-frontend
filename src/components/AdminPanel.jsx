import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";

function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    totalStock: "",
    imageUrl: "",
  });

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.totalStock) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await api.drops.create(formData);
      toast.success("New Drop Broadcasted!");
      setFormData({
        name: "",
        description: "",
        price: "",
        totalStock: "",
        imageUrl: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to create drop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-slate-500 mt-2">
            Manage live inventory and broadcast new hype drops.
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back to Marketplace
        </Link>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              label="Product Name*"
              placeholder="e.g. Jordan 1 Retro"
              value={formData.name}
              onChange={updateField("name")}
            />
            <InputField
              label="Price ($)*"
              type="number"
              placeholder="180"
              value={formData.price}
              onChange={updateField("price")}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
              Description
            </label>
            <textarea
              placeholder="Tell the story of this drop..."
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold h-32 resize-none"
              value={formData.description}
              onChange={updateField("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              label="Initial Stock*"
              type="number"
              placeholder="100"
              value={formData.totalStock}
              onChange={updateField("totalStock")}
            />
            <InputField
              label="Image URL"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={updateField("imageUrl")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 py-6 rounded-2xl font-black text-xl transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "INITIALIZING DROP..." : "BROADCAST TO MARKETPLACE 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default AdminPanel;
