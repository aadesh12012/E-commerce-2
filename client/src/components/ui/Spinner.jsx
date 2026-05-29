import React from "react";

export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"
        role="status"
        aria-label="Loading"
      />
      {label && (
        <p className="text-sm font-medium text-slate-500">{label}</p>
      )}
    </div>
  );
}

