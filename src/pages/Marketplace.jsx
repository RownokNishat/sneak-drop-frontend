import { Navigate } from "react-router-dom";
import DropCard from "../components/DropCard";

function Marketplace({ drops, loading, error, user }) {
  if (!user) return <Navigate to="/login" />;

  return (
    <section>
      <div className="mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
          Active Drops
        </h2>
        <p className="text-slate-500">
          Live stock updates across all items. Be fast.
        </p>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : drops.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} userId={user.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[450px] rounded-3xl bg-white animate-pulse border border-slate-100"
        />
      ))}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-100 p-6 text-rose-700 text-center">
      <p className="font-bold mb-1">Unable to connect to the marketplace</p>
      <p className="text-sm opacity-80">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
      <div className="text-4xl mb-4">📦</div>
      <h3 className="text-xl font-bold text-slate-900">No Drops Found</h3>
      <p className="text-slate-400 mt-1">
        Check back later or wait for a live broadcast.
      </p>
    </div>
  );
}

export default Marketplace;
