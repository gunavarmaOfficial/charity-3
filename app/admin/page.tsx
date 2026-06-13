"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Images,
  HeartHandshake,
  CreditCard,
  Settings,
  Mail,
  Users,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Loader2,
  CheckCircle,
  Calendar,
  DollarSign,
  BookOpen,
  MessageSquare,
  Folder,
  History
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

import AnalyticsTab from "@/components/admin/AnalyticsTab";
import DonationsTab from "@/components/admin/DonationsTab";
import EventsTab from "@/components/admin/EventsTab";
import BlogsTab from "@/components/admin/BlogsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import TeamTab from "@/components/admin/TeamTab";
import DocumentsTab from "@/components/admin/DocumentsTab";
import AuditLogsTab from "@/components/admin/AuditLogsTab";


type Category = "all" | "education" | "healthcare" | "environment" | "community" | "women" | "youth";

interface GalleryImage {
  src: string;
  title: string;
  category: Category;
  description: string;
}

interface Cause {
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  impact: string;
  location: string;
  category: string;
}

interface DBData {
  settings: {
    siteTitle: string;
    whatsappNumber: string;
    phone: string;
    email: string;
    address: string;
    tawkPropertyId: string;
    tawkWidgetId: string;
  };
  banners: string[];
  gallery: GalleryImage[];
  causes: Cause[];
  payment: {
    razorpayApiKey: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountName: string;
    branchName: string;
    upiId: string;
    qrCodeUrl: string;
  };
  queries: any[];
  volunteers: any[];
  donations: any[];
  events: any[];
  blogs: any[];
  testimonials: any[];
  team: any[];
  documents: any[];
  auditLogs: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "donations"
    | "events"
    | "blogs"
    | "testimonials"
    | "team"
    | "documents"
    | "audit-logs"
    | "banners"
    | "gallery"
    | "causes"
    | "payments"
    | "settings"
    | "messages"
    | "volunteers"
  >("overview");

  const [data, setData] = useState<DBData | null>(null);

