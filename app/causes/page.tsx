"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Target, Users, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Cause {
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  impact: string;
  location: string;
  category: string;
}

const defaultCauses: Cause[] = [
  {
    title: "Education for All",
    description: "Providing quality education to underprivileged children across Tamil Nadu. Our program includes school supplies, uniforms, and educational support.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
    goal: 2500000,
    raised: 1750000,
    impact: "5,000+ students supported",
    location: "Tamil Nadu",
    category: "Education",
  },
  {
    title: "Rural Healthcare Initiative",
    description: "Bringing essential healthcare services to remote villages through mobile clinics and permanent health centers.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
    goal: 3000000,
    raised: 2100000,
    impact: "10,000+ patients treated",
    location: "Rural Tamil Nadu",
    category: "Healthcare",
  },
];

export default function CausesPage() {
  const [causes, setCauses] = useState<Cause[]>(defaultCauses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          if (result.causes && result.causes.length > 0) {
            setCauses(result.causes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch causes list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCauses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Causes</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Support our ongoing initiatives and help make a lasting impact in
            communities across Tamil Nadu. Every contribution counts towards
            creating positive change.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : causes.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No causes listed at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {causes.map((cause, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-gray-250">
                    <Image
                      src={cause.image}
                      alt={cause.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {cause.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{cause.title}</h3>
                    <p className="text-gray-600 mb-4">{cause.description}</p>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Target className="w-4 h-4 text-primary" />
                        <span>{cause.impact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{cause.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <Coins className="w-4 h-4 text-primary" />
                        <span>
                          ₹{cause.raised.toLocaleString()} raised of ₹
                          {cause.goal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (cause.raised / cause.goal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Button className="w-full" asChild>
                    <Link href="/donate">
                      Support This Cause <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
