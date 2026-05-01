import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { isAdmin } from "../lib/auth";

function Header({ user, connected, onLogout }) {
  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-xl">
            👟
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              SNEAK DROP
            </h1>
            <ConnectionStatus connected={connected} />
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {admin && (
              <Link
                to="/admin"
                className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">
                  {admin ? "Administrator" : "Logged in as"}
                </p>
                <p
                  className={`text-sm font-bold ${admin ? "text-indigo-600" : "text-slate-900"}`}
                >
                  @{user.username}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                title="Logout"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function ConnectionStatus({ connected }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500"}`}
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {connected ? "Server Live" : "Disconnected"}
      </span>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Layout({ user, connected, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      <Header user={user} connected={connected} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}

export default Layout;
