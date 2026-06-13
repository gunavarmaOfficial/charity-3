"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializeRazorpay } from "@/lib/razorpay";
import toast from "react-hot-toast";
import { CreditCard, Landmark, QrCode, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  amount: z
    .string()
    .regex(/^\d+$/, "Amount must be a number")
    .refine((value) => Number(value) >= 100, "Minimum donation is ₹100"),
  currency: z.string().nonempty("Currency is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  address: z.string().optional(),
  postalCode: z.string().optional(),
});

interface PaymentConfig {
  razorpayApiKey: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountName: string;
  branchName: string;
  upiId: string;
  qrCodeUrl: string;
}

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "bank" | "upi">("bank");
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load payment config dynamically
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          if (result.payment) {
            setPaymentConfig(result.payment);
            // Default to razorpay if key is present, else bank
            if (result.payment.razorpayApiKey) {
              setPaymentMethod("razorpay");
            } else {
              setPaymentMethod("bank");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load payment config", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchPaymentConfig();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    if (paymentMethod === "razorpay") {
      setIsSubmitting(true);
      try {
        const razorpayKey = paymentConfig?.razorpayApiKey || process.env.NEXT_PUBLIC_RAZORPAY_API_KEY;
        
        await initializeRazorpay({
          key: razorpayKey,
          amount: data.amount * 100,
          currency: data.currency,
          name: "Sri Viswa Charitable Trust",
          description: "Donation",
          prefill: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
          theme: {
            color: "#0F172A",
          },
        });

        toast.success("Donation successful!");
      } catch (error) {
        toast.error("Payment failed or cancelled. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Manual Bank / UPI donation pledge submission
      setIsSubmitting(true);
      try {
        // Here we could hit a backend logs if needed, for now trigger standard alert
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Thank you! Please complete your transfer using the details displayed.");
      } catch (err) {
        toast.error("Error submitting donation query.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loadingConfig) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-sm text-gray-500">Loading donation details...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-150"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Support Our Cause</h2>

      {/* Payment Method Selector */}
      <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
        {paymentConfig?.razorpayApiKey && (
          <button
            type="button"
            onClick={() => setPaymentMethod("razorpay")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              paymentMethod === "razorpay"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Online Pay
          </button>
        )}
        <button
          type="button"
          onClick={() => setPaymentMethod("upi")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            paymentMethod === "upi"
              ? "bg-white text-gray-950 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <QrCode className="w-4 h-4" />
          UPI QR Code
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("bank")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            paymentMethod === "bank"
              ? "bg-white text-gray-950 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Landmark className="w-4 h-4" />
          Bank Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Render Form Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name" className="text-gray-700">Full Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. John Doe"
              className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="10-digit number"
              className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-700">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min={100}
              {...register("amount")}
              placeholder="Min. ₹100"
              className={errors.amount ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="currency" className="text-gray-700">Currency</Label>
            <select
              id="currency"
              {...register("currency")}
              className={`block w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.currency ? "border-red-500" : ""
              }`}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
            {errors.currency && (
              <p className="text-red-500 text-xs mt-1">
                {errors.currency.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="state" className="text-gray-700">State</Label>
            <Input
              id="state"
              {...register("state")}
              placeholder="e.g. Tamil Nadu"
              className={errors.state ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">
                {errors.state.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country" className="text-gray-700">Country</Label>
            <Input
              id="country"
              {...register("country")}
              placeholder="e.g. India"
              className={errors.country ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">
                {errors.country.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Payment Method Instruction / Content */}
        <AnimatePresence mode="wait">
          {paymentMethod === "bank" && paymentConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-700 overflow-hidden"
            >
              <h4 className="font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-[10px]">
                Direct Bank Transfer Account
              </h4>
              <p><strong>Account Name:</strong> {paymentConfig.accountName}</p>
              <p><strong>Bank:</strong> {paymentConfig.bankName}</p>
              <p><strong>Account Number:</strong> {paymentConfig.accountNumber}</p>
              <p><strong>IFSC Code:</strong> {paymentConfig.ifscCode}</p>
              <p><strong>Branch:</strong> {paymentConfig.branchName}</p>
              <p className="text-[10px] text-gray-500 italic pt-1 border-t">
                * Please transfer directly and submit form to notify our admin team.
              </p>
            </motion.div>
          )}

          {paymentMethod === "upi" && paymentConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2 text-slate-700 overflow-hidden"
            >
              <h4 className="font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-[10px] text-left">
                UPI / SCAN QR CODE
              </h4>
              <p className="text-left"><strong>UPI ID:</strong> {paymentConfig.upiId}</p>
              {paymentConfig.qrCodeUrl ? (
                <div className="flex justify-center p-2 bg-white rounded-lg border max-w-[150px] mx-auto">
                  <img src={paymentConfig.qrCodeUrl} alt="UPI QR Code" className="w-full object-contain" />
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 italic">No QR code graphic uploaded.</p>
              )}
              <p className="text-[10px] text-gray-500 italic pt-1 border-t text-left">
                * Scan the code or use UPI ID, then click verify below.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : paymentMethod === "razorpay" ? (
            "Proceed to Pay Online"
          ) : (
            "Confirm Contribution Details"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
