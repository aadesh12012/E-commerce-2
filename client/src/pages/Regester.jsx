import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout, { AuthFooterLink, AuthLink } from "../components/ui/AuthLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function Regester() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter your email address first");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/register/send-otp", { email });
      if (res.data.success) {
        setOtpSent(true);
        setSuccess(res.data.message || "OTP sent to your email");
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !otp) {
      setError("Name, email, password, and OTP are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP from your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/create", {
        name,
        email,
        password,
        otp,
      });
      if (res.data.success) {
        setSuccess(
          res.data.message ||
            "Account created successfully!"
        );
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Black Lake today. OTP verification is required."
    >
      <Card padding="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setOtpSent(false);
                setOtp("");
              }}
              required
              autoComplete="email"
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={sendingOtp || !email}
              onClick={handleSendOtp}
            >
              {sendingOtp
                ? "Sending OTP..."
                : otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
            </Button>
          </div>

          <Input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={!otpSent}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !otpSent}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <AuthFooterLink>
          Already have an account? <AuthLink to="/">Sign in</AuthLink>
        </AuthFooterLink>
      </Card>
    </AuthLayout>
  );
}

export default Regester;
