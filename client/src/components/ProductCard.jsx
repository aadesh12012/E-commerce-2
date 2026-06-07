import React from "react";
import Button from "./ui/Button";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-slate-100">
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : `${import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com"}/uploads/${product.image}`
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3ENo Image%3C/text%3E%3Ctext x='50%25' y='58%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='%23cbd5e1'%3E%F0%9F%96%BC%EF%B8%8F%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
            {product.name}
          </h3>
          {product.quantity && product.quantity > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 whitespace-nowrap">
              {product.quantity} left
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
          {product.info}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-slate-900">
            ₹{product.price}
          </span>
          <Button size="sm" onClick={() => onAddToCart(product._id)}>
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}

