"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [hasAdmin, setHasAdmin] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only used for first admin registration
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if any admin exists on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/admin/has-admin");
        if (res.ok) {
          const result = await res.json();
          setHasAdmin(result.hasAdmin);
          setIsRegistering(!result.hasAdmin); // Auto toggle to registration if no admin exists
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    };
    checkAdminStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Double check profile exists
        const profileRes = await fetch("/api/admin/profile");
        if (profileRes.ok) {
          toast.success("Login successful!");
          router.refresh();
          router.push("/admin");
        } else {
          // If login succeeded but profile doesn't exist, sign out
          await supabase.auth.signOut();
          toast.error("Account does not have admin privileges.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Registration failed. Please check credentials.");
      }

      // 2. Call register endpoint to create the public.users record as Super Admin
      const regRes = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          email,
          name,
          roleName: "super_admin"
        }),
      });

      if (!regRes.ok) {
        const errData = await regRes.json();
        throw new Error(errData.error || "Failed to create admin profile");
      }

      toast.success("Super Admin account created successfully!");
      setHasAdmin(true);
      setIsRegistering(false);
      
      // Auto log in the user
      await supabase.auth.signInWithPassword({ email, password });
      router.refresh();
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans">
      {/* Soft Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-4"
      >
        {/* White Card with Soft Emerald Accent Ring */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-8 relative overflow-hidden">
          {/* Top colored highlight line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 border border-emerald-100"
            >
              {isRegistering ? <KeyRound className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sri Viswa Trust
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {isRegistering 
                ? "Setup the primary Super Admin account"
                : "Sign in to manage homepage, gallery, and settings"
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
            {/* Name Input - Only for registration */}
            {isRegistering && (
              <div className="relative">
                <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition duration-200 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email/Username Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition duration-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition duration-200 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRegistering ? "Registering..." : "Authenticating..."}
                </>
              ) : (
                isRegistering ? "Setup Super Admin" : "Access Admin Dashboard"
              )}
            </motion.button>
          </form>

          {/* Toggle link for registration / login fallback */}
          {!hasAdmin && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                {isRegistering ? "Switch to Login" : "Switch to Setup"}
              </button>
            </div>
          )}

          {/* Back to Home link */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-sm text-slate-400 hover:text-emerald-600 transition duration-200"
            >
              &larr; Back to website homepage
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
