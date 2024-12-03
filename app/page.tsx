"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Users,
  Globe,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagesSlider } from "@/components/ui/images-slider";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";
import TextReveal, { TextRevealByWord } from "@/components/ui/text-reveal";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

gsap.registerPlugin(ScrollTrigger);

const impactStats = [
  { icon: Heart, label: "Lives Impacted", value: "50K+" },
  { icon: Users, label: "Active Volunteers", value: "10K+" },
  { icon: Globe, label: "Communities Served", value: "500+" },
  { icon: Target, label: "Success Rate", value: "95%" },
];

const upcomingEvents = [
  {
    title: "Annual Charity Gala",
    date: "March 15, 2024",
    location: "Grand Hotel, Chennai",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
  },
  {
    title: "Rural Education Drive",
    date: "April 2, 2024",
    location: "Madurai District",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
  },
  {
    title: "Healthcare Camp",
    date: "April 15, 2024",
    location: "Coimbatore",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309",
  },
];

const images = [
  "https://s3.ap-south-1.amazonaws.com/rzp-prod-merchant-assets/payment-link/description/20190122164349_838A3181_D5P3M1bwCyu0x7.jpg",
  "https://donate.oxfamindia.org/donatetoeducate/ravi/davos-healthcare/images/how-donation.jpg",
  "https://www.globalgiving.org/pfil/1877/ph_1877_99953.jpg",
  "https://images.unsplash.com/photo-1710093072215-65070f9cf93e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://media.istockphoto.com/id/941788480/photo/portrait-of-girl-kid-having-mid-day-meal-in-indian-school.webp?a=1&b=1&s=612x612&w=0&k=20&c=VQH6wklsVx9UlbFHNbzG7fYESlfdQwN-kYlqmQWzCyY=",
];

const achievements = [
  "Provided education to 10,000+ underprivileged children",
  "Established 50+ rural healthcare centers",
  "Implemented 100+ clean water projects",
  "Empowered 5,000+ women through skill development",
  "Planted 100,000+ trees across Tamil Nadu",
  "Built 1,000+ homes for the homeless",
];

export default function Home() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".impact-stat", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top center",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
      });

      gsap.from(".achievement-item", {
        scrollTrigger: {
          trigger: ".achievements-section",
          start: "top center",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}

      <ImagesSlider className="h-[100vh]" images={images}>
        <motion.div
          initial={{
            opacity: 0,
            y: -80,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="z-50 flex flex-col text-center text-white px-4 max-w-4xl justify-center items-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Together We Can Make a Difference
          </h1>
          <p className="text-xl mb-8">
            Join us in our mission to create positive change and transform lives
            across India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href="/donate">Donate Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white"
              asChild
            >
              <Link href="/volunteer">Become a Volunteer</Link>
            </Button>
          </div>
        </motion.div>
      </ImagesSlider>

      <AnimatedBackground />

      <div className="z-10 flex flex-col min-h-64 items-center justify-center rounded-lg border  ">
        <TextReveal
          text=" Since our inception in 2024, we have dedicated ourselves to uplifting
        the vulnerable through education, healthcare, environmental
        conservation, and social empowerment.Guided by our mission to create a better tomorrow, we serve individuals
        irrespective of caste, creed, religion, or gender."
        />
      </div>

      {/* Impact Stats Section */}
      <section className="stats-section py-20 bg-gray-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-gray-600  max-w-2xl mx-auto">
              Through the support of our donors and volunteers, we have made
              significant progress in creating positive change across
              communities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="impact-stat text-center p-6 bg-white  rounded-lg shadow-lg"
              >
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                <p className="text-gray-600 ">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-gray-600  max-w-2xl mx-auto">
              Join us in our upcoming events and be part of the change.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white  rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600  mb-4">
                    <span className="block">📅 {event.date}</span>
                    <span className="block">📍 {event.location}</span>
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/events">
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Achievements Section */}
      <section className="achievements-section py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="max-w-2xl mx-auto opacity-90">
              Together with our supporters, we have achieved significant
              milestones in our journey to create positive change.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="achievement-item flex items-start gap-4 bg-white/10 p-6 rounded-lg"
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <p className="text-lg">{achievement}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
