import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";
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
        <SpeedInsights />
        <FloatingButtons />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <PageTransition>
            <main className="">{children}</main>
          </PageTransition>
          <Footer />
        </div>
      </body>
    </html>
  );
}
