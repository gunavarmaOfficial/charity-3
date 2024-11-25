"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

const volunteerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  availability: z.string().min(1, "Please select your availability"),
  experience: z.string(),
  message: z.string().min(10, "Please provide more details"),
});

const interests = [
  "Education",
  "Healthcare",
  "Environment",
  "Community Service",
  "Youth Programs",
  "Elder Care",
  "Fundraising",
  "Administrative",
];

const availabilityOptions = [
  "Weekday Mornings",
  "Weekday Afternoons",
  "Weekday Evenings",
  "Weekends",
  "Flexible",
];

export default function VolunteerPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(volunteerSchema),
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1"
          alt="Volunteer Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl">Make a difference in your community</p>
        </motion.div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Volunteer Application Form
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  {/* {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  {/* {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )} */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
                {/* {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Areas of Interest
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {interests.map((interest) => (
                    <label
                      key={interest}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={interest}
                        {...register("interests")}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
                {/* {errors.interests && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.interests.message}
                  </p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Availability
                </label>
                <select
                  {...register("availability")}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* {errors.availability && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.availability.message}
                  </p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Previous Volunteer Experience
                </label>
                <textarea
                  {...register("experience")}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about your previous volunteer experience (if any)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Why do you want to volunteer?
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Tell us why you'd like to volunteer with us"
                />
                {/* {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )} */}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Submit Application
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
