"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const [settings, setSettings] = useState({
    siteTitle: "Sri Viswa Charitable Trust",
    phone: "+91 99445 34098",
    email: "noreply@srivisawacharitabletrust.com",
    address: "No. 128, Mani Nagar 2nd Street,\nSivanandhapuram, Saravanampatti,",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          if (result.settings) {
            setSettings({
              siteTitle: result.settings.siteTitle || "Sri Viswa Charitable Trust",
              phone: result.settings.phone || "+91 99445 34098",
              email: result.settings.email || "noreply@srivisawacharitabletrust.com",
              address: result.settings.address || "No. 128, Mani Nagar 2nd Street,\nSivanandhapuram, Saravanampatti,",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings in Footer", err);
      }
    };
    fetchSettings();
  }, []);

  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {settings.siteTitle}
            </h3>
            <p className="text-sm">
              Making a difference in the world through compassion, dedication,
              and your support.
            </p>
          </div>
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white ">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/causes" className="hover:text-white ">
                  Our Causes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white ">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white ">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">
              Contact Us
            </h4>
            <div className="space-y-2 text-sm">
              <p className="whitespace-pre-line leading-relaxed">{settings.address}</p>
              <p className="mt-2">Phone: {settings.phone}</p>
              <p>Email: {settings.email}</p>
            </div>
          </div>
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white " aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white " aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white " aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white " aria-label="YouTube">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} {settings.siteTitle}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
