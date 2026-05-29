import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, orderId, amount } = location.state || {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md text-center" padding="p-8 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2
            className="h-8 w-8 text-emerald-600"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
          Payment successful
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thank you for shopping at Black Lake. Your order has been placed.
        </p>

        {(amount || paymentId || orderId) && (
          <dl className="mt-8 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-left text-sm">
            {amount != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Amount paid</dt>
                <dd className="font-semibold text-slate-900">₹{amount}</dd>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Payment ID</dt>
                <dd className="truncate font-mono text-xs text-slate-700">
                  {paymentId}
                </dd>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Order ID</dt>
                <dd className="truncate font-mono text-xs text-slate-700">
                  {orderId}
                </dd>
              </div>
            )}
          </dl>
        )}

        <Button className="mt-8 w-full" size="lg" onClick={() => navigate("/home")}>
          Continue shopping
        </Button>
      </Card>
    </div>
  );
}

export default OrderSuccess;

