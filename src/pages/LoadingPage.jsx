import React from "react";

const LoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-bounce">
          👟
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-bold text-slate-900 tracking-tight">
        Lacing up...
      </h2>
      <p className="mt-2 text-slate-500 font-medium animate-pulse">
        Fetching the latest drops for you.
      </p>
    </div>
  );
};

export default LoadingPage;
