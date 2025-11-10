"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // STEP 1: Call backend to initiate payment
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          referenceNumber: `TEST-${Date.now()}`,
          amount: "100.00",
          currency: "USD",
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data?.signatureValid) {
        alert("Payment initialization failed: " + result.message);
        return;
      }

      // STEP 2: Submit form to Cybersource
      submitPaymentForm(result.data.paymentUrl, result.data.parameters);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  // Utility function to create and auto-submit form
  const submitPaymentForm = (paymentUrl: string, params: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value as string; // plain JS, no 'as string'
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Complete Payment</h1>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Pay Now $100"}
      </button>
    </main>
  );
}
