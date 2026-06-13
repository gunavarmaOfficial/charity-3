"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Tag,
  Eye,
  X,
  Loader2,
  Globe,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogsTabProps {
  onRefresh: () => void;
}

export default function BlogsTab({ onRefresh }: BlogsTabProps) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "categories">("posts");

  // Modals state
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Blog Form State
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    tagsString: "",
    coverImage: "",
    status: "draft",
    seoTitle: "",
    seoDesc: "",
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: "",
    categorySlug: "",
  });

  // Fetch blogs & categories
  const fetchBlogsAndCategories = async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      if (!res.ok) throw new Error("Failed to fetch blog data");
      const data = await res.json();
      setBlogs(data.blogs || []);
      setCategories(data.categories || []);
    } catch (err) {
      toast.error("Failed to load blog logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogsAndCategories();
  }, []);

  // Handle Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          name: catForm.name,
          categorySlug: catForm.categorySlug,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      toast.success("Category created successfully!");
      setCategoryModalOpen(false);
      setCatForm({ name: "", categorySlug: "" });
      fetchBlogsAndCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Blog Submit
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tags = blogForm.tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const method = editingBlog ? "PUT" : "POST";
      const payload = {
        ...blogForm,
        id: editingBlog?.id,
        tags,
      };

      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save blog post");
      }

      toast.success(editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
      setBlogModalOpen(false);
      setEditingBlog(null);
      setBlogForm({
        title: "",
        slug: "",
        content: "",
        categoryId: "",
        tagsString: "",
        coverImage: "",
        status: "draft",
        seoTitle: "",
        seoDesc: "",
      });
      fetchBlogsAndCategories();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Edit Blog
  const handleStartEditBlog = (blog: any) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      categoryId: blog.category?.id?.toString() || "",
      tagsString: (blog.tags || []).join(", "),
      coverImage: blog.coverImage,
      status: blog.status,
      seoTitle: blog.seoTitle || "",
      seoDesc: blog.seoDesc || "",
    });
    setBlogModalOpen(true);
  };

  // Delete Blog
  const handleDeleteBlog = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete blog");

      toast.success("Blog deleted successfully!");
      fetchBlogsAndCategories();
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete blog post.");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/blogs?categoryId=${catId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully!");
      fetchBlogsAndCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  // Auto generate slugs
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setBlogForm({ ...blogForm, title: val, slug });
  };

  const handleCatNameChange = (val: string) => {
    const categorySlug = val
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setCatForm({ name: val, categorySlug });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Tabs Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === "posts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog Posts</span>
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeSubTab === "categories" ? (
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingBlog(null);
                setBlogForm({
                  title: "",
                  slug: "",
                  content: "",
                  categoryId: "",
                  tagsString: "",
                  coverImage: "",
                  status: "draft",
                  seoTitle: "",
                  seoDesc: "",
                });
                setBlogModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Write Post</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : activeSubTab === "posts" ? (
        
        /* Render: Blog Articles List */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-800">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-xs font-extrabold uppercase border-b border-slate-100">
                  <th className="p-4">Post</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No blog posts published yet.
                    </td>
                  </tr>
                ) : (
                  blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={b.coverImage} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200/50" alt="" />
                          <div className="truncate max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{b.title}</div>
                            <div className="text-xs text-slate-400 font-semibold truncate">/{b.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {b.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(b.tags || []).map((t: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <Tag className="w-2.5 h-2.5 text-slate-400" />
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          b.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleStartEditBlog(b)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg shadow-sm border border-slate-200/40 transition inline-flex"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id)}
                          className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg shadow-sm border border-slate-200/40 transition inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* Render: Blog Categories list */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden max-w-xl">
          <table className="w-full text-left border-collapse text-slate-800">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 text-xs font-extrabold uppercase border-b border-slate-100">
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 text-slate-500 font-mono">/{c.slug}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg shadow-sm border border-slate-200/40 transition inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Write/Edit Blog */}
      {blogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/60">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingBlog ? "Modify Blog Article" : "Write Blog Post"}
              </h3>
              <button
                onClick={() => setBlogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                    placeholder="Enter post title"
                  />
                </div>

                {/* Slug */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Article Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-mono"
                    placeholder="e.g. book-drive-recap"
                  />
                </div>

                {/* Category */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={blogForm.categoryId}
                    onChange={(e) => setBlogForm({ ...blogForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                  >
                    <option value="">Choose category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cover Image */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Cover Image URL *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.coverImage}
                    onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Content */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Content Body *</label>
                  <textarea
                    rows={8}
                    required
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm leading-relaxed"
                    placeholder="Type write up here..."
                  />
                </div>

                {/* Tags */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={blogForm.tagsString}
                    onChange={(e) => setBlogForm({ ...blogForm, tagsString: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="e.g. education, coimbatore, outreach"
                  />
                </div>

                {/* Status */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Live)</option>
                  </select>
                </div>

                {/* SEO Divider */}
                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>SEO & Search Engine Fields</span>
                </div>

                {/* SEO Title */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">SEO Title</label>
                  <input
                    type="text"
                    value={blogForm.seoTitle}
                    onChange={(e) => setBlogForm({ ...blogForm, seoTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Search snippet header"
                  />
                </div>

                {/* SEO Description */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">SEO Description</label>
                  <input
                    type="text"
                    value={blogForm.seoDesc}
                    onChange={(e) => setBlogForm({ ...blogForm, seoDesc: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Search snippet description text"
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
                    Saving changes...
                  </>
                ) : (
                  editingBlog ? "Save Article" : "Publish Post"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">New Category</h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => handleCatNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                  placeholder="e.g. Healthcare Camp"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Category Slug (URL) *</label>
                <input
                  type="text"
                  required
                  value={catForm.categorySlug}
                  onChange={(e) => setCatForm({ ...catForm, categorySlug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-mono"
                  placeholder="e.g. healthcare-camp"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Create Category"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