  // Form states for items creation
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newGalleryItem, setNewGalleryItem] = useState<GalleryImage>({
    src: "",
    title: "",
    category: "education",
    description: "",
  });
  const [galleryUploadMode, setGalleryUploadMode] = useState<"single" | "bulk">("single");
  const [bulkGalleryCategory, setBulkGalleryCategory] = useState<Category>("education");
  const [bulkGalleryTitlePrefix, setBulkGalleryTitlePrefix] = useState("");
  const [bulkGalleryDescription, setBulkGalleryDescription] = useState("");
  const [bulkGalleryFiles, setBulkGalleryFiles] = useState<FileList | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);

  const [newCause, setNewCause] = useState<Cause>({
    title: "",
    description: "",
    image: "",
    goal: 100000,
    raised: 0,
    impact: "",
    location: "",
    category: "Education",
  });

  // Fetch website data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch data");

      const dbData: DBData = await res.json();
      setData(dbData);
    } catch (err) {
      toast.error("Failed to load dashboard settings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.refresh();
      router.push("/admin/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleSaveAll = async (updatedData: DBData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: updatedData.settings,
          banners: updatedData.banners,
          gallery: updatedData.gallery,
          causes: updatedData.causes,
          payment: updatedData.payment,
          queries: updatedData.queries,
          volunteers: updatedData.volunteers
        }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
        setData(updatedData);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Save failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Helper file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetCallback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const toastId = toast.loading("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("File upload failed");
      }

      const uploadResult = await res.json();
      targetCallback(uploadResult.url);
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Image upload failed. Try pasting URL directly.", { id: toastId });
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkGalleryFiles || bulkGalleryFiles.length === 0) {
      toast.error("Please select at least one image file");
      return;
    }

    setBulkUploading(true);
    setBulkUploadProgress(0);
    const totalFiles = bulkGalleryFiles.length;
    const toastId = toast.loading(`Uploading batch of ${totalFiles} images...`);

    const newUploadedImages: GalleryImage[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = bulkGalleryFiles[i];
      
      // Update loading status
      toast.loading(`Uploading image ${i + 1} of ${totalFiles}: ${file.name}...`, { id: toastId });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload request failed");
        }

        const result = await res.json();
        
        // Generate title from prefix + filename or just filename
        let title = file.name.split('.').slice(0, -1).join('.'); // remove extension
        // Clean up underscores/dashes for better readability
        title = title.replace(/[_-]+/g, ' ').trim();
        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, c => c.toUpperCase());

        if (bulkGalleryTitlePrefix.trim()) {
          title = `${bulkGalleryTitlePrefix.trim()} - ${title}`;
        }

        newUploadedImages.push({
          src: result.url,
          title: title,
          category: bulkGalleryCategory,
          description: bulkGalleryDescription.trim() || `Photo from ${title}`,
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        failCount++;
      }

      setBulkUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    if (successCount > 0) {
      const updatedGallery = [...data!.gallery, ...newUploadedImages];
      await handleSaveAll({ ...data!, gallery: updatedGallery });
      toast.success(`Successfully uploaded ${successCount} images to Gallery!`, { id: toastId });
      
      // Reset bulk upload fields
      setBulkGalleryFiles(null);
      setBulkGalleryTitlePrefix("");
      setBulkGalleryDescription("");
      
      // Reset file input in UI if present
      const fileInput = document.getElementById("bulk-gallery-files") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } else {
      toast.error(`Failed to upload images. ${failCount} errors occurred.`, { id: toastId });
    }

    setBulkUploading(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading Sri Viswa Trust Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-10">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 tracking-tight leading-none">Sri Viswa Trust</h2>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">Admin Dashboard</span>
          </div>
        </div>

        {/* Tab Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "donations", label: "Donations Log", icon: DollarSign },
            { id: "events", label: "Campaign Events", icon: Calendar },
            { id: "blogs", label: "Blog CMS", icon: BookOpen },
            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
            { id: "team", label: "Team Directory", icon: Users },
            { id: "documents", label: "Legal Documents", icon: Folder },
            { id: "audit-logs", label: "Audit Logs", icon: History },
            { id: "banners", label: "Home Banners", icon: ImageIcon },
            { id: "gallery", label: "Gallery Photos", icon: Images },
            { id: "causes", label: "Causes & Goals", icon: HeartHandshake },
            { id: "payments", label: "Payments Config", icon: CreditCard },
            { id: "settings", label: "General Settings", icon: Settings },
            { id: "messages", label: "Inbox Messages", icon: Mail, count: data.queries?.length },
            { id: "volunteers", label: "Volunteers Log", icon: Users, count: data.volunteers?.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between py-3 rounded-xl transition-all duration-200 group text-left ${isActive
                  ? "bg-emerald-55 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-3 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 pl-4"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-800"}`} />
                  <span className="text-sm">{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition duration-200 font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-10  overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab} manager
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Configure and modify website details instantly.
            </p>
          </div>
          {(activeTab === "settings" || activeTab === "payments") && (
            <button
              onClick={() => handleSaveAll(data)}
              disabled={saving}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          )}
        </header>

        {/* Tab contents */}
        <div className="space-y-8">

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <AnalyticsTab
              donations={data.donations}
              causes={data.causes}
              volunteers={data.volunteers}
              enquiriesCount={data.queries?.length || 0}
            />
          )}

          {/* TAB: BANNERS */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Add Homepage Banner Image</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Option */}
                  <div className="border border-dashed border-slate-350 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition duration-200">
                    <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-xs text-slate-500 font-semibold mb-2">Upload File (PNG, JPG)</span>
                    <input
                      type="file"
                      id="banner-file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const updated = { ...data, banners: [...data.banners, url] };
                        handleSaveAll(updated);
                      })}
                    />
                    <label
                      htmlFor="banner-file"
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Select Image
                    </label>
                  </div>

                  {/* Direct URL input */}
                  <div className="flex flex-col justify-center gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="Paste image URL (e.g. Unsplash URL)"
                        value={newBannerUrl}
                        onChange={(e) => setNewBannerUrl(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newBannerUrl.trim()) {
                          toast.error("Please input a valid URL");
                          return;
                        }
                        const updated = { ...data, banners: [...data.banners, newBannerUrl] };
                        handleSaveAll(updated);
                        setNewBannerUrl("");
                      }}
                      className="bg-emerald-55 text-emerald-700 hover:bg-emerald-100 font-bold py-2 rounded-lg text-xs border border-emerald-100 transition"
                    >
                      Add URL Banner
                    </button>
                  </div>
                </div>
              </div>

              {/* Display existing banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.banners.map((url, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition">
                    <div className="relative h-48 bg-slate-100">
                      <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-xs text-slate-500 truncate max-w-xs">{url}</span>
                      <button
                        onClick={() => {
                          const updatedBanners = data.banners.filter((_, i) => i !== idx);
                          handleSaveAll({ ...data, banners: updatedBanners });
                        }}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              {/* Create gallery item */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Add Images to Gallery</h3>
                    <p className="text-xs text-slate-500">Upload photos into the charity gallery album.</p>
                  </div>
                  
                  {/* Mode Selector */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => setGalleryUploadMode("single")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${galleryUploadMode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      Single Image
                    </button>
                    <button
                      onClick={() => setGalleryUploadMode("bulk")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${galleryUploadMode === "bulk" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      Bulk Upload
                    </button>
                  </div>
                </div>

                {galleryUploadMode === "single" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Gallery Category
                          </label>
                          <select
                            value={newGalleryItem.category}
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value as Category })}
                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                          >
                            <option value="education">Education</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="environment">Environment</option>
                            <option value="community">Community</option>
                            <option value="women">Women Empowerment</option>
                            <option value="youth">Youth Programs</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Image Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Free Medical Camp"
                            value={newGalleryItem.title}
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Short Description
                          </label>
                          <input
                            type="text"
                            placeholder="Describe the moment..."
                            value={newGalleryItem.description}
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Upload */}
                        <div className="border border-dashed border-slate-350 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition duration-200 h-36">
                          {newGalleryItem.src ? (
                            <div className="flex flex-col items-center gap-1">
                              <img src={newGalleryItem.src} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                              <span className="text-[10px] text-slate-500 truncate max-w-xs">{newGalleryItem.src}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-emerald-600 mb-1" />
                              <span className="text-[10px] text-slate-400 font-semibold mb-2">Upload Image File</span>
                            </>
                          )}
                          <input
                            type="file"
                            id="gallery-file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => {
                              setNewGalleryItem({ ...newGalleryItem, src: url });
                            })}
                          />
                          <label
                            htmlFor="gallery-file"
                            className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg mt-1"
                          >
                            Upload Photo
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Or Paste Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={newGalleryItem.src}
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, src: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newGalleryItem.src || !newGalleryItem.title) {
                          toast.error("Please set at least Title and Image Source");
                          return;
                        }
                        const updatedGallery = [...data.gallery, newGalleryItem];
                        handleSaveAll({ ...data, gallery: updatedGallery });
                        setNewGalleryItem({
                          src: "",
                          title: "",
                          category: "education",
                          description: "",
                        });
                      }}
                      className="w-full bg-emerald-55 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4" /> Add Item to Gallery
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBulkUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Gallery Category
                        </label>
                        <select
                          value={bulkGalleryCategory}
                          onChange={(e) => setBulkGalleryCategory(e.target.value as Category)}
                          className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                        >
                          <option value="education">Education</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="environment">Environment</option>
                          <option value="community">Community</option>
                          <option value="women">Women Empowerment</option>
                          <option value="youth">Youth Programs</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Title Prefix (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CSR Event 2026"
                          value={bulkGalleryTitlePrefix}
                          onChange={(e) => setBulkGalleryTitlePrefix(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Uniform Description (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Glimpses from the drive"
                          value={bulkGalleryDescription}
                          onChange={(e) => setBulkGalleryDescription(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Multiple Files Picker */}
                    <div className="border border-dashed border-slate-350 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition duration-200">
                      <Upload className="w-10 h-10 text-emerald-600 mb-2" />
                      <span className="text-sm text-slate-700 font-semibold mb-1">
                        {bulkGalleryFiles && bulkGalleryFiles.length > 0 
                          ? `${bulkGalleryFiles.length} files selected` 
                          : "Choose multiple images to upload"
                        }
                      </span>
                      <span className="text-[10px] text-slate-400 mb-4">PNG, JPG, WEBP, GIF up to 5MB each</span>
                      
                      <input
                        type="file"
                        id="bulk-gallery-files"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setBulkGalleryFiles(e.target.files)}
                        disabled={bulkUploading}
                      />
                      <label
                        htmlFor="bulk-gallery-files"
                        className={`cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg ${bulkUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        Select Files
                      </label>

                      {/* Show selected file names list if any */}
                      {bulkGalleryFiles && bulkGalleryFiles.length > 0 && (
                        <div className="mt-4 w-full max-h-32 overflow-y-auto border-t border-slate-200/60 pt-3 text-[10px] text-slate-500 space-y-1">
                          {Array.from(bulkGalleryFiles).map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white px-3 py-1 rounded-md border border-slate-100">
                              <span className="truncate font-medium text-slate-600">{file.name}</span>
                              <span className="shrink-0 text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar if uploading */}
                    {bulkUploading && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Uploading batch progress...</span>
                          <span>{bulkUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${bulkUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bulkUploading || !bulkGalleryFiles || bulkGalleryFiles.length === 0}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      {bulkUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading and Adding {bulkGalleryFiles?.length} Items...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add {bulkGalleryFiles ? bulkGalleryFiles.length : 0} Items to Gallery
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Gallery lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {data.gallery.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
                    <div className="relative h-40 bg-slate-100">
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/95 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 truncate max-w-xs">{item.src}</span>
                        <button
                          onClick={() => {
                            const updated = data.gallery.filter((_, i) => i !== idx);
                            handleSaveAll({ ...data, gallery: updated });
                          }}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CAUSES */}
          {activeTab === "causes" && (
            <div className="space-y-6">
              {/* Create cause */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Add New Ongoing Cause</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Title of the Cause
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clean Water drive"
                        value={newCause.title}
                        onChange={(e) => setNewCause({ ...newCause, title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Provide details about the cause..."
                        rows={3}
                        value={newCause.description}
                        onChange={(e) => setNewCause({ ...newCause, description: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Goal (₹)
                        </label>
                        <input
                          type="number"
                          value={newCause.goal}
                          onChange={(e) => setNewCause({ ...newCause, goal: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Raised (₹)
                        </label>
                        <input
                          type="number"
                          value={newCause.raised}
                          onChange={(e) => setNewCause({ ...newCause, raised: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Impact Detail
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 50+ wells built"
                          value={newCause.impact}
                          onChange={(e) => setNewCause({ ...newCause, impact: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Madurai"
                          value={newCause.location}
                          onChange={(e) => setNewCause({ ...newCause, location: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Infrastructure"
                          value={newCause.category}
                          onChange={(e) => setNewCause({ ...newCause, category: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Cause Image
                        </label>
                        <div className="border border-dashed border-slate-350 rounded-lg p-2 bg-slate-50 text-center flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 truncate max-w-xs">{newCause.image || "No file"}</span>
                          <input
                            type="file"
                            id="cause-file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => {
                              setNewCause({ ...newCause, image: url });
                            })}
                          />
                          <label
                            htmlFor="cause-file"
                            className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] font-bold px-2 py-1 rounded-md"
                          >
                            Browse
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Or Paste Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newCause.image}
                        onChange={(e) => setNewCause({ ...newCause, image: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!newCause.title || !newCause.image) {
                      toast.error("Please provide at least Title and Image");
                      return;
                    }
                    const updatedCauses = [...data.causes, newCause];
                    handleSaveAll({ ...data, causes: updatedCauses });
                    setNewCause({
                      title: "",
                      description: "",
                      image: "",
                      goal: 100000,
                      raised: 0,
                      impact: "",
                      location: "",
                      category: "Education",
                    });
                  }}
                  className="w-full bg-emerald-55 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Add Cause
                </button>
              </div>

              {/* Display existing causes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.causes.map((cause, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition">
                    <div className="relative h-44 bg-slate-100">
                      <img src={cause.image} alt={cause.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-white/95 border border-emerald-100 text-[10px] text-emerald-700 px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                        {cause.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{cause.title}</h4>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-3 leading-relaxed">{cause.description}</p>
                        <div className="mt-3 text-xs space-y-1.5 text-slate-600">
                          <div>📍 {cause.location}</div>
                          <div>🎯 {cause.impact}</div>
                          <div className="font-medium text-slate-800">💰 Raised: ₹{cause.raised} / ₹{cause.goal}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 truncate max-w-xs">{cause.image}</span>
                        <button
                          onClick={() => {
                            const updated = data.causes.filter((_, i) => i !== idx);
                            handleSaveAll({ ...data, causes: updated });
                          }}
                          className="text-red-550 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              {/* Razorpay config */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Razorpay API Gateway
                </h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Razorpay Key ID (NEXT_PUBLIC_RAZORPAY_API_KEY)
                  </label>
                  <input
                    type="text"
                    placeholder="rzp_test_..."
                    value={data.payment.razorpayApiKey}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.payment.razorpayApiKey = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal">
                    Secure keys stored. These enable Razorpay on the frontend Donation forms dynamically.
                  </span>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Bank Transfer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={data.payment.bankName}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.bankName = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={data.payment.accountNumber}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.accountNumber = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={data.payment.ifscCode}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.ifscCode = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={data.payment.accountName}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.accountName = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={data.payment.branchName}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.branchName = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* UPI & QR Code Settings */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">UPI QR Code Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      UPI ID (e.g. sriviswa@okaxis)
                    </label>
                    <input
                      type="text"
                      value={data.payment.upiId}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.upiId = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      UPI QR Code Image
                    </label>

                    {/* QR Code Upload */}
                    <div className="border border-dashed border-slate-350 rounded-lg p-2 bg-slate-50 text-center flex items-center justify-between">
                      {data.payment.qrCodeUrl ? (
                        <div className="flex items-center gap-2">
                          <img src={data.payment.qrCodeUrl} className="w-8 h-8 object-cover rounded border border-slate-200" />
                          <span className="text-[10px] text-slate-500 truncate max-w-xs">{data.payment.qrCodeUrl}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No QR Code Uploaded</span>
                      )}

                      <input
                        type="file"
                        id="qr-file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => {
                          const updated = { ...data };
                          updated.payment.qrCodeUrl = url;
                          setData(updated);
                        })}
                      />
                      <label
                        htmlFor="qr-file"
                        className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] font-bold px-2.5 py-1 rounded-md"
                      >
                        Upload QR
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste QR Code Image URL"
                      value={data.payment.qrCodeUrl}
                      onChange={(e) => {
                        const updated = { ...data };
                        updated.payment.qrCodeUrl = e.target.value;
                        setData(updated);
                      }}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">General Settings & Contacts</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Website & Trust Title
                  </label>
                  <input
                    type="text"
                    value={data.settings.siteTitle}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.settings.siteTitle = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    WhatsApp Number (Include Country Code, e.g. +919944534098)
                  </label>
                  <input
                    type="text"
                    value={data.settings.whatsappNumber}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.settings.whatsappNumber = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Contact Phone Number (For direct calls)
                  </label>
                  <input
                    type="text"
                    value={data.settings.phone}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.settings.phone = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={data.settings.email}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.settings.email = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Trust Office Address
                  </label>
                  <textarea
                    rows={2}
                    value={data.settings.address}
                    onChange={(e) => {
                      const updated = { ...data };
                      updated.settings.address = e.target.value;
                      setData(updated);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              {(!data.queries || data.queries.length === 0) ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
                  <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No incoming contact form messages logged.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.queries.slice().reverse().map((msg, idx) => (
                    <div key={msg.id || idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <h4 className="font-bold text-slate-800">{msg.name}</h4>
                          <span className="text-xs text-emerald-600 font-bold">{msg.email}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Subject</span>
                        <p className="text-slate-800 font-semibold text-sm mt-0.5">{msg.subject}</p>

                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mt-3">Message Body</span>
                        <p className="text-slate-650 text-sm mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            const updatedQueries = data.queries.filter((q) => q.id !== msg.id);
                            const toastId = toast.loading("Deleting message...");
                            try {
                              const res = await fetch("/api/admin/data", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  settings: data.settings,
                                  banners: data.banners,
                                  gallery: data.gallery,
                                  causes: data.causes,
                                  payment: data.payment,
                                  queries: updatedQueries,
                                  volunteers: data.volunteers
                                }),
                              });
                              if (res.ok) {
                                toast.success("Message deleted", { id: toastId });
                                setData({ ...data, queries: updatedQueries });
                              } else {
                                throw new Error("Delete failed");
                              }
                            } catch (e) {
                              toast.error("Failed to delete", { id: toastId });
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VOLUNTEERS */}
          {activeTab === "volunteers" && (
            <div className="space-y-6">
              {(!data.volunteers || data.volunteers.length === 0) ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No volunteer signups logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.volunteers.slice().reverse().map((vol, idx) => (
                    <div key={vol.id || idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <h4 className="font-bold text-slate-800">{vol.name}</h4>
                          <span className="text-xs text-emerald-600 font-bold">{vol.email} • {vol.phone}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(vol.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Interests</span>
                          <span className="text-slate-800 font-semibold mt-0.5 block">{vol.interests?.join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Availability</span>
                          <span className="text-slate-800 font-semibold mt-0.5 block">{vol.availability}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Experience</span>
                          <p className="text-slate-650 mt-1 leading-relaxed bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                            {vol.experience || "No prior experience provided."}
                          </p>
                        </div>
                        {vol.message && (
                          <div className="md:col-span-2">
                            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Introduction Message</span>
                            <p className="text-slate-650 mt-1 leading-relaxed bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                              {vol.message}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            const updatedVols = data.volunteers.filter((v) => v.id !== vol.id);
                            const toastId = toast.loading("Clearing register...");
                            try {
                              const res = await fetch("/api/admin/data", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  settings: data.settings,
                                  banners: data.banners,
                                  gallery: data.gallery,
                                  causes: data.causes,
                                  payment: data.payment,
                                  queries: data.queries,
                                  volunteers: updatedVols
                                }),
                              });
                              if (res.ok) {
                                toast.success("Record cleared", { id: toastId });
                                setData({ ...data, volunteers: updatedVols });
                              } else {
                                throw new Error("Delete failed");
                              }
                            } catch (e) {
                              toast.error("Failed to delete", { id: toastId });
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: DONATIONS */}
          {activeTab === "donations" && (
            <DonationsTab
              donations={data.donations}
              causes={data.causes}
              onRefresh={fetchData}
            />
          )}

          {/* TAB: EVENTS */}
          {activeTab === "events" && (
            <EventsTab onRefresh={fetchData} />
          )}

          {/* TAB: BLOG CMS */}
          {activeTab === "blogs" && (
            <BlogsTab onRefresh={fetchData} />
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <TestimonialsTab onRefresh={fetchData} />
          )}

          {/* TAB: TEAM */}
          {activeTab === "team" && (
            <TeamTab onRefresh={fetchData} />
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === "documents" && (
            <DocumentsTab onRefresh={fetchData} />
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === "audit-logs" && (
            <AuditLogsTab />
          )}

        </div>
      </main>
    </div>
  );
}
