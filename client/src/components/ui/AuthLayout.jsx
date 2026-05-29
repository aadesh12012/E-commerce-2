import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../../assets/logo.png";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Black Lake"
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/20"
          />
          <span className="text-lg font-semibold tracking-tight">Black Lake</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Modern commerce,
            <br />
            built for scale.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            A clean storefront experience for customers, sellers, and administrators.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Black Lake. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <img
            src={logoImg}
            alt="Black Lake"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold text-slate-900">Black Lake</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({ children }) {
  return <p className="mt-6 text-center text-sm text-slate-500">{children}</p>;
}

export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-medium text-slate-900 underline-offset-4 transition-colors hover:text-slate-700 hover:underline"
    >
      {children}
    </Link>
  );
}

