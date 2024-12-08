"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("api/contact", {
        method: "POST",
        headers: {
          // "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("Your message has been sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("Failed to send your message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for any inquiries or support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-primary text-white px-6 py-3 rounded-full ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primary/90"
                    }`}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                  {status && (
                    <p
                      className={`mt-4 text-center ${
                        status.includes("successfully")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {status}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-gray-600">
                      No. 128, Mani Nagar 2nd Street, Sivanandhapuram,
                      Saravanampatti,
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">+91 99445 34098</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">
                      noreply@srivisawacharitabletrust.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
