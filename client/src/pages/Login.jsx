import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout, { AuthFooterLink, AuthLink } from "../components/ui/AuthLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function Login() {
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
        "https://e-commerce-2-backend-omws.onrender.com/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.user && res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Enter your credentials.">
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
          Don&apos;t have an account? <AuthLink to="/register">Create one</AuthLink>
        </AuthFooterLink>
        <AuthFooterLink>
          Selling on Black Lake?{" "}
          <AuthLink to="/sellerlogin">Seller login</AuthLink>
        </AuthFooterLink>
      </Card>
    </AuthLayout>
  );
}

export default Login;

