import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import ShopLayout, { PageHeader, EmptyState } from "../components/ui/ShopLayout";
import Spinner from "../components/ui/Spinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userString);
      const res = await api.get(
        `/cart-total/${user._id}`
      );
      setCart(res.data.cart || []);
      setTotal(res.data.totalAmount || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return;
      const user = JSON.parse(userString);
      await api.post(
        "/removeitem",
        { userId: user._id, cartItemId }
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <ShopLayout>
        <Spinner label="Loading cart..." />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader
        title="Your cart"
        subtitle={
          cart.length > 0
            ? `${cart.length} item${cart.length !== 1 ? "s" : ""} in your cart`
            : "Your cart is empty"
        }
      />

      {cart.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Add products from the store to get started."
          action={
            <Button onClick={() => navigate("/home")}>Browse products</Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) =>
              item.productId ? (
                <Card
                  key={item._id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center"
                  padding="p-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={
                        item.productId.image?.startsWith("http")
                          ? item.productId.image
                          : `${import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com"}/uploads/${item.productId.image}`
                      }
                      alt={item.productId.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.productId.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      ₹{item.productId.price} each
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className="text-slate-600">
                        Qty:{" "}
                        <span className="font-medium text-slate-900">
                          {item.quantity}
                        </span>
                      </span>
                      <span className="text-slate-600">
                        Subtotal:{" "}
                        <span className="font-semibold text-slate-900">
                          ₹{Number(item.productId.price) * item.quantity}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(item._id)}
                    className="shrink-0 self-start sm:self-center"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </Button>
                </Card>
              ) : (
                <Card key={item._id} padding="p-4">
                  <p className="text-sm font-medium text-red-600">
                    Product unavailable
                  </p>
                </Card>
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900">
                Order summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Items ({cart.length})</dt>
                  <dd className="font-medium text-slate-900">₹{total}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-emerald-600">Free</dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-lg font-semibold text-slate-900">
                  ₹{total}
                </span>
              </div>
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handleProceedToCheckout}
              >
                Proceed to checkout
              </Button>
              <Button
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => navigate("/home")}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Continue shopping
              </Button>
            </Card>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}

export default Cart;

