import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all causes
export async function GET() {
  try {
    if (!db) return NextResponse.json([]);
    const causesList = await db.select().from(schema.causes).orderBy(desc(schema.causes.createdAt));
    return NextResponse.json(causesList);
  } catch (error: any) {
    console.error("Error fetching causes:", error);
    return NextResponse.json({ error: "Failed to fetch causes" }, { status: 500 });
  }
}

// POST: Create a new cause
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    const { title, slug, description, goal, raised, image, impact, location, category, status, featured, seoTitle, seoDesc } = body;

    if (!title || !slug || !description || !goal || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newCause] = await db
      .insert(schema.causes)
      .values({
        title,
        slug,
        description,
        goal: goal.toString(),
        raised: (raised || 0).toString(),
        image,
        impact: impact || null,
        location: location || null,
        category: category || null,
        status: status || "published",
        featured: featured || false,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Created Cause: ${title}`,
      module: "Causes",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, cause: newCause });
  } catch (error: any) {
    console.error("Error creating cause:", error);
    return NextResponse.json({ error: error.message || "Failed to create cause" }, { status: 500 });
  }
}

// PUT: Update an existing cause
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    const { id, title, slug, description, goal, raised, image, impact, location, category, status, featured, seoTitle, seoDesc } = body;

    if (!id || !title || !slug || !description || !goal || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedCause] = await db
      .update(schema.causes)
      .set({
        title,
        slug,
        description,
        goal: goal.toString(),
        raised: (raised || 0).toString(),
        image,
        impact: impact || null,
        location: location || null,
        category: category || null,
        status: status || "published",
        featured: featured || false,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      })
      .where(eq(schema.causes.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Updated Cause ID: ${id} (${title})`,
      module: "Causes",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, cause: updatedCause });
  } catch (error: any) {
    console.error("Error updating cause:", error);
    return NextResponse.json({ error: error.message || "Failed to update cause" }, { status: 500 });
  }
}

// DELETE: Delete a cause
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const id = parseInt(idStr);
    
    // Check if cause is referenced in donations
    const relatedDonations = await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.causeId, id))
      .limit(1);

    if (relatedDonations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete cause as it has associated donation history." },
        { status: 400 }
      );
    }

    // Delete gallery references first
    await db.delete(schema.causeGallery).where(eq(schema.causeGallery.causeId, id));

    const [deletedCause] = await db
      .delete(schema.causes)
      .where(eq(schema.causes.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Cause ID: ${id} (${deletedCause?.title || "Unknown"})`,
      module: "Causes",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, cause: deletedCause });
  } catch (error: any) {
    console.error("Error deleting cause:", error);
    return NextResponse.json({ error: error.message || "Failed to delete cause" }, { status: 500 });
  }
}
