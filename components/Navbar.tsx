"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/causes", label: "Causes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300 ",
        scrolled ? "bg-primary shadow-2xl py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Hope Foundation
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center text-white space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  " text-white",
                  scrolled ? "text-white " : "text-gray-400"
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              className={cn(
                scrolled
                  ? "text-primary bg-white shadow-2xl  hover:bg-white/90"
                  : " bg-primary text-white hover:bg-primary/90",
                "  px-6 py-2 rounded-full   "
              )}
            >
              Donate Now
            </button>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 " />
            ) : (
              <Menu className="h-6 w-6 " />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="pt-4 pb-3 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block   hover:text-primary  py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button className="w-full bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 ">
              Donate Now
            </button>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
