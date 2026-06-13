import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all team members ordered by display order
export async function GET() {
  try {
    if (!db) return NextResponse.json([]);
    const list = await db
      .select()
      .from(schema.teamMembers)
      .orderBy(asc(schema.teamMembers.displayOrder), desc(schema.teamMembers.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

// POST: Add team member
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { name, designation, profilePhoto, bio, socialLinks, displayOrder } = body;

    if (!name || !designation || !profilePhoto) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newMember] = await db
      .insert(schema.teamMembers)
      .values({
        name,
        designation,
        profilePhoto,
        bio: bio || null,
        socialLinks: socialLinks || {},
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Created Team Member: ${name}`,
      module: "Team",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: error.message || "Failed to create team member" }, { status: 500 });
  }
}

// PUT: Update team member
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { id, name, designation, profilePhoto, bio, socialLinks, displayOrder } = body;

    if (!id || !name || !designation || !profilePhoto) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedMember] = await db
      .update(schema.teamMembers)
      .set({
        name,
        designation,
        profilePhoto,
        bio: bio || null,
        socialLinks: socialLinks || {},
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      })
      .where(eq(schema.teamMembers.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Updated Team Member ID: ${id} (${name})`,
      module: "Team",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error: any) {
    console.error("Error updating team member:", error);
    return NextResponse.json({ error: error.message || "Failed to update team member" }, { status: 500 });
  }
}

// DELETE: Delete team member
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
    const [deletedMember] = await db
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Team Member ID: ${id} (${deletedMember?.name || "Unknown"})`,
      module: "Team",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, member: deletedMember });
  } catch (error: any) {
    console.error("Error deleting team member:", error);
    return NextResponse.json({ error: error.message || "Failed to delete team member" }, { status: 500 });
  }
}
