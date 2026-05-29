import React from "react";

export default function Card({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

