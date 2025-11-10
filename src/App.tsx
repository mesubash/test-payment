import { useState } from "react";

interface PaymentParams {
  paymentUrl: string;
  parameters: Record<string, string>;
}

export default function App() {
  const [paymentParams, setPaymentParams] = useState<PaymentParams | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(`TEST-${Date.now()}`);
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        referenceNumber,
        amount: "100.00",
        currency: "USD"
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch("http://localhost:8089/api/payment/initiate", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Backend returned:", data);

      if (!data.success || !data.data) {
        alert("Failed: " + (data.message || "Unknown error"));
        return;
      }

      setPaymentParams(data.data);
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  const goToCybersource = () => {
    if (!paymentParams) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentParams.paymentUrl;

    for (const [key, value] of Object.entries(paymentParams.parameters)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

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
        maxWidth: "600px",
        width: "100%",
        padding: "2.5rem",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e5e5"
      }}>
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: "600",
          marginBottom: "0.5rem",
          color: "#1a1a1a"
        }}>
          Cybersource Payment Test
        </h1>
        <p style={{
          color: "#737373",
          fontSize: "0.875rem",
          marginBottom: "2rem"
        }}>
          Configure and initiate a test payment
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "0.5rem",
            color: "#404040"
          }}>
            Access Token*
          </label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter JWT token"
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              fontSize: "0.875rem",
              border: "1px solid #d4d4d4",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#a3a3a3"}
            onBlur={(e) => e.target.style.borderColor = "#d4d4d4"}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "0.5rem",
            color: "#404040"
          }}>
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              fontSize: "0.875rem",
              border: "1px solid #d4d4d4",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#a3a3a3"}
            onBlur={(e) => e.target.style.borderColor = "#d4d4d4"}
          />
        </div>

        <button 
          onClick={initiatePayment} 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
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
          {loading ? "Fetching..." : "Fetch Signed Payment Data"}
        </button>

        {paymentParams && (
          <div style={{ marginTop: "2rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem"
            }}>
              <span style={{ fontSize: "1.25rem" }}>✓</span>
              <h3 style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: 0
              }}>
                Signed Parameters
              </h3>
            </div>
            <pre style={{
              backgroundColor: "#f8f8f8",
              padding: "1rem",
              borderRadius: "6px",
              overflowX: "auto",
              fontSize: "0.8125rem",
              lineHeight: "1.5",
              border: "1px solid #e5e5e5",
              color: "#404040"
            }}>
              {JSON.stringify(paymentParams, null, 2)}
            </pre>

            <button
              onClick={goToCybersource}
              style={{
                width: "100%",
                marginTop: "1rem",
                padding: "0.75rem",
                fontSize: "0.9375rem",
                fontWeight: "500",
                backgroundColor: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#404040"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a1a1a"}
            >
              Proceed to Payment →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
