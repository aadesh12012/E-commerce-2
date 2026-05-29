import React from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import Button from "./Button";

export default function DashboardLayout({
  title,
  userLabel,
  onLogout,
  children,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <span className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {userLabel && (
              <span className="hidden text-sm text-slate-500 sm:inline">
                {userLabel}
              </span>
            )}
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div className="min-w-[140px] flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${accent || "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function TabGroup({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ListRow({ children, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-4 transition-colors duration-200 hover:border-slate-200 hover:bg-white ${className}`}
    >
      {children}
    </div>
  );
}

