"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";

type Category =
  | "all"
  | "education"
  | "healthcare"
  | "environment"
  | "community"
  | "women"
  | "youth";

interface GalleryImage {
  src: string;
  title: string;
  category: Category;
  description: string;
}

const categories = [
  { id: "all", label: "All" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "environment", label: "Environment" },
  { id: "community", label: "Community" },
  { id: "women", label: "Women Empowerment" },
  { id: "youth", label: "Youth Programs" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          if (result.gallery) {
            setGalleryImages(result.gallery);
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery images", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our impact through these moments captured across various
            initiatives at Sri Viswa Charitable Trust.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as Category)}
              className={`px-6 py-2 rounded-full transition duration-200 ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-secondary/20 text-gray-700 shadow-sm"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No gallery images found in this category.
          </div>
        ) : (
          /* Gallery Grid */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredImages.map((image) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative h-64 bg-gray-200">
                    <Image
                      src={image.src}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <span className="text-xs uppercase font-bold text-teal-400 block mb-1">
                          {image.category}
                        </span>
                        <h3 className="text-xl font-semibold mb-2">
                          {image.title}
                        </h3>
                        <p className="text-sm">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-8 h-8" />
              </button>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative w-full max-w-4xl aspect-video"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-6 text-white">
                  <h3 className="text-2xl font-semibold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p>{selectedImage.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
