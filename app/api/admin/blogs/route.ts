import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET blogs and categories
export async function GET(req: Request) {
  try {
    if (!db) return NextResponse.json({ blogs: [], categories: [] });

    const { searchParams } = new URL(req.url);
    const fetchCategoriesOnly = searchParams.get("categoriesOnly") === "true";

    // Fetch categories
    const categoriesList = await db.select().from(schema.blogCategories).orderBy(schema.blogCategories.name);

    if (fetchCategoriesOnly) {
      return NextResponse.json({ categories: categoriesList });
    }

    // Fetch blogs joined with categories
    const blogsList = await db
      .select({
        id: schema.blogs.id,
        title: schema.blogs.title,
        slug: schema.blogs.slug,
        content: schema.blogs.content,
        tags: schema.blogs.tags,
        coverImage: schema.blogs.coverImage,
        status: schema.blogs.status,
        seoTitle: schema.blogs.seoTitle,
        seoDesc: schema.blogs.seoDesc,
        createdAt: schema.blogs.createdAt,
        category: {
          id: schema.blogCategories.id,
          name: schema.blogCategories.name,
          slug: schema.blogCategories.slug,
        },
      })
      .from(schema.blogs)
      .leftJoin(schema.blogCategories, eq(schema.blogs.categoryId, schema.blogCategories.id))
      .orderBy(desc(schema.blogs.createdAt));

    return NextResponse.json({
      blogs: blogsList,
      categories: categoriesList,
    });
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// POST: Create blog or category
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { type, name, categorySlug, title, content, slug, categoryId, tags, coverImage, status, seoTitle, seoDesc } = body;

    // Handle category creation
    if (type === "category") {
      if (!name || !categorySlug) {
        return NextResponse.json({ error: "Missing required fields for category" }, { status: 400 });
      }
      const [newCat] = await db
        .insert(schema.blogCategories)
        .values({ name, slug: categorySlug })
        .returning();
      
      return NextResponse.json({ success: true, category: newCat });
    }

    // Handle blog creation
    if (!title || !slug || !content || !coverImage) {
      return NextResponse.json({ error: "Missing required fields for blog" }, { status: 400 });
    }

    const [newBlog] = await db
      .insert(schema.blogs)
      .values({
        title,
        slug,
        content,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: tags || [],
        coverImage,
        status: status || "draft",
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Created Blog: ${title}`,
      module: "Blogs",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    console.error("Error creating blog/category:", error);
    return NextResponse.json({ error: error.message || "Failed to create resource" }, { status: 500 });
  }
}

// PUT: Update blog
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { id, title, content, slug, categoryId, tags, coverImage, status, seoTitle, seoDesc } = body;

    if (!id || !title || !slug || !content || !coverImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedBlog] = await db
      .update(schema.blogs)
      .set({
        title,
        slug,
        content,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: tags || [],
        coverImage,
        status: status || "draft",
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      })
      .where(eq(schema.blogs.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Updated Blog ID: ${id} (${title})`,
      module: "Blogs",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

// DELETE: Delete blog or category
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    const categoryIdStr = searchParams.get("categoryId");

    // Handle deleting a category
    if (categoryIdStr) {
      const catId = parseInt(categoryIdStr);

      // Check if any blog is using this category
      const blogsUsingCat = await db
        .select()
        .from(schema.blogs)
        .where(eq(schema.blogs.categoryId, catId))
        .limit(1);

      if (blogsUsingCat.length > 0) {
        return NextResponse.json(
          { error: "Cannot delete category because it is currently assigned to one or more blogs." },
          { status: 400 }
        );
      }

      const [deletedCat] = await db
        .delete(schema.blogCategories)
        .where(eq(schema.blogCategories.id, catId))
        .returning();

      return NextResponse.json({ success: true, category: deletedCat });
    }

    if (!idStr) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const id = parseInt(idStr);
    const [deletedBlog] = await db
      .delete(schema.blogs)
      .where(eq(schema.blogs.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Blog ID: ${id} (${deletedBlog?.title || "Unknown"})`,
      module: "Blogs",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, blog: deletedBlog });
  } catch (error: any) {
    console.error("Error deleting blog/category:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
