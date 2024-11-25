"use client";

import { useState } from "react";
import { loadRazorpay } from "@/lib/razorpay";

interface DonateButtonProps {
  amount?: number;
  className?: string;
}

export default function DonateButton({ amount, className }: DonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDonation = async () => {
    setIsLoading(true);
    try {
      const razorpay = await loadRazorpay();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: (amount || 1000) * 100, // Amount in paise
        currency: "INR",
        name: "Hope Foundation",
        description: "Donation",
        handler: function (response: any) {
          console.log(response);
          // Handle successful payment
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDonation}
      disabled={isLoading}
      className={`bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? "Processing..." : "Donate Now"}
    </button>
  );
}