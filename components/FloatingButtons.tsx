"use client";

import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingButtons() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/+919944534098", "_blank");
  };

  const handleCallClick = () => {
    window.location.href = "tel:+91 99445 34098";
  };

  return (
    <div className="fixed bottom-24 right-7 flex flex-col gap-4 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick}
        className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 "
      >
        <FaWhatsapp className="h-6 w-6" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCallClick}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 "
      >
        <Phone className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
