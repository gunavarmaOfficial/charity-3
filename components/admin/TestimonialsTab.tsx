/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Star,
  X,
  Loader2,
  Quote,
} from "lucide-react";
import toast from "react-hot-toast";

interface TestimonialsTabProps {
  onRefresh: () => void;
}

export default function TestimonialsTab({ onRefresh }: TestimonialsTabProps) {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    designation: "",
    testimonial: "",
    image: "",
    rating: "5",
    type: "donor",
  });

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      toast.error("Failed to load testimonials list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingItem ? "PUT" : "POST";
      const payload = editingItem ? { ...form, id: editingItem.id } : form;

      const res = await fetch("/api/admin/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save testimonial");
      }

      toast.success(editingItem ? "Testimonial updated successfully!" : "Testimonial created successfully!");
      setModalOpen(false);
      setEditingItem(null);
      setForm({
        name: "",
        designation: "",
        testimonial: "",
        image: "",
        rating: "5",
        type: "donor",
      });
      fetchTestimonials();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      designation: item.designation,
      testimonial: item.testimonial,
      image: item.image || "",
      rating: item.rating.toString(),
      type: item.type,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete testimonial");

      toast.success("Testimonial deleted successfully!");
      fetchTestimonials();
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete testimonial.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Donor & Volunteer Testimonials</h3>
          <p className="text-slate-500 text-xs mt-1">Configure user review quotes displayed on the public pages</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setForm({
              name: "",
              designation: "",
              testimonial: "",
              image: "",
              rating: "5",
              type: "donor",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400">
          No testimonials uploaded. Create one to display quotes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 relative flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-emerald-500/10 shrink-0" />
              
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-slate-600 text-sm italic leading-relaxed font-medium">
                  &ldquo;{item.testimonial}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-none">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
                      {item.designation} ({item.type})
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200/40 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg border border-slate-200/40 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Testimonial */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingItem ? "Edit Testimonial Details" : "Add Testimonial Quote"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Designation *</label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="e.g. Regular Donor"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Reviewer Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  >
                    <option value="donor">Regular Donor</option>
                    <option value="volunteer">Volunteer Member</option>
                    <option value="impact">Beneficiary/Impact Story</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Reviewer Photo URL</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Testimonial Quote *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.testimonial}
                    onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm resize-none"
                    placeholder="Type donor or volunteer quote review..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Rating Stars (1-5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingItem ? "Save Changes" : "Submit Testimonial"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
