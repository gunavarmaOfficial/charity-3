/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Facebook,
  Linkedin,
  Instagram,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface TeamTabProps {
  onRefresh: () => void;
}

export default function TeamTab({ onRefresh }: TeamTabProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    designation: "",
    profilePhoto: "",
    bio: "",
    displayOrder: "0",
    facebook: "",
    linkedin: "",
    instagram: "",
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/admin/team");
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      toast.error("Failed to load team members list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingItem ? "PUT" : "POST";
      const payload = {
        ...form,
        id: editingItem?.id,
        socialLinks: {
          facebook: form.facebook,
          linkedin: form.linkedin,
          instagram: form.instagram,
        },
      };

      const res = await fetch("/api/admin/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save team member");
      }

      toast.success(editingItem ? "Team member updated successfully!" : "Team member added successfully!");
      setModalOpen(false);
      setEditingItem(null);
      setForm({
        name: "",
        designation: "",
        profilePhoto: "",
        bio: "",
        displayOrder: "0",
        facebook: "",
        linkedin: "",
        instagram: "",
      });
      fetchMembers();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      designation: item.designation,
      profilePhoto: item.profilePhoto,
      bio: item.bio || "",
      displayOrder: item.displayOrder.toString(),
      facebook: item.socialLinks?.facebook || "",
      linkedin: item.socialLinks?.linkedin || "",
      instagram: item.socialLinks?.instagram || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete team member");

      toast.success("Team member removed successfully!");
      fetchMembers();
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete team member.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Trust Coordinators & Trustees</h3>
          <p className="text-slate-500 text-xs mt-1">Configure founders, management profile photos and social links</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setForm({
              name: "",
              designation: "",
              profilePhoto: "",
              bio: "",
              displayOrder: "0",
              facebook: "",
              linkedin: "",
              instagram: "",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400">
          No team members listed yet. Add trustees to publish profiles.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              
              <div className="space-y-4">
                {/* Photo & Identity details */}
                <div className="flex items-center gap-4">
                  <img src={member.profilePhoto} className="w-16 h-16 object-cover rounded-2xl border border-slate-200/40 shrink-0" alt="" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-tight">{member.name}</h4>
                    <span className="text-xs text-emerald-600 font-bold block mt-1 uppercase tracking-wider">{member.designation}</span>
                  </div>
                </div>

                {/* Bio text */}
                <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-3">
                  {member.bio || "No biography provided."}
                </p>

                {/* Social links */}
                <div className="flex gap-2">
                  {member.socialLinks?.facebook && (
                    <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks?.linkedin && (
                    <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-700 transition">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks?.instagram && (
                    <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-pink-600 transition">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom controls */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-6 bg-slate-50/20 -mx-6 -mb-6 px-6 py-3 rounded-b-2xl">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold uppercase">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Order: {member.displayOrder}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(member)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg shadow-sm hover:shadow transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 bg-white border border-slate-200 text-red-500 hover:text-red-700 rounded-lg shadow-sm hover:shadow transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Member */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/60">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingItem ? "Edit Member Profile" : "Register Team Member"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                    placeholder="e.g. Kavitha G"
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
                    placeholder="e.g. Trustee Coordinator"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Display order *</label>
                  <input
                    type="number"
                    required
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Sorting priority index"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Profile Photo URL *</label>
                  <input
                    type="text"
                    required
                    value={form.profilePhoto}
                    onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Biography / Description</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm resize-none"
                    placeholder="Trustee background info..."
                  />
                </div>

                {/* Social link headers */}
                <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-3">
                  Social Links
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none text-xs"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none text-xs"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none text-xs"
                    placeholder="https://instagram.com/..."
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingItem ? "Save Changes" : "Register Member"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
