import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout, {
  StatCard,
  TabGroup,
  ListRow,
} from "../components/ui/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Alert from "../components/ui/Alert";

const TABS = [
  { id: "users", label: "Users" },
  { id: "products", label: "Products" },
  { id: "sellers", label: "Sellers & Payouts" },
  { id: "orders", label: "Orders" },
];

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payoutInput, setPayoutInput] = useState({});
  const [payoutMsg, setPayoutMsg] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "sellers") fetchSellers();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/sellers");
      setSellers(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/user/${id}`);
      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/product/${id}`);
      fetchProducts();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePayout = async (sellerId, sellerName) => {
    const amount = payoutInput[sellerId];
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid payout amount.");
      return;
    }
    if (!window.confirm(`Mark ₹${amount} as paid to ${sellerName}?`)) return;
    try {
      const res = await api.post(
        "/admin/payout-seller",
        { sellerId, amount: Number(amount) }
      );
      if (res.data.success) {
        setPayoutMsg(res.data.message);
        setPayoutInput((prev) => ({ ...prev, [sellerId]: "" }));
        fetchSellers();
        setTimeout(() => setPayoutMsg(""), 4000);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "successful")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <DashboardLayout
      title="Admin Panel"
      userLabel={user.email}
      onLogout={handleLogout}
    >
      <div className="mb-8 flex flex-wrap gap-4">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Sellers" value={sellers.length} />
        <StatCard label="Products" value={products.length} />
        <StatCard label="Total Revenue" value={`₹${totalRevenue}`} />
        <StatCard label="Orders" value={orders.length} />
      </div>

      {payoutMsg && (
        <Alert variant="success" className="mb-6">
          {payoutMsg}
        </Alert>
      )}

      <TabGroup tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <Card>
        {loading ? (
          <Spinner label="Loading data..." />
        ) : (
          <>
            {activeTab === "users" && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  All users{" "}
                  <span className="font-normal text-slate-500">
                    ({users.length})
                  </span>
                </h2>
                <div className="mt-4 space-y-3">
                  {users.length === 0 ? (
                    <p className="text-sm text-slate-500">No users found.</p>
                  ) : (
                    users.map((u) => (
                      <ListRow key={u._id}>
                        <div>
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={u.role === "admin" ? "admin" : "default"}>
                            {u.role}
                          </Badge>
                          {u.role !== "admin" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </ListRow>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "products" && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  All products{" "}
                  <span className="font-normal text-slate-500">
                    ({products.length})
                  </span>
                </h2>
                <div className="mt-4 space-y-3">
                  {products.length === 0 ? (
                    <p className="text-sm text-slate-500">No products found.</p>
                  ) : (
                    products.map((p) => (
                      <ListRow key={p._id}>
                        <div className="flex items-center gap-4">
                          <img
                             src={p.image?.startsWith("http") ? p.image : `${import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com"}/uploads/${p.image}`}
                             alt={p.name}
                             className="h-12 w-12 rounded-lg object-cover bg-slate-100"
                             onError={(e) => {
                               e.target.onerror = null; // prevent infinite loop
                               e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f1f5f9'/%3E%3C/svg%3E";
                             }}
                          />
                          <div>
                            <p className="font-medium text-slate-900">
                              {p.name}
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                              ₹{p.price}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteProduct(p._id)}
                        >
                          Delete
                        </Button>
                      </ListRow>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "sellers" && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  Sellers & payout management
                </h2>
                <div className="mt-4 space-y-4">
                  {sellers.length === 0 ? (
                    <p className="text-sm text-slate-500">No sellers found.</p>
                  ) : (
                    sellers.map((sel) => (
                      <div
                        key={sel._id}
                        className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {sel.name}
                            </p>
                            <p className="text-sm text-slate-500">{sel.email}</p>
                          </div>
                          <Badge variant="warning">Seller</Badge>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            ["UPI", sel.upiId],
                            ["Bank", sel.bankAccount],
                            ["IFSC", sel.ifscCode],
                            ["Holder", sel.accountHolderName],
                          ].map(([label, val]) => (
                            <p key={label} className="text-slate-600">
                              <span className="text-slate-400">{label}: </span>
                              {val || "Not set"}
                            </p>
                          ))}
                        </div>

                        <div className="inline-block rounded-lg border border-slate-200 bg-white px-4 py-2">
                          <p className="text-xs text-slate-500">Transferred</p>
                          <p className="font-semibold text-slate-900">
                            ₹{sel.earningsTransferred || 0}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-3 border-t border-slate-200 pt-4">
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="max-w-[140px]"
                            value={payoutInput[sel._id] || ""}
                            onChange={(e) =>
                              setPayoutInput((prev) => ({
                                ...prev,
                                [sel._id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            onClick={() => handlePayout(sel._id, sel.name)}
                          >
                            Pay seller
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "orders" && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  All orders{" "}
                  <span className="font-normal text-slate-500">
                    ({orders.length})
                  </span>
                </h2>
                <div className="mt-4 space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-sm text-slate-500">No orders yet.</p>
                  ) : (
                    orders.map((order) => (
                      <ListRow key={order._id}>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {order.productId?.name || "Product"}
                          </p>
                          <p className="text-sm text-slate-500">
                            Buyer: {order.userId?.name} · Seller:{" "}
                            {order.sellerId?.name || "Unknown"}
                          </p>
                          <p className="mt-1 truncate font-mono text-xs text-slate-400">
                            {order.paymentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900">
                            ₹{order.amount}
                          </p>
                          <Badge
                            variant={
                              order.paymentStatus === "successful"
                                ? "success"
                                : "warning"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </ListRow>
                    ))
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default Admin;

