"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ArrowUpRight, TrendingUp, Users, Heart, MessageSquare } from "lucide-react";

interface AnalyticsTabProps {
  donations: any[];
  causes: any[];
  volunteers: any[];
  enquiriesCount: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsTab({
  donations = [],
  causes = [],
  volunteers = [],
  enquiriesCount = 0,
}: AnalyticsTabProps) {
  // 1. Calculate General Card Metrics
  const totalDonationAmount = useMemo(() => {
    return donations
      .filter((d) => d.status === "success")
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  }, [donations]);

  const donorCount = useMemo(() => {
    const uniqueEmails = new Set(donations.map((d) => d.donor?.email).filter(Boolean));
    return uniqueEmails.size;
  }, [donations]);

  // 2. Chart: Monthly Donation Trend (past 6 months)
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const pastSixMonths = Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        monthKey: d.getMonth(),
        year: d.getFullYear(),
        name: `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`,
        total: 0,
      };
    });

    donations
      .filter((d) => d.status === "success" && d.createdAt)
      .forEach((d) => {
        const donationDate = new Date(d.createdAt);
        const match = pastSixMonths.find(
          (m) => m.monthKey === donationDate.getMonth() && m.year === donationDate.getFullYear()
        );
        if (match) {
          match.total += parseFloat(d.amount);
        }
      });

    return pastSixMonths;
  }, [donations]);

  // 3. Chart: Causes Raised vs Goal
  const causesData = useMemo(() => {
    return causes.slice(0, 5).map((c) => ({
      name: c.title.substring(0, 15) + (c.title.length > 15 ? "..." : ""),
      Goal: parseFloat(c.goal || "0"),
      Raised: parseFloat(c.raised || "0"),
    }));
  }, [causes]);

  // 4. Chart: Payment Methods Distribution
  const paymentMethodsData = useMemo(() => {
    const methods: Record<string, number> = {};
    donations
      .filter((d) => d.status === "success")
      .forEach((d) => {
        const m = d.paymentMethod || "Other";
        methods[m] = (methods[m] || 0) + parseFloat(d.amount);
      });

    return Object.entries(methods).map(([name, value]) => ({
      name: name.toUpperCase().replace("_", " "),
      value,
    }));
  }, [donations]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Funds Card */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Total Received</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                ₹{totalDonationAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>Active Campaigns Live</span>
          </div>
        </div>

        {/* Total Donors Card */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Total Donors</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{donorCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-bold">
            <span>Verified Donor Profiles</span>
          </div>
        </div>

        {/* Active Volunteers Card */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Volunteers</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{volunteers.length}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-600 font-bold">
            <span>
              {volunteers.filter((v) => v.status === "pending").length} Pending Approvals
            </span>
          </div>
        </div>

        {/* Contact Enquiries Card */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Inquiries Inbox</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{enquiriesCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-bold">
            <span>Customer & Support Requests</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Monthly Trend */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-6">Donation Inflows Trend (₹)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#f8fafc" }}
                  formatter={(val: any) => [`₹${parseFloat(val).toLocaleString("en-IN")}`, "Total"]}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Payment Channels */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-base font-extrabold text-slate-900 mb-6">Payment Methods Share</h3>
          <div className="flex-1 h-60 min-h-[240px] flex items-center justify-center relative">
            {paymentMethodsData.length === 0 ? (
              <p className="text-slate-400 text-sm">No transaction records</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#f8fafc" }}
                    formatter={(val: any) => [`₹${parseFloat(val).toLocaleString("en-IN")}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {paymentMethodsData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Causes Progress */}
        <div className="lg:col-span-3 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-6">Causes Target Progress (₹)</h3>
          <div className="h-80 w-full">
            {causesData.length === 0 ? (
              <p className="text-slate-400 text-center py-20 text-sm">No campaigns registered</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={causesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#f8fafc" }}
                    formatter={(val: any) => [`₹${parseFloat(val).toLocaleString("en-IN")}`]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Raised" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Goal" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
