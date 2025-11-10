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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fafafa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        padding: "3rem 2.5rem",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e5e5",
        textAlign: "center"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          margin: "0 auto 1.5rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem"
        }}>
          💳
        </div>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          marginBottom: "0.5rem",
          color: "#1a1a1a"
        }}>
          Complete Payment
        </h1>

        <p style={{
          color: "#737373",
          fontSize: "0.875rem",
          marginBottom: "2rem"
        }}>
          Click below to proceed with your payment
        </p>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#f8f8f8",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #e5e5e5"
        }}>
          <div style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#737373",
            marginBottom: "0.5rem",
            fontWeight: "500"
          }}>
            Amount
          </div>
          <div style={{
            fontSize: "2rem",
            fontWeight: "600",
            color: "#1a1a1a"
          }}>
            $100.00
          </div>
          <div style={{
            fontSize: "0.75rem",
            color: "#a3a3a3",
            marginTop: "0.25rem"
          }}>
            USD
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.875rem",
            fontSize: "0.9375rem",
            fontWeight: "500",
            backgroundColor: loading ? "#f5f5f5" : "#1a1a1a",
            color: loading ? "#a3a3a3" : "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s"
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#404040";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#1a1a1a";
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.75rem",
          color: "#a3a3a3"
        }}>
          Secured by Cybersource
        </p>
      </div>
    </div>
  );
}
