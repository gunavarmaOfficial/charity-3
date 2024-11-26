import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Sri Viswa Charitable Trust
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
            <ul className="space-y-2 text-sm">
              <li>No. 128, Mani Nagar 2nd Street,</li>
              <li>Sivanandhapuram, Saravanampatti,</li>
              <li>Phone: +91 99445 34098</li>
              <li>Email: null</li>
            </ul>
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
          <p>© 2024 Sri Viswa Charitable Trust. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
