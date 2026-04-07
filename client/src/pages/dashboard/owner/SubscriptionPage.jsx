// src/pages/dashboard/owner/SubscriptionPage.jsx
import { useState, useEffect } from "react";
import api from "../../../services/api";

// ── Same plan config as registration ──────────────────
const PLANS = [
  {
    id:           "trial",
    emoji:        "🌱",
    label:        "1 Day Trial",
    price:        0,
    priceLabel:   "FREE",
    duration:     "24 Hours",
    note:         "Card verified via ₹1 auth — refunded instantly",
    features: [
      "Full platform access",
      "Unlimited orders",
      "All features unlocked",
      "No commitment",
    ],
    color:  "#22c55e",
    bg:     "#dcfce7",
    border: "#16a34a",
  },
  {
    id:           "starter",
    emoji:        "🚀",
    label:        "Starter",
    price:        999,
    priceLabel:   "₹999",
    duration:     "1 Month",
    note:         null,
    features: [
      "1 Cafe listing",
      "Unlimited Orders",
      "Menu + Photos",
      "Revenue Analytics",
      "Priority Support",
    ],
    color:  "#f97316",
    bg:     "#fff7ed",
    border: "#f97316",
  },
  {
    id:           "growth",
    emoji:        "⚡",
    label:        "Growth",
    price:        2499,
    priceLabel:   "₹2,499",
    duration:     "3 Months",
    note:         "Save ₹498",
    features: [
      "1 Cafe listing",
      "Unlimited Orders",
      "Menu + Photos",
      "Revenue Analytics",
      "Priority Support",
      "Custom Domain",
    ],
    color:   "#f97316",
    bg:      "#fff7ed",
    border:  "#f97316",
    popular: true,
  },
  {
    id:           "pro",
    emoji:        "👑",
    label:        "Pro",
    price:        7999,
    priceLabel:   "₹7,999",
    duration:     "12 Months",
    note:         "Best value — Save ₹3,989",
    features: [
      "3 Cafe listings",
      "Unlimited Orders",
      "Everything in Growth",
      "Custom Domain",
      "Dedicated Support",
      "Early access to features",
    ],
    color:  "#7c3aed",
    bg:     "#f5f3ff",
    border: "#7c3aed",
  },
];

