export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
};

export const initializeRazorpay = async (options: any) => {
  try {
    await loadRazorpayScript();
    return new Promise((resolve, reject) => {
      const razorpay = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
        ...options,
        handler: function (response: any) {
          if (typeof options.handler === "function") {
            options.handler(response);
          } else {
            console.warn("No handler function provided in options.");
          }
          resolve(response);
        },
      });
      razorpay.on("payment.failed", (error: any) => {
        console.error("Payment failed:", error);
        reject(error);
      });
      razorpay.open();
    });
  } catch (error) {
    console.error("Error loading Razorpay:", error);
    throw error;
  }
};
