"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  amount: z.string().min(1, "Amount is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  pan: z.string().optional(),
});

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Add payment gateway integration here
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
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
            <p className="text-red-500 text-sm mt-1">{errors.name.message?.toString()}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.email.message?.toString()}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.phone.message?.toString()}</p>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Donation Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            {...register("amount")}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message?.toString()}</p>
          )}
        </div>

        <div>
          <Label htmlFor="pan">PAN Number (Optional)</Label>
          <Input id="pan" {...register("pan")} />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Proceed to Pay"}
        </Button>
      </form>
    </motion.div>
  );
}