// ── Status badge ────────────────────────────────────────
const StatusBadge = ({ status, daysLeft, plan, endDate }) => {
  if (status === "active") {
    return (
      <div style={{
        background:     "#dcfce7",
        border:         "1.5px solid #16a34a",
        borderRadius:   "12px",
        padding:        "16px 20px",
        marginBottom:   "24px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        flexWrap:       "wrap",
        gap:            "10px",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#15803d" }}>
            ✅ Subscription Active
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#166534" }}>
            {plan?.toUpperCase()} plan · Expires{" "}
            {new Date(endDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div style={{
          background:   "#15803d",
          color:        "white",
          padding:      "6px 16px",
          borderRadius: "20px",
          fontWeight:   "800",
          fontSize:     "13px",
        }}>
          {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div style={{
        background:   "#fee2e2",
        border:       "1.5px solid #ef4444",
        borderRadius: "12px",
        padding:      "16px 20px",
        marginBottom: "24px",
      }}>
        <p style={{ margin: 0, fontWeight: "800", color: "#b91c1c", fontSize: "15px" }}>
          ⚠️ Subscription Expired
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#7f1d1d" }}>
          Your cafe is hidden from customers. Renew to go live again.
        </p>
      </div>
    );
  }

  return null;
};

// ── Main Component ────────────────────────────────────
export default function SubscriptionPage() {
  const [subStatus,     setSubStatus]     = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedPlan,  setSelectedPlan]  = useState(null);
  const [payLoading,    setPayLoading]    = useState(false);
  const [payError,      setPayError]      = useState("");
  const [paySuccess,    setPaySuccess]    = useState(null);

  // Load Razorpay SDK once
  useEffect(() => {
    if (document.getElementById("razorpay-sdk")) return;
    const script   = document.createElement("script");
    script.id      = "razorpay-sdk";
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.async   = true;
    document.body.appendChild(script);
  }, []);

  // Fetch current subscription status
  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/api/cafe-registration/subscription-status");
      setSubStatus(data);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Razorpay payment handler
  const handlePay = async () => {
    if (!selectedPlan) return;
    setPayLoading(true);
    setPayError("");

    try {
      // Get the owner's cafeId first
      const { data: cafeData } = await api.get("/api/cafe-registration/my-cafe");
      const cafeId = cafeData.cafeId;

      // Create Razorpay order
      const { data: orderData } = await api.post("/api/cafe-registration/create-order", {
        cafeId,
        plan: selectedPlan.id,
      });

      const options = {
        key:         orderData.key,
        amount:      orderData.amount,
        currency:    "INR",
        name:        "Restroon",
        description: `${selectedPlan.label} — ${selectedPlan.duration}`,
        image:       "/logo.png",
        order_id:    orderData.orderId,
        theme:       { color: "#f97316" },

        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post("/api/cafe-registration/verify-and-activate", {
              cafeId,
              plan:                selectedPlan.id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            if (verifyData.success) {
              setPaySuccess({
                plan:    selectedPlan.label,
                endDate: verifyData.endDate,
              });
              setSelectedPlan(null);
              await fetchStatus(); // refresh badge
            }
          } catch {
            setPayError("Payment received but verification failed. Contact support@restroon.com");
          } finally {
            setPayLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPayLoading(false);
            setPayError("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPayError(err.response?.data?.message || "Failed to initiate payment. Try again.");
      setPayLoading(false);
    }
  };

  // ── Derive display values from subStatus ───────────────
  const activeStatus  = subStatus?.isActive  ? "active"  : subStatus?.hasSubscription ? "expired" : null;
  const daysLeft      = subStatus?.daysLeft   ?? 0;
  const activePlan    = subStatus?.plan       ?? null;
  const activeEndDate = subStatus?.endDate    ?? null;

  return (
    <div style={{ minHeight: "100vh", background: "#fffdf5", padding: "32px 24px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "900", marginBottom: "6px" }}>
            CHOOSE YOUR <span style={{ color: "#f97316" }}>PLAN</span> 💰
          </h1>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Subscription payment goes directly to Restroon platform.
          </p>
        </div>

        {/* Current subscription status */}
        {loadingStatus ? (
          <div style={{
            background: "#f3f4f6", borderRadius: "12px", padding: "16px",
            marginBottom: "24px", textAlign: "center", color: "#888", fontSize: "14px",
          }}>
            Loading subscription status...
          </div>
        ) : (
          <StatusBadge
            status={activeStatus}
            daysLeft={daysLeft}
            plan={activePlan}
            endDate={activeEndDate}
          />
        )}

        {/* Payment success banner */}
        {paySuccess && (
          <div style={{
            background:   "#dcfce7", border: "2px solid #16a34a",
            borderRadius: "14px", padding: "20px", marginBottom: "24px", textAlign: "center",
          }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>🎉</p>
            <p style={{ fontWeight: "800", fontSize: "16px", color: "#15803d", margin: "0 0 4px" }}>
              {paySuccess.plan} Plan Activated!
            </p>
            <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
              Active until{" "}
              {new Date(paySuccess.endDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Plan cards grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap:                 "14px",
          marginBottom:        "20px",
        }}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isCurrent  = activePlan === plan.id && subStatus?.isActive;

            return (
              <div
                key={plan.id}
                onClick={() => !isCurrent && setSelectedPlan(plan)}
                style={{
                  border:       `2px solid ${isSelected ? plan.color : isCurrent ? "#22c55e" : "#1a1a1a"}`,
                  borderRadius: "16px",
                  padding:      "20px",
                  cursor:       isCurrent ? "default" : "pointer",
                  background:   isSelected ? plan.bg : isCurrent ? "#f0fdf4" : "white",
                  position:     "relative",
                  boxShadow:    isSelected ? `3px 3px 0 ${plan.color}` : "3px 3px 0 #1a1a1a",
                  transition:   "box-shadow 0.1s, border-color 0.1s",
                }}
              >
                {/* Popular badge */}
                {plan.popular && !isCurrent && (
                  <div style={{
                    position:     "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                    background:   "#f97316", color: "white", padding: "3px 14px",
                    borderRadius: "20px", fontSize: "11px", fontWeight: "800",
                    border:       "1.5px solid #1a1a1a", whiteSpace: "nowrap",
                  }}>
                    ⭐ POPULAR
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div style={{
                    position:     "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                    background:   "#22c55e", color: "white", padding: "3px 14px",
                    borderRadius: "20px", fontSize: "11px", fontWeight: "800",
                    border:       "1.5px solid #1a1a1a", whiteSpace: "nowrap",
                  }}>
                    ✅ CURRENT PLAN
                  </div>
                )}

                {/* Plan header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>{plan.emoji}</div>
                    <div style={{ fontWeight: "900", fontSize: "18px", letterSpacing: "0.5px" }}>
                      {plan.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      {plan.duration}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "900", fontSize: "24px", color: plan.color, lineHeight: "1" }}>
                      {plan.id === "trial" ? "FREE" : plan.priceLabel}
                    </div>
                    {plan.id === "trial" && (
                      <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>₹1 card auth</div>
                    )}
                    {plan.note && (
                      <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700", marginTop: "2px" }}>
                        {plan.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "#f3f4f6", marginBottom: "12px" }} />

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151" }}>
                      <span style={{
                        background:     plan.color + "20", color: plan.color, borderRadius: "50%",
                        width:          "18px", height: "18px", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "10px", flexShrink: 0,
                      }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                {/* Trial card-auth note */}
                {plan.id === "trial" && (
                  <div style={{
                    background:   "#fef3c7", border: "1px solid #fbbf24",
                    borderRadius: "8px", padding: "8px 10px",
                    fontSize:     "11px", color: "#92400e", marginBottom: "12px",
                  }}>
                    💳 ₹1 charged for card verification — refunded immediately
                  </div>
                )}

                {/* Selection bar / days remaining */}
                {!isCurrent ? (
                  <div style={{
                    width: "100%", height: "4px", borderRadius: "4px",
                    background: isSelected ? plan.color : "#f3f4f6", transition: "background 0.15s",
                  }} />
                ) : (
                  <div style={{ textAlign: "center", fontSize: "12px", color: "#15803d", fontWeight: "700", marginTop: "8px" }}>
                    {daysLeft} days remaining
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pay error */}
        {payError && (
          <div style={{
            background:   "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "12px 16px",
            marginBottom: "14px", fontSize: "13px", color: "#b91c1c",
          }}>
            ❌ {payError}
          </div>
        )}

        {/* Selected plan summary + pay CTA */}
        {selectedPlan && (
          <div style={{
            background:   "white", border: `2px solid ${selectedPlan.color}`,
            borderRadius: "14px", padding: "20px", marginBottom: "16px",
            boxShadow:    `3px 3px 0 ${selectedPlan.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "800", fontSize: "16px" }}>
                  {selectedPlan.emoji} {selectedPlan.label} — {selectedPlan.duration}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#888" }}>
                  {selectedPlan.id === "trial"
                    ? "₹1 card verification (refunded) then FREE for 24 hours"
                    : `₹${selectedPlan.price} one-time payment`}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <button
              onClick={handlePay}
              disabled={payLoading}
              style={{
                width:         "100%", padding: "14px",
                background:    selectedPlan.color, color: "white",
                border:        "2px solid #1a1a1a", borderRadius: "12px",
                fontWeight:    "900", fontSize: "16px",
                cursor:        payLoading ? "wait" : "pointer",
                boxShadow:     "3px 3px 0 #1a1a1a", letterSpacing: "0.5px",
              }}
            >
              {payLoading
                ? "Opening payment..."
                : selectedPlan.id === "trial"
                ? "🌱 Start Free Trial →"
                : `Pay ${selectedPlan.priceLabel} →`}
            </button>
          </div>
        )}

        {!selectedPlan && !paySuccess && (
          <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
            👆 Tap any plan to select it
          </p>
        )}

        {/* Secure payment banner */}
        <div style={{
          background:   "#1a1a1a", borderRadius: "14px", padding: "18px 20px",
          display:      "flex", alignItems: "center", gap: "14px", marginTop: "20px",
        }}>
          <span style={{ fontSize: "28px" }}>🔒</span>
          <div>
            <p style={{ color: "white", fontWeight: "800", fontSize: "14px", margin: 0 }}>
              SECURE PAYMENT
            </p>
            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "4px 0 0", lineHeight: "1.5" }}>
              Subscription payments are processed by Razorpay and go directly to the Restroon
              platform account. Your cafe will be activated immediately after payment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}