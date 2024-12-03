// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { initializeRazorpay } from "@/lib/razorpay";
// import toast from "react-hot-toast";

// const formSchema = z.object({
//   name: z.string().min(2, "Name is required"),
//   email: z.string().email("Invalid email address"),
//   amount: z.string().min(1, "Amount is required"),
//   phone: z.string().min(10, "Valid phone number is required"),
//   pan: z.string().optional(),
// });

// export default function DonationForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(formSchema),
//   });

//   const onSubmit = async (data: any) => {
//     setIsSubmitting(true);
//     // Add payment gateway integration here

//     try {
//       await initializeRazorpay({
//         amount: data.amount * 100,
//         currency: "INR",
//         name: "Sri Viswa Charitable Trust",
//         description: "Donation",
//         prefill: {
//           name: data.name,
//           email: data.email,
//           phone: data.phone,
//         },
//         theme: {
//           color: "#0F172A",
//         },
//       });
//     } catch (error) {
//       toast.error("Payment failed. Please try again later.");
//     }

//     console.log(data, "Payment");

//     setIsSubmitting(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-md mx-auto bg-white  p-8 rounded-lg shadow-lg"
//     >
//       <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div>
//           <Label htmlFor="name">Full Name</Label>
//           <Input
//             id="name"
//             {...register("name")}
//             className={errors.name ? "border-red-500" : ""}
//           />
//           {errors.name && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors.name.message?.toString()}
//             </p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="email">Email Address</Label>
//           <Input
//             id="email"
//             type="email"
//             {...register("email")}
//             className={errors.email ? "border-red-500" : ""}
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors.email.message?.toString()}
//             </p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="phone">Phone Number</Label>
//           <Input
//             id="phone"
//             {...register("phone")}
//             className={errors.phone ? "border-red-500" : ""}
//           />
//           {errors.phone && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors.phone.message?.toString()}
//             </p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="amount">Donation Amount (₹)</Label>
//           <Input
//             id="amount"
//             type="number"
//             min={1}
//             {...register("amount")}
//             className={errors.amount ? "border-red-500" : ""}
//           />
//           {errors.amount && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors.amount.message?.toString()}
//             </p>
//           )}
//         </div>

//         {/* <div>
//           <Label htmlFor="pan">PAN Number (Optional)</Label>
//           <Input id="pan" {...register("pan")} />
//         </div> */}

//         <Button type="submit" className="w-full" disabled={isSubmitting}>
//           {isSubmitting ? "Processing..." : "Proceed to Pay"}
//         </Button>
//       </form>
//     </motion.div>
//   );
// }

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializeRazorpay } from "@/lib/razorpay";
import toast from "react-hot-toast";

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

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      await initializeRazorpay({
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
    } catch (error) {
      toast.error("Payment failed. Please try again later.");
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phone.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Donation Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            min={100}
            {...register("amount")}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">
              {errors.amount.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            {...register("currency")}
            className={`block w-full p-2 border rounded ${
              errors.currency ? "border-red-500" : ""
            }`}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
          {errors.currency && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currency.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register("state")}
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">
              {errors.state.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register("country")}
            className={errors.country ? "border-red-500" : ""}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address (Optional)</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div>
          <Label htmlFor="postalCode">Postal Code (Optional)</Label>
          <Input id="postalCode" {...register("postalCode")} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Proceed to Pay"}
        </Button>
      </form>
    </motion.div>
  );
}
