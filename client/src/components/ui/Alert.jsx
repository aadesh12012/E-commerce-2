import React from "react";

const styles = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function Alert({ children, variant = "error", className = "" }) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

