"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MdOutlineClose } from "react-icons/md";
import { RiMenu3Line } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { Phone, MessageCircle } from "lucide-react";

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
  const pathname = usePathname();

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/+919944534098", "_blank");
  };

  const handleCallClick = () => {
    window.location.href = "tel:+91 99445 34098";
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  console.log("pathname", pathname);

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300 ",
        scrolled || isOpen
          ? "bg-primary	 shadow-2xl py-4"
          : "bg-transparent py-6 "
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className={cn(
              "text-2xl font-bold ",
              scrolled
                ? "text-white "
                : pathname == "/" ||
                  pathname == "/about" ||
                  pathname == "/volunteer"
                ? "text-white"
                : "text-primary"
            )}
          >
            Sri Viswa Charitable Trust
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center  space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  scrolled
                    ? "text-white "
                    : pathname == "/" ||
                      pathname == "/about" ||
                      pathname == "/volunteer"
                    ? "text-white"
                    : "text-gray-400 hover:text-primary"
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
              <Link href="/donate">Donate Now</Link>
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleWhatsAppClick()}
                className=" font-bold bg-white text-primary p-2 rounded-full hover:bg-gray-200 "
              >
                <FaWhatsapp className="h-6 w-6" />
              </button>

              <button
                onClick={() => handleCallClick()}
                className=" font-bold bg-white text-primary p-2 rounded-full hover:bg-gray-200 "
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <MdOutlineClose className={cn("h-6 w-6 text-white")} />
            ) : (
              <RiMenu3Line
                className={cn(
                  "h-6 w-6 ",
                  scrolled
                    ? "text-white"
                    : pathname == "/" ||
                      pathname == "/about" ||
                      pathname == "/volunteer"
                    ? "text-white"
                    : "text-gray-400"
                )}
              />
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
          className="md:hidden h-screen overflow-hidden"
        >
          <div className="pt-4 pb-3  text-white space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block font-bold    py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button className="w-full font-bold bg-white text-primary px-6 py-2 rounded-full hover:bg-gray-500 ">
              Donate Now
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleWhatsAppClick()}
                className=" font-bold bg-white text-primary flex p-2 items-center justify-center gap-3 rounded-full w-full hover:bg-gray-200 "
              >
                <FaWhatsapp className="h-6 w-6" />
                <div>Chat With Us</div>
              </button>

              <button
                onClick={() => handleCallClick()}
                className=" font-bold bg-white text-primary flex p-2 items-center justify-center gap-3 rounded-full w-full hover:bg-gray-200 "
              >
                <Phone className="h-6 w-6" />
                Call Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
