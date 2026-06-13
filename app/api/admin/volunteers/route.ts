import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all volunteers
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json([]);
    
    const list = await db.select().from(schema.volunteers).orderBy(desc(schema.volunteers.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

// PUT: Update volunteer approval status
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedVolunteer] = await db
      .update(schema.volunteers)
      .set({ status })
      .where(eq(schema.volunteers.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Changed volunteer ${updatedVolunteer?.name || id} status to ${status}`,
      module: "Volunteers",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, volunteer: updatedVolunteer });
  } catch (error: any) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json({ error: error.message || "Failed to update volunteer" }, { status: 500 });
  }
}

// DELETE: Remove volunteer
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
    const [deletedVol] = await db
      .delete(schema.volunteers)
      .where(eq(schema.volunteers.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Volunteer ID: ${id} (${deletedVol?.name || "Unknown"})`,
      module: "Volunteers",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, volunteer: deletedVol });
  } catch (error: any) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json({ error: error.message || "Failed to delete volunteer" }, { status: 500 });
  }
}
