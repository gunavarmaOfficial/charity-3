"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  Heart,
  Users,
  Globe,
  Target,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  TreePine,
  Calendar,
  MapPin,
  Quote,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagesSlider } from "@/components/ui/images-slider";
import TextReveal from "@/components/ui/text-reveal";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";

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

const defaultImages = [
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

const corePillars = [
  {
    title: "Education Support",
    description: "School supplies, scholarships, digital literacy, and educational programs for children.",
    icon: GraduationCap,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-600",
  },
  {
    title: "Healthcare and Wellness",
    description: "Mobile health clinics, free health camps, and clean drinking water initiatives.",
    icon: Heart,
    color: "from-rose-500/20 to-red-500/20 text-rose-600",
  },
  {
    title: "Tribal & Rural Development",
    description: "Vocational skill training, clean sanitation, and rural infrastructure setups.",
    icon: Users,
    color: "from-amber-500/20 to-orange-500/20 text-orange-600",
  },
  {
    title: "Environmental Protection",
    description: "Reforestation projects, tree plantation drives, and local water conservation systems.",
    icon: TreePine,
    color: "from-green-600/20 to-emerald-600/20 text-emerald-700",
  },
];

const defaultTestimonials = [
  {
    name: "Sampath G.",
    designation: "Regular Donor",
    testimonial: "Sri Viswa Charitable Trust operates with absolute transparency. Seeing the direct impact of my donations on child education in local villages is truly rewarding.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Meera Krishnan",
    designation: "Volunteer",
    testimonial: "Volunteering with the rural healthcare drives has been a life-changing experience. The organization is extremely well-structured and cares about every single life.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Anand Sen",
    designation: "Community Partner",
    testimonial: "Their clean water projects have completely transformed health standards in our village. We are extremely grateful for the prompt execution and support.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
    rating: 5,
  },
];

const defaultCauses = [
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
  {
    title: "Clean Water Mission",
    description: "Installing water filtration systems in remote villages to prevent waterborne diseases and ensure safety.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    goal: 1500000,
    raised: 950000,
    impact: "3,000+ families benefited",
    location: "Coimbatore District",
    category: "Infrastructure",
  },
];

export default function Home() {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [causes, setCauses] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          if (result.banners && result.banners.length > 0) {
            setImages(result.banners);
          }
          if (result.causes && result.causes.length > 0) {
            setCauses(result.causes);
          }
          if (result.testimonials && result.testimonials.length > 0) {
            setTestimonials(result.testimonials);
          }
        }
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      }
    };
    fetchHomeData();
  }, []);

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

  const activeCauses = causes.length > 0 ? causes.slice(0, 3) : defaultCauses;

  return (
    <div className="min-h-screen bg-white">
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-md leading-tight">
            Together We Can Make a Difference
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl drop-shadow-sm">
            Join us in our mission to create positive change and transform lives
            across India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full font-bold px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/donate">Donate Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white rounded-full font-bold px-8 py-6 transition-all"
              asChild
            >
              <Link href="/volunteer">Become a Volunteer</Link>
            </Button>
          </div>
        </motion.div>
      </ImagesSlider>

      {/* Our Story Split Section (Video & Copy consolidated) */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30">
        {/* Floating Bubble Background - integrated organically */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary/10 rounded-full"
              style={{
                width: `${100 + i * 40}px`,
                height: `${100 + i * 40}px`,
                left: `${15 + i * 15}%`,
                bottom: "-100px",
              }}
              animate={{
                y: ["0px", "-600px"],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Story Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-primary font-semibold tracking-wider text-sm uppercase block">
                Who We Are
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Welcome to <span className="text-primary font-serif">Sri Viswa Charitable Trust</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                A beacon of hope for underprivileged and vulnerable communities in India.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Since our inception in 2024, we have dedicated ourselves to uplifting the vulnerable through education, healthcare, environmental conservation, and social empowerment. Guided by our mission to create a better tomorrow, we serve individuals irrespective of caste, creed, religion, or gender.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/about">Read Full Story</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary/5" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 p-4 transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-tr-full -z-10" />

                <div className="h-full w-full flex flex-col justify-between items-center text-center">
                  <div className="space-y-2 mt-4 px-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Video Overview</span>
                    <h3 className="text-xl font-bold text-gray-800">Watch Our Work in Action</h3>
                    <p className="text-xs text-gray-500">Take a short virtual tour of our projects and rural community outreach drives.</p>
                  </div>

                  {/* Hero Video Dialog Component with custom supabase source */}
                  <div className="w-full px-2 mb-4 z-20">
                    <HeroVideoDialog
                      className="w-full rounded-xl overflow-hidden"
                      animationStyle="from-center"
                      videoSrc="https://fvcxbtoiboxrlyncvjsr.supabase.co/storage/v1/object/public/video/VID_20241027_191333152.mp4"
                      thumbnailSrc="https://fvcxbtoiboxrlyncvjsr.supabase.co/storage/v1/object/public/charity-assets/1781348536404_IMG_20241027_191717044.jpg"
                      thumbnailAlt="Sri Viswa Charitable Trust Work Video"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TextReveal Word Animation */}
      <div className="z-10 bg-gray-50/50 py-12">
        <TextReveal
          text="Since our inception in 2024, we have dedicated ourselves to uplifting the vulnerable through education, healthcare, environmental conservation, and social empowerment. Guided by our mission to create a better tomorrow, we serve individuals irrespective of caste, creed, religion, or gender."
        />
      </div>

      {/* Core Pillars Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-semibold tracking-wider text-sm uppercase">Our Pillars</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
              Areas of Our Dedication
            </h2>
            <p className="text-gray-600 text-lg">
              We operate through four key dimensions to provide holistic support, addressing root social issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {corePillars.map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-b from-gray-50 to-white hover:from-white hover:to-white p-8 rounded-2xl border border-gray-100 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Icon Wrapper */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pillar.color} transition-all duration-300 group-hover:scale-110`}>
                    <pillar.icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/about"
                    className="inline-flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform"
                  >
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Active Causes Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <span className="text-primary font-semibold tracking-wider text-sm uppercase">Support Our Missions</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                Active Causes
              </h2>
              <p className="text-gray-600 text-lg">
                Your contributions directly fuel these projects, making a tangible difference in real lives.
              </p>
            </div>
            <div>
              <Button size="lg" className="rounded-full shadow-md bg-white hover:bg-gray-100 text-primary border border-primary/20 animate-pulse" asChild>
                <Link href="/causes">
                  View All Causes <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCauses.map((cause, index) => {
              const percentage = Math.min(100, Math.round((cause.raised / cause.goal) * 100)) || 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      <Image
                        src={cause.image}
                        alt={cause.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                        {cause.category}
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                          {cause.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {cause.description}
                        </p>
                      </div>

                      {/* Goal Stats Info */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="text-gray-500">Raised: <strong className="text-primary font-bold">₹{cause.raised.toLocaleString()}</strong></span>
                          <span className="text-gray-400">Goal: ₹{cause.goal.toLocaleString()}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="font-semibold">{percentage}% Funded</span>
                          <span>{cause.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all" asChild>
                      <Link href="/donate">
                        Support Cause <Heart className="w-4 h-4 ml-2 fill-white" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats Section (Glassmorphism counters) */}
      <section className="stats-section py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute -left-1/4 -top-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-1/4 -bottom-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="impact-stat text-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-center items-center space-y-3"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-white/80 font-medium text-xs md:text-sm uppercase tracking-wider text-center">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-semibold tracking-wider text-sm uppercase">Our Accomplishments</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
              Key Milestones Crossed
            </h2>
            <p className="text-gray-600 text-lg">
              Through the unwavering support of donors and volunteers, we have reached these key goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="achievement-item flex items-start gap-4 bg-gray-50 border border-gray-100 hover:border-primary/20 p-6 rounded-2xl hover:shadow-md transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-gray-800 font-semibold text-base leading-relaxed">
                  {achievement}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-semibold tracking-wider text-sm uppercase">Join Us on the Ground</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
              Upcoming Events
            </h2>
            <p className="text-gray-600 text-lg">
              Participate in our ground outreach campaigns and become part of our active field volunteer community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="text-gray-600 text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 pt-0">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-5 font-bold shadow-md shadow-primary/10 transition-all" asChild>
                    <Link href="/volunteer">
                      Register to Participate <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-semibold tracking-wider text-sm uppercase">Hear From Our Community</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
              Voices of Impact
            </h2>
            <p className="text-gray-600 text-lg">
              Read how support from our donors and efforts of our volunteers make a real impact on families.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-100 hover:border-primary/20 hover:bg-white p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative"
              >
                <div className="space-y-6">
                  {/* Quote icon decoration */}
                  <Quote className="w-8 h-8 text-primary/10 absolute top-6 right-8 rotate-180" />

                  <div className="flex gap-1">
                    {[...Array(item.rating || 5)].map((_, starIndex) => (
                      <span key={starIndex} className="text-yellow-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic relative z-10">
                    &ldquo;{item.testimonial || item.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-6">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-primary font-medium">{item.designation || item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Take Action CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute left-10 top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute right-10 bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to Help Make <br />
            <span className="text-secondary">A Lasting Difference?</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/95 text-lg leading-relaxed font-medium">
            Whether you wish to sponsor a child&apos;s education, support mobile medical vans, or contribute your time as a coordinator, we welcome your hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-primary font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/donate">Donate Safely Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white font-bold px-8 py-6 rounded-full transition-all"
              asChild
            >
              <Link href="/volunteer">Join as a Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
