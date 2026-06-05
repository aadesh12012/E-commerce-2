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
        setOtp("");
        setSuccess("OTP sent! Check your server logs for the code.");
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Name, email, and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!otpSent) {
      setError("Please send OTP to your email first");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/create", { name, email, password, otp });
      if (res.data.success) {
        setSuccess(res.data.message || "Account created successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Follow the steps below to register."
    >
      <Card padding="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Step 1 */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Step 1 — Your details
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Step 2 — Verify your email
            </p>
            <div className="space-y-3">
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
                  ? "✓ OTP Sent — Resend"
                  : "Send OTP"}
              </Button>
            </div>
          </div>

          {/* Step 3 — Only shown after OTP is sent */}
          {otpSent && (
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ✓ Step 3 — Enter the OTP from server logs
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP here"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "2px solid #16a34a",
                  background: "#f0fdf4",
                  padding: "10px 14px",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textAlign: "center",
                  color: "#15803d",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "6px", textAlign: "center" }}>
                OTP is visible in your Render server logs
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !otpSent || otp.length !== 6}
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
