import React from "react";
import { ShoppingBag, LogOut, Search } from "lucide-react";
import logoImg from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

function Navbar({ searchTerm = "", setSearchTerm = () => {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="flex shrink-0 items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
        >
          <img
            src={logoImg}
            alt="Black Lake"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline">
            Black Lake
          </span>
        </button>

        <div className="relative hidden flex-1 sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 transition-colors duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            aria-label="Search products"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/cart")}
            className="hidden sm:inline-flex"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Cart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cart")}
            className="sm:hidden"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 sm:mr-1" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            aria-label="Search products"
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

