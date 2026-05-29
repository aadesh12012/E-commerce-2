import React from "react";
import Navbar from "../Navbar";

export default function ShopLayout({ children, searchTerm, setSearchTerm }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="mx-auto w-full pb-16 pt-32 sm:pt-24 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

