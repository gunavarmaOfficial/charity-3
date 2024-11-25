"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Target, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const causes = [
  {
    title: "Education for All",
    description:
      "Providing quality education to underprivileged children across Tamil Nadu. Our program includes school supplies, uniforms, and educational support.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
    goal: 2500000,
    raised: 1750000,
    impact: "5,000+ students supported",
    location: "Tamil Nadu",
    category: "Education",
  },
  {
    title: "Rural Healthcare Initiative",
    description:
      "Bringing essential healthcare services to remote villages through mobile clinics and permanent health centers.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
    goal: 3000000,
    raised: 2100000,
    impact: "10,000+ patients treated",
    location: "Rural Tamil Nadu",
    category: "Healthcare",
  },
  {
    title: "Women Empowerment Program",
    description:
      "Empowering women through skill development, financial literacy, and entrepreneurship training.",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
    goal: 1500000,
    raised: 900000,
    impact: "2,000+ women empowered",
    location: "Chennai, Madurai",
    category: "Empowerment",
  },
  {
    title: "Clean Water Project",
    description:
      "Installing water purification systems and building wells in water-scarce regions.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    goal: 2000000,
    raised: 1200000,
    impact: "50+ communities served",
    location: "Coastal regions",
    category: "Infrastructure",
  },
  {
    title: "Environmental Conservation",
    description:
      "Protecting local ecosystems through tree planting and waste management initiatives.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6",
    goal: 1000000,
    raised: 600000,
    impact: "100,000+ trees planted",
    location: "Western Ghats",
    category: "Environment",
  },
  {
    title: "Elder Care Support",
    description:
      "Providing care and support to elderly citizens through assisted living and healthcare programs.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
    goal: 1800000,
    raised: 1100000,
    impact: "1,000+ elders supported",
    location: "Multiple locations",
    category: "Healthcare",
  },
];

export default function CausesPage() {
  return (
    <div className="min-h-screen bg-gray-50  py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Causes</h1>
          <p className="text-gray-600  max-w-2xl mx-auto">
            Support our ongoing initiatives and help make a lasting impact in
            communities across Tamil Nadu. Every contribution counts towards
            creating positive change.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white  rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative h-48">
                <Image
                  src={cause.image}
                  alt={cause.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
                  {cause.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{cause.title}</h3>
                <p className="text-gray-600  mb-4">{cause.description}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span>{cause.impact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{cause.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="w-4 h-4 text-primary" />
                    <span>
                      ₹{cause.raised.toLocaleString()} raised of ₹
                      {cause.goal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200  h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(cause.raised / cause.goal) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href="/donate">
                    Support This Cause <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
