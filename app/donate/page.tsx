"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Users, Target } from "lucide-react";
import DonationForm from "@/components/DonationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Donate - Sri Viswa Charitable Trust',
  description: 'Support our mission to empower communities through education, healthcare, and sustainable development.',
  openGraph: {
    title: 'Donate - Sri Viswa Charitable Trust',
    description: 'Make a difference by supporting our charitable initiatives',
    images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c'],
  },
};

const impactStats = [
  {
    icon: Heart,
    value: "10,000+",
    label: "Lives Impacted",
    description: "Through our various programs",
  },
  {
    icon: Users,
    value: "50+",
    label: "Communities Served",
    description: "Across Tamil Nadu",
  },
  {
    icon: Target,
    value: "95%",
    label: "Funds Utilized",
    description: "Directly for charitable activities",
  },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
          alt="Donate Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white px-4 max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Make a Difference Today
          </h1>
          <p className="text-xl">
            Your support helps us continue our mission of empowering communities
            and transforming lives.
          </p>
        </motion.div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 rounded-lg bg-gray-50"
              >
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </h3>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {stat.label}
                </h4>
                <p className="text-gray-600">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Why Donate?</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Your donation helps us continue our vital work in education,
                  healthcare, and community development across Tamil Nadu.
                </p>
                <p>
                  We ensure transparency and accountability in utilizing funds,
                  with 95% directly supporting our charitable activities.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Support education for underprivileged children</li>
                  <li>Provide healthcare services to rural communities</li>
                  <li>Empower women through skill development</li>
                  <li>Enable sustainable community development</li>
                  <li>Protect and preserve the environment</li>
                </ul>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <DonationForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}