import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all testimonials
export async function GET() {
  try {
    if (!db) return NextResponse.json([]);
    const list = await db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST: Create testimonial
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { name, designation, testimonial, image, rating, type } = body;

    if (!name || !designation || !testimonial) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newTestimonial] = await db
      .insert(schema.testimonials)
      .values({
        name,
        designation,
        testimonial,
        image: image || null,
        rating: rating ? parseInt(rating) : 5,
        type: type || "donor",
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Created Testimonial for ${name}`,
      module: "Testimonials",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, testimonial: newTestimonial });
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: error.message || "Failed to create testimonial" }, { status: 500 });
  }
}

// PUT: Update testimonial
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { id, name, designation, testimonial, image, rating, type } = body;

    if (!id || !name || !designation || !testimonial) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedTestimonial] = await db
      .update(schema.testimonials)
      .set({
        name,
        designation,
        testimonial,
        image: image || null,
        rating: rating ? parseInt(rating) : 5,
        type: type || "donor",
      })
      .where(eq(schema.testimonials.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Updated Testimonial ID: ${id} (${name})`,
      module: "Testimonials",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, testimonial: updatedTestimonial });
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: error.message || "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE: Delete testimonial
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

    if (!idStr) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const id = parseInt(idStr);
    const [deletedTestimonial] = await db
      .delete(schema.testimonials)
      .where(eq(schema.testimonials.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Testimonial ID: ${id} (${deletedTestimonial?.name || "Unknown"})`,
      module: "Testimonials",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, testimonial: deletedTestimonial });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: error.message || "Failed to delete testimonial" }, { status: 500 });
  }
}
