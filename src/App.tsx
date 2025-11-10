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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Cybersource Payment Test</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Access Token:&nbsp;
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            style={{ width: "300px" }}
            placeholder="Optional JWT"
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Reference Number:&nbsp;
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </label>
      </div>

      <button onClick={initiatePayment} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Signed Payment Data"}
      </button>

      {paymentParams && (
        <div style={{ marginTop: "2rem" }}>
          <h3>✅ Signed Parameters (from backend)</h3>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(paymentParams, null, 2)}
          </pre>

          <button
            onClick={goToCybersource}
            style={{
              marginTop: "1rem",
              background: "#007bff",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Go to Cybersource Hosted Payment Page
          </button>
        </div>
      )}
    </div>
  );
}
