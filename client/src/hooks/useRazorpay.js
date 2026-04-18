import api from '../services/api';

// ✅ Reliable Razorpay script loader — safe for mobile browsers and flaky networks
const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);

        const existingScript = document.getElementById("razorpay-script");
        if (existingScript) {
            existingScript.onload = () => resolve(true);
            existingScript.onerror = () => reject(new Error("Razorpay script failed"));
            return;
        }

        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        
        script.onload = () => resolve(true);
        script.onerror = () => {
            document.head.removeChild(script); // cleanup
            reject(new Error("Failed to load Razorpay payment gateway. Please check your internet connection or disable ad-blockers."));
        };
        
        document.head.appendChild(script);
    });
};

export const useRazorpay = () => {
    const initiatePayment = async ({
        orderId,
        cafeName,
        cafeLogo,
        customerName,
        customerPhone,
        onSuccess,
        onFailure,
        onDismiss
    }) => {
        try {
            // Step 1: Safely load Razorpay SDK
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error("Razorpay SDK not available");

            // Step 2: Create Razorpay order on backend
            // Note: The total amount and platform fees are mapped on the backend using the orderId
            const { data: rzpData } = await api.post('/api/payment/create-order', { orderId });

            if (!rzpData.success) {
                throw new Error("Failed to create payment order");
            }

            // Step 3: Open Razorpay checkout
            const options = {
                key: rzpData.keyId,         // ✅ Master CAFE key id (or specific if routing is used)
                amount: rzpData.amount,     // ✅ Amount MUST be in paise
                currency: rzpData.currency || "INR",
                name: cafeName || "Restroon",
                description: `Order #${orderId.slice(-6)}`,
                image: cafeLogo || "/logo.png",
                order_id: rzpData.razorpayOrderId,
                prefill: {
                    name: customerName || "",
                    contact: customerPhone || "",
                },
                theme: {
                    color: "#F5A623", // Restroon yellow
                },
                modal: {
                    ondismiss: () => {
                        console.log("Payment modal closed by user");
                        onDismiss?.();
                    },
                    // ✅ Critical for mobile — prevents blank screen on UPI redirect
                    escape: true,
                    animation: true,
                },
                handler: async (response) => {
                    // Step 4: Verify payment on backend
                    try {
                        const { data: verifyData } = await api.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderId,
                        });

                        if (verifyData.success) {
                            onSuccess?.();
                        } else {
                            throw new Error(verifyData.message || 'Verification failed');
                        }
                    } catch (err) {
                        onFailure?.(err.response?.data?.message || err.message || 'Payment verification failed');
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", (response) => {
                console.error("Payment failed:", response.error);
                onFailure?.(response.error?.description || "Payment failed");
            });

            rzp.open();
        } catch (err) {
            console.error("initiatePayment error:", err);
            onFailure?.(err.message || "Failed to place order");
        }
    };

    return { initiatePayment };
};
