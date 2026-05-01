import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = ({ title = "Oops! Something went wrong", message = "We couldn't find what you were looking for.", code = "404" }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 text-5xl mb-8 shadow-sm">
        ⚠️
      </div>
      <h1 className="text-7xl font-black text-slate-900 mb-4 tracking-tighter">
        {code}
      </h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
        {title}
      </h2>
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed font-medium">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
        >
          Back to Home
        </Link>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
