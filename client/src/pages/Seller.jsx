import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Upload } from "lucide-react";
import api from "../api/axios";
import DashboardLayout, {
  StatCard,
  TabGroup,
  ListRow,
} from "../components/ui/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Alert from "../components/ui/Alert";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/Toast";

const TABS = [
  { id: "add", label: "Add Product" },
  { id: "products", label: "My Products" },
  { id: "orders", label: "My Orders" },
  { id: "earnings", label: "Earnings" },
  { id: "payout", label: "Payout Details" },
];

function Seller() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    transferredEarnings: 0,
    pendingEarnings: 0,
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [payoutMsg, setPayoutMsg] = useState("");
  const [payoutError, setPayoutError] = useState("");

  const seller = JSON.parse(localStorage.getItem("seller") || "{}");

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "earnings") {
      fetchOrders();
      fetchEarnings();
    }
    if (activeTab === "payout") loadPayoutDetails();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get("/seller/products");
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      toast(
        err.response?.data?.message || "Failed to load your products",
        "error"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchEarnings = async () => {
    setLoadingEarnings(true);
    try {
      const res = await api.get("/seller/earnings");
      setEarnings({
        totalEarnings: res.data.totalEarnings || 0,
        transferredEarnings: res.data.transferredEarnings || 0,
        pendingEarnings: res.data.pendingEarnings || 0,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const loadPayoutDetails = () => {
    if (seller.upiId) setUpiId(seller.upiId);
    if (seller.bankAccount) setBankAccount(seller.bankAccount);
    if (seller.ifscCode) setIfscCode(seller.ifscCode);
    if (seller.accountHolderName) setAccountHolderName(seller.accountHolderName);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !price || !quantity || !imageFile || !info) {
      setError("All fields are required");
      return;
    }
    try {
      const submitData = new FormData();
      submitData.append("name", name);
      submitData.append("price", price);
      submitData.append("quantity", quantity);
      submitData.append("info", info);
      if (imageFile) {
        submitData.append("productImage", imageFile);
      }

      const res = await api.post("/addproduct", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        setSuccess("Product added successfully!");
        toast("Product added successfully!");
        setName("");
        setPrice("");
        setQuantity("");
        setImageFile(null);
        setImagePreview(null);
        setInfo("");
      } else {
        setError(res.data.message || "Failed to add product");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSavePayoutDetails = async (e) => {
    e.preventDefault();
    setPayoutMsg("");
    setPayoutError("");
    try {
      const res = await api.post("/seller/payout-details", {
        upiId,
        bankAccount,
        ifscCode,
        accountHolderName,
      });
      if (res.data.success) {
        setPayoutMsg("Payout details saved successfully!");
        const updatedSeller = {
          ...seller,
          upiId,
          bankAccount,
          ifscCode,
          accountHolderName,
        };
        localStorage.setItem("seller", JSON.stringify(updatedSeller));
      } else {
        setPayoutError(res.data.message || "Failed to save payout details");
      }
    } catch (err) {
      setPayoutError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const openDeleteConfirm = (product) => {
    setConfirmDelete(product);
  };

  const closeDeleteConfirm = () => {
    if (!deletingId) setConfirmDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!confirmDelete) return;

    const productId = confirmDelete._id;
    const previousProducts = products;

    // Optimistic UI: remove from list immediately
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setDeletingId(productId);

    try {
      const res = await api.delete(`/seller/product/${productId}`);
      if (res.data.success) {
        toast(res.data.message || "Product deleted successfully");
        setConfirmDelete(null);
      } else {
        setProducts(previousProducts);
        toast(res.data.message || "Failed to delete product", "error");
      }
    } catch (err) {
      setProducts(previousProducts);
      toast(
        err.response?.data?.message || "Failed to delete product. Try again.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("seller");
    navigate("/sellerlogin");
  };

  return (
    <DashboardLayout
      title="Seller Dashboard"
      userLabel={seller.email || "Seller"}
      onLogout={handleLogout}
    >
      <Card className="mb-8" padding="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome back, {seller.name || "Seller"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage products, track orders, and update payout details.
        </p>
      </Card>

      <TabGroup tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete product?"
        message={
          confirmDelete
            ? `"${confirmDelete.name}" will be permanently removed from the store. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        loading={Boolean(deletingId)}
        onConfirm={handleDeleteProduct}
        onCancel={closeDeleteConfirm}
      />

      {activeTab === "add" && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Add new product</h2>
          <form onSubmit={handleAddProduct} className="mt-6 max-w-xl space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Input
              type="text"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Price (INR)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Quantity available"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Product Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image-upload"
                  required={!imageFile}
                />
                <label
                  htmlFor="product-image-upload"
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </label>
              </div>
              {imagePreview && (
                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {imageFile?.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-red-600 hover:text-red-700"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        document.getElementById("product-image-upload").value = "";
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Product description"
              rows={4}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              required
            />
            <Button type="submit" size="lg">
              Add product
            </Button>
          </form>
        </Card>
      )}

      {activeTab === "products" && (
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                My products{" "}
                <span className="font-normal text-slate-500">
                  ({products.length})
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage listings you have published. Only you can delete your own
                products.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchProducts}
              disabled={loadingProducts}
            >
              Refresh
            </Button>
          </div>

          {loadingProducts ? (
            <Spinner label="Loading your products..." />
          ) : products.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              No products yet. Add your first product from the Add Product tab.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className={`group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity ${
                    deletingId === product._id ? "opacity-50" : ""
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={
                        product.image?.startsWith("http")
                          ? product.image
                          : `${import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com"}/uploads/${product.image}`
                      }
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo Image%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='%23cbd5e1'%3E%F0%9F%96%BC%EF%B8%8F%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-semibold text-slate-900">
                        {product.name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                          product.quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.quantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.quantity || 0} left
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      ₹{product.price}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {product.info}
                    </p>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="mt-4 w-full gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                      disabled={deletingId === product._id}
                      onClick={() => openDeleteConfirm(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === product._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "orders" && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            My orders{" "}
            <span className="font-normal text-slate-500">({orders.length})</span>
          </h2>
          {loadingOrders ? (
            <Spinner label="Loading orders..." />
          ) : orders.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              No orders yet. Purchases will appear here once customers buy your
              products.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <ListRow key={order._id}>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {order.productId?.name || "Product"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Buyer: {order.userId?.name || "Unknown"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-400">
                      {order.paymentId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
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
                  </div>
                </ListRow>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "earnings" && (
        <div className="space-y-6">
          {loadingEarnings ? (
            <Spinner label="Calculating earnings..." />
          ) : (
            <div className="flex flex-wrap gap-4">
              <StatCard
                label="Total earnings"
                value={`₹${earnings.totalEarnings}`}
              />
              <StatCard
                label="Pending payout"
                value={`₹${earnings.pendingEarnings}`}
                accent="text-amber-600"
              />
              <StatCard
                label="Transferred"
                value={`₹${earnings.transferredEarnings}`}
                accent="text-emerald-600"
              />
            </div>
          )}

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Order breakdown
            </h2>
            {orders.length === 0 ? (
              <p className="mt-6 text-center text-sm text-slate-500">
                No orders yet
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <ListRow key={order._id}>
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.productId?.name || "Product"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ₹{order.amount}
                    </p>
                  </ListRow>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "payout" && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            Bank / UPI payout details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin uses these details to transfer your earnings manually.
          </p>

          <form
            onSubmit={handleSavePayoutDetails}
            className="mt-6 max-w-xl space-y-4"
          >
            {payoutMsg && <Alert variant="success">{payoutMsg}</Alert>}
            {payoutError && <Alert variant="error">{payoutError}</Alert>}

            <Input
              label="UPI ID"
              type="text"
              placeholder="seller@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <Input
              label="Account holder name"
              type="text"
              placeholder="Full name on bank account"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
            />
            <Input
              label="Bank account number"
              type="text"
              placeholder="Account number"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
            <Input
              label="IFSC code"
              type="text"
              placeholder="HDFC0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
            />

            <Button type="submit" size="lg">
              Save payout details
            </Button>
          </form>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default Seller;

