import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import FloatingButtons from "@/components/FloatingButtons";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sri Viswa Charitable Trust - Empowering Lives, Inspiring Change",
  description:
    "Dedicated to serving underprivileged communities through education, healthcare, and sustainable development initiatives in Tamil Nadu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Toaster />
        <SpeedInsights />
        <FloatingButtons />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
