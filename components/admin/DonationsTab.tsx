"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import {
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  Users,
  CreditCard,
  CheckCircle2,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface DonationsTabProps {
  donations: any[];
  causes: any[];
  onRefresh: () => void;
}

export default function DonationsTab({ donations = [], causes = [], onRefresh }: DonationsTabProps) {
  const [subTab, setSubTab] = useState<"donations" | "donors">("donations");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for manual donation
  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorAddress: "",
    amount: "",
    causeId: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  // Calculate unique donors metrics
  const donorProfiles = React.useMemo(() => {
    const donorsMap: Record<string, any> = {};
    donations.forEach((d) => {
      if (!d.donor?.email) return;
      const email = d.donor.email;
      if (!donorsMap[email]) {
        donorsMap[email] = {
          name: d.donor.name,
          email: d.donor.email,
          phone: d.donor.phone || "N/A",
          totalDonated: 0,
          donationCount: 0,
        };
      }
      if (d.status === "success") {
        donorsMap[email].totalDonated += parseFloat(d.amount);
        donorsMap[email].donationCount += 1;
      }
    });
    return Object.values(donorsMap);
  }, [donations]);

  // Filter donations based on search term
  const filteredDonations = donations.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.id?.toString().includes(term) ||
      d.donor?.name?.toLowerCase().includes(term) ||
      d.donor?.email?.toLowerCase().includes(term) ||
      d.cause?.title?.toLowerCase().includes(term) ||
      d.paymentMethod?.toLowerCase().includes(term)
    );
  });

  // Filter donors list
  const filteredDonors = donorProfiles.filter((donor) => {
    const term = search.toLowerCase();
    return (
      donor.name?.toLowerCase().includes(term) ||
      donor.email?.toLowerCase().includes(term) ||
      donor.phone?.includes(term)
    );
  });

  // Generate and download a PDF receipt using jsPDF
  const handleDownloadReceipt = (d: any) => {
    try {
      const doc = new jsPDF();

      // Top logo area & branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text("Sri Viswa Charitable Trust", 105, 25, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Regd. No. 128/2020 | PAN: AAATS9012F | Section 80G Tax Exempt Approved", 105, 32, { align: "center" });
      doc.text("No. 128, Mani Nagar 2nd Street, Sivanandhapuram, Saravanampatti, Coimbatore - 641035", 105, 38, { align: "center" });

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 44, 190, 44);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("DONATION RECEIPT", 105, 54, { align: "center" });

      // Details Block
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Receipt Number:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`SVCT-REC-${d.id}-${new Date(d.createdAt).getFullYear()}`, 55, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Receipt Date:", 120, 70);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(d.createdAt).toLocaleDateString(), 150, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Donor Name:", 20, 80);
      doc.setFont("helvetica", "normal");
      doc.text(d.donor?.name || "Anonymous", 55, 80);

      doc.setFont("helvetica", "bold");
      doc.text("Email Address:", 20, 90);
      doc.setFont("helvetica", "normal");
      doc.text(d.donor?.email || "N/A", 55, 90);

      doc.setFont("helvetica", "bold");
      doc.text("Phone Number:", 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text(d.donor?.phone || "N/A", 55, 100);

      doc.line(20, 110, 190, 110);

      doc.setFont("helvetica", "bold");
      doc.text("Donation For:", 20, 122);
      doc.setFont("helvetica", "normal");
      doc.text(d.cause?.title || "General Charity Funds", 55, 122);

      doc.setFont("helvetica", "bold");
      doc.text("Payment Mode:", 20, 132);
      doc.setFont("helvetica", "normal");
      doc.text(d.paymentMethod ? d.paymentMethod.toUpperCase() : "N/A", 55, 132);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Amount Contributed:", 20, 148);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text(`INR ${parseFloat(d.amount).toLocaleString("en-IN")}.00`, 65, 148);

      doc.setTextColor(30, 41, 59);
      doc.line(20, 158, 190, 158);

      // Tax disclaimer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Note: Sri Viswa Charitable Trust is registered under Section 12A and 80G.", 105, 172, { align: "center" });
      doc.text("Contributions are eligible for tax deductions to the extent allowed under the Income Tax Act.", 105, 178, { align: "center" });

      // Sign-off
      doc.setFont("helvetica", "bold");
      doc.text("Authorized Representative", 150, 215, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("Sri Viswa Charitable Trust", 150, 220, { align: "center" });

      doc.save(`Receipt_SVCT_${d.id}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF receipt.");
    }
  };

  // Export all filtered donations to Excel (XLSX)
  const handleExportExcel = () => {
    try {
      const sheetData = filteredDonations.map((d) => ({
        "Donation ID": d.id,
        "Donor Name": d.donor?.name || "Anonymous",
        "Donor Email": d.donor?.email || "N/A",
        "Donor Phone": d.donor?.phone || "N/A",
        "Amount (INR)": parseFloat(d.amount),
        "Cause ID": d.cause?.id || "N/A",
        "Cause Title": d.cause?.title || "General Fund",
        "Payment Mode": d.paymentMethod,
        "Gateway Txn ID": d.razorpayPaymentId || "N/A",
        Status: d.status,
        Date: new Date(d.createdAt).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Donations History");
      XLSX.writeFile(wb, "Sri_Viswa_Trust_Donations.xlsx");
      toast.success("Excel sheet exported successfully!");
    } catch (err) {
      toast.error("Failed to export Excel sheet.");
    }
  };

  // Submit manual donation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record donation");
      }

      toast.success("Donation recorded successfully!");
      setModalOpen(false);
      setForm({
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        donorAddress: "",
        amount: "",
        causeId: "",
        paymentMethod: "bank_transfer",
        notes: "",
      });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        
        {/* Toggle subtabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab("donations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              subTab === "donations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Donations List</span>
          </button>
          <button
            onClick={() => setSubTab("donors")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              subTab === "donors" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Donor Database</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {subTab === "donations" && (
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200/60 transition w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Donation</span>
          </button>
        </div>
      </div>

      {/* Search & Listing */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search filter input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={subTab === "donations" ? "Search by Donor Name, Email, Cause, Method..." : "Search Donors by Name, Email, Phone..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none text-sm"
          />
        </div>

        {/* TAB content: Donations List */}
        {subTab === "donations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-800">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-xs font-extrabold uppercase border-b border-slate-100">
                  <th className="p-4">Txn ID</th>
                  <th className="p-4">Donor details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Fund/Cause</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No donation transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4 font-bold text-slate-900">#{d.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{d.donor?.name || "Anonymous"}</div>
                        <div className="text-xs text-slate-400">{d.donor?.email || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-600">
                          ₹{parseFloat(d.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700 truncate max-w-xs">
                        {d.cause?.title || "General Trust Fund"}
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/50 font-bold uppercase tracking-wider text-slate-600">
                          {d.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        {d.status === "success" ? (
                          <button
                            onClick={() => handleDownloadReceipt(d)}
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition text-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-red-500">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB content: Donors List */}
        {subTab === "donors" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-800">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-xs font-extrabold uppercase border-b border-slate-100">
                  <th className="p-4">Donor Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Donation Count</th>
                  <th className="p-4">Total Contributed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No donor profiles found.
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map((donor, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4 font-bold text-slate-900">{donor.name}</td>
                      <td className="p-4 text-slate-600 font-medium">{donor.email}</td>
                      <td className="p-4 text-slate-500">{donor.phone}</td>
                      <td className="p-4 font-bold text-slate-700 text-center">{donor.donationCount} times</td>
                      <td className="p-4">
                        <span className="font-extrabold text-emerald-600 text-base">
                          ₹{donor.totalDonated.toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Manual Entry modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Record Offline/Bank Donation</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={form.donorName}
                    onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.donorEmail}
                    onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="donor@example.com"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={form.donorPhone}
                    onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Address</label>
                  <textarea
                    rows={2}
                    value={form.donorAddress}
                    onChange={(e) => setForm({ ...form, donorAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm resize-none"
                    placeholder="Enter postal address"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Donation amount"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Payment Method *</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI/QR Code</option>
                    <option value="cash">Cash Payment</option>
                    <option value="check">Check Payment</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Assigned Cause / Campaign</label>
                  <select
                    value={form.causeId}
                    onChange={(e) => setForm({ ...form, causeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  >
                    <option value="">General Trust Fund (No Cause)</option>
                    {causes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Notes / Remarks</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Sponsorship comments"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record & Generate Receipt"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
