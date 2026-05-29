import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import api from "../api/axios";
import AuthLayout, { AuthFooterLink, AuthLink } from "../components/ui/AuthLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

function SellerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    address: "",
  });
  const [businessLogo, setBusinessLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setBusinessLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("Enter your email address first");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/seller/register/send-otp", {
        email: formData.email,
      });
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone ||
      !formData.businessName ||
      !formData.address
    ) {
      setError("All fields are required");
      return;
    }

    if (!otpSent) {
      setError("Please verify your email with OTP first");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP from your email");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("phone", formData.phone);
      submitData.append("businessName", formData.businessName);
      submitData.append("address", formData.address);
      submitData.append("otp", otp);
      if (businessLogo) {
        submitData.append("businessLogo", businessLogo);
      }

      const res = await api.post("/seller/register", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccess(
          res.data.message ||
            "Seller account created! Redirecting to login..."
        );
        setTimeout(() => navigate("/sellerlogin"), 2000);
      } else {
        setError(res.data.message || "Registration failed");
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
      title="Seller registration"
      subtitle="Verify your email with OTP to set up your store."
    >
      <Card padding="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Input
            name="name"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={sendingOtp || !formData.email}
              onClick={handleSendOtp}
            >
              {sendingOtp
                ? "Sending OTP..."
                : otpSent
                  ? "Resend OTP"
                  : "Send OTP to email"}
            </Button>
          </div>

          <Input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
            disabled={!otpSent}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
          />

          <Input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            name="businessName"
            type="text"
            placeholder="Business name"
            value={formData.businessName}
            onChange={handleChange}
            required
          />
          <Input
            name="address"
            type="text"
            placeholder="Business address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Business Logo (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="logo-upload"
                disabled={loading}
              />
              <label
                htmlFor="logo-upload"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition-colors hover:border-slate-400 hover:bg-slate-100"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {businessLogo ? businessLogo.name : "Click to upload logo"}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                </div>
              </label>
            </div>
            {logoPreview && (
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {businessLogo?.name}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-red-600 hover:text-red-700"
                    onClick={() => {
                      setBusinessLogo(null);
                      setLogoPreview(null);
                      document.getElementById("logo-upload").value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !otpSent}
          >
            {loading ? "Registering..." : "Verify & register as seller"}
          </Button>
        </form>

        <AuthFooterLink>
          Already registered? <AuthLink to="/sellerlogin">Sign in</AuthLink>
        </AuthFooterLink>
      </Card>
    </AuthLayout>
  );
}

export default SellerRegister;

