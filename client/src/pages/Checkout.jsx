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

      const orderRes = await api.post("/create-order", { amount: total });
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
            // ✅ Sanitize cart items — send only what the backend needs
            const sanitizedCart = cart.map((item) => ({
              productId: item.productId?._id ?? item.productId,
              sellerId:  item.sellerId ?? item.productId?.sellerId ?? null,
              price:     item.productId?.price ?? item.price ?? 0,
              quantity:  item.quantity ?? 1,
            }));

            const verifyRes = await api.post("/verify-payment", {
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              cartItems: sanitizedCart,   // ✅ clean, flat objects
              userId: user._id,
            });

            if (verifyRes.data.success) {
              navigate("/order-success", {
                state: {
                  paymentId: response.razorpay_payment_id,
                  orderId:   response.razorpay_order_id,
                  amount:    total,
                },
              });
            } else {
              setError(verifyRes.data.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr?.response?.data ?? verifyErr);
            setError(
              verifyErr.response?.data?.message ??
                "Payment verification failed. Please contact support."
            );
          }
        },
        prefill: { name, email: user.email, contact: phone },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError("Failed to start payment. Please check your backend.");
    }
  };