import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET events (or guest list for a specific event)
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json([]);

    const { searchParams } = new URL(req.url);
    const eventIdStr = searchParams.get("eventId");

    // If eventId is provided, fetch guest registrations
    if (eventIdStr) {
      const eventId = parseInt(eventIdStr);
      const guestList = await db
        .select()
        .from(schema.eventRegistrations)
        .where(eq(schema.eventRegistrations.eventId, eventId))
        .orderBy(desc(schema.eventRegistrations.createdAt));
      return NextResponse.json(guestList);
    }

    // Else fetch all events with attendee counts
    const eventsList = await db
      .select()
      .from(schema.events)
      .orderBy(desc(schema.events.eventDate));

    const registrations = await db.select().from(schema.eventRegistrations);

    const eventStats = eventsList.map(event => {
      const eventGuests = registrations.filter(r => r.eventId === event.id);
      return {
        ...event,
        registrationsCount: eventGuests.length,
        attendedCount: eventGuests.filter(g => g.attended).length,
      };
    });

    return NextResponse.json(eventStats);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Create event
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { title, description, eventDate, venue, coverImage, registrationLimit, status } = body;

    if (!title || !description || !eventDate || !venue || !coverImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newEvent] = await db
      .insert(schema.events)
      .values({
        title,
        description,
        eventDate: new Date(eventDate),
        venue,
        coverImage,
        registrationLimit: registrationLimit ? parseInt(registrationLimit) : null,
        status: status || "published",
      })
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Created Event: ${title}`,
      module: "Events",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}

// PUT: Update event / attendance status
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await req.json();
    const { id, title, description, eventDate, venue, coverImage, registrationLimit, status, registrationId, attended } = body;

    // If registrationId is present, this updates an attendee status instead of the event itself
    if (registrationId !== undefined && attended !== undefined) {
      const [updatedReg] = await db
        .update(schema.eventRegistrations)
        .set({ attended })
        .where(eq(schema.eventRegistrations.id, registrationId))
        .returning();
      return NextResponse.json({ success: true, registration: updatedReg });
    }

    if (!id || !title || !description || !eventDate || !venue || !coverImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updatedEvent] = await db
      .update(schema.events)
      .set({
        title,
        description,
        eventDate: new Date(eventDate),
        venue,
        coverImage,
        registrationLimit: registrationLimit ? parseInt(registrationLimit) : null,
        status: status || "published",
      })
      .where(eq(schema.events.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Updated Event ID: ${id} (${title})`,
      module: "Events",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

// DELETE: Delete event (and registrations)
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
    const registrationIdStr = searchParams.get("registrationId");

    // If deleting an attendee registration
    if (registrationIdStr) {
      const regId = parseInt(registrationIdStr);
      const [deletedReg] = await db
        .delete(schema.eventRegistrations)
        .where(eq(schema.eventRegistrations.id, regId))
        .returning();
      return NextResponse.json({ success: true, registration: deletedReg });
    }

    if (!idStr) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const id = parseInt(idStr);

    // Delete guest registrations cascade
    await db.delete(schema.eventRegistrations).where(eq(schema.eventRegistrations.eventId, id));

    const [deletedEvent] = await db
      .delete(schema.events)
      .where(eq(schema.events.id, id))
      .returning();

    // Log Audit Action
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Deleted Event ID: ${id} (${deletedEvent?.title || "Unknown"})`,
      module: "Events",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, event: deletedEvent });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 });
  }
}
