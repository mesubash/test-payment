import { useState } from "react";

export default function App() {
  const [accessToken, setAccessToken] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(`TEST-${Date.now()}`);
  const [loading, setLoading] = useState(false);

  const initiatePaymentAndRedirect = async () => {
    setLoading(true);
    try {
      // Generate fresh reference number for each payment attempt
      const freshReferenceNumber = `TEST-${Date.now()}`;
      setReferenceNumber(freshReferenceNumber);

      const payload = {
        referenceNumber: freshReferenceNumber,
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
        setLoading(false);
        return;
      }

      // ✅ CRITICAL: Immediately submit to Cybersource without caching
      // Each transaction_uuid is unique and expires in 15 minutes
      const { paymentUrl, parameters } = data.data;
      
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;

      for (const [key, value] of Object.entries(parameters)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      
      // Note: Loading state will persist as page redirects
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Error initiating payment");
      setLoading(false);
    }
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
          onClick={initiatePaymentAndRedirect} 
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
          {loading ? "Processing..." : "Pay Now $100"}
        </button>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#fffbeb",
          border: "1px solid #fef3c7",
          borderRadius: "6px"
        }}>
          <div style={{
            fontSize: "0.75rem",
            color: "#92400e",
            lineHeight: "1.5"
          }}>
            <strong>⚠️ Note:</strong> Each payment generates a fresh transaction UUID that expires in 15 minutes. 
            You'll be redirected to Cybersource immediately after initiating payment.
          </div>
        </div>
      </div>
    </div>
  );
}
