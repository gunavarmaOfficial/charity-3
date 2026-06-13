import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all documents
export async function GET() {
  try {
    if (!db) return NextResponse.json([]);
    const list = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// POST: Add document record
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { name, category, fileUrl, version } = body;

    if (!name || !category || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newDoc] = await db
      .insert(schema.documents)
      .values({
        name,
        category,
        fileUrl,
        version: version || "1.0",
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Uploaded Document: ${name} (Category: ${category})`,
      module: "Documents",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, document: newDoc });
  } catch (error: any) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
  }
}

// DELETE: Delete document record
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
    const [deletedDoc] = await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Document ID: ${id} (${deletedDoc?.name || "Unknown"})`,
      module: "Documents",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, document: deletedDoc });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: error.message || "Failed to delete document" }, { status: 500 });
  }
}
