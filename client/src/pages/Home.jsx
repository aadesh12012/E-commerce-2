import React, { useState, useEffect } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import ShopLayout, { PageHeader, EmptyState } from "../components/ui/ShopLayout";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/products", {
        timeout: 5000,
      });

      const productsData = response.data.products || response.data || [];

      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        throw new Error("Products data is not in expected format");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(
        err.message ||
          "Failed to load products. Please check your server is running on port 3000"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const setcartdata = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please login first");
        return;
      }

      await api.post(
        "/addtocart",
        { userId: user._id, productId }
      );

      alert("Product added to cart");
    } catch (err) {
      console.log(err);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.info.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ShopLayout>
        <Spinner label="Loading products..." />
      </ShopLayout>
    );
  }

  if (error) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Unable to load products
          </h2>
          <Alert variant="error" className="mt-4 text-left">
            {error}
          </Alert>
          <ul className="mt-6 space-y-2 text-left text-sm text-slate-500">
            <li>Ensure the backend server is running on port 3000</li>
            <li>Verify seller routes are configured in the API</li>
            <li>Check the browser console for detailed errors</li>
          </ul>
          <Button className="mt-8" onClick={fetchProducts}>
            Try again
          </Button>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <PageHeader
        title="Products"
        subtitle={
          filteredProducts.length > 0
            ? `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"} available`
            : "Browse our catalog"
        }
      />

      {filteredProducts.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No matches found" : "No products yet"}
          description={
            searchTerm
              ? "Try adjusting your search terms."
              : "Check back soon for new arrivals."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={setcartdata}
            />
          ))}
        </div>
      )}
    </ShopLayout>
  );
}

export default Home;

