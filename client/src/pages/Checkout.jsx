import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ShopLayout, { PageHeader } from "../components/ui/ShopLayout";
import Spinner from "../components/ui/Spinner";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        navigate("/");
        return;
      }

      const user = JSON.parse(userString);
      setName(user.name || "");

      const res = await api.get(
        `/cart-total/${user._id}`
      );

      setCart(res.data.cart || []);
      setTotal(res.data.totalAmount || 0);
    } catch (err) {
      console.log("Error fetching cart details:", err);
      setError("Could not load cart details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!address || !city || !zip || !phone) {
      setError("Please fill in all shipping details");
      return;
    }

    try {
      const userString = localStorage.getItem("user");
      if (!userString) return;
      const user = JSON.parse(userString);

      const orderRes = await api.post(
        "/create-order",
        { amount: total }
      );

      const order = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Black Lake Store",
        description: "E-Commerce Checkout",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(
              "/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems: cart,
                userId: user._id,
              }
            );

            if (verifyRes.data.success) {
              navigate("/order-success", {
                state: {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: total,
                },
              });
            } else {
              setError(
                verifyRes.data.message || "Payment verification failed"
              );
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            if (verifyErr.response?.data) {
              console.error("Verification error details:", verifyErr.response.data);
            }
            setError(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          }
        },
        prefill: {
          name,
          email: user.email,
          contact: phone,
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError("Failed to start payment. Please check your backend.");
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <Spinner label="Loading checkout..." />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <PageHeader
        title="Checkout"
        subtitle="Enter shipping details to complete your purchase"
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Shipping details
          </h2>
          <form onSubmit={handlePayment} className="mt-6 space-y-4">
            <Input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="ZIP / Postal code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </div>
            <Input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Pay ₹{total} via Razorpay
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No items in cart</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {cart.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between gap-4 py-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.productId?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-slate-900">
                    ₹{item.productId?.price * item.quantity}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-semibold text-slate-900">
              ₹{total}
            </span>
          </div>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => navigate("/cart")}
          >
            Back to cart
          </Button>
        </Card>
      </div>
    </ShopLayout>
  );
}

export default Checkout;

