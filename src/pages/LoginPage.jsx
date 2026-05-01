import { Navigate } from "react-router-dom";
import UserSetup from "../components/UserSetup";

function LoginPage({ onUserSet, user }) {
  if (user) return <Navigate to="/" />;

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome to the Drop
        </h2>
        <p className="text-slate-500 mb-8">
          Enter your details to start reserving limited edition sneakers.
        </p>
        <UserSetup onUserSet={onUserSet} />
      </div>
    </div>
  );
}

export default LoginPage;
