import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthFooterLink, AuthLink } from "../components/ui/AuthLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function SellerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://e-commerce-2-backend-omws.onrender.com/sellerlogin",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("Seller Login Successful");
        localStorage.setItem("seller", JSON.stringify(res.data.seller));
        navigate("/seller");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.log("Error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (
        err.message === "Network Error" ||
        err.code === "ERR_NETWORK"
      ) {
        setError(
          "Cannot connect to server. Make sure backend is running on port 3000"
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Seller sign in"
      subtitle="Access your seller dashboard and manage inventory."
    >
      <Card padding="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <AuthFooterLink>
          New seller? <AuthLink to="/sellerregister">Register here</AuthLink>
        </AuthFooterLink>
        <AuthFooterLink>
          <AuthLink to="/">Back to customer login</AuthLink>
        </AuthFooterLink>
      </Card>
    </AuthLayout>
  );
}

export default SellerLogin;

